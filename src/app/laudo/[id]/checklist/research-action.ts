"use server";

import { createClient } from "@/lib/supabase/server";
import { researchModelIssues } from "@/lib/research";

export async function triggerResearch(
  brand: string,
  model: string,
  year: number,
  km: number
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await researchModelIssues(brand, model, year, km);
}
