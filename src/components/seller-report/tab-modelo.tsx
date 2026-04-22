"use client";
import { C, sectionLabel, badgeCritico, badgeAtencao } from "./styles";
import type { ReportData } from "./types";

export function TabModelo({ data }: { data: ReportData }) {
  const { laudo, items, media, issues } = data;
  const modelItems = items.filter((i) => i.tab === "modelo");
  const modelMedia = media.filter((m) => m.tab === "modelo");

  const answered = issues.filter((iss) => modelItems.some((i) => i.car_issue_id === iss.id && i.response));
  const unanswered = issues.filter((iss) => !modelItems.some((i) => i.car_issue_id === iss.id && i.response));

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: C.text }}>
          Itens do {laudo.brand} {laudo.model} {laudo.year}
        </div>
        <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5, marginTop: 4 }}>
          Problemas conhecidos deste modelo, verificados pelo vendedor.
        </div>
      </div>

      {/* Cards de problemas */}
      {issues.map((issue) => {
        const item = modelItems.find((i) => i.car_issue_id === issue.id);
        const hasResponse = !!item?.response;
        const isOk = item?.response === "ok" || item?.response === "nao" || item?.response === "nunca";
        const isCritical = issue.severity === "critical";
        const issueMedia = modelMedia.find((m) => m.item_id === item?.id);
        const aiText = issueMedia?.ai_analysis?.diagnosis as string | undefined;

        if (!hasResponse && unanswered.includes(issue)) return null; // render in unanswered block

        return (
          <div key={issue.id} style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
            {/* Título + badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{issue.title}</div>
              <span style={isCritical ? badgeCritico : badgeAtencao}>
                {isCritical ? "CRÍTICO" : "ATENÇÃO"}
              </span>
            </div>
            {issue.category && (
              <div style={{ fontSize: 10, color: C.textTer, marginBottom: 10 }}>{issue.category}</div>
            )}

            {/* Pergunta/resposta */}
            <div style={{ background: C.bgSec, borderRadius: 6, padding: "8px 10px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: C.textTer }}>Pergunta:</div>
              <div style={{ fontSize: 11, color: C.text, fontStyle: "italic", marginBottom: 6 }}>
                {getQuestionForIssue(issue)}
              </div>
              <div style={{ fontSize: 10, color: C.textTer }}>Vendedor respondeu:</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: isOk ? C.green : C.yellowText }}>
                {fmtModelResponse(item?.response)} {isOk ? "✓" : "⚠"}
              </div>
            </div>

            {/* Evidência (só mostra se houver mídia associada) */}
            {issueMedia && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: C.textTer, marginBottom: 4 }}>Evidência:</div>
                <div style={{ borderRadius: 6, overflow: "hidden" }}>
                  {issueMedia.media_type === "video" ? (
                    <div style={{ aspectRatio: "16/9", background: C.videoBg, position: "relative" }}>
                      <video src={issueMedia.public_url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <img src={issueMedia.public_url} alt={issue.title} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                  )}
                  {aiText && (
                    <div style={{ padding: "6px 8px", background: C.bgSec }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: C.brand }}>Pablo.AI identifica: </span>
                      <span style={{ fontSize: 10, color: C.textSec }}>{aiText}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contexto */}
            {(issue.description || issue.repair_cost) && (
              <div style={{ borderTop: `0.5px solid ${C.border}`, paddingTop: 8 }}>
                <div style={{ ...sectionLabel, marginBottom: 4 }}>CONTEXTO</div>
                {issue.description && (
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.5, marginBottom: 4 }}>{issue.description}</div>
                )}
                {issue.repair_cost && (
                  <div style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>Reparo estimado: {issue.repair_cost}</div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Não verificados */}
      {unanswered.length > 0 && (
        <div style={{ background: C.yellowBg, borderRadius: 8, padding: "12px 14px", marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: C.yellowMid, textTransform: "uppercase", marginBottom: 8 }}>
            NÃO VERIFICADOS ({unanswered.length})
          </div>
          {unanswered.map((iss) => (
            <div key={iss.id} style={{ fontSize: 12, color: C.yellowDark, lineHeight: 1.6 }}>
              • {iss.title}
            </div>
          ))}
          <div style={{ borderTop: `0.5px solid ${C.yellowBorder}`, paddingTop: 8, marginTop: 8, fontSize: 10, color: C.yellowMid, lineHeight: 1.5 }}>
            Problemas conhecidos do {laudo.brand} {laudo.model} {laudo.year} não respondidos pelo vendedor. Recomendamos verificação presencial.
          </div>
        </div>
      )}
    </div>
  );
}

function getQuestionForIssue(issue: { title: string; category: string | null }): string {
  // Gera pergunta genérica a partir do título do issue
  const t = issue.title.toLowerCase();
  if (t.includes("consumo") && t.includes("óleo")) return "Precisa completar óleo entre trocas?";
  if (t.includes("barulho") && t.includes("cvt")) return "Câmbio faz barulho em marcha lenta?";
  if (t.includes("pastilha")) return "Trocou pastilha antes dos 30 mil km?";
  if (t.includes("infiltração")) return "Já notou umidade ou infiltração?";
  if (t.includes("corrosão")) return "Há sinais de corrosão na área?";
  if (t.includes("vibração")) return "Sente vibração ao dirigir?";
  if (t.includes("ruído") || t.includes("barulho")) return "Nota algum ruído anormal?";
  return `Já notou problema com ${issue.title.toLowerCase()}?`;
}

function fmtModelResponse(r: string | null | undefined): string {
  if (!r) return "Não respondido";
  const m: Record<string, string> = {
    ok: "Não", nao: "Não", nunca: "Nunca", sim: "Sim",
    as_vezes: "Às vezes", sempre: "Sempre", nao_sei: "Não sei",
  };
  return m[r] ?? r;
}
