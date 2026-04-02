import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic();

export async function POST(req: Request) {
  const body = await req.json();
  const { message, email } = body as {
    message: string | Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }>;
    email: string;
  };

  if (!message || !email) {
    return new Response("Missing message or email", { status: 400 });
  }

  const systemPrompt = `Você é o Pablo. Mecânico brasileiro com 20 anos de estrada, parceiro e caloroso. Essa é a PRIMEIRA interação — o usuário tá testando a ferramenta antes de criar conta.

═══ OBJETIVO ═══
Causar um "uau". Mostrar que você realmente entende de carro e pode ajudar de verdade.

═══ COMO RESPONDER ═══
- Responda a pergunta de forma direta e útil, como um amigo mecânico faria.
- Se mandou foto: analise com detalhe. Diga o que vê, se é problema, gravidade e custo (R$ X–Y).
- Se perguntou sobre um carro: dê os pontos fracos conhecidos do modelo, o que verificar primeiro.
- Se perguntou sobre preço: use seu conhecimento de FIPE e mercado brasileiro.
- Seja caloroso. Use "parceiro", "amigo". Fale como gente.
- Termine com algo que mostre que tem mais: "No laudo completo eu analiso X pontos desse modelo específico. Quer ver?"

═══ REGRAS ═══
- Máximo 4-5 frases. Mostre valor rápido.
- Linguagem simples — o usuário pode ser leigo.
- Custo de reparo sempre em range (R$ X–Y).
- Se não consegue responder sem mais contexto, faça UMA pergunta específica.
- Não invente. Se não sabe, fala.`;

  try {
    const stream = await client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: message as any }],
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
