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

        {/* Result preview */}
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden", marginBottom: 24,
        }}>
          {/* Preview header */}
          <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "var(--t4)", letterSpacing: "0.3px" }}>
              Chevrolet Onix 2017 · 45.000 km
            </span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: "var(--ag)", color: "var(--accent)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Exemplo
            </span>
          </div>

          {/* Verdict hero */}
          <div style={{
            background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "var(--rm)", margin: "12px 14px",
            padding: "16px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
              Avaliação Pablo
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ok)", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 6 }}>
              Boa Compra
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3, marginBottom: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "var(--ok)", letterSpacing: "-1px", lineHeight: 1 }}>8.8</span>
              <span style={{ fontSize: 14, color: "var(--t3)" }}>/10</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--t3)" }}>1 atenção · preço alinhado com FIPE</div>
          </div>

          {/* Sample finding */}
          <div style={{ padding: "0 14px" }}>
            <div style={{
              background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.2)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)" }}>Pneus com desgaste irregular</span>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 99, background: "rgba(234,179,8,0.15)", color: "var(--warn)", letterSpacing: "0.3px" }}>ATENÇÃO</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4, lineHeight: 1.4 }}>
                Reparo estimado: <strong style={{ color: "var(--t2)" }}>R$ 400–800</strong>
              </div>
            </div>

            {/* Sample positive */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
              borderRadius: 12, padding: "8px 12px", marginBottom: 8,
            }}>
              <span style={{ fontSize: 12, color: "var(--ok)" }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>Motor sem ruídos anormais</span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
              borderRadius: 12, padding: "8px 12px", marginBottom: 10,
            }}>
              <span style={{ fontSize: 12, color: "var(--ok)" }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>Transmissão sem solavancos</span>
            </div>
          </div>

          {/* Sample recommendation */}
          <div style={{ padding: "0 14px 14px" }}>
            <div style={{
              display: "flex", gap: 10,
              background: "var(--bg3)", borderRadius: 12, padding: "10px 12px",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%", background: "var(--bg4)", color: "var(--accent)",
                fontSize: 9, fontWeight: 900, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>1</div>
              <div style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>
                Na negociação: peça desconto para cobrir troca dos pneus — R$ 400–800.
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          <Link
            href="/cadastro"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 48, background: "var(--accent)", color: "#050505",
              borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Avaliar carro que vou comprar →
          </Link>
          <Link
            href="/cadastro"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 48, background: "#A78BFA", color: "#050505",
              borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Gerar laudo do meu carro →
          </Link>
        </div>

        {/* Example link */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link
            href="/laudo/52ce00a0-c142-4739-9141-f273718db41f"
            style={{ fontSize: 11, color: "var(--t4)", textDecoration: "none" }}
          >
            Ver laudo real →
          </Link>
        </div>

        {/* AI Chat feature */}
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden", marginBottom: 24,
        }}>
          <div style={{ padding: "16px 16px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--ag)", color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900, flexShrink: 0,
              }}>AI</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--t1)" }}>
                  IA que vê o carro com você
                </div>
                <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 1 }}>
                  Tire fotos, pergunte, receba análise instantânea
                </div>
              </div>
            </div>
          </div>

          {/* Mock chat */}
          <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* User message with image placeholder */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                background: "var(--accent)", color: "#050505",
                borderRadius: "14px 14px 4px 14px", padding: "10px 14px",
                maxWidth: "80%",
              }}>
                <div style={{
                  width: "100%", height: 80, borderRadius: 8,
                  background: "rgba(0,0,0,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 6, fontSize: 24,
                }}>
                  <span style={{ opacity: 0.4 }}>🔍</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Esse desgaste é grave?</div>
              </div>
            </div>

            {/* Assistant response */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                background: "var(--bg3)", color: "var(--t1)",
                borderRadius: "14px 14px 14px 4px", padding: "10px 14px",
                maxWidth: "85%",
              }}>
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  O pneu dianteiro esquerdo tem desgaste na borda interna — sinal de <strong style={{ color: "var(--warn)" }}>desalinhamento</strong>. Para um Onix 2017 com 45k km, recomendo troca dos 2 dianteiros. <strong style={{ color: "var(--t2)" }}>Custo: R$ 400–600.</strong>
                </div>
              </div>
            </div>
          </div>
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
