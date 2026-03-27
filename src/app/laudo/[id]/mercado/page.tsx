import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFipePrice } from "@/lib/fipe";
import { salvarMercado } from "./actions";

function parseBRL(price: string) {
  return parseFloat(price.replace(/[R$\s.]/g, "").replace(",", "."));
}

export default async function MercadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: laudo } = await supabase
    .from("laudos")
    .select("brand, model, year, km, asking_price")
    .eq("id", id)
    .single();

  if (!laudo) redirect("/laudo/novo");

  const fipe = await getFipePrice(laudo.brand, laudo.model, laudo.year);
  const fipeValue = fipe ? parseBRL(fipe.price) : null;
  const diff = fipeValue && laudo.asking_price ? laudo.asking_price - fipeValue : null;
  const diffPct = diff && fipeValue ? ((diff / fipeValue) * 100).toFixed(1) : null;
  const isAbove = diff !== null && diff > 0;

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const action = salvarMercado.bind(null, id);

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
      {/* Header */}
      <div style={{ paddingTop: 52, paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Link href={`/laudo/${id}/cautelar`} style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>← Voltar</Link>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>Passo 4 de 5</span>
        </div>
        <div style={{ height: 3, background: "var(--bg3)", borderRadius: 99, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ width: "80%", height: "100%", background: "var(--accent)", borderRadius: 99 }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 4 }}>Mercado</h1>
        <p style={{ fontSize: 14, color: "var(--t2)" }}>
          {laudo.brand} {laudo.model} {laudo.year} · {laudo.km.toLocaleString("pt-BR")} km
        </p>
      </div>

      {fipeValue ? (
        <>
          {/* FIPE hero */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--bd)", borderRadius: 20, padding: 24, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
              Tabela FIPE
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-2px" }}>{fmt(fipeValue)}</div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 6 }}>
              {laudo.brand} {fipe?.model} · {fipe?.referenceMonth}
            </div>
          </div>

          {/* Comparativo */}
          {laudo.asking_price && diff !== null && (
            <>
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: "Preço FIPE", val: fmt(fipeValue), color: "var(--t1)" },
                  { label: "Pedido pelo vendedor", val: fmt(laudo.asking_price), color: isAbove ? "var(--danger)" : "var(--ok)" },
                  { label: "Diferença", val: `${isAbove ? "+" : ""}${fmt(diff)} (${isAbove ? "+" : ""}${diffPct}%)`, color: isAbove ? "var(--danger)" : "var(--ok)" },
                ].map((r) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 13, color: "var(--t2)" }}>{r.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: r.color }}>{r.val}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: isAbove ? "var(--dg)" : "var(--og)",
                border: `1px solid ${isAbove ? "rgba(255,68,68,0.2)" : "rgba(46,204,113,0.2)"}`,
                borderRadius: "var(--rm)", padding: "14px 16px", marginBottom: 24,
                fontSize: 13, color: "var(--t1)", lineHeight: 1.5,
              }}>
                {isAbove
                  ? `Carro pedido ${diffPct}% acima da FIPE. Há margem para negociar até ${fmt(diff)}.`
                  : `Carro pedido ${Math.abs(Number(diffPct))}% abaixo da FIPE. Preço competitivo.`}
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--bd)", borderRadius: "var(--rm)", padding: 20, color: "var(--t3)", fontSize: 14, marginBottom: 24 }}>
          Não foi possível buscar o preço FIPE para este modelo. Continue assim mesmo.
        </div>
      )}

      <form action={action}>
        <input type="hidden" name="fipe_price" value={fipeValue ?? ""} />
        <button
          type="submit"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54, background: "var(--accent)", color: "#050505",
            border: "none", borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800, cursor: "pointer",
          }}
        >
          Ver resultado →
        </button>
      </form>
    </main>
  );
}
