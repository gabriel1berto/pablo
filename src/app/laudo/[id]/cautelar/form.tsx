"use client";

import { useState } from "react";
import { salvarCautelar } from "./actions";

type Status = "ok" | "atencao" | "nd";

const ITEMS: {
  key: string;
  label: string;
  sub: string;
  okLabel: string;
  atencaoLabel: string;
}[] = [
  {
    key: "crlv",
    label: "CRLV",
    sub: "Documento de licenciamento anual — verificar validade e se o ano está quitado.",
    okLabel: "Em dia",
    atencaoLabel: "Vencido / irregular",
  },
  {
    key: "multas",
    label: "Multas",
    sub: "Verificar no DETRAN com RENAVAM ou placa. Multas do proprietário ficam no veículo na transferência.",
    okLabel: "Sem multas",
    atencaoLabel: "Tem multas",
  },
  {
    key: "sinistro",
    label: "Sinistro / batida grave",
    sub: "Perguntar ao vendedor e cruzar com marcas no chassi, pintura e frestas irregulares na carroceria.",
    okLabel: "Sem histórico",
    atencaoLabel: "Batida ou sinistro",
  },
  {
    key: "gravame",
    label: "Financiamento / gravame",
    sub: "Carro financiado com parcelas em aberto não pode ser transferido. Verificar no DETRAN ou Módulo CRB.",
    okLabel: "Quitado / livre",
    atencaoLabel: "Tem gravame",
  },
  {
    key: "recall",
    label: "Recall ativo",
    sub: "Consultar pelo chassi no site do fabricante ou no portal do DENATRAN. Recall não atendido é risco real.",
    okLabel: "Sem recall",
    atencaoLabel: "Recall pendente",
  },
  {
    key: "manutencoes",
    label: "Manutenções em dia",
    sub: "Pedir carnê de revisões, notas de serviço ou histórico na concessionária. Checar trocas de óleo e correia.",
    okLabel: "Revisões em dia",
    atencaoLabel: "Atrasada / sem comprovante",
  },
];

export default function CautelarForm({ laudoId }: { laudoId: string }) {
  const [values, setValues] = useState<Record<string, Status>>(
    Object.fromEntries(ITEMS.map((i) => [i.key, "nd"]))
  );
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: Status) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await salvarCautelar(laudoId, new FormData(e.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit}>
      {ITEMS.map((item) => {
        const val = values[item.key];
        return (
          <div key={item.key} style={{ marginBottom: 24 }}>
            <input type="hidden" name={item.key} value={val} />

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 3 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>
                {item.sub}
              </div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => set(item.key, "ok")}
                style={{
                  flex: 1, height: 36, fontSize: 12, fontWeight: 700,
                  border: val === "ok" ? "none" : "1px solid var(--bg4)",
                  borderRadius: 8, cursor: "pointer",
                  background: val === "ok" ? "var(--ok)" : "var(--bg3)",
                  color: val === "ok" ? "#050505" : "var(--t3)",
                  transition: "all .12s",
                }}
              >
                ✓ {item.okLabel}
              </button>
              <button
                type="button"
                onClick={() => set(item.key, "atencao")}
                style={{
                  flex: 1, height: 36, fontSize: 12, fontWeight: 700,
                  border: val === "atencao" ? "none" : "1px solid var(--bg4)",
                  borderRadius: 8, cursor: "pointer",
                  background: val === "atencao" ? "var(--danger)" : "var(--bg3)",
                  color: val === "atencao" ? "#fff" : "var(--t3)",
                  transition: "all .12s",
                }}
              >
                ✗ {item.atencaoLabel}
              </button>
              <button
                type="button"
                onClick={() => set(item.key, "nd")}
                style={{
                  flex: "0 0 72px", height: 36, fontSize: 11, fontWeight: 700,
                  border: val === "nd" ? "1px solid var(--t3)" : "1px solid var(--bg4)",
                  borderRadius: 8, cursor: "pointer",
                  background: "var(--bg3)",
                  color: val === "nd" ? "var(--t2)" : "var(--t4)",
                  transition: "all .12s",
                }}
              >
                ? N/V
              </button>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.04)", marginTop: 20 }} />
          </div>
        );
      })}

      <div style={{ paddingTop: 8, paddingBottom: 48 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54,
            background: loading ? "#00a884" : "var(--accent)", color: "#050505",
            border: "none", borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Salvando..." : "Próximo →"}
        </button>
      </div>
    </form>
  );
}
