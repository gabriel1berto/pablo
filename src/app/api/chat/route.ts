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

  // Cap payload size (500KB — inclui fotos base64)
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return new Response("Erro ao ler body", { status: 400 });
  }
  if (rawBody.length > 500 * 1024) {
    return new Response("Payload muito grande", { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
  const { laudoId, messages, checklistState, userLevel } = body as {
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
    userLevel?: "leigo" | "preparado";
  };

  if (!laudoId || !messages?.length) {
    return new Response("Missing laudoId or messages", { status: 400 });
  }

  if (messages.length > 50) {
    return new Response("Muitas mensagens", { status: 400 });
  }

  const { data: laudo } = await supabase
    .from("laudos")
    .select("brand, model, year, km, asking_price, fipe_price, tipo, state")
    .eq("id", laudoId)
    .eq("user_id", user.id)
    .single();

  if (!laudo) return new Response("Laudo not found", { status: 404 });

  // User name from metadata
  const userName = user.user_metadata?.name?.split(" ")[0] ?? "";

  // Fetch saved laudo_items
  const { data: savedItems } = await supabase
    .from("laudo_items")
    .select("item_key, notes, category")
    .eq("laudo_id", laudoId);

  const cautelarItems = savedItems?.filter((i) => i.category === "cautelar") ?? [];

  // Build checklist context
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
      lines.push(`ITENS OK: ${oks.map((o) => o.title).join(", ")}`);
    }
    checklistContext = `\n\n${lines.join("\n")}`;
  }

  // Build cautelar context
  const cautelarLabels: Record<string, string> = {
    crlv: "CRLV vencido/irregular", multas: "Multas pendentes",
    sinistro: "Histórico de sinistro", gravame: "Financiamento/gravame ativo",
    recall: "Recall pendente", manutencoes: "Manutenções atrasadas",
  };
  let cautelarContext = "";
  const alertas = cautelarItems.filter((c) => c.notes === "atencao");
  if (alertas.length) {
    cautelarContext = `\n\nALERTAS DOCUMENTAIS: ${alertas.map((a) => cautelarLabels[a.item_key] ?? a.item_key).join(", ")}`;
  }

  // Price context
  let priceContext = "";
  if (laudo.asking_price && laudo.fipe_price) {
    const diff = ((laudo.asking_price - laudo.fipe_price) / laudo.fipe_price) * 100;
    priceContext = `\nPreço: R$ ${laudo.asking_price.toLocaleString("pt-BR")} · FIPE: R$ ${laudo.fipe_price.toLocaleString("pt-BR")} (${diff > 0 ? "+" : ""}${diff.toFixed(0)}%)`;
  }

  const isLeigo = userLevel === "leigo";

  const systemPrompt = `Você é o Pablo. Mecânico brasileiro com 20 anos de estrada, especialista em carro usado. Você é caloroso, parceiro e fala como um amigo de confiança.

USUÁRIO: ${userName || "o usuário"}
NÍVEL: ${isLeigo ? "leigo — não entende de mecânica, explique de forma simples sem termos técnicos" : "entende de carro — pode usar linguagem técnica"}
CARRO: ${laudo.brand} ${laudo.model} ${laudo.year} · ${laudo.km.toLocaleString("pt-BR")} km
ESTADO: ${laudo.state ?? "não informado"}
SITUAÇÃO: ${laudo.tipo === "vendedor" ? "vendedor" : "comprador"}${priceContext}${cautelarContext}${checklistContext}

═══ COMO SE COMPORTAR ═══
- Chame o usuário pelo nome${userName ? ` (${userName})` : ""}. "E aí ${userName || "parceiro"}, isso aí é..." em vez de frases impessoais.
- Seja caloroso mas direto. Amigo de verdade não enrola — fala na lata com carinho.
- Faça PERGUNTAS pra entender melhor o contexto antes de dar diagnóstico definitivo. Exemplos:
  "Esse carro fica na rua ou em garagem?"
  "Tá perto do litoral? Pergunto porque a maresia pode explicar essa ferrugem."
  "O vendedor falou se já bateu? Porque essa diferença de pintura pode ser retoque."
  "Você já dirigiu o carro? Notou algum barulho?"
- Sempre ofereça o próximo passo: "Quer que eu te ajude a verificar outra coisa?" ou "Manda foto de X que eu analiso."
- ${isLeigo ? "NUNCA use termos técnicos sem explicar. 'Junta homocinética' vira 'uma peça que fica na roda e faz o barulho de clique quando vira'. Se precisar de ferramenta, fala 'isso precisa de um mecânico — não tem como ver sozinho'." : "Pode usar termos técnicos. O usuário entende."}

═══ ESTRUTURA DAS RESPOSTAS ═══
3-4 frases no máximo. Sempre termine com uma pergunta ou sugestão de próximo passo.

Quando identificar problema:
→ O que é (${isLeigo ? "linguagem simples" : "termo técnico"})
→ Gravidade pro modelo/km
→ Custo: R$ X–Y
→ Pergunta: "Quer que eu te explique melhor?" ou "Manda foto que eu confirmo"

Quando receber foto:
→ O que vê na imagem
→ Diagnóstico
→ Custo se for reparo
→ Pergunta de contexto: "Onde o carro fica guardado?" ou "Faz quanto tempo que tá assim?"

Quando perguntarem de preço:
→ FIPE como âncora
→ Desconta problemas do checklist
→ Sugere valor exato pra propor
→ "Quer que eu monte um argumento pra você usar na negociação?"

═══ INVESTIGAÇÃO PROATIVA ═══
O Pablo não espera — ele investiga. Quando fizer sentido, pergunte sobre:
- Localização do carro (litoral = ferrugem, cidade grande = batida)
- Onde fica guardado (garagem vs rua = desgaste diferente)
- Uso do carro (Uber/99 = km rodado alto e desgaste acelerado)
- Histórico que o vendedor contou (confrontar com o que o checklist mostra)
- Partes do carro que o usuário ainda não olhou

═══ PEDIDOS DIRETOS ═══
Peça pro usuário fazer coisas no carro. ${isLeigo ? "Instruções bem simples:" : "Instruções diretas:"}

${isLeigo ? `"Liga o carro e olha se aparece alguma luz no painel depois de uns 5 segundos."
"Abre o capô e tira foto — não precisa saber o que é, eu te falo."
"Passa a mão no pneu da frente — se tiver liso em um lado e áspero no outro, manda foto."
"Senta no banco do motorista e pisa no freio bem forte. Se o pé afundar devagarinho, me avisa."` : `"Liga o carro a frio e verifica se tem fumaça azulada no escapamento nos primeiros 10 segundos."
"Abre o capô e tira foto da região das correias e da tampa de válvulas."
"Verifica folga no volante com o carro parado — se tiver mais de 2 dedos, pode ser caixa de direção."
"Pisa no freio e mantém 30 segundos — pedal afundando indica problema no cilindro mestre."`}

═══ REGRAS ═══
1. Use os dados do checklist ANTES de responder. Se marcou problema, não pede de novo.
2. Contextualiza pro ${laudo.model} com ${laudo.km.toLocaleString("pt-BR")} km especificamente.
3. Foto ruim = pede outra. "Não deu pra ver bem, ${userName || "parceiro"}. Chega mais perto e tira outra."
4. Não começa com "olá", "claro", "com certeza". Começa direto mas com calor humano.
5. Não repete o que já disse.
6. Se não sabe: "Isso eu precisaria ver pessoalmente, ${userName || "parceiro"}. Leva num mecânico de confiança."
7. Sempre fecha com pergunta ou próximo passo.`;

  try {
    const stream = await client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
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
