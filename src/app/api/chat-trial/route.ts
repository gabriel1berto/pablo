import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic();

// ── Rate limit in-memory por IP ──────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hora

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

// Limpa entries expiradas a cada 5 min pra não vazar memória
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateMap) {
    if (now > val.resetAt) rateMap.delete(key);
  }
}, 5 * 60 * 1000);

const MAX_MESSAGES = 10;
const MAX_BODY_BYTES = 50 * 1024; // 50KB

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  if (isRateLimited(ip)) {
    return new Response("Muitas requisições. Tente novamente mais tarde.", { status: 429 });
  }

  // Cap payload size — lê como text pra checar tamanho real (Content-Length é client-controlled)
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return new Response("Erro ao ler body", { status: 400 });
  }
  if (rawBody.length > MAX_BODY_BYTES) {
    return new Response("Payload muito grande", { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
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

  // Cap server-side: máximo 10 mensagens do usuário
  const userMsgCount = messages.filter((m) => m.role === "user").length;
  if (userMsgCount > MAX_MESSAGES) {
    return new Response("Limite de mensagens atingido. Crie uma conta para continuar.", { status: 403 });
  }

  const turnCount = userMsgCount;

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
