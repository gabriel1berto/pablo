import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const service = createServiceClient();
  const { data: laudo } = await service
    .from("laudos")
    .select("user_id, model")
    .eq("id", id)
    .single();

  if (!laudo || laudo.user_id !== user.id) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const modelKey = `%${laudo.model.toLowerCase().replace(/\s+/g, "%")}%`;
  const { data: issues } = await service
    .from("car_issues")
    .select("id, title, description, severity, category, repair_cost")
    .ilike("model_pattern", modelKey)
    .order("severity", { ascending: true })
    .order("sort_order");

  return NextResponse.json({ issues: issues ?? [] });
}
