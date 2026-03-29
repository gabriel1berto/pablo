"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email) return { error: "Preencha o e-mail." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { data: name ? { name } : undefined },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Preencha o e-mail." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) return { error: "E-mail não cadastrado. Crie uma conta primeiro." };
  return { success: true };
}

export async function verifyOtpCode(email: string, token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "magiclink",
  });

  if (error) return { error: error.message };

  const user = data.user;
  if (user) {
    const { count } = await supabase
      .from("laudos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    redirect(count && count > 0 ? "/laudos" : "/laudo/novo");
  }
  redirect("/laudo/novo");
}
