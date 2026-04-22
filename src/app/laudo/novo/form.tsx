"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { criarLaudo } from "./actions";
import { normalizeModelKey } from "@/lib/model-utils";

type FipeItem = { code: string; name: string };
type Tipo = "comprador" | "vendedor";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const inp: React.CSSProperties = {
  height: 50, background: "var(--bg2)",
  border: "1px solid rgba(255,255,255,0.09)", borderRadius: "var(--rs)",
  color: "var(--t1)", fontSize: 15, padding: "0 16px",
  outline: "none", width: "100%", WebkitAppearance: "none",
};
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: "var(--t2)",
  marginBottom: 6, display: "block",
};

function Combobox({
  items,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  items: FipeItem[];
  value: FipeItem | null;
  onChange: (item: FipeItem | null) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sync text when value changes externally (e.g. reset on brand change)
  useEffect(() => {
    setText(value?.name ?? "");
  }, [value]);

  const filtered = text.length < 1
    ? items
    : items.filter((i) => i.name.toLowerCase().includes(text.toLowerCase()));

  function select(item: FipeItem) {
    setText(item.name);
    onChange(item);
    setOpen(false);
  }

  function handleBlur(e: React.FocusEvent) {
    if (ref.current?.contains(e.relatedTarget as Node)) return;
    setOpen(false);
    // If typed text doesn't match a selection, clear
    if (!items.find((i) => i.name === text)) {
      setText("");
      onChange(null);
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }} onBlur={handleBlur}>
      <input
        type="text"
        value={text}
        disabled={disabled}
        placeholder={disabled ? "Aguarde..." : placeholder}
        autoComplete="off"
        onChange={(e) => {
          setText(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        style={{
          ...inp,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
      {open && !disabled && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--bg2)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "var(--rs)", maxHeight: 220, overflowY: "auto",
          zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {filtered.slice(0, 60).map((item) => (
            <div
              key={item.code}
              onPointerDown={(e) => { e.preventDefault(); select(item); }}
              style={{
                padding: "10px 14px", fontSize: 14, cursor: "pointer",
                color: item.code === value?.code ? "var(--accent)" : "var(--t1)",
                background: item.code === value?.code ? "rgba(0,212,170,0.08)" : "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = item.code === value?.code ? "rgba(0,212,170,0.08)" : "transparent")}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VeiculoForm() {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>("comprador");
  const [brands, setBrands] = useState<FipeItem[]>([]);
  const [models, setModels] = useState<FipeItem[]>([]);
  const [availableYears, setAvailableYears] = useState<number[] | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<FipeItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<FipeItem | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/fipe/brands")
      .then((r) => r.json())
      .then((data: FipeItem[]) => setBrands(data))
      .catch(() => setBrands([]))
      .finally(() => setLoadingBrands(false));
  }, []);

  useEffect(() => {
    if (!selectedBrand) { setModels([]); setSelectedModel(null); return; }
    setLoadingModels(true);
    setSelectedModel(null);
    setAvailableYears(null);
    fetch(`/api/fipe/models?brand=${selectedBrand.code}`)
      .then((r) => r.json())
      .then((data: FipeItem[]) => setModels(data))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [selectedBrand]);

  useEffect(() => {
    if (!selectedBrand || !selectedModel) { setAvailableYears(null); return; }
    setLoadingYears(true);
    fetch(`/api/fipe/years?brand=${selectedBrand.code}&model=${selectedModel.code}`)
      .then((r) => r.json())
      .then((data: number[]) => setAvailableYears(data.length > 0 ? data : null))
      .catch(() => setAvailableYears(null))
      .finally(() => setLoadingYears(false));
  }, [selectedBrand, selectedModel]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedBrand || !selectedModel) return;
    setStatus("loading");
    setErro("");

    const fd = new FormData(e.currentTarget);
    fd.set("brand", selectedBrand.name);
    fd.set("model", normalizeModelKey(selectedModel.name));
    fd.set("fipe_model_full", selectedModel.name);
    fd.set("tipo", tipo);

    const result = await criarLaudo(fd);
    if (result.error) {
      setErro(result.error);
      setStatus("error");
    } else if (tipo === "vendedor") {
      router.push(`/vender/${result.id}/externo`);
    } else {
      router.push(`/laudo/${result.id}/checklist`);
    }
  }

  const isVendedor = tipo === "vendedor";

  // Build year list: FIPE years if available, else static fallback
  const yearList = availableYears
    ?? Array.from({ length: 27 }, (_, i) => new Date().getFullYear() + 1 - i);

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Tipo toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
        {(["comprador", "vendedor"] as Tipo[]).map((t) => {
          const active = tipo === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                gap: 3, padding: "12px 14px",
                background: active ? (t === "vendedor" ? "rgba(167,139,250,0.12)" : "rgba(0,212,170,0.1)") : "var(--bg2)",
                border: `1.5px solid ${active ? (t === "vendedor" ? "rgba(167,139,250,0.4)" : "rgba(0,212,170,0.35)") : "rgba(255,255,255,0.07)"}`,
                borderRadius: "var(--rs)", cursor: "pointer", textAlign: "left",
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: active ? (t === "vendedor" ? "#A78BFA" : "var(--accent)") : "var(--t2)" }}>
                {t === "comprador" ? "Vou comprar" : "Vou vender"}
              </span>
              <span style={{ fontSize: 11, color: "var(--t4)", lineHeight: 1.4 }}>
                {t === "comprador" ? "Avalio antes de fechar negócio" : "Laudo de transparência para o meu anúncio"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Marca */}
      <div>
        <label style={lbl}>Marca *</label>
        <Combobox
          items={brands}
          value={selectedBrand}
          onChange={setSelectedBrand}
          placeholder={loadingBrands ? "Carregando..." : "Digite a marca"}
          disabled={loadingBrands}
        />
      </div>

      {/* Modelo */}
      <div>
        <label style={lbl}>Modelo *</label>
        <Combobox
          items={models}
          value={selectedModel}
          onChange={setSelectedModel}
          placeholder={!selectedBrand ? "Selecione a marca primeiro" : loadingModels ? "Carregando modelos..." : "Digite o modelo"}
          disabled={!selectedBrand || loadingModels}
        />
      </div>

      {/* Ano */}
      <div>
        <label style={lbl}>
          Ano *
          {loadingYears && <span style={{ fontWeight: 400, color: "var(--t4)", marginLeft: 6 }}>carregando...</span>}
          {availableYears && !loadingYears && (
            <span style={{ fontWeight: 400, color: "var(--t4)", marginLeft: 6 }}>{availableYears.length} anos disponíveis</span>
          )}
        </label>
        <select name="year" required style={inp} key={selectedModel?.code ?? "no-model"}>
          <option value="">Selecionar ano</option>
          {yearList.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* KM + Condição */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Quilometragem *</label>
          <input name="km" required placeholder="Ex: 85.000" style={inp} />
        </div>
        <div>
          <label style={lbl}>Condição</label>
          <select name="condition" style={inp} defaultValue="usado">
            <option value="usado">Usado</option>
            <option value="novo">Novo</option>
          </select>
        </div>
      </div>

      {/* Preço */}
      <div>
        <label style={lbl}>
          {isVendedor ? "Seu preço de venda" : "Preço pedido pelo vendedor"}
        </label>
        <input
          name="asking_price"
          placeholder={isVendedor ? "Ex: R$ 32.000" : "Ex: R$ 48.000"}
          style={inp}
        />
      </div>

      {/* Estado */}
      <div>
        <label style={lbl}>Estado</label>
        <select name="state" style={inp} defaultValue="SP">
          {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      {/* Banner vendedor */}
      {isVendedor && (
        <div style={{
          background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: "var(--rm)", padding: "10px 14px",
          fontSize: 12, color: "var(--t3)", lineHeight: 1.55,
        }}>
          Preencha com honestidade. O laudo ficará associado ao seu anúncio e compradores podem verificar os dados.
        </div>
      )}

      {erro && <p style={{ fontSize: 13, color: "var(--danger)" }}>{erro}</p>}

      <div style={{ paddingTop: 8 }}>
        <button
          type="submit"
          disabled={status === "loading" || !selectedBrand || !selectedModel}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54,
            background: status === "loading"
              ? "#00a884"
              : isVendedor ? "#A78BFA" : "var(--accent)",
            color: "#050505", border: "none", borderRadius: "var(--rs)",
            fontSize: 15, fontWeight: 800,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: !selectedBrand || !selectedModel ? 0.6 : 1,
          }}
        >
          {status === "loading" ? "Salvando..." : isVendedor ? "Criar laudo de venda →" : "Próximo →"}
        </button>
      </div>
    </form>
  );
}
