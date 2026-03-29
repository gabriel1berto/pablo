import Link from "next/link";

export default function PagamentoSucesso() {
  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "52px 24px 64px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>✓</div>
      <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 10 }}>
        Pagamento confirmado
      </h1>
      <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 36, maxWidth: 300 }}>
        Seu crédito foi adicionado. Você já pode gerar um novo laudo.
      </p>
      <Link
        href="/laudo/novo"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", maxWidth: 320, height: 54, background: "var(--accent)",
          color: "#050505", borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
          textDecoration: "none",
        }}
      >
        Gerar laudo →
      </Link>
    </main>
  );
}
