export const CAUTELAR_LABEL: Record<string, string> = {
  crlv: "CRLV vencido / irregular",
  multas: "Multas pendentes no veículo",
  sinistro: "Histórico de batida ou sinistro",
  gravame: "Financiamento / gravame ativo",
  recall: "Recall pendente não atendido",
  manutencoes: "Manutenções atrasadas ou sem comprovante",
};

export const CAUTELAR_DETAIL: Record<string, string> = {
  crlv: "Veículo com documentação irregular pode ser apreendido. O comprador assume o risco e eventuais dívidas.",
  multas: "Multas vinculadas ao veículo (não ao condutor) são transferidas automaticamente ao novo proprietário.",
  sinistro: "Histórico de batida pode indicar reparos ocultos que comprometem estrutura e segurança passiva.",
  gravame: "Veículo com financiamento ativo — a venda sem quitação é ilegal e o carro pode ser retomado pelo banco.",
  recall: "Defeito reconhecido pelo fabricante ainda não corrigido. Pode representar risco à segurança.",
  manutencoes: "Sem comprovante de revisão não há como atestar o estado real de motor, câmbio e componentes críticos.",
};

export const CAT_LABEL: Record<string, string> = {
  motor: "Motor", transmissao: "Transmissão", suspensao: "Suspensão",
  freios: "Freios", pneus: "Pneus", carroceria: "Carroceria",
  eletrica: "Elétrica", documentacao: "Documentação", "Precificação": "Precificação",
};

export type Finding = {
  text: string;
  detail?: string;
  if_bad?: string | null;
  severity: "critical" | "warn" | "ok";
  category: string;
  repair_cost?: string | null;
};

export type CautelarAlert = { key: string; label: string; detail: string };

export function verdict(score: number) {
  if (score >= 8) return { label: "Boa Compra", color: "var(--ok)", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" };
  if (score >= 6) return { label: "Compra com Cautela", color: "var(--warn)", bg: "rgba(234,179,8,0.06)", border: "rgba(234,179,8,0.2)" };
  if (score >= 4) return { label: "Risco Moderado", color: "var(--warn)", bg: "rgba(234,179,8,0.06)", border: "rgba(234,179,8,0.2)" };
  return { label: "Não Recomendado", color: "var(--danger)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" };
}

export function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function buildHeroContext(
  isVendedor: boolean,
  findings: Finding[],
  cautelarAlerts: CautelarAlert[],
  diffPct: number
): string {
  if (isVendedor) {
    const probs = findings.filter((f) => f.severity !== "ok").length;
    if (probs > 0) return `${probs} ponto${probs > 1 ? "s" : ""} declarado${probs > 1 ? "s" : ""}`;
    return "Nenhum problema declarado";
  }
  const parts: string[] = [];
  if (cautelarAlerts.length > 0)
    parts.push(`${cautelarAlerts.length} alerta${cautelarAlerts.length > 1 ? "s" : ""} documental${cautelarAlerts.length > 1 ? "is" : ""}`);
  const criticals = findings.filter((f) => f.severity === "critical").length;
  const warns = findings.filter((f) => f.severity === "warn").length;
  if (criticals > 0) parts.push(`${criticals} crítico${criticals > 1 ? "s" : ""}`);
  else if (warns > 0) parts.push(`${warns} atenção`);
  if (diffPct > 10) parts.push(`preço ${diffPct.toFixed(0)}% acima da FIPE`);
  if (parts.length === 0) return "Nenhum problema identificado";
  return parts.join(" · ");
}

export function buildSteps(
  isVendedor: boolean,
  cautelarAlerts: CautelarAlert[],
  findings: Finding[],
  diffPct: number
): string[] {
  if (isVendedor) {
    const probs = findings.filter((f) => f.severity !== "ok");
    return [
      probs.length > 0
        ? `Declare no anúncio: ${probs.slice(0, 2).map((f) => f.text.toLowerCase()).join(" e ")}.`
        : "Nenhum problema declarado — destaque isso no anúncio como diferencial.",
      diffPct > 5
        ? `Preço ${diffPct.toFixed(0)}% acima da FIPE. Ajuste o valor ou prepare justificativa para o comprador.`
        : "Preço alinhado com o mercado — boa posição de negociação.",
      "Compartilhe este laudo no seu anúncio. Vendedores com laudo fecham mais rápido e com menos barganha.",
    ];
  }

  const criticals = findings.filter((f) => f.severity === "critical");
  const withCost = findings.filter((f) => f.repair_cost && f.severity !== "ok");

  let step1: string;
  if (cautelarAlerts.some((a) => a.key === "gravame")) {
    step1 = "Antes de fechar: exija comprovante de quitação do financiamento — sem isso o carro pode ser retomado pelo banco após a compra.";
  } else if (cautelarAlerts.length > 0) {
    step1 = `Antes de fechar: resolva ${cautelarAlerts[0].label.toLowerCase()} — ${cautelarAlerts[0].detail.split(".")[0].toLowerCase()}.`;
  } else if (criticals.length > 0) {
    step1 = `Antes de fechar: leve para avaliação de mecânico com foco em "${criticals[0].text.toLowerCase()}".`;
  } else {
    step1 = "Nenhum bloqueio crítico identificado — você pode avançar na negociação.";
  }

  let step2: string;
  if (withCost.length > 0 && diffPct > 5) {
    step2 = `Na negociação: peça desconto para cobrir os reparos (${withCost.map((f) => f.repair_cost).join(", ")}) mais a diferença de ${diffPct.toFixed(0)}% da FIPE.`;
  } else if (withCost.length > 0) {
    step2 = `Na negociação: peça desconto para cobrir os reparos identificados — ${withCost.map((f) => f.repair_cost).join(", ")}.`;
  } else if (diffPct > 5) {
    step2 = `Na negociação: o preço está ${diffPct.toFixed(0)}% acima da FIPE — argumento direto para pedir desconto.`;
  } else if (diffPct < -5) {
    step2 = `Preço ${Math.abs(diffPct).toFixed(0)}% abaixo da FIPE — pouca margem de negociação mas negócio equilibrado.`;
  } else {
    step2 = "Preço justo e sem reparos urgentes — pouca margem de negociação mas negócio equilibrado.";
  }

  let step3: string;
  const topCritical = criticals[0];
  if (topCritical) {
    step3 = `Se fechar: priorize corrigir "${topCritical.text.toLowerCase()}" nos primeiros meses.`;
  } else {
    step3 = "Carro em boas condições gerais — mantenha revisões em dia e aproveite a compra.";
  }

  return [step1, step2, step3];
}
