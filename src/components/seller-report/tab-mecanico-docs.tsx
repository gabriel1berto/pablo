"use client";
import { C, sectionHeader, sectionLabel, listRow, photoPlaceholder, photoLabel } from "./styles";
import type { ReportData } from "./types";

export function TabMecanicoDocs({ data }: { data: ReportData }) {
  const { items, media, isOwner } = data;
  const mecItems = items.filter((i) => i.tab === "mecanico_docs");
  const mecMedia = media.filter((m) => m.tab === "mecanico_docs");
  const videos = mecMedia.filter((m) => m.media_type === "video");
  const photos = mecMedia.filter((m) => m.media_type === "photo");
  const transmissao = mecItems.find((i) => i.item_key === "transmissao")?.response;

  const mecRessalvas = mecItems.filter((i) => {
    const bad = ["falhando", "demora_pegar", "barulho_anormal", "patinando", "tranco", "barulho", "ruido", "pedal_mole", "pedal_duro", "puxa_lado", "barulho_constante", "barulho_lombada", "baixo_lado", "pegando_alto", "dura"];
    return i.section === "mecanico" && i.response && bad.includes(i.response);
  }).length;

  const docRessalvas = mecItems.filter((i) => {
    const bad = ["ativo", "grave", "leve", "atrasado", "parcelas_pendentes", "mais_de_3", "pendente"];
    return i.section === "documentacao" && i.response && bad.includes(i.response);
  }).length;

  return (
    <div style={{ padding: "16px" }}>
      {/* ── MECÂNICO ────────────────── */}
      <div style={sectionHeader}>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Mecânico</span>
        <span style={{ fontSize: 11, color: mecRessalvas > 0 ? C.yellowText : C.textTer }}>
          {videos.length} vídeo{videos.length !== 1 ? "s" : ""} + {photos.filter((p) => p.media_key !== "crlv").length} foto · {mecRessalvas > 0 ? `${mecRessalvas} ressalva${mecRessalvas > 1 ? "s" : ""}` : "sem ressalvas"}
        </span>
      </div>
      {transmissao && (
        <div style={{ fontSize: 11, color: C.textSec, marginBottom: 12 }}>
          Câmbio: {transmissao === "manual" ? "Manual" : "Automático"}
        </div>
      )}

      {/* Cards de vídeo/foto */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <MediaCard media={mecMedia} mediaKey="motor_ligado" title="Motor ligado, capô aberto" type="video" />
        <MediaCard media={mecMedia} mediaKey="escapamento" title="Escapamento com motor ligado" type="video" />
        <MediaCard media={mecMedia} mediaKey="motor_desligado" title="Motor desligado, capô aberto" type="photo" />
      </div>

      {/* Declarações mecânicas */}
      <div style={{ marginBottom: 24 }}>
        {[
          { key: "motor", label: "Motor", good: "liga_normal" },
          { key: "cambio", label: "Câmbio", good: "troca_suave" },
          { key: "direcao", label: "Direção", good: "leve" },
          { key: "freio", label: "Freio", good: "normal" },
          ...(transmissao === "manual" ? [{ key: "embreagem", label: "Embreagem", good: "pegando_meio" }] : []),
          { key: "suspensao", label: "Suspensão", good: "sem_barulho" },
        ].map(({ key, label, good }) => {
          const item = mecItems.find((i) => i.item_key === key);
          const val = item?.response ?? "—";
          const isOk = val === good;
          return (
            <div key={key} style={listRow}>
              <span style={{ color: C.textSec }}>{label}</span>
              <span style={{ color: isOk ? C.text : C.yellowText, fontWeight: 500 }}>{fmtMec(val)}</span>
            </div>
          );
        })}
      </div>

      {/* ── DOCUMENTAÇÃO ────────────── */}
      <div style={sectionHeader}>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Documentação</span>
        <span style={{ fontSize: 11, color: docRessalvas > 0 ? C.yellowText : C.textTer }}>
          {mecMedia.some((m) => m.media_key === "crlv") ? "1 foto" : "sem foto"} · {docRessalvas > 0 ? `${docRessalvas} ressalva${docRessalvas > 1 ? "s" : ""}` : "sem ressalvas"}
        </span>
      </div>

      {/* CRLV */}
      <div style={{ background: C.bgSec, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
        {(() => {
          const crlv = mecMedia.find((m) => m.media_key === "crlv");
          return (
            <>
              <div style={{ aspectRatio: "3/2", background: C.placeholder, position: "relative" }}>
                {crlv ? (
                  <img src={crlv.public_url} alt="CRLV" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.textTer }}>
                    CRLV não enviado
                  </div>
                )}
              </div>
              {crlv?.ai_analysis && (
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: C.text }}>
                    Placa · <span style={{ fontFamily: "monospace", fontWeight: 500 }}>
                      {isOwner ? (crlv.ai_analysis.placa as string ?? "—") : censorPlaca(crlv.ai_analysis.placa as string)}
                    </span>
                  </div>
                  {!isOwner && <div style={{ fontSize: 9, color: C.textTer, fontStyle: "italic" }}>dados sensíveis ocultos na versão pública</div>}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Situação legal */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ ...sectionLabel, fontSize: 11 }}>SITUAÇÃO LEGAL</div>
        {[
          { key: "ipva", label: "IPVA 2026", good: ["pago"] },
          { key: "multas", label: "Multas", good: ["nenhuma", "1_a_3"] },
          { key: "financiamento", label: "Financiamento", good: ["quitado", "nunca_teve"] },
          { key: "sinistro", label: "Sinistro", good: ["nunca"] },
          { key: "recall", label: "Recall", good: ["nao_ha", "ja_feito", "nao"] },
        ].map(({ key, label, good }) => {
          const item = mecItems.find((i) => i.item_key === key);
          const val = item?.response ?? "—";
          const isOk = good.includes(val);
          return (
            <div key={key} style={listRow}>
              <span style={{ color: C.textSec }}>{label}</span>
              <span style={{ color: isOk ? C.text : val === "grave" ? C.redText : C.yellowText, fontWeight: 500 }}>{fmtDoc(val)}</span>
            </div>
          );
        })}
      </div>

      {/* Alerta automático */}
      {(() => {
        const fin = mecItems.find((i) => i.item_key === "financiamento");
        const sin = mecItems.find((i) => i.item_key === "sinistro");
        const alerts: { text: string }[] = [];
        if (fin?.response === "ativo") alerts.push({ text: "Financiamento ativo · Não feche negócio sem comprovante de quitação ou transferência da dívida." });
        if (sin?.response === "grave") alerts.push({ text: "Sinistro grave declarado · carro teve dano estrutural. Verifique presencialmente + laudo de chassi." });
        if (alerts.length === 0) return null;
        return (
          <div style={{ marginBottom: 16 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ background: C.redBg, borderRadius: 6, padding: "10px 12px", marginBottom: 6, fontSize: 11, color: C.redText, lineHeight: 1.5 }}>
                {a.text}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Histórico */}
      <div>
        <div style={{ ...sectionLabel, fontSize: 11 }}>HISTÓRICO</div>
        {[
          { key: "unico_dono", label: "Único dono" },
          { key: "manual_proprietario", label: "Manual" },
          { key: "chave_reserva", label: "Chave reserva" },
        ].map(({ key, label }) => {
          const item = mecItems.find((i) => i.item_key === key);
          const val = item?.response ?? "—";
          const isOk = val === "sim" || val === "presente";
          return (
            <div key={key} style={listRow}>
              <span style={{ color: C.textSec }}>{label}</span>
              <span style={{ color: isOk ? C.text : C.textSec, fontWeight: 500 }}>{fmtHist(val)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MediaCard({ media, mediaKey, title, type }: { media: ReportData["media"]; mediaKey: string; title: string; type: "video" | "photo" }) {
  const m = media.find((x) => x.media_key === mediaKey);
  const aiText = m?.ai_analysis?.diagnosis as string | undefined;
  return (
    <div style={{ background: C.bgSec, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ aspectRatio: "16/9", position: "relative", background: type === "video" ? C.videoBg : C.placeholder }}>
        {m ? (
          type === "video" ? (
            <video src={m.public_url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <img src={m.public_url} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {type === "video" && (
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 0, height: 0, borderLeft: "12px solid #333", borderTop: "7px solid transparent", borderBottom: "7px solid transparent", marginLeft: 3 }} />
              </div>
            )}
          </div>
        )}
        {m?.duration_seconds && (
          <span style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: 9, padding: "1px 5px", borderRadius: 3 }}>
            {Math.floor(m.duration_seconds / 60)}:{String(m.duration_seconds % 60).padStart(2, "0")}
          </span>
        )}
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 11, color: C.text }}>{title}</div>
        {aiText && (
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: C.brand }}>Pablo.AI identifica: </span>
            <span style={{ fontSize: 10, color: C.textSec, lineHeight: 1.4 }}>{aiText}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function censorPlaca(p: string | undefined): string {
  if (!p || p.length < 7) return "XXX-XXXX";
  return p.slice(0, 3) + "-XX" + p.slice(5);
}

function fmtMec(r: string): string {
  const m: Record<string, string> = {
    liga_normal: "Liga normal ✓", demora_pegar: "Demora ⚠", falhando: "Falhando ⚠", barulho_anormal: "Barulho ⚠",
    troca_suave: "Troca suave ✓", tranco: "Tranco ⚠", patinando: "Patinando ⚠", barulho: "Barulho ⚠",
    leve: "Leve ✓", barulho_virar: "Barulho ⚠", trepidacao: "Trepidação ⚠", dura: "Dura ⚠",
    normal: "Normal ✓", ruido: "Ruído ⚠", pedal_mole: "Pedal mole ⚠", pedal_duro: "Pedal duro ⚠", puxa_lado: "Puxa pro lado ⚠",
    pegando_meio: "Pegando no meio ✓", pegando_alto: "Pegando alto ⚠",
    sem_barulho: "Sem barulho ✓", barulho_lombada: "Em lombada ⚠", barulho_constante: "Constante ⚠", baixo_lado: "Baixo de um lado ⚠",
  };
  return m[r] ?? r;
}

function fmtDoc(r: string): string {
  const m: Record<string, string> = {
    pago: "Pago ✓", parcelas_pendentes: "Parcelas pendentes ⚠", atrasado: "Atrasado ⚠",
    nenhuma: "Nenhuma ✓", "1_a_3": "1 a 3", mais_de_3: "Mais de 3 ⚠",
    quitado: "Quitado ✓", nunca_teve: "Nunca teve ✓", ativo: "Ativo ⚠",
    nunca: "Nunca ✓", leve: "Leve ⚠", grave: "Grave ⚠",
    nao_ha: "Não há ✓", nao: "Não há ✓", ja_feito: "Já feito ✓", pendente: "Pendente ⚠", nao_sei: "Não sei",
  };
  return m[r] ?? r;
}

function fmtHist(r: string): string {
  const m: Record<string, string> = { sim: "Sim ✓", nao: "Não", presente: "Presente ✓", ausente: "Ausente" };
  return m[r] ?? r;
}
