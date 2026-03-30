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

  // Já pesquisado (sentinel ou items reais)? Não repetir.
  const { data: existing } = await supabase
    .from("car_issues")
    .select("id")
    .ilike("model_pattern", `%${modelKey}%`)
    .limit(1);

  if (existing && existing.length > 0) return;

  // Insert sentinel before API call — prevents infinite loader loop on timeout
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

Gere EXATAMENTE 25 problemas REAIS, conhecidos e documentados para: ${brand} ${model} ${year}, com ${kmLabel}.

Responda APENAS com JSON válido (sem texto extra, sem markdown), neste formato:
[
  {
    "category": "motor",
    "title": "Título curto e direto (máx 55 chars)",
    "description": "Breve descrição do problema (1-2 frases)",
    "how_to_check": "Instrução de verificação para leigo: o que fazer + o sinal concreto que distingue OK de Problema. Use termos técnicos quando necessário, mas explique entre parênteses o que significa. Máx 2 frases.",
    "why_important": "Por que este item é crítico (1 linha)",
    "if_bad": "Consequência técnica do problema explicada para leigo: use o nome técnico correto da peça/sistema e explique entre parênteses o que ela faz. Descreva o que acontece com o carro, não o que o comprador deve fazer. Máx 2 frases.",
    "repair_cost": "R$ X.XXX–Y.YYY (faixa realista para o Brasil em 2024, não muito ampla)",
    "severity": "critical",
    "sort_order": 1
  }
]

Categorias válidas: motor, transmissao, suspensao, freios, pneus, carroceria, eletrica
Severity: "critical" para segurança ou custo acima de R$ 800, "warn" para demais.
Gere exatamente 25 itens cobrindo todas as categorias. Foque em falhas REAIS documentadas para este modelo e faixa de km.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type === "text") {
      const raw = block.text.trim().replace(/^```json\n?|```$/g, "");
      items = JSON.parse(raw);
    }
  } catch {
    // Falha silenciosa — sentinel evita nova tentativa
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

  if (Array.isArray(items) && items.length > 0) {
    const rows = (items as Record<string, unknown>[]).map((item, idx) => ({
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
  }
}
