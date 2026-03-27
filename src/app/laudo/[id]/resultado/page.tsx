import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CAUTELAR_LABEL: Record<string, string> = {
  crlv: "CRLV vencido / irregular",
  multas: "Multas pendentes no veículo",
  sinistro: "Histórico de batida ou sinistro",
  gravame: "Financiamento / gravame ativo",
  recall: "Recall pendente não atendido",
  manutencoes: "Manutenções atrasadas ou sem comprovante",
};

const SEV_COLOR: Record<string, string> = {
  critical: "var(--danger)",
  warn: "var(--warn)",
  ok: "var(--ok)",
};

function verdict(score: number) {
  if (score >= 8) return { label: "Boa Compra", color: "var(--ok)" };
  if (score >= 6) return { label: "Compra com Cautela", color: "var(--warn)" };
  if (score >= 4) return { label: "Risco Moderado", color: "var(--warn)" };
  return { label: "Não Recomendado", color: "var(--danger)" };
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default async function ResultadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: laudo } = await supabase
    .from("laudos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!laudo) redirect("/laudo/novo");

  const { data: allItems } = await supabase
    .from("laudo_items")
    .select("*")
    .eq("laudo_id", id);

  const checklistItems = allItems?.filter((i) => i.category === "checklist") ?? [];
  const cautelarItems = allItems?.filter((i) => i.category === "cautelar") ?? [];

  const issueIds = checklistItems.map((i) => parseInt(i.item_key)).filter(Boolean);
  const { data: issues } = issueIds.length
    ? await supabase.from("car_issues").select("id, title, description, severity, category").in("id", issueIds)
    : { data: [] };

  // ── Score calculation ──────────────────────────────────────
  let score = 10;
  type Finding = { text: string; detail?: string; severity: "critical" | "warn" | "ok" };
  const findings: Finding[] = [];

  // Checklist — usa 3 estados: ok / problema / nd
  for (const issue of issues ?? []) {
    const item = checklistItems.find((i) => i.item_key === String(issue.id));
    const state = item?.notes ?? "nd"; // 'ok' | 'problema' | 'nd'

    if (state === "problema") {
      if (issue.severity === "critical") {
        score -= 2.5;
        findings.push({ text: issue.title, detail: issue.description, severity: "critical" });
      } else if (issue.severity === "warn") {
        score -= 1.2;
        findings.push({ text: issue.title, detail: issue.description, severity: "warn" });
      }
    } else if (state === "nd") {
      // Penalidade menor por não verificado — incerteza
      if (issue.severity === "critical") score -= 0.8;
      else if (issue.severity === "warn") score -= 0.3;
    }
    // state === 'ok' → sem penalidade
  }

  // Cautelar — atencao penaliza mais, nd penaliza levemente
  for (const c of cautelarItems) {
    if (c.notes === "atencao") {
      score -= 1.5;
      findings.push({ text: CAUTELAR_LABEL[c.item_key] ?? c.item_key, severity: "critical" });
    } else if (c.notes === "nd") {
      score -= 0.4;
    }
  }

  // Price vs FIPE
  let diffPct = 0;
  if (laudo.fipe_price && laudo.asking_price) {
    diffPct = ((laudo.asking_price - laudo.fipe_price) / laudo.fipe_price) * 100;
    if (diffPct > 20) {
      score -= 2.0;
      findings.push({ text: `Preço ${diffPct.toFixed(1)}% acima da FIPE`, severity: "critical" });
    } else if (diffPct > 10) {
      score -= 1.0;
      findings.push({ text: `Preço ${diffPct.toFixed(1)}% acima da FIPE`, severity: "warn" });
    } else if (diffPct > 5) {
      score -= 0.5;
      findings.push({ text: `Preço ${diffPct.toFixed(1)}% acima da FIPE`, severity: "warn" });
    } else if (diffPct < 0) {
      findings.push({ text: `Preço ${Math.abs(diffPct).toFixed(1)}% abaixo da FIPE — bom negócio`, severity: "ok" });
    }
  }

  score = Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  const v = verdict(score);

  // Salva score + verdict (apenas se ainda não calculado)
  if (!laudo.score) {
    await supabase.from("laudos").update({ score, verdict: v.label }).eq("id", id);
  }

  // Dica de negociação
  const criticals = findings.filter((f) => f.severity === "critical").length;
  const negoTip = criticals > 0
    ? `Negocie desconto para cobrir ${criticals} ponto${criticals > 1 ? "s" : ""} crítico${criticals > 1 ? "s" : ""} identificado${criticals > 1 ? "s" : ""}.${diffPct > 5 ? ` Inclua a diferença de ${fmt(laudo.asking_price - laudo.fipe_price)} em relação à FIPE.` : ""}`
    : diffPct > 5
    ? `Carro acima da FIPE — negocie a diferença de ${fmt(laudo.asking_price - laudo.fipe_price)}.`
    : "Nenhum ponto crítico identificado. Preço compatível com o mercado.";

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px 64px" }}>
      {/* Header */}
      <div style={{ paddingTop: 52, paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Link href={`/laudo/${id}/mercado`} style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>← Voltar</Link>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>Passo 5 de 5</span>
        </div>
        <div style={{ height: 3, background: "var(--accent)", borderRadius: 99, marginBottom: 24 }} />
      </div>

      {/* Score */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0 32px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 80, fontWeight: 900, color: v.color, letterSpacing: "-4px", lineHeight: 1 }}>
            {score.toFixed(1)}
          </span>
          <span style={{ fontSize: 22, color: "var(--t3)", fontWeight: 400 }}>/10</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: v.color, marginTop: 12 }}>{v.label}</div>
        <div style={{ fontSize: 13, color: "var(--t3)", marginTop: 8, lineHeight: 1.5 }}>
          {laudo.brand} {laudo.model} {laudo.year} · {laudo.km.toLocaleString("pt-BR")} km
        </div>
      </div>

      {/* Findings */}
      {findings.length > 0 && (
        <>
          <div style={{ height: 1, background: "var(--bd)", marginBottom: 20 }} />
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
            Achados
          </div>
          {findings.map((f, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: SEV_COLOR[f.severity], flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600, lineHeight: 1.4 }}>{f.text}</div>
                  {f.detail && (
                    <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 3, lineHeight: 1.45 }}>{f.detail}</div>
                  )}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, flexShrink: 0,
                  background: f.severity === "critical" ? "var(--dg)" : f.severity === "warn" ? "var(--wg)" : "var(--og)",
                  color: SEV_COLOR[f.severity],
                }}>
                  {f.severity === "critical" ? "Crítico" : f.severity === "warn" ? "Atenção" : "OK"}
                </span>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Negotiation */}
      <div style={{ marginTop: 24, background: "var(--bg2)", border: "1px solid var(--bd)", borderRadius: "var(--rm)", padding: "16px 18px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
          Recomendação
        </div>
        <div style={{ fontSize: 14, color: "var(--t1)", lineHeight: 1.6, fontWeight: 500 }}>{negoTip}</div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 32 }}>
        <Link
          href={`/laudo/${id}/compartilha`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54, background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800, textDecoration: "none",
          }}
        >
          Salvar laudo →
        </Link>
      </div>
    </main>
  );
}
