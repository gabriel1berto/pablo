"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  calcExternoScore, calcInternoScore, calcMecanicoDocsScore, calcModeloScore,
  calcOverallScore, calcTransparency,
  type SellerItem, type SellerMedia, type CarIssue,
} from "@/lib/seller-score";

// ── Helpers ─────────────────────────────────────────────

async function verifyOwner(laudoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada.", user: null };
  const service = createServiceClient();
  const { data: laudo } = await service.from("laudos").select("user_id, score_version").eq("id", laudoId).single();
  if (!laudo || laudo.user_id !== user.id) return { error: "Laudo não encontrado.", user: null };
  if (laudo.score_version !== "v2") return { error: "Laudo incompatível.", user: null };
  return { error: null, user };
}

// ── Salvar respostas de uma estação ─────────────────────

export async function saveStationItems(
  laudoId: string,
  tab: string,
  items: { section: string; item_key: string; item_type: string; response: string | null; car_issue_id?: number | null }[]
) {
  const { error: authError } = await verifyOwner(laudoId);
  if (authError) return { error: authError };

  const service = createServiceClient();

  for (const item of items) {
    const { error } = await service
      .from("seller_inspection_items")
      .upsert({
        laudo_id: laudoId,
        tab,
        section: item.section,
        item_key: item.item_key,
        item_type: item.item_type,
        response: item.response,
        car_issue_id: item.car_issue_id ?? null,
      }, { onConflict: "laudo_id,item_key" });
    if (error) return { error: "Erro ao salvar: " + error.message };
  }

  return { success: true };
}

// ── Upload de mídia ─────────────────────────────────────

export async function uploadMedia(formData: FormData) {
  const laudoId = formData.get("laudoId") as string;
  const tab = formData.get("tab") as string;
  const mediaKey = formData.get("mediaKey") as string;
  const mediaType = formData.get("mediaType") as string;
  const itemId = formData.get("itemId") as string | null;
  const file = formData.get("file") as File;

  if (!file || !laudoId || !tab || !mediaKey || !mediaType) {
    return { error: "Dados incompletos." };
  }

  const { error: authError, user } = await verifyOwner(laudoId);
  if (authError || !user) return { error: authError ?? "Não autenticado." };

  const service = createServiceClient();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${user.id}/${laudoId}/${mediaKey}.${ext}`;

  // Upload pro Storage
  const { error: uploadError } = await service.storage
    .from("seller-media")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: "Erro no upload: " + uploadError.message };

  const { data: urlData } = service.storage.from("seller-media").getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  // Upsert no seller_inspection_media
  // Primeiro, remove entrada antiga com mesmo media_key
  await service.from("seller_inspection_media")
    .delete()
    .eq("laudo_id", laudoId)
    .eq("media_key", mediaKey);

  const { error: insertError } = await service
    .from("seller_inspection_media")
    .insert({
      laudo_id: laudoId,
      tab,
      media_type: mediaType,
      media_key: mediaKey,
      storage_path: path,
      public_url: publicUrl,
      item_id: itemId ? parseInt(itemId) : null,
    });

  if (insertError) return { error: "Erro ao registrar mídia: " + insertError.message };

  return { success: true, publicUrl };
}

// ── Finalizar laudo: calcular scores ────────────────────

export async function finalizarLaudo(laudoId: string) {
  const { error: authError } = await verifyOwner(laudoId);
  if (authError) return { error: authError };

  const service = createServiceClient();

  // Buscar todos os dados
  const [{ data: items }, { data: mediaRows }] = await Promise.all([
    service.from("seller_inspection_items").select("*").eq("laudo_id", laudoId),
    service.from("seller_inspection_media").select("*").eq("laudo_id", laudoId),
  ]);

  const { data: laudo } = await service.from("laudos").select("model").eq("id", laudoId).single();
  if (!laudo) return { error: "Laudo não encontrado." };

  // Buscar issues do modelo
  const modelKey = `%${laudo.model.toLowerCase().replace(/\s+/g, "%")}%`;
  const { data: issues } = await service
    .from("car_issues")
    .select("id, title, description, severity, category, repair_cost")
    .ilike("model_pattern", modelKey);

  const sellerItems: SellerItem[] = (items ?? []).map((i) => ({
    tab: i.tab, section: i.section, item_key: i.item_key,
    item_type: i.item_type, response: i.response, car_issue_id: i.car_issue_id,
  }));

  const sellerMedia: SellerMedia[] = (mediaRows ?? []).map((m) => ({
    tab: m.tab, media_type: m.media_type, media_key: m.media_key,
    public_url: m.public_url, ai_analysis: m.ai_analysis,
    item_id: m.item_id, duration_seconds: m.duration_seconds,
  }));

  const carIssues: CarIssue[] = (issues ?? []).map((i) => ({
    id: i.id, title: i.title, description: i.description,
    severity: i.severity, category: i.category ?? "", repair_cost: i.repair_cost,
  }));

  // Calcular scores
  const extItems = sellerItems.filter((i) => i.tab === "externo");
  const extMedia = sellerMedia.filter((m) => m.tab === "externo");
  const intItems = sellerItems.filter((i) => i.tab === "interno");
  const mecItems = sellerItems.filter((i) => i.tab === "mecanico_docs");
  const mecMedia = sellerMedia.filter((m) => m.tab === "mecanico_docs");
  const modItems = sellerItems.filter((i) => i.tab === "modelo");

  const tabScores = {
    externo: calcExternoScore(extItems, extMedia),
    interno: calcInternoScore(intItems),
    mecanico_docs: calcMecanicoDocsScore(mecItems, mecMedia),
    modelo: calcModeloScore(modItems, carIssues),
  };

  const score = calcOverallScore(tabScores);
  const criticalIssueCount = carIssues.filter((i) => i.severity === "critical").length;
  const transparency = calcTransparency(sellerItems, sellerMedia, criticalIssueCount);

  // Persistir
  const { error: updateError } = await service
    .from("laudos")
    .update({
      score,
      tab_scores: tabScores,
      transparency_pct: transparency.pct,
      verdict: null, // v2 não tem veredito textual
    })
    .eq("id", laudoId);

  if (updateError) return { error: "Erro ao salvar score: " + updateError.message };

  return { success: true, score, tabScores, transparency };
}
