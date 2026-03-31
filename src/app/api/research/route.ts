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

    const { brand, model, year, km } = await req.json();
    if (!brand || !model || !year || !km) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }
    await researchModelIssues(brand, model, year, km);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[research route] error:", err);
    return NextResponse.json({ error: "Falha na pesquisa", detail: String(err) }, { status: 500 });
  }
}
