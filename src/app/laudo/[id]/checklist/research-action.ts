"use server";

import { researchModelIssues } from "@/lib/research";

export async function triggerResearch(
  brand: string,
  model: string,
  year: number,
  km: number
): Promise<void> {
  await researchModelIssues(brand, model, year, km);
}
