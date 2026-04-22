"use client";
import { C, cardStyle, sectionLabel } from "./styles";
import type { ReportData, TabId } from "./types";

function fmt(v: number): string {
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

function daysAgo(date: string): string {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  return d === 0 ? "hoje" : d === 1 ? "há 1 dia" : `há ${d} dias`;
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("pt-BR");
}

type Props = { data: ReportData; onTabChange: (tab: TabId) => void };

export function TabVisao({ data, onTabChange }: Props) {
  const { laudo, items } = data;
  const score = laudo.score ?? 0;
  const tabScores = laudo.tab_scores ?? {};
  const transPct = laudo.transparency_pct ?? 0;
  const ressalvas = countRessalvasSimple(items);
  const validUntil = new Date(laudo.created_at);
  validUntil.setDate(validUntil.getDate() + 30);
  const isExpired = new Date() > validUntil;

  // Pontos de atenção
  const alertas = buildAlertas(items);

  // Dashboard sections
  const sections: { label: string; tab: TabId; status: "ok" | "warn" | "none"; detail: string }[] = [
    { label: "Externo", tab: "externo", status: getTabStatus("externo", tabScores, items), detail: getTabDetail("externo", tabScores, items) },
    { label: "Interno", tab: "interno", status: getTabStatus("interno", tabScores, items), detail: getTabDetail("interno", tabScores, items) },
    { label: "Mecânico + Docs", tab: "mecanico_docs", status: getTabStatus("mecanico_docs", tabScores, items), detail: getTabDetail("mecanico_docs", tabScores, items) },
    { label: `Itens do ${laudo.brand} ${laudo.model} ${laudo.year}`, tab: "modelo", status: getTabStatus("modelo", tabScores, items), detail: getTabDetail("modelo", tabScores, items) },
  ];

  return (
    <div style={{ padding: "16px" }}>
      {/* Cabeçalho */}
      <div style={{ paddingBottom: 14, borderBottom: `0.5px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          CONDITION REPORT
        </div>
        <div style={{ fontSize: 17, fontWeight: 500, color: C.text, marginBottom: 4 }}>
          {laudo.brand} {laudo.model} {laudo.year}
        </div>
        <div style={{ fontSize: 12, color: C.textSec }}>
          {laudo.km.toLocaleString("pt-BR")} km{laudo.state ? ` · ${laudo.state}` : ""}
        </div>
        <div style={{ fontSize: 10, color: C.textTer, marginTop: 4 }}>
          Preenchido em {fmtDate(laudo.created_at)} ({daysAgo(laudo.created_at)})
          {" · "}
          <span style={isExpired ? { color: C.redText, fontWeight: 700 } : {}}>
            {isExpired ? "Laudo vencido" : `Válido até ${fmtDate(validUntil.toISOString())}`}
          </span>
        </div>
      </div>

      {/* Score principal */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div style={{
          width: 78, height: 78, borderRadius: "50%",
          border: `3px solid ${C.scoreCircle}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 24, fontWeight: 500, color: C.text, lineHeight: 1 }}>{score.toFixed(1)}</span>
          <span style={{ fontSize: 9, color: C.textTer }}>/ 10</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            ESTADO DECLARADO
          </div>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 8 }}>
            {ressalvas === 0 ? "Sem ressalvas declaradas" : `${ressalvas} ressalva${ressalvas > 1 ? "s" : ""} declarada${ressalvas > 1 ? "s" : ""} pelo vendedor`}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: C.bgSec, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${transPct}%`, height: "100%", background: C.green, borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, color: C.textSec }}>{transPct}%</span>
          </div>
          <div style={{ fontSize: 10, color: C.textTer, marginTop: 2 }}>
            {data.items.length > 0 ? `evidências entregues` : "sem dados"}
          </div>
        </div>
      </div>

      {/* Bloco financeiro */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        {laudo.asking_price && (
          <>
            <div style={{ fontSize: 10, color: C.textTer, textTransform: "uppercase" }}>PREÇO PEDIDO</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: C.text, marginBottom: 8 }}>{fmt(laudo.asking_price)}</div>
          </>
        )}
        <div style={{ display: "flex", gap: 16, paddingTop: laudo.asking_price ? 8 : 0, borderTop: laudo.asking_price ? `0.5px solid ${C.border}` : "none" }}>
          {laudo.fipe_price && (
            <div style={{ fontSize: 11, color: C.textSec }}>
              FIPE · <span style={{ color: C.text }}>{fmt(laudo.fipe_price)}</span>
            </div>
          )}
          {getReparosTotal(items) > 0 && (
            <div style={{ fontSize: 11, color: C.textSec }}>
              Reparos · <span style={{ color: C.text }}>{fmt(getReparosTotal(items))}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pontos de atenção */}
      {alertas.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionLabel}>PONTOS DE ATENÇÃO</div>
          {alertas.slice(0, 3).map((a, i) => (
            <div key={i} style={{
              background: C.yellowBg, borderRadius: 6, padding: "10px 12px",
              display: "flex", gap: 10, marginBottom: 6,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.yellowText, marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.yellowDark }}>{a.title}</div>
                {a.detail && <div style={{ fontSize: 11, color: C.yellowMid, marginTop: 2 }}>{a.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard por seção */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionLabel}>POR SEÇÃO</div>
        <div style={{ borderRadius: 6, overflow: "hidden", border: `0.5px solid ${C.border}` }}>
          {sections.map((s, i) => (
            <div
              key={s.tab}
              onClick={() => onTabChange(s.tab)}
              style={{
                padding: "10px 12px", background: C.bg, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                borderBottom: i < sections.length - 1 ? `0.5px solid ${C.border}` : "none",
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: s.status === "ok" ? C.green : s.status === "warn" ? C.yellowText : C.placeholder,
              }} />
              <span style={{ flex: 1, fontSize: 12, color: C.text }}>{s.label}</span>
              <span style={{ fontSize: 10, color: s.status === "warn" ? C.yellowText : C.textTer }}>{s.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <div style={{
        background: C.bgSec, borderRadius: 6, padding: "10px 16px",
        textAlign: "center", fontSize: 10, color: C.textTer, lineHeight: 1.5,
      }}>
        Relatório preenchido pelo vendedor · verificação parcial por Pablo.AI
        <br />Não substitui avaliação mecânica presencial
      </div>
    </div>
  );
}

// ── Helpers internos ─────────────────────────────────────

function countRessalvasSimple(items: { item_type: string; item_key: string; response: string | null }[]): number {
  let n = 0;
  n += items.filter((i) => i.item_type === "damage").length;
  const badMec = ["falhando", "demora_pegar", "barulho_anormal", "patinando", "tranco", "barulho", "ruido", "pedal_mole", "puxa_lado", "barulho_constante"];
  for (const i of items) {
    if (i.response && badMec.includes(i.response)) n++;
  }
  const pneuBad = ["careca", "meia_vida"];
  for (const i of items.filter((i) => i.item_key.startsWith("pneu_"))) {
    if (i.response && pneuBad.includes(i.response)) n++;
  }
  return n;
}

function getReparosTotal(items: { item_key: string; response: string | null }[]): number {
  // Placeholder — será calculado quando houver dados reais
  return 0;
}

function buildAlertas(items: { item_key: string; item_type: string; response: string | null }[]): { title: string; detail: string }[] {
  const alertas: { title: string; detail: string }[] = [];
  const fin = items.find((i) => i.item_key === "financiamento");
  if (fin?.response === "ativo") alertas.push({ title: "Financiamento ativo", detail: "não feche sem comprovante de quitação" });
  const sin = items.find((i) => i.item_key === "sinistro");
  if (sin?.response === "grave") alertas.push({ title: "Sinistro grave declarado", detail: "verifique estrutura + laudo de chassi" });
  const freio = items.find((i) => i.item_key === "freio");
  if (freio?.response === "ruido") alertas.push({ title: "Freio com ruído declarado", detail: "pastilhas — verificar presencialmente" });
  const pneuBad = items.filter((i) => i.item_key.startsWith("pneu_") && i.response === "meia_vida");
  if (pneuBad.length > 0) alertas.push({ title: `Pneus ${pneuBad.length > 1 ? "traseiros" : ""} em meia-vida`, detail: "substituição prevista" });
  return alertas;
}

function getTabStatus(tab: string, scores: Record<string, number>, items: { tab: string; item_type: string; response: string | null }[]): "ok" | "warn" | "none" {
  const tabItems = items.filter((i) => i.tab === tab);
  if (tabItems.length === 0) return "none";
  const s = scores[tab];
  if (s === undefined) return "none";
  return s >= 9 ? "ok" : "warn";
}

function getTabDetail(tab: string, scores: Record<string, number>, items: { tab: string; item_type: string; response: string | null }[]): string {
  const tabItems = items.filter((i) => i.tab === tab);
  if (tabItems.length === 0) return "não preenchido";
  const s = scores[tab];
  if (s === undefined) return "não preenchido";
  if (s >= 9) return "sem ressalvas";
  const badCount = tabItems.filter((i) => i.item_type === "damage" || (i.response && !["ok", "nao", "nunca", "liga_normal", "troca_suave", "leve", "normal", "sem_barulho", "pegando_meio", "bom", "nenhuma", "pago", "quitado", "nunca_teve", "presente", "sim", "nao_ha", "ja_feito", "funciona_gelando", "todos_ok", "todas_ok", "originais_sem_dano", "presente_calibrado", "original"].includes(i.response!))).length;
  return `${badCount} ressalva${badCount !== 1 ? "s" : ""}`;
}
