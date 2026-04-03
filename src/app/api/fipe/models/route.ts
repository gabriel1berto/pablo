import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Modelos populares no Brasil — aparecem primeiro
const POPULAR_MODELS = [
  "onix", "hb20", "argo", "polo", "corolla", "civic", "creta", "tracker",
  "gol", "t-cross", "compass", "renegade", "kicks", "nivus", "pulse",
  "strada", "toro", "hilux", "s10", "saveiro", "mobi", "kwid", "duster",
  "hr-v", "tucson", "corolla cross", "yaris", "cronos", "fastback", "ka",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandCode = searchParams.get("brand");
  if (!brandCode || !/^\d+$/.test(brandCode)) return NextResponse.json([]);

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("fipe_models")
    .select("code, name")
    .eq("brand_code", brandCode)
    .order("name");

  if (error || !data) {
    // Fallback to external API if not in DB
    try {
      const res = await fetch(
        `https://fipe.parallelum.com.br/api/v2/cars/brands/${brandCode}/models`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return NextResponse.json([]);
      const raw = await res.json();
      const arr = Array.isArray(raw) ? raw : (Array.isArray(raw?.models) ? raw.models : []);
      return NextResponse.json(arr);
    } catch {
      return NextResponse.json([]);
    }
  }

  // Sort: popular models first, then alphabetical
  const sorted = data.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    const idxA = POPULAR_MODELS.findIndex(p => nameA.includes(p));
    const idxB = POPULAR_MODELS.findIndex(p => nameB.includes(p));
    const pa = idxA >= 0 ? idxA : 999;
    const pb = idxB >= 0 ? idxB : 999;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json(sorted);
}
