"use client";
import { useState, useEffect } from "react";
import { C } from "./styles";
import type { TabId, ReportData } from "./types";
import { TabVisao } from "./tab-visao";
import { TabExterno } from "./tab-externo";
import { TabInterno } from "./tab-interno";
import { TabMecanicoDocs } from "./tab-mecanico-docs";
import { TabModelo } from "./tab-modelo";

const TABS: { id: TabId; label: string }[] = [
  { id: "visao", label: "Visão" },
  { id: "externo", label: "Externo" },
  { id: "interno", label: "Interno" },
  { id: "mecanico_docs", label: "Mec+Doc" },
  { id: "modelo", label: "Modelo" },
];

export function SellerReport({ data }: { data: ReportData }) {
  const [tab, setTab] = useState<TabId>("visao");

  // Deep-link via ?tab=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") as TabId | null;
    if (t && TABS.some((tb) => tb.id === t)) setTab(t);
  }, []);

  // Laudo ID curto (últimos 4 do UUID)
  const laudoShort = data.laudo.id.slice(-4).toUpperCase();

  return (
    <div style={{
      maxWidth: 380, margin: "0 auto", background: C.bg,
      border: `0.5px solid ${C.border}`, borderRadius: 12,
      overflow: "hidden", minHeight: "100vh",
      display: "flex", flexDirection: "column",
    }}>
      {/* ── Header fixo ────────────────────────── */}
      <div style={{
        height: 44, padding: "0 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `0.5px solid ${C.border}`, background: C.bg,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%", background: C.brand,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>
            P
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
            Laudo #{laudoShort}
          </span>
        </div>
        <span style={{ fontSize: 18, color: C.textTer, cursor: "pointer" }}>⋮</span>
      </div>

      {/* ── Conteúdo da tab ────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ opacity: 1, transition: "opacity 300ms" }}>
          {tab === "visao" && <TabVisao data={data} onTabChange={setTab} />}
          {tab === "externo" && <TabExterno data={data} />}
          {tab === "interno" && <TabInterno data={data} />}
          {tab === "mecanico_docs" && <TabMecanicoDocs data={data} />}
          {tab === "modelo" && <TabModelo data={data} />}
        </div>
      </div>

      {/* ── Bottom tab bar ─────────────────────── */}
      <div style={{
        height: 48, display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        borderTop: `0.5px solid ${C.border}`, background: C.bg,
        flexShrink: 0,
      }}>
        {TABS.map((t, i) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-label={`Tab ${t.label}`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 3, border: "none", cursor: "pointer", padding: 0,
                background: active ? C.brandBg : "transparent",
                borderLeft: i > 0 ? `0.5px solid ${C.border}` : "none",
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                border: active ? "none" : `1.5px solid ${C.placeholder}`,
                background: active ? C.brand : "transparent",
              }} />
              <span style={{
                fontSize: 9, fontWeight: active ? 500 : 400,
                color: active ? C.brandDark : C.textSec,
              }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
