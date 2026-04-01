"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!email) return { error: "Preencha o e-mail." };
  if (!name?.trim()) return { error: "Preencha o nome." };
  if (!password || password.length < 6) return { error: "Senha precisa ter pelo menos 6 caracteres." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Esse e-mail já tem conta. Faz login." };
    }
    return { error: error.message };
  }

  if (data.user) {
    redirect("/laudo/novo");
  }

  return { error: "Erro inesperado. Tente novamente." };
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email) return { error: "Preencha o e-mail." };
  if (!password) return { error: "Preencha a senha." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "E-mail ou senha errados." };
    }
    return { error: error.message };
  }

  if (data.user) {
    const { count } = await supabase
      .from("laudos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", data.user.id);
    redirect(count && count > 0 ? "/laudos" : "/laudo/novo");
  }

  return { error: "Erro inesperado." };
}
