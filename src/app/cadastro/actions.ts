"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

async function siteUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email) return { error: "Preencha o e-mail." };
  if (!name?.trim()) return { error: "Preencha o nome." };

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

  const base = await siteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${base}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("rate")) {
      return { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
    }
    return { error: "E-mail não cadastrado. Crie uma conta primeiro." };
  }
  return { success: true };
}

export async function verifyOtpCode(email: string, token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
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
