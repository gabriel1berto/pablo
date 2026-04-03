import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Marcas mais vendidas no Brasil — aparecem primeiro
const POPULAR: Record<string, number> = {
  "21": 1,  // Fiat
  "23": 2,  // GM - Chevrolet
  "59": 3,  // VW
  "26": 4,  // Hyundai
  "25": 5,  // Honda
  "56": 6,  // Toyota
  "29": 7,  // Jeep
  "48": 8,  // Renault
  "43": 9,  // Nissan
  "22": 10, // Ford
  "31": 11, // Kia
  "41": 12, // Mitsubishi
  "44": 13, // Peugeot
  "238": 14, // BYD
  "245": 15, // Caoa Chery
  "240": 16, // GWM
};

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("fipe_brands")
    .select("code, name")
    .order("name");

  if (error || !data) return NextResponse.json([]);

  // Sort: popular first, then alphabetical
  const sorted = data.sort((a, b) => {
    const pa = POPULAR[a.code] ?? 999;
    const pb = POPULAR[b.code] ?? 999;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json(sorted);
}
