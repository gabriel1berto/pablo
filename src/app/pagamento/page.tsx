"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PagamentoPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
        Você já usou seu laudo gratuito. Laudos adicionais custam R$&nbsp;100 cada.
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
          "Score de 0 a 10 com veredicto",
          "Análise de preço vs FIPE",
          "Recomendação de negociação",
          "PDF para salvar e compartilhar",
        ].map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--t2)" }}>{item}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px solid var(--bd)", marginTop: 20, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>Total</span>
          <span style={{ fontSize: 28, fontWeight: 900, color: "var(--t1)", letterSpacing: "-1px" }}>R$ 100</span>
        </div>
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
        {loading ? "Redirecionando..." : "Pagar com cartão →"}
      </button>

      <button
        onClick={() => router.back()}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 46, background: "transparent", color: "var(--t3)",
          border: "none", fontSize: 13, cursor: "pointer", marginTop: 12,
        }}
      >
        Voltar
      </button>
    </main>
  );
}
