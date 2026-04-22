import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SellerReport } from "@/components/seller-report";
import type { ReportData } from "@/components/seller-report/types";

type Props = { id: string; laudo: Record<string, unknown> };

export async function SellerReportLoader({ id, laudo }: Props) {
  const userSupabase = await createClient();
  const { data: { user } } = await userSupabase.auth.getUser();
  const service = createServiceClient();
  const isOwner = user?.id === laudo.user_id;

  // Carregar items e media
  const [{ data: items }, { data: mediaRows }] = await Promise.all([
    service.from("seller_inspection_items").select("*").eq("laudo_id", id).order("sort_order"),
    service.from("seller_inspection_media").select("*").eq("laudo_id", id).order("sort_order"),
  ]);

  // Carregar issues do modelo (car_issues)
  const modelKey = `%${(laudo.model as string).toLowerCase().replace(/\s+/g, "%")}%`;
  const { data: issues } = await service
    .from("car_issues")
    .select("id, title, description, severity, category, repair_cost")
    .ilike("model_pattern", modelKey)
    .order("severity", { ascending: true })
    .order("sort_order");

  // WhatsApp do vendedor
  let sellerWhatsapp: string | null = null;
  if (!isOwner) {
    const { data: sellerData } = await service.auth.admin.getUserById(laudo.user_id as string);
    const meta = sellerData?.user?.user_metadata;
    if (meta?.whatsapp && typeof meta.whatsapp === "string" && meta.whatsapp.trim() !== "") {
      sellerWhatsapp = meta.whatsapp.replace(/\D/g, "");
    }
  }

  const reportData: ReportData = {
    laudo: {
      id,
      brand: laudo.brand as string,
      model: laudo.model as string,
      year: laudo.year as number,
      km: laudo.km as number,
      state: laudo.state as string | null,
      asking_price: laudo.asking_price ? Number(laudo.asking_price) : null,
      fipe_price: laudo.fipe_price ? Number(laudo.fipe_price) : null,
      score: laudo.score ? Number(laudo.score) : null,
      tab_scores: (laudo.tab_scores as Record<string, number>) ?? null,
      transparency_pct: laudo.transparency_pct ? Number(laudo.transparency_pct) : null,
      created_at: laudo.created_at as string,
      tipo: laudo.tipo as string,
      user_id: laudo.user_id as string,
    },
    items: (items ?? []).map((i) => ({
      id: i.id,
      tab: i.tab,
      section: i.section,
      item_key: i.item_key,
      item_type: i.item_type,
      response: i.response,
      car_issue_id: i.car_issue_id,
      sort_order: i.sort_order,
    })),
    media: (mediaRows ?? []).map((m) => ({
      id: m.id,
      tab: m.tab,
      media_type: m.media_type,
      media_key: m.media_key,
      public_url: m.public_url,
      ai_analysis: m.ai_analysis,
      item_id: m.item_id,
      duration_seconds: m.duration_seconds,
      sort_order: m.sort_order,
    })),
    issues: (issues ?? []).map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      severity: i.severity,
      category: i.category,
      repair_cost: i.repair_cost,
    })),
    isOwner,
    sellerWhatsapp,
  };

  return <SellerReport data={reportData} />;
}
