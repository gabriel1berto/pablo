export type TabId = "visao" | "externo" | "interno" | "mecanico_docs" | "modelo";

export type Laudo = {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  state: string | null;
  asking_price: number | null;
  fipe_price: number | null;
  score: number | null;
  tab_scores: Record<string, number> | null;
  transparency_pct: number | null;
  created_at: string;
  tipo: string;
  user_id: string;
};

export type InspectionItem = {
  id: number;
  tab: string;
  section: string;
  item_key: string;
  item_type: string;
  response: string | null;
  car_issue_id: number | null;
  sort_order: number;
};

export type InspectionMedia = {
  id: number;
  tab: string;
  media_type: string;
  media_key: string;
  public_url: string;
  ai_analysis: Record<string, unknown> | null;
  item_id: number | null;
  duration_seconds: number | null;
  sort_order: number;
};

export type ModelIssue = {
  id: number;
  title: string;
  description: string | null;
  severity: string;
  category: string | null;
  repair_cost: string | null;
};

export type ReportData = {
  laudo: Laudo;
  items: InspectionItem[];
  media: InspectionMedia[];
  issues: ModelIssue[];
  isOwner: boolean;
  sellerWhatsapp: string | null;
};
