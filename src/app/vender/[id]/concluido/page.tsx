"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const C = {
  brand: "#F25C05",
  text: "#1A1A19",
  textSec: "#6B6A65",
  textTer: "#9C9B95",
  bgSec: "#F5F4F0",
  border: "#E3E2DD",
  green: "#1D9E75",
};

export default function ConcluidoPage() {
  const { id } = useParams<{ id: string }>();
  const [laudo, setLaudo] = useState<{ brand: string; model: string; year: number; km: number; score: number | null; asking_price: number | null; transparency_pct: number | null } | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);

  const link = typeof window !== "undefined" ? `${window.location.origin}/laudo/${id}` : "";

  useEffect(() => {
    const client = createClient();
    client.from("laudos")
      .select("brand, model, year, km, score, asking_price, transparency_pct")
      .eq("id", id).single()
      .then(({ data }) => { if (data) setLaudo(data); });
    client.from("seller_inspection_items")
      .select("id", { count: "exact", head: true })
      .eq("laudo_id", id).not("response", "is", null)
      .then(({ count }) => setCheckedCount(count ?? 0));
  }, [id]);

  if (!laudo) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 13, color: C.textTer }}>Carregando...</span>
    </main>
  );

  const score = laudo.score ? Number(laudo.score).toFixed(1) : "—";
  const transPct = laudo.transparency_pct ? Number(laudo.transparency_pct) : 0;
  const fmtPrice = laudo.asking_price ? `R$ ${Number(laudo.asking_price).toLocaleString("pt-BR")}` : "";

  const textoAnuncio = [
    `${laudo.brand} ${laudo.model} ${laudo.year} — ${laudo.km.toLocaleString("pt-BR")} km`,
    fmtPrice ? `Preço: ${fmtPrice}` : null,
    "",
    `Laudo Pablo com nota ${score}/10 · ${transPct}% de transparência · ${checkedCount} pontos verificados.`,
    "",
    `Relatório completo com fotos, vídeos e score:`,
    link,
    "",
    `Gerado por pabloapps.net`,
  ].filter((l) => l !== null).join("\n");

  function copyText() {
    navigator.clipboard.writeText(textoAnuncio).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px 64px" }}>
      {/* Sucesso */}
      <div style={{ paddingTop: 52, textAlign: "center", marginBottom: 28 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `${C.green}15`, border: `2px solid ${C.green}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 24,
        }}>✓</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Laudo pronto</h1>
        <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5 }}>
          Nota <strong>{score}/10</strong> · {transPct}% de transparência
        </p>
      </div>

      {/* Preview */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>P</div>
          <span style={{ fontSize: 12, color: C.textTer }}>Condition Report</span>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{laudo.brand} {laudo.model} {laudo.year}</div>
          <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{laudo.km.toLocaleString("pt-BR")} km{fmtPrice ? ` · ${fmtPrice}` : ""}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2.5px solid #2C2C2A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: C.text }}>{score}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{checkedCount} pontos verificados</div>
              <div style={{ fontSize: 11, color: C.textTer }}>{transPct}% transparência</div>
            </div>
          </div>
        </div>
      </div>

      {/* Texto pro anúncio */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.brand, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          TEXTO PRONTO PRO ANÚNCIO
        </div>
        <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {textoAnuncio}
        </div>
      </div>

      {/* Botões */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <button onClick={copyText} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 52, border: "none", borderRadius: 8,
          background: copied ? `${C.green}20` : C.brand,
          color: copied ? C.green : "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
          {copied ? "Texto copiado ✓" : "Copiar texto do anúncio"}
        </button>

        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(textoAnuncio)}`)} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 52, border: "none", borderRadius: 8,
          background: "#25D366", color: "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
          Compartilhar no WhatsApp
        </button>

        <button onClick={() => navigator.clipboard.writeText(link)} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 48, borderRadius: 8,
          background: "transparent", color: C.text,
          border: `1px solid ${C.border}`,
          fontSize: 13, fontWeight: 500, cursor: "pointer",
        }}>
          Copiar link do relatório
        </button>
      </div>

      {/* Dica */}
      <div style={{ background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>Como usar na OLX, Facebook e Instagram</div>
        <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.6 }}>
          1. Copie o texto acima{"\n"}2. Cole na descrição do seu anúncio{"\n"}3. O link do relatório dá credibilidade ao comprador
        </div>
      </div>

      {/* Links */}
      <Link href={`/laudo/${id}`} style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "100%", height: 48, borderRadius: 8,
        background: "transparent", color: C.brand,
        border: `1.5px solid ${C.brand}`,
        fontSize: 14, fontWeight: 700, textDecoration: "none",
      }}>Ver meu relatório</Link>

      <Link href="/laudos" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "100%", height: 40, marginTop: 10,
        fontSize: 12, color: C.textTer, textDecoration: "none",
      }}>Ir para meus laudos</Link>
    </main>
  );
}
