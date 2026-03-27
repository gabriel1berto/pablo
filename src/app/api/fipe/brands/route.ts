import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://fipe.parallelum.com.br/api/v2/cars/brands", {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return NextResponse.json([]);
  const data = await res.json();
  return NextResponse.json(data);
}
