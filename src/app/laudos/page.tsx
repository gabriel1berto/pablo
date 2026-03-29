import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const VERDICT_COLOR: Record<string, string> = {
  "Boa Compra": "var(--ok)",
  "Compra com Cautela": "var(--warn)",
  "Risco Moderado": "var(--warn)",
  "Não Recomendado": "var(--danger)",
};

export default async function MeusLaudosPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: laudos } = await supabase
    .from("laudos")
    .select("id, brand, model, year, km, score, verdict, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px 64px" }}>
      {/* Header */}
      <div style={{ paddingTop: 52, paddingBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>
              pa<span style={{ color: "var(--accent)" }}>b</span>lo
            </span>
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", marginTop: 16, marginBottom: 2 }}>
            Meus laudos
          </h1>
          <p style={{ fontSize: 13, color: "var(--t3)" }}>
            {laudos?.length ?? 0} laudo{laudos?.length !== 1 ? "s" : ""} gerado{laudos?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/laudo/novo"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: 40, padding: "0 16px", background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 13, fontWeight: 800, textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          + Novo
        </Link>
      </div>

      {/* Empty state */}
      {(!laudos || laudos.length === 0) && (
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)", borderRadius: "var(--rm)",
          padding: "32px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Nenhum laudo ainda</div>
          <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 20 }}>
            Gere seu primeiro laudo gratuitamente antes de comprar um carro usado.
          </div>
          <Link
            href="/laudo/novo"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              height: 46, padding: "0 24px", background: "var(--accent)", color: "#050505",
              borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800, textDecoration: "none",
            }}
          >
            Gerar laudo grátis →
          </Link>
        </div>
      )}

      {/* Laudo list */}
      {laudos && laudos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {laudos.map((laudo) => {
            const verdictColor = VERDICT_COLOR[laudo.verdict] ?? "var(--t3)";
            const date = new Date(laudo.created_at).toLocaleDateString("pt-BR");
            return (
              <Link
                key={laudo.id}
                href={laudo.score ? `/laudo/${laudo.id}/resultado` : `/laudo/${laudo.id}/checklist`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  background: "var(--bg2)", border: "1px solid var(--bd)", borderRadius: "var(--rm)",
                  padding: "16px 18px", display: "flex", alignItems: "center", gap: 14,
                }}>
                  {/* Score */}
                  <div style={{
                    minWidth: 52, height: 52, borderRadius: 12, background: "var(--bg3)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {laudo.score ? (
                      <>
                        <span style={{ fontSize: 18, fontWeight: 900, color: verdictColor, lineHeight: 1 }}>
                          {laudo.score.toFixed(1)}
                        </span>
                        <span style={{ fontSize: 9, color: "var(--t4)", marginTop: 2 }}>/10</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 10, color: "var(--t4)", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
                        em<br />andamento
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {laudo.brand} {laudo.model} {laudo.year}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 3 }}>
                      {laudo.km.toLocaleString("pt-BR")} km · {date}
                    </div>
                    {laudo.verdict && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: verdictColor, marginTop: 4 }}>
                        {laudo.verdict}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <span style={{ color: "var(--t4)", fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
