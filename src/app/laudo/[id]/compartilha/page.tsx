"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Laudo = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  score: number;
  verdict: string;
  created_at: string;
  user_id: string;
};

const VERDICT_COLOR: Record<string, string> = {
  "Boa Compra": "var(--ok)",
  "Compra com Cautela": "var(--warn)",
  "Risco Moderado": "var(--warn)",
  "Não Recomendado": "var(--danger)",
};

export default function CompartilhaPage() {
  const { id } = useParams<{ id: string }>();
  const [laudo, setLaudo] = useState<Laudo | null>(null);
  const [copied, setCopied] = useState(false);
  const [laudoCount, setLaudoCount] = useState(0);

  useEffect(() => {
    const client = createClient();
    client
      .from("laudos")
      .select("id, brand, model, year, km, score, verdict, created_at, user_id")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setLaudo(data);
        client
          .from("laudos")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user_id)
          .then(({ count }) => setLaudoCount(count ?? 0));
      });
  }, [id]);

  const link = typeof window !== "undefined" ? window.location.origin + `/laudo/${id}` : "";

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function whatsapp() {
    const text = laudo
      ? `Laudo Pablo — ${laudo.brand} ${laudo.model} ${laudo.year}\nScore: ${laudo.score}/10 · ${laudo.verdict}\n${link}`
      : link;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  }

  if (!laudo) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--t3)", fontSize: 14 }}>
        {laudo === null ? "Carregando..." : "Laudo não encontrado."}
      </div>
    </main>
  );

  const verdictColor = VERDICT_COLOR[laudo.verdict] ?? "var(--warn)";
  const date = new Date(laudo.created_at).toLocaleDateString("pt-BR");

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "52px 24px 64px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 4 }}>
        Laudo pronto
      </h1>
      <p style={{ fontSize: 14, color: "var(--t2)", marginBottom: 28 }}>Salve ou compartilhe antes de fechar.</p>

      {/* Preview card */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--bd)", borderRadius: 20, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bd)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px" }}>
            pa<span style={{ color: "var(--accent)" }}>b</span>lo
          </span>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>{date}</span>
        </div>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bd)" }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{laudo.brand} {laudo.model} {laudo.year}</div>
          <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 3 }}>
            {laudo.km.toLocaleString("pt-BR")} km
          </div>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: verdictColor, letterSpacing: "-1px" }}>
            {laudo.score?.toFixed(1)}
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{laudo.verdict}</div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>Score /10</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <button
          onClick={() => window.print()}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", height: 52,
            background: "var(--accent)", color: "#050505", border: "none",
            borderRadius: "var(--rs)", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "0 18px",
          }}
        >
          <span style={{ fontSize: 18 }}>🖨</span> Imprimir / Salvar PDF
        </button>
        <button
          onClick={whatsapp}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", height: 52,
            background: "#25D366", color: "#fff", border: "none",
            borderRadius: "var(--rs)", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "0 18px",
          }}
        >
          <span style={{ fontSize: 18 }}>💬</span> Compartilhar no WhatsApp
        </button>
        <button
          onClick={copyLink}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", height: 52,
            background: "var(--bg2)", color: "var(--t1)", border: "1px solid var(--bd)",
            borderRadius: "var(--rs)", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "0 18px",
          }}
        >
          <span style={{ fontSize: 18 }}>🔗</span> {copied ? "Link copiado!" : "Copiar link do laudo"}
        </button>
      </div>

      {/* Upsell — only shown after first laudo */}
      {laudoCount >= 1 && (
        <div style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "var(--rm)", padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Próximo laudo por R$ 100</div>
          <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>
            Você usou seu laudo gratuito. Laudos adicionais são R$ 100 cada.
          </div>
          <Link href="/laudo/novo" style={{ display: "inline-block", marginTop: 12, fontSize: 13, fontWeight: 700, color: "#A78BFA", textDecoration: "none" }}>
            Fazer novo laudo →
          </Link>
        </div>
      )}
    </main>
  );
}
