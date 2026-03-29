import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandCode = searchParams.get("brand");
  const modelCode = searchParams.get("model");
  if (!brandCode || !modelCode) return NextResponse.json([]);

  const res = await fetch(
    `https://fipe.parallelum.com.br/api/v2/cars/brands/${brandCode}/models/${modelCode}/years`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return NextResponse.json([]);
  const raw: { code: string; name: string }[] = await res.json();

  // Extract numeric year from name (e.g. "2022 Gasolina" → 2022), deduplicate
  const years = [...new Set(
    raw.map((y) => parseInt(y.name)).filter((n) => !isNaN(n))
  )].sort((a, b) => b - a);

  return NextResponse.json(years);
}
