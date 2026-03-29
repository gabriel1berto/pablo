"use client";

import { useState } from "react";
import { salvarChecklist } from "./actions";

type Issue = {
  id: number;
  category: string;
  title: string;
  description: string;
  severity: "critical" | "warn";
  how_to_check: string | null;
  why_important: string | null;
  if_bad: string | null;
  repair_cost: string | null;
};

type State = "ok" | "problema";

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

const MECHANIC_KEYWORDS = [
  "elevador", "desmontag", "oficina", "mecânico", "mecanic",
  "técnico", "técnica", "perito", "escâner", "scanner", "diagnóstico", "diagnos",
];

function requiresMechanic(issue: Issue): boolean {
  const text = [(issue.how_to_check ?? ""), (issue.if_bad ?? "")].join(" ").toLowerCase();
  return MECHANIC_KEYWORDS.some((k) => text.includes(k));
}

export default function ChecklistForm({
  laudoId,
  issues,
}: {
  laudoId: string;
  issues: Issue[];
}) {
  const [states, setStates] = useState<Record<number, State>>({});
  const [openItems, setOpenItems] = useState<Set<number>>(() => {
    const open = new Set<number>();
    const seenCats = new Set<string>();
    for (const issue of issues) {
      if (!seenCats.has(issue.category)) {
        open.add(issue.id);
        seenCats.add(issue.category);
      }
    }
    return open;
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const getState = (id: number): State | null => states[id] ?? null;
  const setState = (id: number, s: State) =>
    setStates((prev) => ({ ...prev, [id]: s }));
  const toggleOpen = (id: number) =>
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const grouped = issues.reduce<Record<string, Issue[]>>((acc, issue) => {
    (acc[issue.category] ??= []).push(issue);
    return acc;
  }, {});

  const answered = Object.keys(states).length;
  const problemCount = Object.values(states).filter((s) => s === "problema").length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const fd = new FormData();
    issues.forEach((issue) => {
      fd.append("item_id", String(issue.id));
      fd.append(`item_state_${issue.id}`, states[issue.id] ?? "nd");
    });
    const result = await salvarChecklist(laudoId, fd);
    if (result?.error) {
      setErro(result.error);
      setLoading(false);
    }
    // On success salvarChecklist redirects server-side — no client handling needed
  }

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
            const isOpen = openItems.has(issue.id);
            const hasTip = !!(issue.how_to_check || issue.if_bad);
            const needsMechanic = requiresMechanic(issue);

            return (
              <div key={issue.id} style={{
                padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                {/* Title row — click to expand tip */}
                <div
                  onClick={() => hasTip && toggleOpen(issue.id)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    marginBottom: 10, cursor: hasTip ? "pointer" : "default",
                  }}
                >
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
                      {needsMechanic && (
                        <span
                          title="Requer inspeção de mecânico"
                          style={{ marginLeft: 6, fontSize: 11 }}
                        >
                          🔧
                        </span>
                      )}
                    </div>
                  </div>
                  {hasTip && (
                    <span style={{
                      fontSize: 14, color: "var(--t4)", flexShrink: 0, marginTop: 3,
                      display: "inline-block",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform .15s",
                    }}>
                      ▾
                    </span>
                  )}
                </div>

                {/* Inline tip dropdown */}
                {isOpen && hasTip && (
                  <div style={{
                    marginLeft: 16, marginBottom: 10,
                    background: "var(--bg3)", borderRadius: 8, padding: "10px 12px",
                  }}>
                    {issue.how_to_check && (
                      <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55, marginBottom: (issue.if_bad || issue.repair_cost) ? 6 : 0 }}>
                        <span style={{ fontWeight: 700, color: "var(--t3)" }}>Como verificar: </span>
                        {issue.how_to_check}
                      </div>
                    )}
                    {issue.if_bad && (
                      <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55, marginBottom: issue.repair_cost ? 4 : 0 }}>
                        <span style={{ fontWeight: 700, color: "var(--t3)" }}>Se problema: </span>
                        {issue.if_bad}
                      </div>
                    )}
                    {issue.repair_cost && (
                      <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>
                        Reparo estimado: <strong style={{ color: "var(--t2)" }}>{issue.repair_cost}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* OK / Problema buttons */}
                <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
                  <button
                    type="button"
                    onClick={() => setState(issue.id, "ok")}
                    style={{
                      flex: 1, height: 36, fontSize: 13, fontWeight: 700,
                      border: state === "ok" ? "none" : "1px solid var(--bg4)",
                      borderRadius: 8, cursor: "pointer",
                      background: state === "ok" ? "var(--ok)" : "var(--bg3)",
                      color: state === "ok" ? "#050505" : "var(--t3)",
                      transition: "all .12s",
                    }}
                  >
                    ✓ OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setState(issue.id, "problema")}
                    style={{
                      flex: 1, height: 36, fontSize: 13, fontWeight: 700,
                      border: state === "problema" ? "none" : "1px solid var(--bg4)",
                      borderRadius: 8, cursor: "pointer",
                      background: state === "problema" ? "var(--danger)" : "var(--bg3)",
                      color: state === "problema" ? "#fff" : "var(--t3)",
                      transition: "all .12s",
                    }}
                  >
                    ✗ Problema
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Promise card */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--bd)",
        borderRadius: "var(--rm)", padding: "12px 14px", marginBottom: 4,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>📸</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 2 }}>
            Em breve: avaliação por fotos
          </div>
          <div style={{ fontSize: 11, color: "var(--t4)", lineHeight: 1.5 }}>
            Envie fotos do carro e nossa IA identifica problemas automaticamente.
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 8, paddingBottom: 48 }}>
        <div style={{ fontSize: 12, color: answered === 0 ? "var(--warn)" : "var(--t3)", marginBottom: 14, textAlign: "center" }}>
          {answered === 0
            ? "Responda ao menos um item antes de continuar"
            : `${answered} de ${issues.length} itens verificados`}
          {answered > 0 && problemCount > 0 && (
            <span style={{ color: "var(--danger)", marginLeft: 8 }}>
              · {problemCount} problema{problemCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {erro && (
          <div style={{ fontSize: 13, color: "var(--danger)", textAlign: "center", marginBottom: 10 }}>
            {erro}
          </div>
        )}
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
