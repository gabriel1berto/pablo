"use client";
import { C, sectionHeader, sectionLabel, listRow, photoPlaceholder, photoLabel } from "./styles";
import { CarTopView } from "./car-top-view";
import type { ReportData } from "./types";

export function TabExterno({ data }: { data: ReportData }) {
  const { items, media } = data;
  const extItems = items.filter((i) => i.tab === "externo");
  const extMedia = media.filter((m) => m.tab === "externo");

  const extPhotos = extMedia.filter((m) => m.media_key.startsWith("ext_"));
  const pneuPhotos = extMedia.filter((m) => m.media_key.startsWith("pneu_"));
  const damages = extItems.filter((i) => i.item_type === "damage");

  const extPhotoCount = extPhotos.length;
  const pneuPhotoCount = pneuPhotos.length;
  const extRessalvas = damages.length;
  const pneuRessalvas = extItems.filter((i) => i.item_key.startsWith("pneu_") && i.response && ["careca", "meia_vida"].includes(i.response)).length;

  return (
    <div style={{ padding: "16px" }}>
      {/* ── EXTERIOR ──────────────────── */}
      <div style={sectionHeader}>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Exterior</span>
        <span style={{ fontSize: 11, color: extRessalvas > 0 ? C.yellowText : C.textTer }}>
          {extPhotoCount} foto{extPhotoCount !== 1 ? "s" : ""} · {extRessalvas > 0 ? `${extRessalvas} dano${extRessalvas > 1 ? "s" : ""}` : "sem ressalvas"}
        </span>
      </div>

      {/* Grid de fotos 2x2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
        {(["frente", "traseira", "lateral_esq", "lateral_dir"] as const).map((key) => {
          const photo = extPhotos.find((m) => m.media_key === `ext_${key}`);
          const labels: Record<string, string> = { frente: "Frente", traseira: "Traseira", lateral_esq: "Lat. Esq", lateral_dir: "Lat. Dir" };
          return (
            <div key={key} style={{ ...photoPlaceholder, aspectRatio: "3/2" }}>
              {photo ? (
                <img src={photo.public_url} alt={labels[key]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.textTer }}>
                  Não enviada
                </div>
              )}
              <span style={photoLabel}>{labels[key]}</span>
            </div>
          );
        })}
      </div>

      {/* Status visual carro */}
      <div style={{ marginBottom: 12 }}>
        <CarTopView items={extItems} />
      </div>

      {/* Danos declarados */}
      {damages.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {damages.map((d, i) => {
            const damageMedia = extMedia.find((m) => m.item_id === d.id);
            const aiText = damageMedia?.ai_analysis?.diagnosis as string | undefined;
            const repairCost = damageMedia?.ai_analysis?.repair_cost as string | undefined;
            const typeLabels: Record<string, string> = { arranhao: "Arranhão", amassado: "Amassado", trinca: "Trinca", pintura_diferente: "Pintura diferente" };
            return (
              <div key={i} style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                {damageMedia && (
                  <img src={damageMedia.public_url} alt="Dano" style={{ width: "100%", height: 120, objectFit: "cover" }} />
                )}
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 11, color: C.text }}>
                    <strong>{d.section}</strong> · {typeLabels[d.response ?? ""] ?? d.response}
                  </div>
                  {aiText && (
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: C.brand }}>Pablo.AI identifica: </span>
                      <span style={{ fontSize: 10, color: C.textSec }}>{aiText}</span>
                    </div>
                  )}
                  {repairCost && (
                    <div style={{ fontSize: 10, color: C.textSec, marginTop: 2 }}>
                      Reparo estimado: <strong style={{ color: C.text }}>{repairCost}</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pintura */}
      {(() => {
        const pintura = extItems.find((i) => i.item_key === "pintura");
        if (!pintura?.response) return null;
        const labels: Record<string, string> = { original: "Original em todas as peças ✓", repintura_parcial: "Repintura parcial ⚠", repintura_total: "Repintura total ⚠", nao_sei: "Não sei" };
        const isOk = pintura.response === "original";
        return (
          <div style={{ ...listRow, borderBottom: "none", paddingTop: 8, borderTop: `0.5px solid ${C.border}` }}>
            <span style={{ color: C.textSec }}>Pintura</span>
            <span style={{ fontWeight: 500, color: isOk ? C.text : C.yellowText }}>{labels[pintura.response] ?? pintura.response}</span>
          </div>
        );
      })()}

      {/* ── PNEUS E RODAS ────────────── */}
      <div style={{ ...sectionHeader, marginTop: 24 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Pneus e rodas</span>
        <span style={{ fontSize: 11, color: pneuRessalvas > 0 ? C.yellowText : C.textTer }}>
          {pneuPhotoCount} foto{pneuPhotoCount !== 1 ? "s" : ""} · {pneuRessalvas > 0 ? `${pneuRessalvas} ressalva${pneuRessalvas > 1 ? "s" : ""}` : "sem ressalvas"}
        </span>
      </div>

      {/* Grid 2x2 pneus */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
        {(["pneu_de", "pneu_dd", "pneu_te", "pneu_td"] as const).map((key) => {
          const photo = pneuPhotos.find((m) => m.media_key === key);
          const item = extItems.find((i) => i.item_key === key);
          const posLabels: Record<string, string> = { pneu_de: "Diant. Esq", pneu_dd: "Diant. Dir", pneu_te: "Tras. Esq", pneu_td: "Tras. Dir" };
          const stateLabels: Record<string, { text: string; bg: string; color: string }> = {
            bom: { text: "Bom", bg: C.green, color: "#fff" },
            novo: { text: "Novo", bg: C.green, color: "#fff" },
            meia_vida: { text: "Meia-vida", bg: C.yellowText, color: "#fff" },
            careca: { text: "Careca", bg: C.redText, color: "#fff" },
          };
          const state = stateLabels[item?.response ?? ""] ?? null;
          return (
            <div key={key} style={{ ...photoPlaceholder, aspectRatio: "1/1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {photo ? (
                <img src={photo.public_url} alt={posLabels[key]} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
              ) : null}
              <span style={{ position: "relative", zIndex: 1, fontSize: 9, color: photo ? "#fff" : C.textSec }}>{posLabels[key]}</span>
              {state && (
                <span style={{ position: "relative", zIndex: 1, marginTop: 4, fontSize: 9, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: state.bg, color: state.color }}>
                  {state.text}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Perguntas pneus */}
      <div>
        {[
          { key: "pneus_mesma_marca", label: "Mesma marca/medida" },
          { key: "rodas", label: "Rodas" },
          { key: "estepe", label: "Estepe" },
          { key: "puxa_lado", label: "Carro puxa pro lado" },
        ].map(({ key, label }) => {
          const item = extItems.find((i) => i.item_key === key);
          const val = item?.response ?? "—";
          const display = formatResponse(val);
          const isOk = ["sim", "originais_sem_dano", "presente_calibrado", "nao"].includes(val);
          return (
            <div key={key} style={listRow}>
              <span style={{ color: C.textSec }}>{label}</span>
              <span style={{ color: isOk ? C.text : C.yellowText, fontWeight: 500 }}>{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatResponse(r: string): string {
  const map: Record<string, string> = {
    sim: "Sim ✓", nao: "Não ✓", originais_sem_dano: "Originais sem dano ✓",
    riscadas: "Riscadas ⚠", amassadas: "Amassadas ⚠", aftermarket: "Aftermarket",
    presente_calibrado: "Presente + calibrado ✓", presente_nao_verificado: "Presente (não verificado)",
    ausente: "Ausente ⚠", puxa_leve: "Puxa leve ⚠", puxa_forte: "Puxa forte ⚠", nao_sei: "Não sei",
  };
  return map[r] ?? r;
}
