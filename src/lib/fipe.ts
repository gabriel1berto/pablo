const BASE = "https://fipe.parallelum.com.br/api/v2/cars";

type Item = { code: string; name: string };

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`FIPE ${res.status}`);
  return res.json();
}

function match(list: Item[], query: string) {
  const q = query.toLowerCase();
  return list.find((i) => i.name.toLowerCase().includes(q));
}

export type FipeResult = {
  price: string;
  model: string;
  brand: string;
  modelYear: number;
  referenceMonth: string;
  fipeCode: string;
};

export async function getFipePrice(
  brand: string,
  model: string,
  year: number
): Promise<FipeResult | null> {
  try {
    const brands = await get<Item[]>(`${BASE}/brands`);
    const b = match(brands, brand);
    if (!b) return null;

    const models = await get<Item[]>(`${BASE}/brands/${b.code}/models`);
    const m = match(models, model);
    if (!m) return null;

    const years = await get<Item[]>(`${BASE}/brands/${b.code}/models/${m.code}/years`);
    const y = years.find((yr) => yr.name.startsWith(String(year)));
    if (!y) return null;

    return await get<FipeResult>(
      `${BASE}/brands/${b.code}/models/${m.code}/years/${y.code}`
    );
  } catch {
    return null;
  }
}
