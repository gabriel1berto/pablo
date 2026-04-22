// ── Seller Report Score v2 ────────────────────────────────
// Score por tab (0-10), média ponderada, transparência

export type SellerItem = {
  tab: string;
  section: string;
  item_key: string;
  item_type: string;
  response: string | null;
  car_issue_id: number | null;
};

export type SellerMedia = {
  tab: string;
  media_type: string;
  media_key: string;
  public_url: string;
  ai_analysis: Record<string, unknown> | null;
  item_id: number | null;
  duration_seconds: number | null;
};

export type CarIssue = {
  id: number;
  title: string;
  severity: string;
  category: string;
  description: string | null;
  repair_cost: string | null;
};

// ── Penalizações por resposta ───────────────────────────

const EXTERNO_PENALTIES: Record<string, number> = {
  amassado: -1.5,
  trinca: -2.0,
  pintura_diferente: -1.0,
  arranhao: -0.5,
};

const PNEU_STATE_PENALTIES: Record<string, number> = {
  careca: -1.5,
  meia_vida: -0.3,
};

const INTERNO_PENALTIES: Record<string, Record<string, number>> = {
  ar_condicionado: { nao_funciona: -2.0, funciona_fraco: -1.0 },
  vidros: { algum_defeito: -0.5 },
  travas: { alguma_defeito: -0.5 },
  bancos: { rasgo_mancha: -1.0 },
  teto_interno: { descolando: -0.5, manchado: -0.3 },
  portamalas_conteudo: { vazio: -0.5 },
};

const MECANICO_PENALTIES: Record<string, Record<string, number>> = {
  motor: { falhando: -3.0, demora_pegar: -1.5, barulho_anormal: -2.0 },
  cambio: { patinando: -3.0, tranco: -1.5, barulho: -1.5 },
  direcao: { barulho_virar: -1.0, trepidacao: -1.0, dura: -0.5 },
  freio: { pedal_mole: -2.0, puxa_lado: -1.5, ruido: -0.5, pedal_duro: -0.5 },
  embreagem: { patinando: -2.0, pegando_alto: -1.0, dura: -0.5 },
  suspensao: { barulho_constante: -1.5, barulho_lombada: -0.5, baixo_lado: -1.0 },
};

const DOCS_PENALTIES: Record<string, Record<string, number>> = {
  financiamento: { ativo: -2.0 },
  sinistro: { grave: -3.0, leve: -1.0 },
  ipva: { atrasado: -1.0, parcelas_pendentes: -0.5 },
  multas: { mais_de_3: -0.5 },
  recall: { pendente: -1.0 },
};

// ── Pesos das tabs ──────────────────────────────────────

const TAB_WEIGHTS: Record<string, number> = {
  mecanico_docs: 0.45,
  externo: 0.30,
  modelo: 0.15,
  interno: 0.10,
};

// ── Cálculo por tab ─────────────────────────────────────

function clampScore(score: number): number {
  return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
}

