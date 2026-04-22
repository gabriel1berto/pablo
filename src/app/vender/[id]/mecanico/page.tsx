"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { saveStationItems } from "../actions";
import { Stepper, PhotoUpload, VideoUpload, Dropdown, pageStyle, btnPrimary, btnSecondary, sectionTitle, C } from "../components";

export default function MecanicoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Pergunta obrigatória
  const [transmissao, setTransmissao] = useState("");

  // Mecânico
  const [motor, setMotor] = useState("");
  const [cambio, setCambio] = useState("");
  const [direcao, setDirecao] = useState("");
  const [freio, setFreio] = useState("");
  const [embreagem, setEmbreagem] = useState("");
  const [suspensao, setSuspensao] = useState("");

  // Documentação
  const [ipva, setIpva] = useState("");
  const [multas, setMultas] = useState("");
  const [financiamento, setFinanciamento] = useState("");
  const [sinistro, setSinistro] = useState("");
  const [recall, setRecall] = useState("");
  const [unicoDono, setUnicoDono] = useState("");
  const [manual, setManual] = useState("");
  const [chaveReserva, setChaveReserva] = useState("");

  async function handleSave() {
    if (!transmissao) { setError("Informe o tipo de câmbio."); return; }
    setSaving(true);
    setError("");

    const items = [
      { section: "mecanico", item_key: "transmissao", item_type: "dropdown", response: transmissao },
      { section: "mecanico", item_key: "motor", item_type: "dropdown", response: motor || null },
      { section: "mecanico", item_key: "cambio", item_type: "dropdown", response: cambio || null },
      { section: "mecanico", item_key: "direcao", item_type: "dropdown", response: direcao || null },
      { section: "mecanico", item_key: "freio", item_type: "dropdown", response: freio || null },
      ...(transmissao === "manual" ? [{ section: "mecanico", item_key: "embreagem", item_type: "dropdown", response: embreagem || null }] : []),
      { section: "mecanico", item_key: "suspensao", item_type: "dropdown", response: suspensao || null },
      { section: "documentacao", item_key: "ipva", item_type: "dropdown", response: ipva || null },
      { section: "documentacao", item_key: "multas", item_type: "dropdown", response: multas || null },
      { section: "documentacao", item_key: "financiamento", item_type: "dropdown", response: financiamento || null },
      { section: "documentacao", item_key: "sinistro", item_type: "dropdown", response: sinistro || null },
      { section: "documentacao", item_key: "recall", item_type: "dropdown", response: recall || null },
      { section: "documentacao", item_key: "unico_dono", item_type: "dropdown", response: unicoDono || null },
      { section: "documentacao", item_key: "manual_proprietario", item_type: "dropdown", response: manual || null },
      { section: "documentacao", item_key: "chave_reserva", item_type: "dropdown", response: chaveReserva || null },
    ];

    const result = await saveStationItems(id, "mecanico_docs", items);
    if (result.error) { setError(result.error); setSaving(false); return; }
    router.push(`/vender/${id}/modelo`);
  }

  return (
    <main style={pageStyle}>
      <Stepper step={3} total={4} label="Mecânico + Docs" />

      {/* Pergunta obrigatória */}
      <div style={{ background: C.bgSec, borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10, display: "block" }}>
          Este carro é manual ou automático? *
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["manual", "automatico"].map((t) => (
            <button key={t} type="button" onClick={() => setTransmissao(t)} style={{
              height: 44, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: transmissao === t ? C.brand : C.bg,
              color: transmissao === t ? "#fff" : C.text,
              border: `1px solid ${transmissao === t ? C.brand : C.border}`,
            }}>
              {t === "manual" ? "Manual" : "Automático"}
            </button>
          ))}
        </div>
      </div>

      {transmissao && (
        <>
          <div style={sectionTitle}>VÍDEOS E FOTOS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <VideoUpload laudoId={id} tab="mecanico_docs" mediaKey="motor_ligado" label="Motor ligado, capô aberto" minSeconds={10} />
            <VideoUpload laudoId={id} tab="mecanico_docs" mediaKey="escapamento" label="Escapamento com motor ligado" minSeconds={5} />
            <PhotoUpload laudoId={id} tab="mecanico_docs" mediaKey="motor_desligado" label="Motor desligado, capô aberto" />
          </div>

          <div style={sectionTitle}>MECÂNICO</div>
          <Dropdown label="Motor" name="motor" value={motor} onChange={setMotor} options={[
            { value: "liga_normal", label: "Liga normal" }, { value: "demora_pegar", label: "Demora pra pegar" },
            { value: "falhando", label: "Falhando" }, { value: "barulho_anormal", label: "Barulho anormal" },
          ]} />
          <Dropdown label="Câmbio" name="cambio" value={cambio} onChange={setCambio} options={[
            { value: "troca_suave", label: "Troca suave" }, { value: "tranco", label: "Tranco ao trocar" },
            { value: "patinando", label: "Patinando" }, { value: "barulho", label: "Barulho" },
          ]} />
          <Dropdown label="Direção" name="direcao" value={direcao} onChange={setDirecao} options={[
            { value: "leve", label: "Leve" }, { value: "barulho_virar", label: "Barulho ao virar" },
            { value: "trepidacao", label: "Trepidação" }, { value: "dura", label: "Dura" },
          ]} />
          <Dropdown label="Freio" name="freio" value={freio} onChange={setFreio} options={[
            { value: "normal", label: "Normal" }, { value: "ruido", label: "Ruído" },
            { value: "pedal_mole", label: "Pedal mole" }, { value: "pedal_duro", label: "Pedal duro" },
            { value: "puxa_lado", label: "Puxa pro lado" },
          ]} />
          {transmissao === "manual" && (
            <Dropdown label="Embreagem" name="embreagem" value={embreagem} onChange={setEmbreagem} options={[
              { value: "pegando_meio", label: "Pegando no meio" }, { value: "pegando_alto", label: "Pegando alto" },
              { value: "patinando", label: "Patinando" }, { value: "dura", label: "Dura" },
            ]} />
          )}
          <Dropdown label="Suspensão" name="suspensao" value={suspensao} onChange={setSuspensao} options={[
            { value: "sem_barulho", label: "Sem barulho" }, { value: "barulho_lombada", label: "Barulho em lombada" },
            { value: "barulho_constante", label: "Barulho constante" }, { value: "baixo_lado", label: "Carro baixo de um lado" },
          ]} />

          <div style={sectionTitle}>DOCUMENTAÇÃO</div>
          <PhotoUpload laudoId={id} tab="mecanico_docs" mediaKey="crlv" label="Foto do CRLV (frente)" />
          <div style={{ height: 16 }} />

          <div style={sectionTitle}>SITUAÇÃO LEGAL</div>
          <Dropdown label="IPVA 2026" name="ipva" value={ipva} onChange={setIpva} options={[
            { value: "pago", label: "Pago" }, { value: "parcelas_pendentes", label: "Parcelas pendentes" },
            { value: "atrasado", label: "Atrasado" },
          ]} />
          <Dropdown label="Multas" name="multas" value={multas} onChange={setMultas} options={[
            { value: "nenhuma", label: "Nenhuma" }, { value: "1_a_3", label: "1 a 3" },
            { value: "mais_de_3", label: "Mais de 3" },
          ]} />
          <Dropdown label="Financiamento" name="fin" value={financiamento} onChange={setFinanciamento} options={[
            { value: "quitado", label: "Quitado" }, { value: "nunca_teve", label: "Nunca teve" },
            { value: "ativo", label: "Ativo" },
          ]} />
          <Dropdown label="Sinistro" name="sinistro" value={sinistro} onChange={setSinistro} options={[
            { value: "nunca", label: "Nunca" }, { value: "leve", label: "Leve (sem dano estrutural)" },
            { value: "grave", label: "Grave (com dano estrutural)" },
          ]} />
          <Dropdown label="Recall" name="recall" value={recall} onChange={setRecall} options={[
            { value: "nao", label: "Não há" }, { value: "ja_feito", label: "Já feito" },
            { value: "pendente", label: "Pendente" }, { value: "nao_sei", label: "Não sei" },
          ]} />

          <div style={sectionTitle}>HISTÓRICO</div>
          <Dropdown label="Único dono" name="unico" value={unicoDono} onChange={setUnicoDono} options={[
            { value: "sim", label: "Sim" }, { value: "nao", label: "Não" },
          ]} />
          <Dropdown label="Manual do proprietário" name="manual" value={manual} onChange={setManual} options={[
            { value: "presente", label: "Presente" }, { value: "ausente", label: "Ausente" },
          ]} />
          <Dropdown label="Chave reserva" name="chave" value={chaveReserva} onChange={setChaveReserva} options={[
            { value: "presente", label: "Presente" }, { value: "ausente", label: "Ausente" },
          ]} />
        </>
      )}

      {error && <p style={{ fontSize: 13, color: "#A32D2D", marginTop: 8 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        <button onClick={handleSave} disabled={saving || !transmissao} style={{ ...btnPrimary, opacity: saving || !transmissao ? 0.7 : 1 }}>
          {saving ? "Salvando..." : "Próximo: Itens do modelo →"}
        </button>
        <Link href={`/vender/${id}/interno`} style={btnSecondary}>← Voltar</Link>
      </div>
    </main>
  );
}
