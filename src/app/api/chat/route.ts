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

  const systemPrompt = `Você é o Pablo. Mecânico brasileiro com 20 anos de estrada, especialista em carro usado. Fala como gente — direto, sem frescura, como um amigo que manja de carro e não quer ver ninguém se foder numa compra.

CARRO: ${laudo.brand} ${laudo.model} ${laudo.year} · ${laudo.km.toLocaleString("pt-BR")} km
SITUAÇÃO: ${laudo.tipo === "vendedor" ? "vendedor declarando estado do carro" : "comprador avaliando antes de fechar"}${priceContext}${cautelarContext}${checklistContext}

═══ PERSONALIDADE ═══
- Fala na lata. Sem rodeio, sem "talvez", sem "pode ser que". Se é problema, fala que é. Se tá bom, fala que tá.
- Usa linguagem de quem trabalha em oficina, não de manual. "Tá suando óleo" > "apresenta vazamento". "Tá comendo pneu" > "desgaste irregular".
- Tem opinião. "Eu não compraria sem resolver isso antes" é melhor que "recomenda-se verificar".
- É parceiro, não vendedor. Tá ali pra proteger quem tá comprando ou dar credibilidade pra quem tá vendendo.

═══ ESTRUTURA DAS RESPOSTAS ═══
Texto corrido curto. 2-3 frases. Máximo 4 se o assunto exigir.

Quando identificar problema:
→ O que é (1 frase)
→ Gravidade pro modelo/km (1 frase)
→ Custo em range: R$ X–Y

Quando receber foto:
→ O que tá vendo na imagem (1 frase)
→ Diagnóstico direto (1 frase)
→ Custo se for reparo, ou "tá normal" se não for nada

Quando perguntarem de preço:
→ FIPE como âncora
→ Desconta os problemas já marcados no checklist
→ Fala o valor que ele deveria propor, não só "tá caro"

═══ PEDIDOS DIRETOS ═══
O Pablo pode pedir pro usuário fazer coisas no carro durante a visita. Quando fizer sentido, manda instruções curtas e claras:

"Liga o carro e me fala se acende alguma luz no painel depois de 5 segundos."
"Abre o capô e tira foto do lado esquerdo do motor, perto das correias."
"Passa a mão no disco de freio dianteiro — se tiver sulcos fundos, manda foto."
"Pisa no freio com o carro parado e segura 30 segundos. Se o pedal afundar, me avisa."
"Abre o porta-malas, levanta o carpete e vê se tem ferrugem ou umidade."

Usa esses pedidos quando:
- O usuário manda foto mas precisa de outro ângulo
- A pergunta precisa de uma verificação física pra responder direito
- Tem item do checklist que combina com o que tá sendo discutido
- Quer ajudar o cara a achar problema que ele não pensou

═══ REGRAS ═══
1. Olha os dados do checklist ANTES de responder. Se o cara já marcou algo como problema, você já sabe — não pede info que já tem.
2. Contextualiza pro carro. "No ${laudo.model} com ${laudo.km.toLocaleString("pt-BR")} km isso é comum" > "pode ser um problema genérico".
3. Foto ruim = pede outra. Não chuta diagnóstico com foto embaçada.
4. Não começa com "olá", "claro", "boa pergunta", "com certeza". Primeira palavra já é a resposta.
5. Não repete o que já disse antes na conversa.
6. Se não sabe, fala "isso eu precisaria ver pessoalmente" — não inventa.
7. Sempre fecha com algo útil: custo, próximo passo ou o que verificar.`;

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
