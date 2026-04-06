/**
 * Pure utility — safe to import in client and server components.
 */

export function normalizeModelKey(fipeModelName: string): string {
  const first = fipeModelName.split(" ")[0];
  // Keep model codes with digits or dashes (HB20, T-Cross, CX-5)
  if (/\d/.test(first) || /[-]/.test(first)) return first;
  // Keep short all-caps (GLA, SUV, etc.)
  if (first.length <= 3) return first;
  // Title-case proper names (DUSTER → Duster, COROLLA → Corolla)
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

/** Escape SQL LIKE wildcards (% and _) for safe use in ilike queries */
export function escapeLikePattern(value: string): string {
  return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
}
