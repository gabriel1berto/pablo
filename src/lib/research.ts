import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeModelKey } from "@/lib/model-utils";
export { normalizeModelKey };

function kmBucket(km: number): [number, number] {
  if (km < 30000) return [0, 30000];
  if (km < 60000) return [30001, 60000];
  if (km < 100000) return [60001, 100000];
  return [100001, 999999];
}

export async function researchModelIssues(
  brand: string,
  model: string,
  year: number,
  km: number
): Promise<void> {
  const supabase = createServiceClient();
  const modelKey = normalizeModelKey(model);

  // Já pesquisado com itens reais? Não repetir.
  const { data: existing } = await supabase
    .from("car_issues")
    .select("id, category")
    .ilike("model_pattern", `%${modelKey}%`)
    .limit(5);

  const hasRealItems = (existing ?? []).some(r => r.category !== "_sentinel");
  if (hasRealItems) return;

  // Insert sentinel antes da chamada à API — evita loop em caso de timeout
  await supabase.from("car_issues").insert({
    brand,
    model_pattern: modelKey,
    year_from: 2000,
    year_to: 2099,
    km_from: 0,
    km_to: 999999,
    category: "_sentinel",
    title: "_pesquisado",
    description: "",
    severity: "warn",
    sort_order: 999,
  });

  const [km_from, km_to] = kmBucket(km);
  const kmLabel =
    km < 30000
      ? "até 30.000 km"
      : km < 60000
      ? "entre 30.000 e 60.000 km"
      : km < 100000
      ? "entre 60.000 e 100.000 km"
      : "acima de 100.000 km";

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let items: unknown[] = [];

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Você é um especialista em mecânica automotiva brasileira com 20 anos de experiência em oficinas e fóruns como Autos Segredos e Clube do Carro.

Gere EXATAMENTE 15 problemas REAIS e conhecidos para: ${brand} ${model} ${year}, com ${kmLabel}.

Regras:
- "how_to_check": 1 frase — o que fazer + sinal concreto de OK vs Problema. Termos técnicos com explicação entre parênteses.
- "if_bad": 1 frase — consequência técnica para o carro, com nome da peça e o que ela faz entre parênteses.
- "repair_cost": faixa realista Brasil 2025 (ex: "R$ 800–1.500").
- "severity": "critical" se risco de segurança ou custo acima de R$ 800, "warn" para demais.

Responda APENAS com JSON válido (sem texto extra, sem markdown):
[{"category":"motor","title":"Título (máx 55 chars)","description":"1 frase","how_to_check":"...","why_important":"...","if_bad":"...","repair_cost":"R$ X–Y","severity":"critical","sort_order":1}]

Categorias válidas: motor, transmissao, suspensao, freios, pneus, carroceria, eletrica
Gere exatamente 15 itens cobrindo as principais categorias. Foque em falhas REAIS documentadas para este modelo.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type === "text") {
      // Sanitiza caracteres de controle antes do parse
      const raw = block.text.trim().replace(/^```json\n?|```$/g, "");
      const sanitized = raw.replace(/[\x00-\x1F\x7F]/g, " ");
      items = JSON.parse(sanitized);
    }
  } catch (err) {
    console.error("[research] Haiku error:", err);
    // Remove sentinel em caso de falha — permite retry na próxima visita
    await supabase
      .from("car_issues")
      .delete()
      .eq("model_pattern", modelKey)
      .eq("category", "_sentinel");
    return;
  }

  const validCategories = [
    "motor",
    "transmissao",
    "suspensao",
    "freios",
    "pneus",
    "carroceria",
    "eletrica",
  ];

  // Filtra itens malformados antes de inserir
  const validItems = (items as Record<string, unknown>[]).filter(
    (item) => item.title && item.category && item.severity
  );

  if (validItems.length > 0) {
    const rows = validItems.map((item, idx) => ({
      brand,
      model_pattern: modelKey,
      year_from: Math.max(2000, year - 3),
      year_to: year + 3,
      km_from,
      km_to,
      category: validCategories.includes(item.category as string)
        ? item.category
        : "motor",
      title: String(item.title ?? "").slice(0, 100) || "Item sem título",
      description: String(item.description ?? ""),
      how_to_check: item.how_to_check ? String(item.how_to_check) : null,
      why_important: item.why_important ? String(item.why_important) : null,
      if_bad: item.if_bad ? String(item.if_bad) : null,
      repair_cost: item.repair_cost ? String(item.repair_cost) : null,
      severity: item.severity === "critical" ? "critical" : "warn",
      sort_order: Number(item.sort_order) || idx + 1,
    }));
    await supabase.from("car_issues").insert(rows);
  } else {
    // Sem itens válidos — remove sentinel para permitir retry
    await supabase
      .from("car_issues")
      .delete()
      .eq("model_pattern", modelKey)
      .eq("category", "_sentinel");
  }
}
