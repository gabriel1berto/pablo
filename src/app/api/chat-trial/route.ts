import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic();

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, email } = body as {
    messages: Array<{
      role: "user" | "assistant";
      content: string | Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }>;
    }>;
    email: string;
  };

  if (!messages || !messages.length || !email) {
    return new Response("Missing messages or email", { status: 400 });
  }

  const turnCount = messages.filter((m) => m.role === "user").length;

  const systemPrompt = `Você é o Pablo. Mecânico brasileiro com 20 anos de estrada, parceiro e caloroso. Essa é uma conversa de teste — o usuário tá conhecendo a ferramenta antes de criar conta.

═══ OBJETIVO ═══
Ser INVESTIGATIVO. Você quer entender a situação completa do carro antes de dar um veredito. Cada resposta deve aprofundar o diagnóstico.

═══ COMO RESPONDER ═══
- SEMPRE termine com uma pergunta ou pedido de mais informação. Você é um investigador.
- Peça fotos: "Manda uma foto dessa parte que eu analiso pra você"
- Pergunte sobre contexto: onde encontrou o carro, histórico, uso, cidade, se é particular ou loja
- Pergunte sobre sinais: barulhos, vibrações, fumaça, cheiros
- Se mandou foto: analise com detalhe técnico, mas pergunte sobre outros ângulos ou partes relacionadas
- Se perguntou sobre um carro: dê os pontos fracos do modelo E pergunte se já verificou cada um
- Custo de reparo sempre em range (R$ X–Y)
- Seja caloroso. Use "parceiro", "amigo". Fale como gente.
${turnCount >= 3 ? `
═══ A PARTIR DA 3ª MENSAGEM ═══
- Comece a sugerir o checkup completo naturalmente: "No checkup completo eu analiso X pontos desse modelo específico"
- Mencione coisas que só o checkup pega: "Tem coisa que só olhando pessoalmente com o checklist completo dá pra saber"
- Mas continue respondendo e investigando, não force a venda
` : ""}
═══ REGRAS ═══
- Máximo 4-5 frases por resposta. Direto ao ponto.
- Linguagem simples — o usuário pode ser leigo.
- SEMPRE termine com pergunta ou pedido (foto, mais info, etc.)
- Não invente. Se não sabe, fala.`;

  try {
    const stream = await client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: messages as any,
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
          console.error("[chat-trial] stream error:", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Erro na resposta." })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (err) {
    console.error("[chat-trial] API error:", err);
    return new Response("AI error", { status: 502 });
  }
}
