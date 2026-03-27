import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase.from("laudos").select("id", { count: "exact", head: true }).eq("user_id", user.id);
        return NextResponse.redirect(`${origin}${count && count > 0 ? "/laudos" : "/laudo/novo"}`);
      }
      return NextResponse.redirect(`${origin}/laudo/novo`);
    }
  }

  return NextResponse.redirect(`${origin}/cadastro?error=link_invalido`);
}
