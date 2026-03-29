"use server";

import { createClient } from "@/lib/supabase/server";

export async function criarLaudo(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const year = parseInt(formData.get("year") as string);
  const km = parseInt((formData.get("km") as string).replace(/\D/g, ""));
  const condition = formData.get("condition") as string;
  const asking_price_raw = (formData.get("asking_price") as string).replace(/\D/g, "");
  const asking_price = asking_price_raw ? parseInt(asking_price_raw) : null;
  const state = formData.get("state") as string;
  const tipo = (formData.get("tipo") as string) === "vendedor" ? "vendedor" : "comprador";

  if (!brand || !model || !year || !km) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const { data, error } = await supabase
    .from("laudos")
    .insert({ user_id: user.id, brand, model, year, km, condition, asking_price, state, tipo })
    .select("id")
    .single();

  if (error) {
    return { error: "Erro ao salvar. Tente novamente." };
  }

  // Conta free — não consome crédito
  const { data: freeAccount } = await supabase
    .from("free_accounts")
    .select("email")
    .eq("email", user.email ?? "")
    .maybeSingle();

  if (!freeAccount) {
    // Marca crédito como usado (se existir — primeiro laudo é gratuito)
    const { data: credit } = await supabase
      .from("laudo_credits")
      .select("id")
      .eq("user_id", user.id)
      .is("used_at", null)
      .limit(1)
      .single();

    if (credit) {
      await supabase
        .from("laudo_credits")
        .update({ used_at: new Date().toISOString() })
        .eq("id", credit.id);
    }
  }

  return { id: data.id };
}
