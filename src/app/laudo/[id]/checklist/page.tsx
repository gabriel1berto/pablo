import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { normalizeModelKey } from "@/lib/model-utils";
import ChecklistForm from "./form";
import ResearchLoader from "./research-loader";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: laudo } = await supabase
    .from("laudos")
    .select("brand, model, year, km, tipo")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!laudo) redirect("/laudo/novo");

  const modelKey = normalizeModelKey(laudo.model);

  const { data: issues } = await supabase
    .from("car_issues")
    .select("id, category, title, description, severity, how_to_check, why_important, if_bad, repair_cost")
    .ilike("model_pattern", `%${modelKey}%`)
    .neq("category", "_sentinel")
    .order("category")
    .order("sort_order");

  const specificIssues = issues ?? [];
  const hasSpecific = specificIssues.length > 0;
  const needsResearch = !hasSpecific;

  // Sempre carregar genéricos (verificações padrão de qualquer carro)
  const { data: generic } = await supabase
    .from("car_issues")
    .select("id, category, title, description, severity, how_to_check, why_important, if_bad, repair_cost")
    .eq("model_pattern", "Generico")
    .order("category")
    .order("sort_order");

  // Juntar: específicos primeiro, depois genéricos (sem duplicar por título)
  const specificTitles = new Set(specificIssues.map((i) => i.title.toLowerCase()));
  const uniqueGeneric = (generic ?? []).filter((g) => !specificTitles.has(g.title.toLowerCase()));
  const displayIssues = [...specificIssues, ...uniqueGeneric];

  // Load previously saved checklist answers
  const { data: savedItems } = await supabase
    .from("laudo_items")
    .select("item_key, notes")
    .eq("laudo_id", id)
    .eq("category", "checklist");

  const savedStates: Record<string, string> = {};
  for (const item of savedItems ?? []) {
    if (item.notes === "ok" || item.notes === "problema") {
      savedStates[item.item_key] = item.notes;
    }
  }

  const specificCount = specificIssues.length;
  const criticals = specificIssues.filter((i) => i.severity === "critical").length;
  const warns = specificIssues.filter((i) => i.severity === "warn").length;

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      maxWidth: 480, margin: "0 auto", padding: "0 24px",
    }}>
      {/* Header */}
      <div style={{ paddingTop: 52, paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Link href={`/laudo/${id}`} style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>← Voltar</Link>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>Passo 2 de 5</span>
        </div>
        <div style={{ height: 3, background: "var(--bg3)", borderRadius: 99, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ width: "40%", height: "100%", background: "var(--accent)", borderRadius: 99 }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Checklist
        </h1>
        <p style={{ fontSize: 14, color: "var(--t2)" }}>
          {laudo.brand} {laudo.model} {laudo.year} · {laudo.km.toLocaleString("pt-BR")} km
        </p>
      </div>

      <div style={{ paddingTop: 12 }}>
        {/* Loader — aparece até ter itens específicos do modelo */}
        {needsResearch ? (
          <ResearchLoader
            brand={laudo.brand}
            model={laudo.model}
            year={laudo.year}
            km={laudo.km}
          />
        ) : displayIssues.length > 0 && (
          <>
            {specificCount > 0 && (
              <div style={{
                background: criticals > 0 ? "var(--dg)" : "var(--wg)",
                border: `1px solid ${criticals > 0 ? "rgba(255,68,68,0.2)" : "rgba(245,166,35,0.2)"}`,
                borderRadius: "var(--rm)", padding: "12px 16px", marginBottom: 10,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4,
                  color: criticals > 0 ? "var(--danger)" : "var(--warn)" }}>
                  {criticals > 0
                    ? `⚠ ${criticals} ponto${criticals > 1 ? "s" : ""} crítico${criticals > 1 ? "s" : ""} conhecido${criticals > 1 ? "s" : ""} do ${laudo.model}`
                    : `${warns} ponto${warns > 1 ? "s" : ""} de atenção para o ${laudo.model}`}
                </div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>
                  Problemas documentados para {laudo.km.toLocaleString("pt-BR")} km + verificação padrão ({displayIssues.length} itens no total).
                </div>
              </div>
            )}
            {specificCount === 0 && (
              <div style={{
                background: "var(--bg2)", border: "1px solid var(--bd)",
                borderRadius: "var(--rm)", padding: "12px 16px", marginBottom: 10,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: "var(--t2)" }}>
                  Verificação padrão — {displayIssues.length} itens
                </div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>
                  {laudo.tipo === "vendedor"
                    ? <>Preencha o estado real do carro. Marque <strong>OK</strong> ou <strong>Problema</strong>.</>
                    : <>Marque <strong>OK</strong> ou <strong>Problema</strong> em cada item.</>}
                </div>
              </div>
            )}
            <ChecklistForm laudoId={id} issues={displayIssues} carInfo={{ brand: laudo.brand, model: laudo.model, year: laudo.year, km: laudo.km }} savedStates={savedStates} />
          </>
        )}
      </div>
    </main>
  );
}
