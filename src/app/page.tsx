import Link from "next/link";

export default function LP() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      {/* Logo */}
      <div style={{ paddingTop: 52 }}>
        <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.8px" }}>
          pa<span style={{ color: "var(--accent)" }}>b</span>lo
        </span>
      </div>

      {/* Hero */}
      <div style={{ paddingTop: 40, flex: 1 }}>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: "-1px",
            lineHeight: 1.1,
            marginBottom: 14,
          }}
        >
          Laudo de carro{" "}
          <span style={{ color: "var(--accent)" }}>grátis</span>
          <br />
          em 8 minutos.
        </h1>

        <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.65, marginBottom: 32 }}>
          Checklist técnico, documentação e preço vs. FIPE —
          tudo antes de fechar negócio.
        </p>

        {/* Accordions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>

          {/* Buyer */}
          <details style={{ background: "var(--bg2)", border: "1px solid var(--bd)", borderRadius: "var(--rm)", overflow: "hidden" }} open>
            <summary style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", cursor: "pointer", listStyle: "none",
              userSelect: "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                  background: "var(--ag)", color: "var(--accent)",
                  letterSpacing: "0.5px", textTransform: "uppercase", flexShrink: 0,
                }}>
                  Comprando
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>
                  Descobrir o que o vendedor esconde
                </span>
              </div>
              <span style={{ fontSize: 16, color: "var(--t4)", flexShrink: 0, marginLeft: 8 }}>▾</span>
            </summary>
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--bd)" }}>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, margin: "12px 0 14px" }}>
                Checklist de 15+ pontos técnicos por modelo, alertas documentais e posição de preço vs. FIPE.
                Resultado claro: <strong style={{ color: "var(--ok)" }}>Boa Compra</strong>,{" "}
                <strong style={{ color: "var(--warn)" }}>Cautela</strong> ou{" "}
                <strong style={{ color: "var(--danger)" }}>Não Recomendado</strong>.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link
                  href="/cadastro"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 44, background: "var(--accent)", color: "#050505",
                    borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Avaliar carro que vou comprar →
                </Link>
                <Link
                  href="/laudo/ba45f916/resultado"
                  style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", textDecoration: "none" }}
                >
                  Ver exemplo: Onix 2017 · Score 8.8 · Boa Compra
                </Link>
              </div>
            </div>
          </details>

          {/* Seller */}
          <details style={{ background: "var(--bg2)", border: "1px solid var(--bd)", borderRadius: "var(--rm)", overflow: "hidden" }}>
            <summary style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", cursor: "pointer", listStyle: "none",
              userSelect: "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                  background: "rgba(167,139,250,0.12)", color: "#A78BFA",
                  letterSpacing: "0.5px", textTransform: "uppercase", flexShrink: 0,
                }}>
                  Vendendo
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>
                  Vender mais rápido com transparência
                </span>
              </div>
              <span style={{ fontSize: 16, color: "var(--t4)", flexShrink: 0, marginLeft: 8 }}>▾</span>
            </summary>
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--bd)" }}>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, margin: "12px 0 14px" }}>
                Gere um laudo de transparência do seu carro e cole o link no anúncio.
                Compradores confiam mais, negociam menos e fecham mais rápido.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link
                  href="/cadastro"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 44, background: "#A78BFA", color: "#050505",
                    borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Gerar laudo do meu carro →
                </Link>
                <Link
                  href="/laudo/8188fbf4/resultado"
                  style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", textDecoration: "none" }}
                >
                  Ver exemplo: Onix 2017 · Laudo de transparência
                </Link>
              </div>
            </div>
          </details>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {[
            { n: "8 min", l: "Para gerar\no laudo" },
            { n: "Grátis", l: "1° laudo\nsem custo" },
            { n: "R$ 100", l: "Laudos\nseguintes" },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--bd)",
                borderRadius: 14,
                padding: "14px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.5px" }}>
                {s.n}
              </div>
              <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, marginTop: 4, lineHeight: 1.4, whiteSpace: "pre-line" }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "24px 0 48px" }}>
        <Link
          href="/cadastro"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 54,
            background: "var(--accent)",
            color: "#050505",
            borderRadius: "var(--rs)",
            fontSize: 15,
            fontWeight: 800,
            textDecoration: "none",
            letterSpacing: "-0.2px",
          }}
        >
          Gerar laudo grátis →
        </Link>
      </div>
    </main>
  );
}
