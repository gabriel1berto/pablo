"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email) {
    return { error: "Preencha o e-mail." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: name ? { name } : undefined,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: "Não foi possível enviar o link. Tente novamente." };
  }

  return { success: true };
}
