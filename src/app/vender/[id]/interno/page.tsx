"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { saveStationItems } from "../actions";
import { Stepper, PhotoUpload, Dropdown, pageStyle, btnPrimary, btnSecondary, sectionTitle, C } from "../components";

export default function InternoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [ac, setAc] = useState("");
  const [vidros, setVidros] = useState("");
  const [travas, setTravas] = useState("");
  const [luzes, setLuzes] = useState<string[]>([]);
  const [bancos, setBancos] = useState("");
  const [tetoInterno, setTetoInterno] = useState("");
  const [portamalas, setPortamalas] = useState("");

  function toggleLuz(l: string) {
    setLuzes((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const items = [
      { section: "funcionamento", item_key: "ar_condicionado", item_type: "dropdown", response: ac || null },
      { section: "funcionamento", item_key: "vidros", item_type: "dropdown", response: vidros || null },
      { section: "funcionamento", item_key: "travas", item_type: "dropdown", response: travas || null },
      { section: "funcionamento", item_key: "luzes_painel", item_type: "multi_check", response: JSON.stringify(luzes) },
      { section: "conservacao", item_key: "bancos", item_type: "dropdown", response: bancos || null },
      { section: "conservacao", item_key: "teto_interno", item_type: "dropdown", response: tetoInterno || null },
      { section: "conservacao", item_key: "portamalas_conteudo", item_type: "dropdown", response: portamalas || null },
    ];

    const result = await saveStationItems(id, "interno", items);
    if (result.error) { setError(result.error); setSaving(false); return; }
    router.push(`/vender/${id}/mecanico`);
  }

  const LUZES = ["airbag", "abs", "motor", "bateria", "temperatura", "outra"];

  return (
    <main style={pageStyle}>
      <Stepper step={2} total={4} label="Interior" />

      <div style={sectionTitle}>FOTOS DO INTERIOR</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <PhotoUpload laudoId={id} tab="interno" mediaKey="int_painel" label="Painel com carro ligado" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <PhotoUpload laudoId={id} tab="interno" mediaKey="int_motorista" label="Banco motorista" />
          <PhotoUpload laudoId={id} tab="interno" mediaKey="int_traseiro" label="Banco traseiro" />
        </div>
        <PhotoUpload laudoId={id} tab="interno" mediaKey="int_portamalas" label="Porta-malas aberto" />
      </div>

      <div style={sectionTitle}>FUNCIONAMENTO</div>
      <Dropdown label="Ar-condicionado" name="ac" value={ac} onChange={setAc} options={[
        { value: "funciona_gelando", label: "Funciona gelando" },
        { value: "funciona_fraco", label: "Funciona fraco" },
        { value: "nao_funciona", label: "Não funciona" },
        { value: "nao_tem", label: "Não tem" },
      ]} />
      <Dropdown label="Vidros elétricos" name="vidros" value={vidros} onChange={setVidros} options={[
        { value: "todos_ok", label: "Todos OK" },
        { value: "algum_defeito", label: "Algum com defeito" },
        { value: "manuais", label: "Manuais" },
      ]} />
      <Dropdown label="Travas elétricas" name="travas" value={travas} onChange={setTravas} options={[
        { value: "todas_ok", label: "Todas OK" },
        { value: "alguma_defeito", label: "Alguma com defeito" },
        { value: "manuais", label: "Manuais" },
      ]} />

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: C.textSec, marginBottom: 8, display: "block" }}>
          Luzes acesas no painel
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {LUZES.map((l) => {
            const active = luzes.includes(l);
            return (
              <button key={l} type="button" onClick={() => toggleLuz(l)} style={{
                padding: "8px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                background: active ? "#FCEBEB" : C.bgSec,
                border: `1px solid ${active ? "#A32D2D" : C.border}`,
                color: active ? "#A32D2D" : C.text,
              }}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            );
          })}
        </div>
        {luzes.length === 0 && (
          <div style={{ fontSize: 11, color: C.green, marginTop: 6 }}>Nenhuma luz acesa ✓</div>
        )}
      </div>

      <div style={sectionTitle}>CONSERVAÇÃO</div>
      <Dropdown label="Bancos" name="bancos" value={bancos} onChange={setBancos} options={[
        { value: "sem_danos", label: "Sem danos" },
        { value: "desgaste_leve", label: "Desgaste leve" },
        { value: "rasgo_mancha", label: "Rasgo ou mancha" },
        { value: "cobertura", label: "Cobertura aftermarket" },
      ]} />
      <Dropdown label="Teto interno" name="teto" value={tetoInterno} onChange={setTetoInterno} options={[
        { value: "ok", label: "OK" },
        { value: "descolando", label: "Descolando" },
        { value: "manchado", label: "Manchado" },
      ]} />
      <Dropdown label="Porta-malas" name="portamalas" value={portamalas} onChange={setPortamalas} options={[
        { value: "estepe_ferramentas", label: "Estepe + ferramentas" },
        { value: "so_estepe", label: "Só estepe" },
        { value: "vazio", label: "Vazio" },
      ]} />

      {error && <p style={{ fontSize: 13, color: "#A32D2D", marginTop: 8 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Salvando..." : "Próximo: Mecânico →"}
        </button>
        <Link href={`/vender/${id}/externo`} style={btnSecondary}>← Voltar</Link>
      </div>
    </main>
  );
}
