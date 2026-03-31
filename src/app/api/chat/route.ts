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

  // Build checklist context from live state (sent by client)
  let checklistContext = "";
  if (checklistState?.length) {
    const problems = checklistState.filter((i) => i.state === "problema");
    const oks = checklistState.filter((i) => i.state === "ok");
    const lines: string[] = [];
    if (problems.length) {
      lines.push("PROBLEMAS MARCADOS:");
      for (const p of problems) lines.push(`  - ${p.title} (${p.category}, ${p.severity})`);
    }
    if (oks.length) {
      lines.push(`OK: ${oks.map((o) => o.title).join(", ")}`);
    }
    checklistContext = `\n\n${lines.join("\n")}`;
  }

  const priceContext =
    laudo.asking_price && laudo.fipe_price
      ? `\nPreço pedido: R$ ${laudo.asking_price.toLocaleString("pt-BR")} · FIPE: R$ ${laudo.fipe_price.toLocaleString("pt-BR")}`
      : "";

  const systemPrompt = `Você é mecânico e consultor automotivo com 20 anos de experiência no mercado brasileiro de usados. Especialista em ${laudo.brand} ${laudo.model}.

Veículo: ${laudo.brand} ${laudo.model} ${laudo.year} · ${laudo.km.toLocaleString("pt-BR")} km
Contexto: ${laudo.tipo === "vendedor" ? "vendedor declarando estado do carro" : "comprador avaliando antes de fechar"}${priceContext}${checklistContext}

Regras:
- Máximo 2-3 frases por resposta. Sem enrolação.
- Foto recebida: diga o que vê, se é problema, gravidade, custo estimado de reparo. Se não der pra ver direito, peça foto mais próxima.
- Sempre contextualiza pro modelo/ano/km. "No Onix 2017 com 45k km isso é comum" > "pode ser um problema".
- Custo de reparo sempre em range (R$ X–Y).
- Se o checklist mostra problemas, considere na resposta.
- Sem formalidades, sem "olá", sem "espero ter ajudado". Vai direto.`;

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
