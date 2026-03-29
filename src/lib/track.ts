"use client";

import { createClient } from "@/lib/supabase/client";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("pablo_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("pablo_sid", sid);
  }
  return sid;
}

export async function track(
  event: string,
  options?: { metadata?: Record<string, unknown>; laudoId?: string }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("user_activity_log").insert({
      session_id: getSessionId(),
      user_id: user?.id ?? null,
      event,
      laudo_id: options?.laudoId ?? null,
      metadata: options?.metadata ?? {},
    });
  } catch {
    // tracking nunca quebra o app
  }
}

export async function trackSession() {
  try {
    if (typeof window === "undefined") return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const params = new URLSearchParams(window.location.search);
    await supabase.from("lead_sessions").insert({
      session_id: getSessionId(),
      user_id: user?.id ?? null,
      referrer: document.referrer || null,
      landing_page: window.location.pathname,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
    });
  } catch {
    // tracking nunca quebra o app
  }
}
