"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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

  // ── Verificar crédito ANTES de inserir ──────────────────────
  const { data: freeAccount } = await supabase
    .from("free_accounts")
    .select("email")
    .eq("email", user.email ?? "")
    .maybeSingle();

  let creditConsumed: string | null = null;

  if (!freeAccount) {
    const { count: laudoCount } = await supabase
      .from("laudos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((laudoCount ?? 0) >= 1) {
      // ── Claim atômico: UPDATE WHERE used_at IS NULL ──────────
      // Se 2 requests concorrentes tentarem o mesmo crédito,
      // apenas um UPDATE retorna a row (Postgres row-level lock).
      const { data: claimed } = await supabase
        .from("laudo_credits")
        .update({ used_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("used_at", null)
        .select("id")
        .limit(1)
        .maybeSingle();

      if (!claimed) {
        return { error: "Sem créditos. Compre um laudo para continuar." };
      }

      creditConsumed = claimed.id;
    }
  }

  // ── Inserir laudo (service client — bypassa RLS, INSERT bloqueado pro client) ──
  const service = createServiceClient();
  const { data, error } = await service
    .from("laudos")
    .insert({ user_id: user.id, brand, model, year, km, condition, asking_price, state, tipo, score_version: tipo === "vendedor" ? "v2" : "v1" })
    .select("id")
    .single();

  if (error) {
    // Rollback: libera crédito se insert falhou
    if (creditConsumed) {
      await supabase
        .from("laudo_credits")
        .update({ used_at: null })
        .eq("id", creditConsumed);
    }
    return { error: "Erro ao salvar. Tente novamente." };
  }

  return { id: data.id };
}
