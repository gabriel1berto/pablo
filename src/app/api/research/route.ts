import { NextRequest, NextResponse } from "next/server";
import { researchModelIssues } from "@/lib/research";

export const maxDuration = 60; // segundos — requer plano Vercel Pro ou hobby com fluid compute

export async function POST(req: NextRequest) {
  try {
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