export function calcExternoScore(items: SellerItem[], media: SellerMedia[]): number {
  let score = 10;

  // Danos declarados
  const damages = items.filter((i) => i.item_type === "damage" && i.response);
  for (const d of damages) {
    const penalty = EXTERNO_PENALTIES[d.response!] ?? -0.5;
    score += penalty;
  }

  // Pintura
  const pintura = items.find((i) => i.item_key === "pintura");
  if (pintura?.response === "repintura_parcial") score -= 1.0;
  if (pintura?.response === "repintura_total") score -= 1.0;

  // Fotos obrigatórias ausentes (frente, traseira, lat_esq, lat_dir)
  const requiredPhotos = ["frente", "traseira", "lateral_esq", "lateral_dir"];
  const exteriorMedia = media.filter((m) => m.tab === "externo" && m.media_key.startsWith("ext_"));
  for (const key of requiredPhotos) {
    if (!exteriorMedia.some((m) => m.media_key === `ext_${key}`)) score -= 0.3;
  }

  // Pneus
  const pneuKeys = ["pneu_de", "pneu_dd", "pneu_te", "pneu_td"];
  for (const key of pneuKeys) {
    const pneu = items.find((i) => i.item_key === key);
    if (pneu?.response) {
      const penalty = PNEU_STATE_PENALTIES[pneu.response] ?? 0;
      score += penalty;
    }
  }

  // Medidas diferentes
  const uniformidade = items.find((i) => i.item_key === "pneus_mesma_marca");
  if (uniformidade?.response === "nao") score -= 1.0;

  // Estepe
  const estepe = items.find((i) => i.item_key === "estepe");
  if (estepe?.response === "ausente") score -= 0.5;

  // Rodas
  const rodas = items.find((i) => i.item_key === "rodas");
  if (rodas?.response === "amassadas") score -= 0.5;

  // Puxa pro lado
  const puxa = items.find((i) => i.item_key === "puxa_lado");
  if (puxa?.response === "puxa_leve" || puxa?.response === "puxa_forte") score -= 1.0;

  return clampScore(score);
}

export function calcInternoScore(items: SellerItem[]): number {
  let score = 10;

  for (const [key, penalties] of Object.entries(INTERNO_PENALTIES)) {
    const item = items.find((i) => i.item_key === key);
    if (item?.response && penalties[item.response]) {
      score += penalties[item.response];
    }
  }

  // Luzes no painel (multi_check)
  const luzes = items.find((i) => i.item_key === "luzes_painel");
  if (luzes?.response) {
    try {
      const checked: string[] = JSON.parse(luzes.response);
      if (checked.includes("motor")) score -= 2.5;
      if (checked.includes("abs")) score -= 1.5;
      if (checked.includes("airbag")) score -= 1.5;
      if (checked.includes("bateria")) score -= 0.5;
      if (checked.includes("temperatura")) score -= 1.0;
    } catch {}
  }

  return clampScore(score);
}

export function calcMecanicoDocsScore(items: SellerItem[], media: SellerMedia[]): number {
  let score = 10;

  // Mecânico
  for (const [key, penalties] of Object.entries(MECANICO_PENALTIES)) {
    const item = items.find((i) => i.item_key === key);
    if (item?.response && penalties[item.response]) {
      score += penalties[item.response];
    }
  }

  // Vídeos obrigatórios ausentes
  const requiredVideos = ["motor_ligado", "escapamento"];
  const mecVideos = media.filter((m) => m.tab === "mecanico_docs" && m.media_type === "video");
  for (const key of requiredVideos) {
    if (!mecVideos.some((m) => m.media_key === key)) score -= 0.5;
  }

  // Documentação
  for (const [key, penalties] of Object.entries(DOCS_PENALTIES)) {
    const item = items.find((i) => i.item_key === key);
    if (item?.response && penalties[item.response]) {
      score += penalties[item.response];
    }
  }

  // CRLV ausente
  const crlvPhoto = media.find((m) => m.media_key === "crlv");
  if (!crlvPhoto) score -= 0.5;

  return clampScore(score);
}

export function calcModeloScore(items: SellerItem[], issues: CarIssue[]): number {
  let score = 10;

  for (const issue of issues) {
    const item = items.find((i) => i.car_issue_id === issue.id);
    if (!item || !item.response) {
      // Não respondido
      score -= 0.3;
    } else if (item.response !== "ok" && item.response !== "nao" && item.response !== "nunca") {
      // Problema declarado
      if (issue.severity === "critical") score -= 2.5;
      else score -= 1.2;
    }
  }

  // Itens críticos sem evidência
  const criticalIssues = issues.filter((i) => i.severity === "critical");
  for (const issue of criticalIssues) {
    const item = items.find((i) => i.car_issue_id === issue.id);
    if (item?.response && item.response !== "ok" && item.response !== "nao") {
      // Tem problema mas sem evidência — penalidade extra já coberta acima
    }
  }

  return clampScore(score);
}

