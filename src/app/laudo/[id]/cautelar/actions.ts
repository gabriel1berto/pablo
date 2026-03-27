"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function salvarCautelar(laudoId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: laudo } = await supabase.from("laudos").select("id").eq("id", laudoId).eq("user_id", user.id).single();
  if (!laudo) return { error: "Laudo não encontrado." };

  const ITEMS = ["crlv", "multas", "sinistro", "gravame", "recall", "manutencoes"];

  const items = ITEMS.map((key) => ({
    laudo_id: laudoId,
    category: "cautelar",
    item_key: key,
    checked: formData.get(key) === "ok",
    severity: formData.get(key) === "ok" ? "ok" : formData.get(key) === "atencao" ? "warn" : "nd",
    notes: formData.get(key) as string,
  }));

  await supabase.from("laudo_items").delete().eq("laudo_id", laudoId).eq("category", "cautelar");
  const { error } = await supabase.from("laudo_items").insert(items);

  if (error) return { error: "Erro ao salvar. Tente novamente." };

  redirect(`/laudo/${laudoId}/mercado`);
}
