import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const modelKey = normalizeModelKey(model);

  // Already researched?
  const { data: existing } = await supabase
    .from("car_issues")
    .select("id")
    .ilike("model_pattern", `%${modelKey}%`)
    .limit(1);

  if (existing && existing.length > 0) return;

  // Grava sentinel antes de chamar a API — garante fallback para genérico mesmo se timeout
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
    km < 30000 ? "até 30.000 km"
    : km < 60000 ? "entre 30.000 e 60.000 km"
    : km < 100000 ? "entre 60.000 e 100.000 km"
    : "acima de 100.000 km";

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let items: unknown[] = [];

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Você é um especialista em mecânica automotiva brasileira com 20 anos de experiência em oficinas e fóruns como o Autos Segredos e Clube do Carro.

Gere uma lista de problemas REAIS, conhecidos e documentados para: ${brand} ${model} ${year}, com ${kmLabel}.

Responda APENAS com JSON válido (sem texto extra, sem markdown), neste formato:
[
  {
    "category": "motor",
    "title": "Título curto e direto (máx 55 chars)",
    "description": "Como identificar o problema, o que causa, custo estimado de reparo em R$ se aplicável.",
    "severity": "critical",
    "sort_order": 1
  }
]

Categorias válidas: motor, transmissao, suspensao, freios, pneus, carroceria, eletrica
Severity: "critical" para segurança ou custo acima de R$ 800, "warn" para demais.
Gere entre 6 e 14 itens. Foque em falhas reais documentadas para este modelo e faixa de km.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type === "text") {
      const raw = block.text.trim().replace(/^```json\n?|```$/g, "");
      items = JSON.parse(raw);
    }
  } catch {
    // Falha silenciosa — sentinel abaixo evita nova tentativa
  }

  const validCategories = ["motor", "transmissao", "suspensao", "freios", "pneus", "carroceria", "eletrica"];

  // Se Anthropic retornou resultados, insere os issues reais
  if (Array.isArray(items) && items.length > 0) {
    const rows = (items as Record<string, unknown>[]).map((item, idx) => ({
      brand,
      model_pattern: modelKey,
      year_from: Math.max(2000, year - 3),
      year_to: year + 3,
      km_from,
      km_to,
      category: validCategories.includes(item.category as string) ? item.category : "motor",
      title: String(item.title ?? "").slice(0, 100) || "Item sem título",
      description: String(item.description ?? ""),
      severity: item.severity === "critical" ? "critical" : "warn",
      sort_order: Number(item.sort_order) || idx + 1,
    }));
    await supabase.from("car_issues").insert(rows);
  }
}