// ── Score geral ─────────────────────────────────────────

export type TabScores = {
  externo: number;
  interno: number;
  mecanico_docs: number;
  modelo: number;
};

export function calcOverallScore(tabs: TabScores): number {
  const weighted =
    tabs.mecanico_docs * TAB_WEIGHTS.mecanico_docs +
    tabs.externo * TAB_WEIGHTS.externo +
    tabs.modelo * TAB_WEIGHTS.modelo +
    tabs.interno * TAB_WEIGHTS.interno;
  return clampScore(weighted);
}

// ── Transparência ───────────────────────────────────────

export function calcTransparency(
  items: SellerItem[],
  media: SellerMedia[],
  modelIssueCount: number
): { pct: number; delivered: number; required: number } {
  let required = 0;
  let delivered = 0;

  // Tab 2: 4 fotos exterior + 4 fotos pneus = 8
  const extRequired = ["ext_frente", "ext_traseira", "ext_lateral_esq", "ext_lateral_dir"];
  const pneuRequired = ["pneu_de", "pneu_dd", "pneu_te", "pneu_td"];
  for (const key of [...extRequired, ...pneuRequired]) {
    required++;
    if (media.some((m) => m.media_key === key)) delivered++;
  }

  // Tab 3: 4 fotos interior
  const intRequired = ["int_painel", "int_motorista", "int_traseiro", "int_portamalas"];
  for (const key of intRequired) {
    required++;
    if (media.some((m) => m.media_key === key)) delivered++;
  }

  // Tab 4: 2 vídeos + 1 foto motor + 1 foto CRLV = 4
  const mecRequired = ["motor_ligado", "escapamento", "motor_desligado", "crlv"];
  for (const key of mecRequired) {
    required++;
    if (media.some((m) => m.media_key === key)) delivered++;
  }

  // Fotos de dano e evidências do modelo:
  // Upload por dano e por item do modelo ainda não implementado.
  // Quando implementado, descomentar e ajustar o matching.
  // Por ora, transparência conta apenas fotos/vídeos das estações.

  const pct = required > 0 ? Math.round((delivered / required) * 100) : 100;
  return { pct, delivered, required };
}

// ── Contagem de ressalvas ───────────────────────────────

export function countRessalvas(items: SellerItem[], issues: CarIssue[]): number {
  let count = 0;

  // Danos exteriores
  count += items.filter((i) => i.item_type === "damage").length;

  // Pneus com problema
  const pneuKeys = ["pneu_de", "pneu_dd", "pneu_te", "pneu_td"];
  for (const key of pneuKeys) {
    const p = items.find((i) => i.item_key === key);
    if (p?.response === "careca" || p?.response === "meia_vida") count++;
  }

  // Interior
  const acItem = items.find((i) => i.item_key === "ar_condicionado");
  if (acItem?.response === "nao_funciona" || acItem?.response === "funciona_fraco") count++;

  // Luzes
  const luzes = items.find((i) => i.item_key === "luzes_painel");
  if (luzes?.response) {
    try {
      const checked: string[] = JSON.parse(luzes.response);
      count += checked.length;
    } catch {}
  }

  // Mecânico — respostas que não são a "boa"
  const mecGood: Record<string, string> = {
    motor: "liga_normal", cambio: "troca_suave", direcao: "leve",
    freio: "normal", suspensao: "sem_barulho", embreagem: "pegando_meio",
  };
  for (const [key, good] of Object.entries(mecGood)) {
    const item = items.find((i) => i.item_key === key);
    if (item?.response && item.response !== good) count++;
  }

  // Docs
  const finItem = items.find((i) => i.item_key === "financiamento");
  if (finItem?.response === "ativo") count++;
  const sinItem = items.find((i) => i.item_key === "sinistro");
  if (sinItem?.response === "leve" || sinItem?.response === "grave") count++;

  return count;
}
