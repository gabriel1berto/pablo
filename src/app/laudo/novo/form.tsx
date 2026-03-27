"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { criarLaudo } from "./actions";
import { normalizeModelKey } from "@/lib/model-utils";

type FipeItem = { code: string; name: string };

const ANOS = Array.from({ length: 27 }, (_, i) => 2026 - i);
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

export default function VeiculoForm() {
  const router = useRouter();
  const [brands, setBrands] = useState<FipeItem[]>([]);
  const [models, setModels] = useState<FipeItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<FipeItem | null>(null);
  const [selectedModel, setSelectedModel] = useState<FipeItem | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [erro, setErro] = useState("");

  // Carrega marcas na montagem
  useEffect(() => {
    fetch("/api/fipe/brands")
      .then((r) => r.json())
      .then((data: FipeItem[]) => setBrands(data))
      .catch(() => setBrands([]))
      .finally(() => setLoadingBrands(false));
  }, []);

  // Carrega modelos quando marca muda
  useEffect(() => {
    if (!selectedBrand) { setModels([]); return; }
    setLoadingModels(true);
    setSelectedModel(null);
    fetch(`/api/fipe/models?brand=${selectedBrand.code}`)
      .then((r) => r.json())
      .then((data: FipeItem[]) => setModels(data))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [selectedBrand]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedBrand || !selectedModel) return;
    setStatus("loading");
    setErro("");

    const fd = new FormData(e.currentTarget);
    // Sobrescreve com valores normalizados
    fd.set("brand", selectedBrand.name);
    fd.set("model", normalizeModelKey(selectedModel.name));
    fd.set("fipe_model_full", selectedModel.name); // nome completo para display

    const result = await criarLaudo(fd);
    if (result.error) {
      setErro(result.error);
      setStatus("error");
    } else {
      router.push(`/laudo/${result.id}/checklist`);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Marca + Ano */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Marca *</label>
          <select
            required
            disabled={loadingBrands}
            value={selectedBrand?.code ?? ""}
            onChange={(e) => {
              const b = brands.find((b) => b.code === e.target.value) ?? null;
              setSelectedBrand(b);
            }}
            style={{ ...inp, opacity: loadingBrands ? 0.5 : 1 }}
          >
            <option value="">{loadingBrands ? "Carregando..." : "Selecionar"}</option>
            {brands.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Ano *</label>
          <select name="year" required style={inp}>
            <option value="">Ano</option>
            {ANOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Modelo */}
      <div>
        <label style={lbl}>Modelo *</label>
        <select
          required
          disabled={!selectedBrand || loadingModels}
          value={selectedModel?.code ?? ""}
          onChange={(e) => {
            const m = models.find((m) => m.code === e.target.value) ?? null;
            setSelectedModel(m);
          }}
          style={{ ...inp, opacity: !selectedBrand || loadingModels ? 0.5 : 1 }}
        >
          <option value="">
            {!selectedBrand ? "Selecione a marca primeiro"
              : loadingModels ? "Carregando modelos..."
              : "Selecionar modelo"}
          </option>
          {models.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
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

      {/* Preço pedido */}
      <div>
        <label style={lbl}>Preço pedido pelo vendedor</label>
        <input name="asking_price" placeholder="Ex: R$ 48.000" style={inp} />
      </div>

      {/* Estado */}
      <div>
        <label style={lbl}>Estado</label>
        <select name="state" style={inp} defaultValue="SP">
          {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      {erro && <p style={{ fontSize: 13, color: "var(--danger)" }}>{erro}</p>}

      <div style={{ paddingTop: 8 }}>
        <button
          type="submit"
          disabled={status === "loading" || !selectedBrand || !selectedModel}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54,
            background: status === "loading" ? "#00a884" : "var(--accent)",
            color: "#050505", border: "none", borderRadius: "var(--rs)",
            fontSize: 15, fontWeight: 800,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            opacity: !selectedBrand || !selectedModel ? 0.6 : 1,
          }}
        >
          {status === "loading" ? "Salvando..." : "Próximo →"}
        </button>
      </div>
    </form>
  );
}
