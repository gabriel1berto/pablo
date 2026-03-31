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
  const { laudoId, messages } = body as {
    laudoId: string;
    messages: Array<{
      role: "user" | "assistant";
      content: string | Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }>;
    }>;
  };

  if (!laudoId || !messages?.length) {
    return new Response("Missing laudoId or messages", { status: 400 });
  }

  // Fetch laudo
  const { data: laudo } = await supabase
    .from("laudos")
    .select("brand, model, year, km, asking_price, fipe_price, tipo")
    .eq("id", laudoId)
    .eq("user_id", user.id)
    .single();

  if (!laudo) return new Response("Laudo not found", { status: 404 });

  // Fetch checklist answers + issues
  const { data: items } = await supabase
    .from("laudo_items")
    .select("item_key, notes, category")
    .eq("laudo_id", laudoId);

  const checklistItems = items?.filter((i) => i.category === "checklist") ?? [];
  const cautelarItems = items?.filter((i) => i.category === "cautelar") ?? [];

  const issueIds = checklistItems.map((i) => parseInt(i.item_key)).filter(Boolean);

  let issueContext = "";
  if (issueIds.length) {
    const { data: issues } = await supabase
      .from("car_issues")
      .select("id, title, category, severity, if_bad, repair_cost")
      .in("id", issueIds);

    if (issues?.length) {
      const lines = issues.map((iss) => {
        const item = checklistItems.find((i) => i.item_key === String(iss.id));
        const status = item?.notes ?? "não verificado";
        return `- ${iss.title} (${iss.category}, ${iss.severity}): ${status}${status === "problema" && iss.if_bad ? ` → ${iss.if_bad}` : ""}${iss.repair_cost ? ` [reparo: ${iss.repair_cost}]` : ""}`;
      });
      issueContext = `\n\nChecklist respondido:\n${lines.join("\n")}`;
    }
  }

  const cautelarContext = cautelarItems.length
    ? `\n\nCautelar:\n${cautelarItems.map((c) => `- ${c.item_key}: ${c.notes}`).join("\n")}`
    : "";

  const priceContext =
    laudo.asking_price && laudo.fipe_price
      ? `\nPreço pedido: R$ ${laudo.asking_price.toLocaleString("pt-BR")} · FIPE: R$ ${laudo.fipe_price.toLocaleString("pt-BR")}`
      : "";

  const systemPrompt = `Você é o Pablo, assistente especialista em compra e venda de carros usados no Brasil.
Você está ajudando o usuário que está ${laudo.tipo === "vendedor" ? "vendendo" : "avaliando para comprar"} o seguinte veículo:

${laudo.brand} ${laudo.model} ${laudo.year} · ${laudo.km.toLocaleString("pt-BR")} km${priceContext}${issueContext}${cautelarContext}

Regras:
- Respostas curtas e diretas. Máximo 3 parágrafos.
- Se o usuário enviar foto, analise visualmente com foco em problemas mecânicos, estéticos ou de conservação relevantes para a compra/venda.
- Sempre contextualize para o modelo/ano/km específico.
- Se identificar algo na foto, diga o que é, a gravidade, e o custo estimado de reparo.
- Fale em português brasileiro informal mas profissional.
- Não invente problemas. Se não conseguir ver claramente, diga isso.`;

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content as any,
    })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
