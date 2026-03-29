"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function salvarMercado(laudoId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: laudo } = await supabase.from("laudos").select("id").eq("id", laudoId).eq("user_id", user.id).single();
  if (!laudo) redirect("/laudo/novo");

  const raw = formData.get("fipe_price") as string;
  const fipe_price = raw ? parseFloat(raw) : null;
  if (fipe_price !== null && !isNaN(fipe_price)) {
    await supabase.from("laudos").update({ fipe_price }).eq("id", laudoId);
  }
  redirect(`/laudo/${laudoId}/resultado`);
}
