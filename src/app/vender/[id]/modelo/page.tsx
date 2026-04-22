"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { saveStationItems, finalizarLaudo } from "../actions";
import { Stepper, Dropdown, pageStyle, btnPrimary, btnSecondary, sectionTitle, C } from "../components";

type Issue = { id: number; title: string; severity: string; category: string | null; description: string | null; repair_cost: string | null };

const RESPONSES = [
  { value: "nao", label: "Não" },
  { value: "sim", label: "Sim" },
  { value: "as_vezes", label: "Às vezes" },
  { value: "sempre", label: "Sempre" },
  { value: "nao_sei", label: "Não sei" },
];

export default function ModeloPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar issues do modelo via API
  useEffect(() => {
    fetch(`/api/seller-issues/${id}`)
      .then((r) => r.json())
      .then((data) => { setIssues(data.issues ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleFinish() {
    setSaving(true);
    setError("");

    // Salvar respostas do modelo
    const items = issues.map((iss) => ({
      section: "modelo",
      item_key: `model_${iss.id}`,
      item_type: "model_issue" as const,
      response: responses[iss.id] || null,
      car_issue_id: iss.id,
    }));

    const saveResult = await saveStationItems(id, "modelo", items);
    if (saveResult.error) { setError(saveResult.error); setSaving(false); return; }

    // Finalizar: calcular scores
    const finalResult = await finalizarLaudo(id);
    if (finalResult.error) { setError(finalResult.error); setSaving(false); return; }

    // Redirecionar pro relatório público
    router.push(`/laudo/${id}`);
  }

  return (
    <main style={pageStyle}>
      <Stepper step={4} total={4} label="Itens do modelo" />

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", fontSize: 13, color: C.textTer }}>
          Carregando problemas conhecidos...
        </div>
      ) : issues.length === 0 ? (
        <div style={{ background: C.bgSec, borderRadius: 8, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>
            Nenhum problema conhecido encontrado
          </div>
          <div style={{ fontSize: 12, color: C.textSec }}>
            O Pablo ainda não tem dados específicos para este modelo. Isso não afeta seu laudo.
          </div>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5, marginBottom: 16 }}>
            Esses são problemas conhecidos do seu modelo. Responda com honestidade — isso aumenta a credibilidade do seu laudo.
          </p>

          {issues.map((iss) => (
            <div key={iss.id} style={{
              border: `0.5px solid ${C.border}`, borderRadius: 8,
              padding: "12px 14px", marginBottom: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{iss.title}</div>
                <span style={{
                  fontSize: 9, fontWeight: 500, padding: "2px 6px", borderRadius: 3, flexShrink: 0,
                  background: iss.severity === "critical" ? "#FCEBEB" : "#FAEEDA",
                  color: iss.severity === "critical" ? "#A32D2D" : "#854F0B",
                }}>
                  {iss.severity === "critical" ? "CRÍTICO" : "ATENÇÃO"}
                </span>
              </div>
              {iss.description && (
                <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5, marginBottom: 8 }}>
                  {iss.description}
                </div>
              )}
              <Dropdown
                label={getQuestion(iss)}
                name={`issue_${iss.id}`}
                value={responses[iss.id] ?? ""}
                onChange={(v) => setResponses({ ...responses, [iss.id]: v })}
                options={RESPONSES}
              />
              {iss.repair_cost && (
                <div style={{ fontSize: 10, color: C.textTer, marginTop: -4 }}>
                  Reparo estimado: {iss.repair_cost}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {error && <p style={{ fontSize: 13, color: "#A32D2D", marginTop: 8 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        <button onClick={handleFinish} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Finalizando..." : "Finalizar laudo →"}
        </button>
        <Link href={`/vender/${id}/mecanico`} style={btnSecondary}>← Voltar</Link>
      </div>
    </main>
  );
}

function getQuestion(iss: Issue): string {
  const t = iss.title.toLowerCase();
  if (t.includes("consumo") && t.includes("óleo")) return "Precisa completar óleo entre trocas?";
  if (t.includes("barulho") && t.includes("cvt")) return "Câmbio faz barulho em marcha lenta?";
  if (t.includes("pastilha")) return "Trocou pastilha antes dos 30 mil km?";
  if (t.includes("infiltração")) return "Já notou umidade ou infiltração?";
  if (t.includes("corrosão")) return "Há sinais de corrosão na área?";
  if (t.includes("vibração")) return "Sente vibração ao dirigir?";
  if (t.includes("ruído") || t.includes("barulho")) return "Nota algum ruído anormal?";
  return `Já notou problema com ${iss.title.toLowerCase()}?`;
}
