import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  CAUTELAR_LABEL, CAUTELAR_DETAIL, CAT_LABEL,
  verdict, fmt, fmtDate, buildSteps,
  type Finding, type CautelarAlert,
} from "@/lib/laudo-score";
import { SectionDivider } from "../components/section-divider";

function buildHeroContext(
  isVendedor: boolean,
  findings: Finding[],
  cautelarAlerts: CautelarAlert[],
  diffPct: number,
  coverage: number
): string {
  if (isVendedor) {
    const probs = findings.filter((f) => f.severity !== "ok").length;
    if (probs > 0) return `${probs} ponto${probs > 1 ? "s" : ""} declarado${probs > 1 ? "s" : ""}`;
    return "Nenhum problema declarado";
  }
  const parts: string[] = [];
  // Redflags documentais
  const hasGravame = cautelarAlerts.some((a) => a.key === "gravame");
  const hasSinistro = cautelarAlerts.some((a) => a.key === "sinistro");
  if (hasGravame) parts.push("GRAVAME ATIVO — não feche sem quitação");
  else if (hasSinistro) parts.push("SINISTRO — verifique estrutura");
  else if (cautelarAlerts.length > 0)
    parts.push(`${cautelarAlerts.length} alerta${cautelarAlerts.length > 1 ? "s" : ""} documental${cautelarAlerts.length > 1 ? "is" : ""}`);
  const criticals = findings.filter((f) => f.severity === "critical").length;
  const warns = findings.filter((f) => f.severity === "warn").length;
  if (criticals > 0) parts.push(`${criticals} crítico${criticals > 1 ? "s" : ""}`);
  else if (warns > 0) parts.push(`${warns} atenção`);
  if (diffPct > 10) parts.push(`preço ${diffPct.toFixed(0)}% acima da FIPE`);
  if (coverage < 0.5 && coverage > 0) parts.push("checklist incompleto");
  if (parts.length === 0) return "Nenhum problema identificado";
  return parts.join(" · ");
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
    ? await supabase
        .from("car_issues")
        .select("id, title, description, if_bad, severity, category, repair_cost")
        .in("id", issueIds)
    : { data: [] };

  // ── Score ─────────────────────────────────────────────────────
  let score = 10;
  const findings: Finding[] = [];

  for (const issue of issues ?? []) {
    const item = checklistItems.find((i) => i.item_key === String(issue.id));
    const state = item?.notes ?? "nd";

    if (state === "problema") {
      if (issue.severity === "critical") {
        score -= 2.5;
        findings.push({
          text: issue.title,
          detail: issue.description,
          if_bad: issue.if_bad,
          severity: "critical",
          category: issue.category ?? "Inspeção",
          repair_cost: issue.repair_cost,
        });
      } else {
        score -= 1.2;
        findings.push({
          text: issue.title,
          detail: issue.description,
          if_bad: issue.if_bad,
          severity: "warn",
          category: issue.category ?? "Inspeção",
          repair_cost: issue.repair_cost,
        });
      }
    }
  }

  const cautelarAlerts: CautelarAlert[] = cautelarItems
    .filter((c) => c.notes === "atencao")
    .map((c) => ({
      key: c.item_key,
      label: CAUTELAR_LABEL[c.item_key] ?? c.item_key,
      detail: CAUTELAR_DETAIL[c.item_key] ?? "",
    }));

  let diffPct = 0;
  if (laudo.fipe_price && laudo.asking_price) {
    diffPct = ((laudo.asking_price - laudo.fipe_price) / laudo.fipe_price) * 100;
    if (diffPct > 20) {
      score -= 2.0;
      findings.push({
        text: `Preço ${diffPct.toFixed(1)}% acima da FIPE`,
        detail: `Pedindo ${fmt(laudo.asking_price)} · FIPE ${fmt(laudo.fipe_price)} · diferença de ${fmt(laudo.asking_price - laudo.fipe_price)}`,
        severity: "critical",
        category: "Precificação",
      });
    } else if (diffPct > 10) {
      score -= 1.0;
      findings.push({
        text: `Preço ${diffPct.toFixed(1)}% acima da FIPE`,
        detail: `Pedindo ${fmt(laudo.asking_price)} · FIPE ${fmt(laudo.fipe_price)} · diferença de ${fmt(laudo.asking_price - laudo.fipe_price)}`,
        severity: "warn",
        category: "Precificação",
      });
    } else if (diffPct > 5) {
      score -= 0.5;
      findings.push({
        text: `Preço ${diffPct.toFixed(1)}% acima da FIPE`,
        detail: `Pedindo ${fmt(laudo.asking_price)} · FIPE ${fmt(laudo.fipe_price)} · diferença de ${fmt(laudo.asking_price - laudo.fipe_price)}`,
        severity: "warn",
        category: "Precificação",
      });
    } else if (diffPct < 0) {
      findings.push({
        text: `Preço ${Math.abs(diffPct).toFixed(1)}% abaixo da FIPE — bom negócio`,
        detail: `Pedindo ${fmt(laudo.asking_price)} · FIPE ${fmt(laudo.fipe_price)}`,
        severity: "ok",
        category: "Precificação",
      });
    }
  }

  // Penalizar cobertura baixa (menos de 50% respondido)
  const totalItems = (issues ?? []).length;
  const answeredItems = checklistItems.filter((i) => i.notes === "ok" || i.notes === "problema").length;
  const coverage = totalItems > 0 ? answeredItems / totalItems : 0;
  if (coverage < 0.5 && answeredItems > 0) {
    score -= 1.5;
  } else if (coverage < 0.75 && answeredItems > 0) {
    score -= 0.5;
  }

  score = Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  if (isNaN(score)) score = 10;

  const v = verdict(score);
  const isVendedor = laudo.tipo === "vendedor";

  // Transparency score for seller laudos
  const transparencyAnswered = checklistItems.filter((i) => i.notes === "ok" || i.notes === "problema").length;
  const transparencyTotal = (issues ?? []).length;
  const transparencyPct = transparencyTotal > 0 ? Math.round((transparencyAnswered / transparencyTotal) * 100) : 0;

  // Unverified items for seller laudos
  const unverifiedItems = (issues ?? []).filter((issue) => {
    const item = checklistItems.find((i) => i.item_key === String(issue.id));
    return !item || item.notes === "nd";
  });

  // Validity date for seller laudos (created_at + 30 days)
  const validUntil = new Date(laudo.created_at);
  validUntil.setDate(validUntil.getDate() + 30);
  const isExpired = new Date() > validUntil;

  const hasAnswers = checklistItems.some((i) => i.notes === "ok" || i.notes === "problema");
  if (hasAnswers) {
    const { error: persistError } = await supabase
      .from("laudos")
      .update({ score, verdict: v.label })
      .eq("id", id);
    if (persistError) console.error("[resultado] score persist failed:", persistError);
  }

  const positiveCriticals = (issues ?? []).filter((issue) => {
    const item = checklistItems.find((i) => i.item_key === String(issue.id));
    return item?.notes === "ok" && issue.severity === "critical";
  });

  const problemFindings = findings.filter((f) => f.severity !== "ok");
  const heroContext = buildHeroContext(isVendedor, problemFindings, cautelarAlerts, diffPct, coverage);
  const steps = buildSteps(isVendedor, cautelarAlerts, problemFindings, diffPct);

  const groups: Record<string, typeof findings> = {};
  for (const f of problemFindings) {
    if (!groups[f.category]) groups[f.category] = [];
    groups[f.category].push(f);
  }

  const totalChecked = checklistItems.length;
  const problemCount = problemFindings.filter((f) => f.category !== "Precificação").length;

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px 64px" }}>

      {/* Navigation */}
      <div style={{ paddingTop: 52, paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Link href={`/laudo/${id}/mercado`} style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>← Voltar</Link>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>Passo 5 de 5</span>
        </div>
        <div style={{ height: 3, background: "var(--accent)", borderRadius: 99, marginBottom: 20 }} />

        {/* Metadata header */}
        <div style={{ fontSize: 11, color: "var(--t4)", letterSpacing: "0.3px" }}>
          Laudo · {fmtDate(laudo.created_at)} · {laudo.brand} {laudo.model} {laudo.year} · {laudo.km.toLocaleString("pt-BR")} km
        </div>
        {isVendedor && (
          <div style={{
            fontSize: 11, marginTop: 6,
            color: isExpired ? "var(--danger)" : "var(--t3)",
            fontWeight: isExpired ? 700 : 400,
          }}>
            {isExpired
              ? "Laudo vencido \u2014 atualize para manter a credibilidade"
              : `V\u00e1lido at\u00e9 ${fmtDate(validUntil.toISOString())}`}
          </div>
        )}
      </div>

      {/* Hero — verdict dominant */}
      <div style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: "var(--rm)",
        padding: "24px 20px",
        marginBottom: 28,
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12,
        }}>
          {isVendedor ? "Laudo de transpar\u00eancia" : "Avalia\u00e7\u00e3o Pablo"}
        </div>
        {isVendedor ? (
          <>
            <div style={{
              fontSize: 34, fontWeight: 900,
              color: transparencyPct >= 80 ? "var(--ok)" : transparencyPct >= 50 ? "var(--warn)" : "var(--danger)",
              letterSpacing: "-0.5px", textTransform: "uppercase", lineHeight: 1.1,
              marginBottom: 10,
            }}>
              Transpar\u00eancia: {transparencyPct}%
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 12 }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: v.color, letterSpacing: "-2px", lineHeight: 1 }}>
                {score.toFixed(1)}
              </span>
              <span style={{ fontSize: 18, color: "var(--t3)", fontWeight: 400 }}>/10</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.5 }}>
              {transparencyAnswered} de {transparencyTotal} itens respondidos
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontSize: 34, fontWeight: 900, color: v.color,
              letterSpacing: "-0.5px", textTransform: "uppercase", lineHeight: 1.1,
              marginBottom: 10,
            }}>
              {v.label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 12 }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: v.color, letterSpacing: "-2px", lineHeight: 1 }}>
                {score.toFixed(1)}
              </span>
              <span style={{ fontSize: 18, color: "var(--t3)", fontWeight: 400 }}>/10</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.5 }}>
              {heroContext}
            </div>
          </>
        )}
      </div>

      {/* Documental alerts */}
      {cautelarAlerts.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionDivider label="Alertas documentais" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cautelarAlerts.map((alert) => (
              <div key={alert.key} style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "var(--rm)", padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99, background: "rgba(239,68,68,0.15)", color: "var(--danger)", letterSpacing: "0.4px" }}>
                    DOCUMENTAL
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)", marginBottom: 5 }}>
                  {alert.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55 }}>
                  {alert.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mechanical problems */}
      {Object.keys(groups).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionDivider
            label="Problemas identificados"
            counter={totalChecked > 0 ? `${problemCount} de ${totalChecked} itens` : undefined}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(groups).map(([category, items]) => (
              <div key={category}>
                {items.map((f, i) => (
                  <div key={i} style={{
                    background: f.severity === "critical" ? "rgba(239,68,68,0.05)" : f.severity === "warn" ? "rgba(234,179,8,0.05)" : "rgba(34,197,94,0.05)",
                    border: `1px solid ${f.severity === "critical" ? "rgba(239,68,68,0.2)" : f.severity === "warn" ? "rgba(234,179,8,0.2)" : "rgba(34,197,94,0.15)"}`,
                    borderRadius: "var(--rm)", padding: "14px 16px",
                    marginBottom: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", lineHeight: 1.4, flex: 1 }}>
                        {f.text}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99, whiteSpace: "nowrap",
                          background: f.severity === "critical" ? "rgba(239,68,68,0.15)" : f.severity === "warn" ? "rgba(234,179,8,0.15)" : "rgba(34,197,94,0.15)",
                          color: f.severity === "critical" ? "var(--danger)" : f.severity === "warn" ? "var(--warn)" : "var(--ok)",
                          letterSpacing: "0.3px",
                        }}>
                          {f.severity === "critical" ? "CRÍTICO" : f.severity === "warn" ? "ATENÇÃO" : "OK"}
                        </span>
                        <span style={{ fontSize: 10, color: "var(--t4)", fontWeight: 600 }}>
                          {CAT_LABEL[category] ?? category}
                        </span>
                      </div>
                    </div>
                    {f.if_bad && (
                      <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55, marginBottom: f.repair_cost ? 6 : 0 }}>
                        {f.if_bad}
                      </div>
                    )}
                    {!f.if_bad && f.detail && (
                      <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.55, marginBottom: f.repair_cost ? 6 : 0 }}>
                        {f.detail}
                      </div>
                    )}
                    {f.repair_cost && (
                      <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 4 }}>
                        Reparo estimado: <strong style={{ color: "var(--t3)" }}>{f.repair_cost}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positives */}
      {positiveCriticals.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionDivider label={`${positiveCriticals.length} ponto${positiveCriticals.length > 1 ? "s" : ""} crítico${positiveCriticals.length > 1 ? "s" : ""} verificado${positiveCriticals.length > 1 ? "s" : ""} e OK`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {positiveCriticals.map((issue) => (
              <div key={issue.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: "var(--rm)", padding: "10px 14px",
              }}>
                <span style={{ fontSize: 14, color: "var(--ok)", flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{issue.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unverified items — seller only */}
      {isVendedor && unverifiedItems.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionDivider label="Itens n\u00e3o verificados pelo vendedor" />
          <div style={{
            background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.15)",
            borderRadius: "var(--rm)", padding: "14px 16px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {unverifiedItems.map((issue) => (
                <div key={issue.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--warn)", flexShrink: 0 }}>--</span>
                  <span style={{ fontSize: 13, color: "var(--t2)" }}>{issue.title}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 10, lineHeight: 1.5 }}>
              Esses itens precisam ser verificados por um mec\u00e2nico
            </div>
          </div>
        </div>
      )}

      {/* 3-step recommendation */}
      <div style={{ marginBottom: 32 }}>
        <SectionDivider label={isVendedor ? "Recomenda\u00e7\u00f5es" : "O que fazer agora"} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: 12,
              background: "var(--bg2)", border: "1px solid var(--bd)",
              borderRadius: "var(--rm)", padding: "14px 16px",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "var(--bg3)", color: "var(--accent)",
                fontSize: 11, fontWeight: 900, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.6, flex: 1 }}>
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link
          href={`/laudo/${id}/compartilha`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54,
            background: isVendedor ? "#A78BFA" : "var(--accent)",
            color: "#050505",
            borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800, textDecoration: "none",
          }}
        >
          {isVendedor ? "Compartilhar no anúncio →" : "Compartilhar com o vendedor →"}
        </Link>
        <Link
          href="/laudos"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 48, background: "var(--bg2)", color: "var(--t2)",
            border: "1px solid var(--bd)", borderRadius: "var(--rs)",
            fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}
        >
          Ver meus laudos
        </Link>
      </div>
    </main>
  );
}
