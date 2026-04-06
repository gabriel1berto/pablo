import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const maxDuration = 30;

const client = new Anthropic();

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { image, mediaType, itemTitle, category, carModel, carYear, carKm } = body as {
    image: string; // base64
    mediaType?: string;
    itemTitle: string;
    category: string;
    carModel: string;
    carYear: number;
    carKm: number;
  };

  if (!image || !itemTitle) {
    return NextResponse.json({ error: "Imagem e título são obrigatórios" }, { status: 400 });
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
  const mime = validTypes.includes(mediaType ?? "") ? mediaType! : "image/jpeg";

  // Limitar tamanho da imagem (5MB em base64 ≈ 6.6MB string)
  if (image.length > 7 * 1024 * 1024) {
    return NextResponse.json({ error: "Imagem muito grande (máx 5MB)" }, { status: 413 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mime as "image/jpeg" | "image/png" | "image/webp", data: image },
          },
          {
            type: "text",
            text: `Você é um mecânico especialista brasileiro. Analise esta foto do item "${itemTitle}" (categoria: ${category}) de um ${carModel} ${carYear} com ${carKm?.toLocaleString("pt-BR") ?? "?"} km.

Responda em JSON EXATO (sem markdown):
{
  "diagnosis": "1 frase do que você vê na foto",
  "severity": "ok" ou "warning" ou "critical",
  "repair_cost": "R$ X–Y" ou null se não precisa de reparo,
  "recommendation": "1 frase do que fazer"
}

Se a foto estiver escura, borrada ou não mostrar o item claramente, retorne:
{"diagnosis": "Foto não está clara o suficiente", "severity": "unclear", "repair_cost": null, "recommendation": "Tire outra foto mais próxima e com boa iluminação"}`,
          },
        ],
      }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      return NextResponse.json({ error: "Resposta inesperada da IA" }, { status: 502 });
    }

    // Parse JSON da resposta
    const raw = block.text.trim().replace(/^```json\n?|```$/g, "");
    const sanitized = raw.replace(/[\x00-\x1F\x7F]/g, " ");
    const analysis = JSON.parse(sanitized);

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("[analyze-photo] error:", err);
    return NextResponse.json({ error: "Erro na análise" }, { status: 502 });
  }
}
