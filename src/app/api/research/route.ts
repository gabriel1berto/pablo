import { NextRequest, NextResponse } from "next/server";
import { researchModelIssues } from "@/lib/research";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }
    const { brand, model, year, km } = body as { brand: string; model: string; year: number; km: number };
    if (!brand || !model || typeof year !== "number" || typeof km !== "number" || km < 0) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    // Verificar que o usuário tem laudo pra esse modelo
    const { count } = await supabase
      .from("laudos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("brand", brand);
    if (!count) {
      return NextResponse.json({ error: "Nenhum laudo encontrado para esse modelo" }, { status: 403 });
    }

    await researchModelIssues(brand, model, year, km);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[research route] error:", err);
    return NextResponse.json({ error: "Falha na pesquisa", detail: String(err) }, { status: 500 });
  }
}
