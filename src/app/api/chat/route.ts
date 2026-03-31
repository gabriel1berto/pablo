import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

const client = new Anthropic();

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const { laudoId, messages, checklistState } = body as {
    laudoId: string;
    messages: Array<{
      role: "user" | "assistant";
      content: string | Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }>;
    }>;
    checklistState?: Array<{
      id: number;
      title: string;
      category: string;
      severity: string;
      state: "ok" | "problema";
    }>;
  };

  if (!laudoId || !messages?.length) {
    return new Response("Missing laudoId or messages", { status: 400 });
  }

  const { data: laudo } = await supabase
    .from("laudos")
    .select("brand, model, year, km, asking_price, fipe_price, tipo")
    .eq("id", laudoId)
    .eq("user_id", user.id)
    .single();

  if (!laudo) return new Response("Laudo not found", { status: 404 });

  // Fetch saved laudo_items (cautelar from previous step, any saved checklist)
  const { data: savedItems } = await supabase
    .from("laudo_items")
    .select("item_key, notes, category")
    .eq("laudo_id", laudoId);

  const cautelarItems = savedItems?.filter((i) => i.category === "cautelar") ?? [];

  // Build live checklist context (from React state)
  let checklistContext = "";
  if (checklistState?.length) {
    const problems = checklistState.filter((i) => i.state === "problema");
    const oks = checklistState.filter((i) => i.state === "ok");
    const lines: string[] = [];
    if (problems.length) {
      lines.push("PROBLEMAS MARCADOS NO CHECKLIST:");
      for (const p of problems) lines.push(`  - ${p.title} (${p.category}, ${p.severity})`);
    }
    if (oks.length) {
      lines.push(`ITENS OK: ${oks.map((o) => o.title).join(", ")}`);
    }
    checklistContext = `\n\n${lines.join("\n")}`;
  }

  // Build cautelar context (from saved data)
  const cautelarLabels: Record<string, string> = {
    crlv: "CRLV vencido/irregular",
    multas: "Multas pendentes",
    sinistro: "Histórico de sinistro",
    gravame: "Financiamento/gravame ativo",
    recall: "Recall pendente",
    manutencoes: "Manutenções atrasadas",
  };
  let cautelarContext = "";
  const alertas = cautelarItems.filter((c) => c.notes === "atencao");
  const okDocs = cautelarItems.filter((c) => c.notes === "ok");
  if (alertas.length || okDocs.length) {
    const lines: string[] = [];
    if (alertas.length) {
      lines.push("ALERTAS DOCUMENTAIS:");
      for (const a of alertas) lines.push(`  - ${cautelarLabels[a.item_key] ?? a.item_key}`);
    }
    if (okDocs.length) {
      lines.push(`DOCS OK: ${okDocs.map((d) => cautelarLabels[d.item_key] ?? d.item_key).join(", ")}`);
    }
    cautelarContext = `\n\n${lines.join("\n")}`;
  }

  // Price context
  let priceContext = "";
  if (laudo.asking_price && laudo.fipe_price) {
    const diff = ((laudo.asking_price - laudo.fipe_price) / laudo.fipe_price) * 100;
    priceContext = `\nPreço: R$ ${laudo.asking_price.toLocaleString("pt-BR")} · FIPE: R$ ${laudo.fipe_price.toLocaleString("pt-BR")} (${diff > 0 ? "+" : ""}${diff.toFixed(0)}%)`;
  }

  const systemPrompt = `Você é mecânico e consultor automotivo com 20 anos de experiência no mercado brasileiro de usados. Especialista em ${laudo.brand} ${laudo.model}.

VEÍCULO: ${laudo.brand} ${laudo.model} ${laudo.year} · ${laudo.km.toLocaleString("pt-BR")} km
CONTEXTO: ${laudo.tipo === "vendedor" ? "vendedor declarando estado do carro" : "comprador avaliando antes de fechar"}${priceContext}${cautelarContext}${checklistContext}

REGRAS:
- Máximo 2-3 frases por resposta. Direto ao ponto.
- Foto: diga o que vê, se é problema, gravidade, custo (R$ X–Y). Se não der pra ver, peça foto mais próxima.
- Sempre contextualiza pro modelo/ano/km específico.
- Use os dados do checklist e cautelar nas respostas quando relevante.
- Sem formalidades. Vai direto.`;

  try {
    const stream = await client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content as any,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("[chat] stream error:", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Erro na resposta. Tente novamente." })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (err) {
    console.error("[chat] API error:", err);
    return new Response("AI error", { status: 502 });
  }
}
