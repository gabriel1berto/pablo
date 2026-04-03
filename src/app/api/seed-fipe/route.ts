import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const maxDuration = 120;

const TOP_BRANDS = ["21","22","23","25","26","29","31","41","43","44","48","56","59","238","245","240","167","177","7","6","39","47","33","156","185","55","54"];

// Popular brands in Brazil — will be displayed first in the selector
const POPULAR_ORDER: Record<string, number> = {
  "21": 1,  // Fiat
  "23": 2,  // GM/Chevrolet
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
  "13": 14, // Citroën
  "238": 15, // BYD
  "245": 16, // Caoa Chery
  "240": 17, // GWM
  "7": 18,  // BMW
  "39": 19, // Mercedes
  "6": 20,  // Audi
};

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}

async function run(req: Request) {
  // Simple auth — check for a secret
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (key !== process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-8)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const results: string[] = [];

  try {
    // 1. Fetch and insert brands
    const brandsRes = await fetch("https://fipe.parallelum.com.br/api/v2/cars/brands");
    const brands: { code: string; name: string }[] = await brandsRes.json();

    const { error: brandError } = await supabase
      .from("fipe_brands")
      .upsert(brands.map(b => ({ code: b.code, name: b.name })), { onConflict: "code" });

    if (brandError) return NextResponse.json({ error: "Brands: " + brandError.message }, { status: 500 });
    results.push(`${brands.length} brands inserted`);

    // 2. Fetch and insert models for top brands
    let totalModels = 0;
    for (const brandCode of TOP_BRANDS) {
      try {
        const res = await fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands/${brandCode}/models`);
        const models: { code: string; name: string }[] = await res.json();

        if (!Array.isArray(models) || models.length === 0) {
          results.push(`Brand ${brandCode}: no models`);
          continue;
        }

        // Insert in chunks of 200
        for (let i = 0; i < models.length; i += 200) {
          const chunk = models.slice(i, i + 200);
          const { error } = await supabase
            .from("fipe_models")
            .upsert(
              chunk.map(m => ({ brand_code: brandCode, code: String(m.code), name: m.name })),
              { onConflict: "brand_code,code" }
            );
          if (error) {
            results.push(`Brand ${brandCode} chunk ${i} error: ${error.message}`);
            break;
          }
        }

        totalModels += models.length;
        results.push(`Brand ${brandCode}: ${models.length} models`);

        // Small delay
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        results.push(`Brand ${brandCode}: fetch error`);
      }
    }

    results.push(`Total: ${totalModels} models`);

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
