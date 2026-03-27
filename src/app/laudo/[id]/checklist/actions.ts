"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function salvarChecklist(laudoId: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: laudo } = await supabase.from("laudos").select("id").eq("id", laudoId).eq("user_id", user.id).single();
  if (!laudo) return { error: "Laudo não encontrado." };

  const allIds = formData.getAll("item_id") as string[];

  const items = allIds.map((id) => {
    const state = (formData.get(`item_state_${id}`) as string) || "nd";
    return {
      laudo_id: laudoId,
      category: "checklist",
      item_key: id,
      checked: state === "ok",
      notes: state, // 'ok' | 'problema' | 'nd'
    };
  });

  await supabase.from("laudo_items").delete().eq("laudo_id", laudoId).eq("category", "checklist");
  const { error } = await supabase.from("laudo_items").insert(items);

  if (error) return { error: "Erro ao salvar. Tente novamente." };

  redirect(`/laudo/${laudoId}/cautelar`);
}
