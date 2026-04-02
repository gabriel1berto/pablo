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

  const hasSpecific = (issues ?? []).length > 0;

  // Se não tem itens específicos, mostra loader (research-loader cuida de não re-pesquisar)
  // Só mostra genérico como fallback se o modelo for literalmente "Generico"
  let displayIssues = issues ?? [];
  let isGeneric = false;
  const needsResearch = !hasSpecific;

  if (!hasSpecific) {
    // Fallback genérico enquanto não tem dados específicos
    const { data: generic } = await supabase
      .from("car_issues")
      .select("id, category, title, description, severity, how_to_check, why_important, if_bad, repair_cost")
      .eq("model_pattern", "Generico")
      .order("category")
      .order("sort_order");
    displayIssues = generic ?? [];
    isGeneric = true;
  }

  const criticals = displayIssues.filter((i) => i.severity === "critical").length;
  const warns = displayIssues.filter((i) => i.severity === "warn").length;

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
            <div style={{
              background: isGeneric ? "var(--bg2)" : criticals > 0 ? "var(--dg)" : "var(--wg)",
              border: `1px solid ${isGeneric ? "var(--bd)" : criticals > 0 ? "rgba(255,68,68,0.2)" : "rgba(245,166,35,0.2)"}`,
              borderRadius: "var(--rm)", padding: "12px 16px", marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4,
                color: isGeneric ? "var(--t2)" : criticals > 0 ? "var(--danger)" : "var(--warn)" }}>
                {isGeneric
                  ? `Inspeção geral — ${displayIssues.length} itens`
                  : criticals > 0
                    ? `⚠ ${criticals} ponto${criticals > 1 ? "s" : ""} crítico${criticals > 1 ? "s" : ""} conhecido${criticals > 1 ? "s" : ""} do ${laudo.model}`
                    : `${warns} ponto${warns > 1 ? "s" : ""} de atenção para o ${laudo.model}`}
              </div>
              <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>
                {isGeneric
                  ? "Modelo fora da base. Checklist padrão para qualquer carro usado."
                  : `Problemas reais documentados para ${laudo.km.toLocaleString("pt-BR")} km.`}
                {" "}{laudo.tipo === "vendedor"
                  ? <>Preencha com honestidade o estado real do seu carro. Marque <strong>OK</strong> ou <strong>Problema</strong>.</>
                  : <>Marque <strong>OK</strong> ou <strong>Problema</strong> em cada item.</>}
              </div>
            </div>
            <ChecklistForm laudoId={id} issues={displayIssues} carInfo={{ brand: laudo.brand, model: laudo.model, year: laudo.year, km: laudo.km }} />
          </>
        )}
      </div>
    </main>
  );
}
