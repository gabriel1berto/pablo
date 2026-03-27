import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandCode = searchParams.get("brand");
  if (!brandCode) return NextResponse.json([]);

  const res = await fetch(
    `https://fipe.parallelum.com.br/api/v2/cars/brands/${brandCode}/models`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return NextResponse.json([]);
  const raw = await res.json();
  // API may return flat array or { models: [...] }
  const data = Array.isArray(raw) ? raw : (Array.isArray(raw?.models) ? raw.models : []);
  return NextResponse.json(data);
}
