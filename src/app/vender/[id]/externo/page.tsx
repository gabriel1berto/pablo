"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { saveStationItems } from "../actions";
import { Stepper, PhotoUpload, Dropdown, pageStyle, btnPrimary, btnSecondary, sectionTitle, C } from "../components";

const DAMAGE_TYPES = [
  { value: "arranhao", label: "Arranhão" },
  { value: "amassado", label: "Amassado" },
  { value: "trinca", label: "Trinca" },
  { value: "pintura_diferente", label: "Pintura diferente" },
];

const PNEU_STATES = [
  { value: "novo", label: "Novo" },
  { value: "bom", label: "Bom (>3mm)" },
  { value: "meia_vida", label: "Meia-vida" },
  { value: "careca", label: "Careca (<1.6mm)" },
];

export default function ExternoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Exterior
  const [pintura, setPintura] = useState("");
  const [damages, setDamages] = useState<{ area: string; type: string }[]>([]);

  // Pneus
  const [pneuDE, setPneuDE] = useState("");
  const [pneuDD, setPneuDD] = useState("");
  const [pneuTE, setPneuTE] = useState("");
  const [pneuTD, setPneuTD] = useState("");
  const [mesmaMarca, setMesmaMarca] = useState("");
  const [rodas, setRodas] = useState("");
  const [estepe, setEstepe] = useState("");
  const [puxaLado, setPuxaLado] = useState("");

  function addDamage() {
    setDamages([...damages, { area: "", type: "" }]);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const items = [
      { section: "exterior", item_key: "pintura", item_type: "dropdown", response: pintura || null },
      ...damages.map((d, i) => ({
        section: d.area || "exterior", item_key: `damage_${i}`, item_type: "damage" as const, response: d.type || null,
      })),
      { section: "pneus", item_key: "pneu_de", item_type: "dropdown", response: pneuDE || null },
      { section: "pneus", item_key: "pneu_dd", item_type: "dropdown", response: pneuDD || null },
      { section: "pneus", item_key: "pneu_te", item_type: "dropdown", response: pneuTE || null },
      { section: "pneus", item_key: "pneu_td", item_type: "dropdown", response: pneuTD || null },
      { section: "pneus", item_key: "pneus_mesma_marca", item_type: "dropdown", response: mesmaMarca || null },
      { section: "pneus", item_key: "rodas", item_type: "dropdown", response: rodas || null },
      { section: "pneus", item_key: "estepe", item_type: "dropdown", response: estepe || null },
      { section: "pneus", item_key: "puxa_lado", item_type: "dropdown", response: puxaLado || null },
    ];

    const result = await saveStationItems(id, "externo", items);
    if (result.error) { setError(result.error); setSaving(false); return; }
    router.push(`/vender/${id}/interno`);
  }

  return (
    <main style={pageStyle}>
      <Stepper step={1} total={4} label="Externo" />

      {/* ── Fotos do exterior ──────── */}
      <div style={sectionTitle}>FOTOS DO EXTERIOR</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <PhotoUpload laudoId={id} tab="externo" mediaKey="ext_frente" label="Frente" />
        <PhotoUpload laudoId={id} tab="externo" mediaKey="ext_traseira" label="Traseira" />
        <PhotoUpload laudoId={id} tab="externo" mediaKey="ext_lateral_esq" label="Lateral esquerda" />
        <PhotoUpload laudoId={id} tab="externo" mediaKey="ext_lateral_dir" label="Lateral direita" />
      </div>

      {/* ── Danos ──────────────────── */}
      <div style={sectionTitle}>DANOS</div>
      {damages.map((d, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select
            value={d.area} onChange={(e) => { const n = [...damages]; n[i].area = e.target.value; setDamages(n); }}
            style={{ ...{ flex: 1, height: 40, background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, padding: "0 8px", color: C.text } }}
          >
            <option value="">Área</option>
            <option value="frente">Frente</option>
            <option value="traseira">Traseira</option>
            <option value="lateral_esq">Lateral esq.</option>
            <option value="lateral_dir">Lateral dir.</option>
            <option value="teto">Teto</option>
          </select>
          <select
            value={d.type} onChange={(e) => { const n = [...damages]; n[i].type = e.target.value; setDamages(n); }}
            style={{ ...{ flex: 1, height: 40, background: C.bgSec, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, padding: "0 8px", color: C.text } }}
          >
            <option value="">Tipo</option>
            {DAMAGE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      ))}
      <button type="button" onClick={addDamage} style={{ ...btnSecondary, height: 38, fontSize: 12, marginBottom: 16 }}>
        + Adicionar dano
      </button>

      {/* ── Pintura ────────────────── */}
      <Dropdown label="Pintura" name="pintura" value={pintura} onChange={setPintura} options={[
        { value: "original", label: "Original em todas as peças" },
        { value: "repintura_parcial", label: "Repintura parcial" },
        { value: "repintura_total", label: "Repintura total" },
        { value: "nao_sei", label: "Não sei" },
      ]} />

      {/* ── Pneus ──────────────────── */}
      <div style={sectionTitle}>PNEUS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <PhotoUpload laudoId={id} tab="externo" mediaKey="pneu_de" label="Diant. esq." />
        <PhotoUpload laudoId={id} tab="externo" mediaKey="pneu_dd" label="Diant. dir." />
        <PhotoUpload laudoId={id} tab="externo" mediaKey="pneu_te" label="Tras. esq." />
        <PhotoUpload laudoId={id} tab="externo" mediaKey="pneu_td" label="Tras. dir." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Dropdown label="Diant. esq." name="pneu_de" value={pneuDE} onChange={setPneuDE} options={PNEU_STATES} />
        <Dropdown label="Diant. dir." name="pneu_dd" value={pneuDD} onChange={setPneuDD} options={PNEU_STATES} />
        <Dropdown label="Tras. esq." name="pneu_te" value={pneuTE} onChange={setPneuTE} options={PNEU_STATES} />
        <Dropdown label="Tras. dir." name="pneu_td" value={pneuTD} onChange={setPneuTD} options={PNEU_STATES} />
      </div>

      <Dropdown label="Os 4 pneus têm mesma marca e medida?" name="mesma_marca" value={mesmaMarca} onChange={setMesmaMarca} options={[
        { value: "sim", label: "Sim" }, { value: "nao", label: "Não" },
      ]} />
      <Dropdown label="Rodas" name="rodas" value={rodas} onChange={setRodas} options={[
        { value: "originais_sem_dano", label: "Originais sem dano" },
        { value: "riscadas", label: "Riscadas" }, { value: "amassadas", label: "Amassadas" },
        { value: "aftermarket", label: "Aftermarket" },
      ]} />
      <Dropdown label="Estepe" name="estepe" value={estepe} onChange={setEstepe} options={[
        { value: "presente_calibrado", label: "Presente e calibrado" },
        { value: "presente_nao_verificado", label: "Presente (não verificado)" },
        { value: "ausente", label: "Ausente" },
      ]} />
      <Dropdown label="Carro puxa pro lado?" name="puxa_lado" value={puxaLado} onChange={setPuxaLado} options={[
        { value: "nao", label: "Não" }, { value: "puxa_leve", label: "Puxa leve" },
        { value: "puxa_forte", label: "Puxa forte" }, { value: "nao_sei", label: "Não sei" },
      ]} />

      {error && <p style={{ fontSize: 13, color: "#A32D2D", marginTop: 8 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Salvando..." : "Próximo: Interior →"}
        </button>
        <Link href="/laudos" style={btnSecondary}>Salvar e sair</Link>
      </div>
    </main>
  );
}
