"use client";
import { C, sectionHeader, sectionLabel, listRow, photoPlaceholder, photoLabel } from "./styles";
import type { ReportData } from "./types";

export function TabInterno({ data }: { data: ReportData }) {
  const { items, media } = data;
  const intItems = items.filter((i) => i.tab === "interno");
  const intMedia = media.filter((m) => m.tab === "interno");
  const photoCount = intMedia.length;
  const ressalvas = intItems.filter((i) => {
    const bad = ["nao_funciona", "funciona_fraco", "algum_defeito", "rasgo_mancha", "descolando", "manchado", "vazio"];
    return i.response && bad.includes(i.response);
  }).length;

  // Luzes
  const luzes = intItems.find((i) => i.item_key === "luzes_painel");
  let luzesChecked: string[] = [];
  if (luzes?.response) { try { luzesChecked = JSON.parse(luzes.response); } catch {} }
  const luzesRessalvas = luzesChecked.length;

  return (
    <div style={{ padding: "16px" }}>
      <div style={sectionHeader}>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Interior</span>
        <span style={{ fontSize: 11, color: (ressalvas + luzesRessalvas) > 0 ? C.yellowText : C.textTer }}>
          {photoCount} foto{photoCount !== 1 ? "s" : ""} · {(ressalvas + luzesRessalvas) > 0 ? `${ressalvas + luzesRessalvas} ressalva${(ressalvas + luzesRessalvas) > 1 ? "s" : ""}` : "sem ressalvas"}
        </span>
      </div>

      {/* Fotos: painel (grande), motorista + traseiro (2col), porta-malas (grande) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
        <PhotoSlot media={intMedia} mediaKey="int_painel" label="Painel" aspect="16/9" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <PhotoSlot media={intMedia} mediaKey="int_motorista" label="Motorista" aspect="3/2" />
          <PhotoSlot media={intMedia} mediaKey="int_traseiro" label="Traseiro" aspect="3/2" />
        </div>
        <PhotoSlot media={intMedia} mediaKey="int_portamalas" label="Porta-malas" aspect="16/9" />
      </div>

      {/* Funcionamento */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ ...sectionLabel, fontSize: 11 }}>FUNCIONAMENTO</div>
        {[
          { key: "ar_condicionado", label: "Ar-condicionado", good: ["funciona_gelando"] },
          { key: "vidros", label: "Vidros elétricos", good: ["todos_ok"] },
          { key: "travas", label: "Travas", good: ["todas_ok"] },
        ].map(({ key, label, good }) => {
          const item = intItems.find((i) => i.item_key === key);
          const val = item?.response ?? "—";
          const isOk = good.includes(val);
          return (
            <div key={key} style={listRow}>
              <span style={{ color: C.textSec }}>{label}</span>
              <span style={{ color: isOk ? C.text : C.yellowText, fontWeight: 500 }}>{fmtResp(val)}</span>
            </div>
          );
        })}
        {/* Luzes no painel */}
        <div style={listRow}>
          <span style={{ color: C.textSec }}>Luzes no painel</span>
          <span style={{ color: luzesChecked.length === 0 ? C.text : C.yellowText, fontWeight: 500 }}>
            {luzesChecked.length === 0 ? "Nenhuma acesa ✓" : luzesChecked.map(capitalize).join(", ") + " ⚠"}
          </span>
        </div>
      </div>

      {/* Conservação */}
      <div>
        <div style={{ ...sectionLabel, fontSize: 11 }}>CONSERVAÇÃO</div>
        {[
          { key: "bancos", label: "Bancos", good: ["sem_danos", "desgaste_leve"] },
          { key: "teto_interno", label: "Teto interno", good: ["ok"] },
          { key: "portamalas_conteudo", label: "Porta-malas", good: ["estepe_ferramentas", "so_estepe"] },
        ].map(({ key, label, good }) => {
          const item = intItems.find((i) => i.item_key === key);
          const val = item?.response ?? "—";
          const isOk = good.includes(val);
          return (
            <div key={key} style={listRow}>
              <span style={{ color: C.textSec }}>{label}</span>
              <span style={{ color: isOk ? C.text : C.yellowText, fontWeight: 500 }}>{fmtResp(val)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhotoSlot({ media, mediaKey, label, aspect }: { media: ReportData["media"]; mediaKey: string; label: string; aspect: string }) {
  const photo = media.find((m) => m.media_key === mediaKey);
  return (
    <div style={{ ...photoPlaceholder as React.CSSProperties, aspectRatio: aspect }}>
      {photo ? (
        <img src={photo.public_url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.textTer }}>
          Não enviada
        </div>
      )}
      <span style={photoLabel}>{label}</span>
    </div>
  );
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function fmtResp(r: string): string {
  const m: Record<string, string> = {
    funciona_gelando: "Gelando ✓", funciona_fraco: "Fraco ⚠", nao_funciona: "Não funciona ⚠", nao_tem: "Não tem",
    todos_ok: "Todos OK ✓", algum_defeito: "Com defeito ⚠", manuais: "Manuais",
    todas_ok: "Todas OK ✓",
    sem_danos: "Sem danos ✓", desgaste_leve: "Desgaste leve", rasgo_mancha: "Rasgo ou mancha ⚠", cobertura: "Cobertura aftermarket",
    ok: "OK ✓", descolando: "Descolando ⚠", manchado: "Manchado ⚠",
    estepe_ferramentas: "Estepe + ferramentas ✓", so_estepe: "Só estepe", vazio: "Vazio ⚠",
  };
  return m[r] ?? r;
}
