import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = createServiceClient();
  const { data: laudo } = await service
    .from("laudos")
    .select("brand, model, year, score, verdict")
    .eq("id", id)
    .single();

  if (!laudo) return { title: "Laudo Pablo" };

  const title = `${laudo.brand} ${laudo.model} ${laudo.year} — Score ${laudo.score?.toFixed(1)}/10`;
  const description = `${laudo.verdict} · Laudo Pablo — avaliação independente de veículo usado.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

import {
  CAUTELAR_LABEL, CAUTELAR_DETAIL, CAT_LABEL,
  verdict, fmt, fmtDate, buildHeroContext, buildSteps,
  type Finding, type CautelarAlert,
} from "@/lib/laudo-score";
import { SectionDivider } from "./components/section-divider";

export default async function LaudoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const userSupabase = await createClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  const service = createServiceClient();

  const { data: laudo } = await service
    .from("laudos")
    .select("id, user_id, brand, model, year, km, score, verdict, asking_price, fipe_price, state, created_at, tipo")
    .eq("id", id)
    .single();

  if (!laudo) {
    return (
      <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ paddingTop: 52, paddingBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 40 }} />
          </Link>
        </div>
        <div style={{ textAlign: "center", paddingTop: 48 }}>
          <div style={{ fontSize: 14, color: "var(--t3)", marginBottom: 16 }}>Laudo não encontrado.</div>
          <Link href="/laudo/novo" style={{ fontSize: 14, color: "var(--accent)", textDecoration: "none" }}>
            Criar um laudo →
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = user?.id === laudo.user_id;

  // Laudo not completed yet
  if (!laudo.score) {
    return (
      <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ paddingTop: 52, paddingBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 40 }} />
          </Link>
        </div>
        <div style={{ textAlign: "center", maxWidth: 320, margin: "0 auto", paddingTop: 48 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            {laudo.brand} {laudo.model} {laudo.year}
          </div>
          <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 24 }}>
            {laudo.km.toLocaleString("pt-BR")} km
          </div>
          {isOwner ? (
            <>
              <div style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 20 }}>
                Sua inspeção ainda está em andamento.
              </div>
              <Link href={`/laudo/${id}/checklist`} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 46, padding: "0 28px", background: "var(--accent)", color: "#050505",
                borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800, textDecoration: "none",
              }}>
                Continuar checklist →
              </Link>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, color: "var(--t3)", lineHeight: 1.6, marginBottom: 24 }}>
                Laudo em andamento — ainda não foi concluído.
              </div>
              <Link href="/laudo/novo" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                height: 44, padding: "0 24px", background: "var(--accent)", color: "#050505",
                borderRadius: "var(--rs)", fontSize: 14, fontWeight: 700, textDecoration: "none",
              }}>
                Criar meu laudo →
              </Link>
            </>
          )}
        </div>
      </main>
    );
  }

  // ── Fetch items for completed laudo ───────────────────────────
  const { data: allItems } = await service
    .from("laudo_items")
    .select("*")
    .eq("laudo_id", id);

  const checklistItems = allItems?.filter((i) => i.category === "checklist") ?? [];
  const cautelarItems = allItems?.filter((i) => i.category === "cautelar") ?? [];

  const issueIds = checklistItems.map((i) => parseInt(i.item_key)).filter(Boolean);
  const { data: issues } = issueIds.length
    ? await service
        .from("car_issues")
        .select("id, title, description, if_bad, severity, category, repair_cost")
        .in("id", issueIds)
    : { data: [] };

  // ── Score & findings ──────────────────────────────────────────
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

  score = Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  if (isNaN(score)) score = 10;

  const v = verdict(score);
  const isVendedor = laudo.tipo === "vendedor";

  // Validity date for seller laudos (created_at + 30 days)
  const validUntil = new Date(laudo.created_at);
  validUntil.setDate(validUntil.getDate() + 30);
  const isExpired = new Date() > validUntil;

  // Fetch seller WhatsApp for seller laudos
  let sellerWhatsapp: string | null = null;
  if (isVendedor) {
    const { data: sellerData } = await service.auth.admin.getUserById(laudo.user_id);
    const meta = sellerData?.user?.user_metadata;
    if (meta?.whatsapp && typeof meta.whatsapp === "string" && meta.whatsapp.trim() !== "") {
      sellerWhatsapp = meta.whatsapp.replace(/\D/g, "");
    }
  }

  const positiveCriticals = (issues ?? []).filter((issue) => {
    const item = checklistItems.find((i) => i.item_key === String(issue.id));
    return item?.notes === "ok" && issue.severity === "critical";
  });

  const problemFindings = findings.filter((f) => f.severity !== "ok");
  const heroContext = buildHeroContext(isVendedor, problemFindings, cautelarAlerts, diffPct);
  const steps = buildSteps(isVendedor, cautelarAlerts, problemFindings, diffPct);

  const groups: Record<string, typeof findings> = {};
  for (const f of problemFindings) {
    if (!groups[f.category]) groups[f.category] = [];
    groups[f.category].push(f);
  }

  const totalChecked = checklistItems.length;
  const problemCount = problemFindings.filter((f) => f.category !== "Precificação").length;

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px 80px" }}>

      {/* Brand header */}
      <div style={{ paddingTop: 40, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 40 }} />
          <span style={{ fontSize: 11, color: "var(--t4)" }}>{fmtDate(laudo.created_at)}</span>
        </div>

        {/* Vehicle info */}
        <div style={{ fontSize: 11, color: "var(--t4)", letterSpacing: "0.3px" }}>
          {laudo.brand} {laudo.model} {laudo.year} · {laudo.km.toLocaleString("pt-BR")} km{laudo.state ? ` · ${laudo.state}` : ""}
        </div>
        {isVendedor && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)",
              borderRadius: 99, padding: "3px 10px",
              fontSize: 11, fontWeight: 700, color: "#A78BFA",
              alignSelf: "flex-start",
            }}>
              Declarado pelo vendedor
            </div>
            <div style={{
              fontSize: 11,
              color: isExpired ? "var(--danger)" : "var(--t3)",
              fontWeight: isExpired ? 700 : 400,
            }}>
              {isExpired
                ? "Laudo vencido \u2014 atualize para manter a credibilidade"
                : `V\u00e1lido at\u00e9 ${fmtDate(validUntil.toISOString())}`}
            </div>
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
          {isVendedor ? "Laudo de transparência" : "Avaliação Pablo"}
        </div>
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
                          {f.severity === "critical" ? "CRITICO" : f.severity === "warn" ? "ATENÇÃO" : "OK"}
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

      {/* No problems */}
      {Object.keys(groups).length === 0 && (
        <div style={{
          background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: "var(--rm)", padding: "14px 16px", marginBottom: 28,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ok)" }}>
            Nenhum problema identificado na inspeção.
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

      {/* 3-step recommendation */}
      <div style={{ marginBottom: 32 }}>
        <SectionDivider label={isVendedor ? "Recomendações" : "O que fazer agora"} />
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

      {/* WhatsApp do vendedor — seller laudo only */}
      {isVendedor && sellerWhatsapp && (
        <div style={{ marginBottom: 20 }}>
          <a
            href={`https://wa.me/55${sellerWhatsapp}?text=${encodeURIComponent(`Vi o laudo do seu ${laudo.brand} ${laudo.model} ${laudo.year} no Pablo`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", height: 52,
              background: "#25D366", color: "#fff", border: "none",
              borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800, textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 18 }}>{"\uD83D\uDCAC"}</span> Falar com o vendedor
          </a>
        </div>
      )}

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {isVendedor ? (
          <>
            <div style={{
              background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)",
              borderRadius: "var(--rm)", padding: "12px 14px", marginBottom: 2,
              fontSize: 12, color: "var(--t3)", lineHeight: 1.6,
            }}>
              Este laudo foi preenchido pelo próprio vendedor. Faça sua inspeção independente antes de fechar negócio.
            </div>
            <Link
              href="/laudo/novo"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "100%", height: 50, background: "var(--accent)", color: "#050505",
                borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800, textDecoration: "none",
              }}
            >
              Fazer minha própria inspeção →
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/laudo/novo"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "100%", height: 50, background: "var(--accent)", color: "#050505",
                borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800, textDecoration: "none",
              }}
            >
              Criar meu laudo grátis →
            </Link>
            <div style={{ fontSize: 11, color: "var(--t4)", textAlign: "center", marginTop: 2 }}>
              Avalie qualquer carro usado antes de comprar
            </div>
          </>
        )}
      </div>
    </main>
  );
}
