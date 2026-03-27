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
      <div style={{ paddingTop: 56 }}>
        <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.8px" }}>
          pa<span style={{ color: "var(--accent)" }}>b</span>lo
        </span>
      </div>

      {/* Hero */}
      <div style={{ paddingTop: 48, flex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            background: "var(--ag)",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: "var(--rf)",
            padding: "5px 12px",
            marginBottom: 22,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Laudo grátis
          </span>
        </div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-1px",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Antes de comprar,{" "}
          <span style={{ color: "var(--accent)" }}>saiba tudo</span>
          <br />
          sobre o carro.
        </h1>

        <p style={{ fontSize: 16, color: "var(--t2)", lineHeight: 1.65 }}>
          Em 8 minutos você tem um laudo completo com FIPE, checklist técnico e
          análise de documentação.
        </p>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginTop: 36,
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
                borderRadius: 16,
                padding: "16px 10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  color: "var(--accent)",
                  letterSpacing: "-0.5px",
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--t3)",
                  fontWeight: 600,
                  marginTop: 5,
                  lineHeight: 1.4,
                  whiteSpace: "pre-line",
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 20 }}>
          <strong style={{ color: "var(--t2)" }}>1.200 laudos gerados</strong>{" "}
          · nota <strong style={{ color: "var(--t2)" }}>4.9 ★</strong>
        </p>
      </div>

      {/* CTA */}
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
