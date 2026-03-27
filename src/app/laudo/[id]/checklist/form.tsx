"use client";

import { useState } from "react";
import { salvarChecklist } from "./actions";

type Issue = {
  id: number;
  category: string;
  title: string;
  description: string;
  severity: "critical" | "warn" | "ok";
};

type State = "nd" | "ok" | "problema";

const CAT_LABEL: Record<string, string> = {
  motor: "Motor",
  transmissao: "Transmissão",
  suspensao: "Suspensão",
  freios: "Freios",
  pneus: "Pneus",
  carroceria: "Carroceria",
  eletrica: "Elétrica",
  documentacao: "Documentação",
};

const SEV: Record<string, { color: string; label: string }> = {
  critical: { color: "var(--danger)", label: "Crítico" },
  warn: { color: "var(--warn)", label: "Atenção" },
};

export default function ChecklistForm({
  laudoId,
  issues,
}: {
  laudoId: string;
  issues: Issue[];
}) {
  const [states, setStates] = useState<Record<number, State>>({});
  const [loading, setLoading] = useState(false);

  const getState = (id: number): State => states[id] ?? "nd";
  const setState = (id: number, s: State) =>
    setStates((prev) => ({ ...prev, [id]: s }));

  const grouped = issues.reduce<Record<string, Issue[]>>((acc, issue) => {
    (acc[issue.category] ??= []).push(issue);
    return acc;
  }, {});

  const problemCount = issues.filter((i) => getState(i.id) === "problema").length;
  const okCount = issues.filter((i) => getState(i.id) === "ok").length;
  const answered = problemCount + okCount;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    issues.forEach((issue) => {
      fd.append("item_id", String(issue.id));
      fd.append(`item_state_${issue.id}`, getState(issue.id));
    });
    await salvarChecklist(laudoId, fd);
  }

  const btn = (id: number, s: State, label: string, activeColor: string): React.CSSProperties => {
    const active = getState(id) === s;
    return {
      flex: 1,
      height: 34,
      fontSize: 12,
      fontWeight: 700,
      border: active ? "none" : "1px solid var(--bg4)",
      borderRadius: 8,
      cursor: "pointer",
      background: active ? activeColor : "var(--bg3)",
      color: active ? (s === "ok" ? "#050505" : "#fff") : "var(--t3)",
      transition: "all .12s",
    };
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: "var(--t4)",
            textTransform: "uppercase", letterSpacing: "0.8px",
            paddingBottom: 10, borderBottom: "1px solid var(--bd)", marginBottom: 4,
          }}>
            {CAT_LABEL[cat] ?? cat}
          </div>

          {items.map((issue) => {
            const sev = SEV[issue.severity];
            const state = getState(issue.id);
            return (
              <div key={issue.id} style={{
                padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                {/* Title row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: sev?.color ?? "var(--t3)",
                    flexShrink: 0, marginTop: 6,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", lineHeight: 1.3 }}>
                      {issue.title}
                      {sev && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, fontWeight: 700,
                          padding: "2px 7px", borderRadius: 99,
                          background: issue.severity === "critical" ? "var(--dg)" : "var(--wg)",
                          color: sev.color,
                        }}>
                          {sev.label}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4, lineHeight: 1.5 }}>
                      {issue.description}
                    </div>
                  </div>
                </div>

                {/* 3-state toggle */}
                <div style={{ display: "flex", gap: 6, marginLeft: 16 }}>
                  <button type="button" onClick={() => setState(issue.id, "ok")}
                    style={btn(issue.id, "ok", "✓ OK", "var(--ok)")}>
                    ✓ OK
                  </button>
                  <button type="button" onClick={() => setState(issue.id, "problema")}
                    style={btn(issue.id, "problema", "✗ Problema", "var(--danger)")}>
                    ✗ Problema
                  </button>
                  <button type="button" onClick={() => setState(issue.id, "nd")}
                    style={btn(issue.id, "nd", "? N/V", "var(--bg4)")}>
                    ? N/V
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ paddingTop: 8, paddingBottom: 48 }}>
        <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 14, textAlign: "center" }}>
          {answered} de {issues.length} itens respondidos
          {problemCount > 0 && (
            <span style={{ color: "var(--danger)", marginLeft: 8 }}>· {problemCount} problema{problemCount > 1 ? "s" : ""}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54,
            background: loading ? "#00a884" : "var(--accent)", color: "#050505",
            border: "none", borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Salvando..." : "Próximo →"}
        </button>
      </div>
    </form>
  );
}
