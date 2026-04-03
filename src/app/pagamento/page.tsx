"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PagamentoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Pagamento — Pablo";
  }, []);

  async function handlePagar() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Erro ao iniciar pagamento. Tente novamente.");
        setLoading(false);
      }
    } catch {
      setError("Erro ao iniciar pagamento. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "52px 24px 64px" }}>
      <div style={{ marginBottom: 32 }}>
        <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 44 }} />
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 8 }}>
        Laudo adicional
      </h1>
      <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 32 }}>
        Você já usou seu laudo gratuito. Laudos adicionais custam R$&nbsp;20 cada.
      </p>

      <div style={{
        background: "var(--bg2)", border: "1px solid var(--bd)",
        borderRadius: "var(--rm)", padding: "24px 20px", marginBottom: 28,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>
          O que está incluído
        </div>
        {[
          "Checklist completo com IA",
          "Fale com o Pablo — mecânico de bolso",
          "Score de 0 a 10 com veredicto",
          "Análise de preço vs FIPE",
          "Recomendação de negociação",
          "Laudo compartilhável por WhatsApp",
        ].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--t2)" }}>{item}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px solid var(--bd)", marginTop: 20, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>Total</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "var(--t1)", letterSpacing: "-1px" }}>R$ 20</span>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.12)",
        borderRadius: "var(--rm)", padding: "10px 14px", marginBottom: 20,
        fontSize: 12, color: "var(--t3)",
      }}>
        <span style={{ color: "var(--accent)", fontWeight: 900 }}>✓</span>
        Não gostou? Devolvo os R$ 20. Sem pergunta.
      </div>

      {error && (
        <div style={{ fontSize: 13, color: "var(--danger)", marginBottom: 12 }}>{error}</div>
      )}

      <button
        onClick={handlePagar}
        disabled={loading}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 54, background: loading ? "var(--bg3)" : "var(--accent)",
          color: loading ? "var(--t3)" : "#050505", border: "none",
          borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Redirecionando..." : "Pagar R$ 20"}
      </button>

      <div style={{ fontSize: 11, color: "var(--t4)", textAlign: "center", marginTop: 10 }}>
        Cartão, boleto ou PIX via Stripe
      </div>

      <Link
        href="/laudos"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 46, background: "transparent", color: "var(--t3)",
          fontSize: 13, textDecoration: "none", marginTop: 12,
        }}
      >
        Voltar
      </Link>
    </main>
  );
}
