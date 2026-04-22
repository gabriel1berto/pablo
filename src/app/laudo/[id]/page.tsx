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
    openGraph: { title, description, type: "website" },
  };
}

import { SellerReportLoader } from "./seller-report-loader";

import {
  CAUTELAR_LABEL, CAUTELAR_DETAIL, CAT_LABEL,
  verdict, fmt, fmtDate, buildHeroContext, buildSteps,
  type Finding, type CautelarAlert,
} from "@/lib/laudo-score";

// ── Tell-tale icon helper ────────────────────────────────
function TellTale({ ok, label }: { ok: boolean | null; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        background: ok === null ? "var(--bg4)" : ok ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
        color: ok === null ? "var(--t4)" : ok ? "var(--ok)" : "var(--danger)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 900,
      }}>
        {ok === null ? "?" : ok ? "\u2713" : "!"}
      </div>
      <span style={{ fontSize: 11, color: ok === false ? "var(--danger)" : "var(--t3)", fontWeight: ok === false ? 700 : 400 }}>
        {label}
      </span>
    </div>
  );
}

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
    .select("id, user_id, brand, model, year, km, score, verdict, asking_price, fipe_price, state, created_at, tipo, score_version, tab_scores, transparency_pct")
    .eq("id", id)
    .single();

  if (!laudo) {
    return (
      <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ paddingTop: 52, paddingBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}><img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 40 }} /></Link>
        </div>
        <div style={{ textAlign: "center", paddingTop: 48 }}>
          <div style={{ fontSize: 14, color: "var(--t3)", marginBottom: 16 }}>Laudo n\u00e3o encontrado.</div>
          <Link href="/laudo/novo" style={{ fontSize: 14, color: "var(--accent)", textDecoration: "none" }}>Criar um laudo \u2192</Link>
        </div>
      </main>
    );
  }

  const isOwner = user?.id === laudo.user_id;

  // ── Branch: Relatório Vendedor v2 ──────────────────────
  if (laudo.score_version === "v2") {
    return (
      <main style={{ minHeight: "100vh", background: "#F5F4F0", padding: "16px 0" }}>
        <SellerReportLoader id={id} laudo={laudo} />
      </main>
    );
  }

  if (!laudo.score) {
    return (
      <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ paddingTop: 52, paddingBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}><img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 40 }} /></Link>
        </div>
        <div style={{ textAlign: "center", maxWidth: 320, margin: "0 auto", paddingTop: 48 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{laudo.brand} {laudo.model} {laudo.year}</div>
          <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 24 }}>{laudo.km.toLocaleString("pt-BR")} km</div>
          {isOwner ? (
            <>
              <div style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 20 }}>Sua inspe\u00e7\u00e3o ainda est\u00e1 em andamento.</div>
              <Link href={`/laudo/${id}/checklist`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 46, padding: "0 28px", background: "var(--accent)", color: "#050505", borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>Continuar checklist \u2192</Link>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, color: "var(--t3)", lineHeight: 1.6, marginBottom: 24 }}>Laudo em andamento \u2014 ainda n\u00e3o foi conclu\u00eddo.</div>
              <Link href="/laudo/novo" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 44, padding: "0 24px", background: "var(--accent)", color: "#050505", borderRadius: "var(--rs)", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Criar meu laudo \u2192</Link>
            </>
          )}
        </div>
      </main>
    );
  }

  // ── Data processing ─────────────────────────────────────────
  const { data: allItems } = await service.from("laudo_items").select("*").eq("laudo_id", id);
  const checklistItems = allItems?.filter((i) => i.category === "checklist") ?? [];
  const cautelarItems = allItems?.filter((i) => i.category === "cautelar") ?? [];

  const issueIds = checklistItems.map((i) => parseInt(i.item_key)).filter(Boolean);
  const { data: issues } = issueIds.length
    ? await service.from("car_issues").select("id, title, description, if_bad, severity, category, repair_cost").in("id", issueIds)
    : { data: [] };

  // Score
  let score = 10;
  const findings: Finding[] = [];

  for (const issue of issues ?? []) {
    const item = checklistItems.find((i) => i.item_key === String(issue.id));
    const state = item?.notes ?? "nd";
    if (state === "problema") {
      const isCrit = issue.severity === "critical";
      score -= isCrit ? 2.5 : 1.2;
      findings.push({
        text: issue.title, detail: issue.description, if_bad: issue.if_bad,
        severity: isCrit ? "critical" : "warn",
        category: issue.category ?? "Inspe\u00e7\u00e3o", repair_cost: issue.repair_cost,
      });
    }
  }

  const cautelarAlerts: CautelarAlert[] = cautelarItems
    .filter((c) => c.notes === "atencao")
    .map((c) => ({ key: c.item_key, label: CAUTELAR_LABEL[c.item_key] ?? c.item_key, detail: CAUTELAR_DETAIL[c.item_key] ?? "" }));

  let diffPct = 0;
  if (laudo.fipe_price && laudo.asking_price) {
    diffPct = ((laudo.asking_price - laudo.fipe_price) / laudo.fipe_price) * 100;
    if (diffPct > 20) { score -= 2.0; findings.push({ text: `Pre\u00e7o ${diffPct.toFixed(1)}% acima da FIPE`, detail: `Pedindo ${fmt(laudo.asking_price)} \u00b7 FIPE ${fmt(laudo.fipe_price)}`, severity: "critical", category: "Precifica\u00e7\u00e3o" }); }
    else if (diffPct > 10) { score -= 1.0; findings.push({ text: `Pre\u00e7o ${diffPct.toFixed(1)}% acima da FIPE`, detail: `Pedindo ${fmt(laudo.asking_price)} \u00b7 FIPE ${fmt(laudo.fipe_price)}`, severity: "warn", category: "Precifica\u00e7\u00e3o" }); }
    else if (diffPct > 5) { score -= 0.5; findings.push({ text: `Pre\u00e7o ${diffPct.toFixed(1)}% acima da FIPE`, detail: `Pedindo ${fmt(laudo.asking_price)} \u00b7 FIPE ${fmt(laudo.fipe_price)}`, severity: "warn", category: "Precifica\u00e7\u00e3o" }); }
    else if (diffPct < 0) { findings.push({ text: `Pre\u00e7o ${Math.abs(diffPct).toFixed(1)}% abaixo da FIPE`, detail: `Pedindo ${fmt(laudo.asking_price)} \u00b7 FIPE ${fmt(laudo.fipe_price)}`, severity: "ok", category: "Precifica\u00e7\u00e3o" }); }
  }

  const totalItems = (issues ?? []).length;
  const answeredItems = checklistItems.filter((i) => i.notes === "ok" || i.notes === "problema").length;
  if (totalItems > 0 && answeredItems > 0) {
    const coverage = answeredItems / totalItems;
    if (coverage < 0.5) score -= 1.5;
    else if (coverage < 0.75) score -= 0.5;
  }

  score = Math.round(Math.max(0, Math.min(10, score)) * 10) / 10;
  if (isNaN(score)) score = 10;

  const v = verdict(score);
  const isVendedor = laudo.tipo === "vendedor";
  const validUntil = new Date(laudo.created_at);
  validUntil.setDate(validUntil.getDate() + 30);
  const isExpired = new Date() > validUntil;

  let sellerWhatsapp: string | null = null;
  if (isVendedor) {
    const { data: sellerData } = await service.auth.admin.getUserById(laudo.user_id);
    const meta = sellerData?.user?.user_metadata;
    if (meta?.whatsapp && typeof meta.whatsapp === "string" && meta.whatsapp.trim() !== "") {
      sellerWhatsapp = meta.whatsapp.replace(/\D/g, "");
    }
  }

  const problemFindings = findings.filter((f) => f.severity !== "ok");
  const okFindings = findings.filter((f) => f.severity === "ok");
  const steps = buildSteps(isVendedor, cautelarAlerts, problemFindings, diffPct);

  // Items com foto
  const photosItems = checklistItems.filter((i) => i.photo_url);

  // Parse custos de reparo pra somar total
  let totalRepairMin = 0;
  let totalRepairMax = 0;
  for (const f of problemFindings) {
    if (f.repair_cost) {
      const nums = f.repair_cost.match(/[\d.]+/g)?.map(Number) ?? [];
      if (nums.length >= 2) { totalRepairMin += nums[0]; totalRepairMax += nums[1]; }
      else if (nums.length === 1) { totalRepairMin += nums[0]; totalRepairMax += nums[0]; }
    }
  }

  // Tell-tale data
  const hasMotorProblem = problemFindings.some((f) => f.category === "motor");
  const hasFreiosProblem = problemFindings.some((f) => f.category === "freios");
  const hasPneusProblem = problemFindings.some((f) => f.category === "pneus");
  const hasCarroceriaProblem = problemFindings.some((f) => f.category === "carroceria");
  const hasDocsProblem = cautelarAlerts.length > 0;
  const hasPriceProblem = diffPct > 10;

  const positiveCriticals = (issues ?? []).filter((issue) => {
    const item = checklistItems.find((i) => i.item_key === String(issue.id));
    return item?.notes === "ok" && issue.severity === "critical";
  });

  // Group findings by category
  const groups: Record<string, typeof findings> = {};
  for (const f of problemFindings) {
    if (!groups[f.category]) groups[f.category] = [];
    groups[f.category].push(f);
  }

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px 80px" }}>

      {/* ── Header ────────────────────────────────────── */}
      <div style={{ paddingTop: 40, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 36 }} />
          <span style={{ fontSize: 10, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Condition Report</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t1)", marginBottom: 4 }}>
          {laudo.brand} {laudo.model} {laudo.year}
        </div>
        <div style={{ fontSize: 12, color: "var(--t3)" }}>
          {laudo.km.toLocaleString("pt-BR")} km{laudo.state ? ` \u00b7 ${laudo.state}` : ""} \u00b7 {fmtDate(laudo.created_at)}
        </div>
        {isVendedor && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#A78BFA" }}>
              Declarado pelo vendedor
            </span>
            <span style={{ fontSize: 10, color: isExpired ? "var(--danger)" : "var(--t4)", fontWeight: isExpired ? 700 : 400 }}>
              {isExpired ? "Vencido" : `V\u00e1lido at\u00e9 ${fmtDate(validUntil.toISOString())}`}
            </span>
          </div>
        )}
      </div>

      {/* ── Score + Tell-tale icons ────────────────────── */}
      <div style={{
        background: v.bg, border: `1px solid ${v.border}`,
        borderRadius: "var(--rm)", padding: "20px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {/* Score circle */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              border: `3px solid ${v.color}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: v.color, lineHeight: 1, letterSpacing: "-1px" }}>
                {score.toFixed(1)}
              </span>
              <span style={{ fontSize: 9, color: "var(--t3)" }}>/10</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: v.color, marginTop: 6, textTransform: "uppercase" }}>
              {v.label}
            </div>
          </div>

          {/* Tell-tale icons grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
            <TellTale ok={!hasMotorProblem} label="Motor" />
            <TellTale ok={!hasFreiosProblem} label="Freios" />
            <TellTale ok={!hasPneusProblem} label="Pneus" />
            <TellTale ok={!hasCarroceriaProblem} label="Carroceria" />
            <TellTale ok={!hasDocsProblem} label="Documenta\u00e7\u00e3o" />
            <TellTale ok={!hasPriceProblem} label="Pre\u00e7o" />
          </div>
        </div>
      </div>

      {/* ── Resumo financeiro ─────────────────────────── */}
      {(laudo.fipe_price || totalRepairMax > 0) && (
        <div style={{
          display: "grid", gridTemplateColumns: totalRepairMax > 0 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 1,
          background: "var(--bd)", borderRadius: "var(--rm)", overflow: "hidden", marginBottom: 20,
        }}>
          {laudo.fipe_price && (
            <div style={{ background: "var(--bg2)", padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "var(--t1)" }}>{fmt(laudo.fipe_price)}</div>
              <div style={{ fontSize: 9, color: "var(--t4)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>FIPE</div>
            </div>
          )}
          {laudo.asking_price && (
            <div style={{ background: "var(--bg2)", padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: diffPct > 10 ? "var(--warn)" : "var(--t1)" }}>{fmt(laudo.asking_price)}</div>
              <div style={{ fontSize: 9, color: "var(--t4)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pedido</div>
            </div>
          )}
          {totalRepairMax > 0 && (
            <div style={{ background: "var(--bg2)", padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "var(--danger)" }}>
                {fmt(totalRepairMin)}{totalRepairMax !== totalRepairMin ? `\u2013${fmt(totalRepairMax).replace("R$\u00a0", "")}` : ""}
              </div>
              <div style={{ fontSize: 9, color: "var(--t4)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Reparos</div>
            </div>
          )}
        </div>
      )}

      {/* ── Alertas documentais ────────────────────────── */}
      {cautelarAlerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Alertas documentais</div>
          {cautelarAlerts.map((alert) => (
            <div key={alert.key} style={{
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--rm)", padding: "12px 14px", marginBottom: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>{alert.label}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.5 }}>{alert.detail}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Problemas identificados (com fotos) ────────── */}
      {Object.keys(groups).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Problemas identificados
          </div>
          {Object.entries(groups).map(([category, items]) => (
            <div key={category}>
              {items.map((f, i) => {
                // Buscar foto e análise do item
                const matchItem = checklistItems.find((ci) => {
                  const issue = (issues ?? []).find((iss) => iss.title === f.text);
                  return issue && ci.item_key === String(issue.id);
                });
                const photoUrl = matchItem?.photo_url;
                let aiParsed: { diagnosis?: string } | null = null;
                if (matchItem?.ai_analysis) {
                  try { aiParsed = JSON.parse(matchItem.ai_analysis); } catch {}
                }

                return (
                  <div key={i} style={{
                    background: f.severity === "critical" ? "rgba(239,68,68,0.05)" : "rgba(234,179,8,0.05)",
                    border: `1px solid ${f.severity === "critical" ? "rgba(239,68,68,0.2)" : "rgba(234,179,8,0.2)"}`,
                    borderRadius: "var(--rm)", marginBottom: 8, overflow: "hidden",
                  }}>
                    {/* Foto do item (se existir) */}
                    {photoUrl && (
                      <img src={photoUrl} alt={f.text} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                    )}
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", lineHeight: 1.3, flex: 1 }}>{f.text}</div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99,
                            background: f.severity === "critical" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)",
                            color: f.severity === "critical" ? "var(--danger)" : "var(--warn)",
                          }}>
                            {f.severity === "critical" ? "CR\u00cdTICO" : "ATEN\u00c7\u00c3O"}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--t4)" }}>{CAT_LABEL[category] ?? category}</span>
                        </div>
                      </div>
                      {aiParsed?.diagnosis && (
                        <div style={{ fontSize: 12, color: "var(--accent)", lineHeight: 1.5, marginBottom: 4 }}>
                          IA: {aiParsed.diagnosis}
                        </div>
                      )}
                      {f.if_bad && <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5, marginBottom: 4 }}>{f.if_bad}</div>}
                      {!f.if_bad && f.detail && <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5, marginBottom: 4 }}>{f.detail}</div>}
                      {f.repair_cost && (
                        <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 2 }}>
                          Reparo estimado: <strong style={{ color: "var(--t2)" }}>{f.repair_cost}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Sem problemas ─────────────────────────────── */}
      {Object.keys(groups).length === 0 && (
        <div style={{
          background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: "var(--rm)", padding: "14px 16px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ok)" }}>Nenhum problema identificado na inspe\u00e7\u00e3o.</div>
        </div>
      )}

      {/* ── Pontos positivos ──────────────────────────── */}
      {positiveCriticals.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Pontos cr\u00edticos verificados e OK
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {positiveCriticals.map((issue) => (
              <div key={issue.id} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: 99, padding: "6px 12px",
              }}>
                <span style={{ fontSize: 11, color: "var(--ok)", fontWeight: 700 }}>{"\u2713"}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--t2)" }}>{issue.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Galeria de fotos ──────────────────────────── */}
      {photosItems.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
            Fotos da inspe\u00e7\u00e3o ({photosItems.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, borderRadius: "var(--rm)", overflow: "hidden" }}>
            {photosItems.map((item) => (
              <img key={item.id} src={item.photo_url!} alt={item.item_key} style={{ width: "100%", height: 100, objectFit: "cover" }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recomenda\u00e7\u00f5es ─────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
          {isVendedor ? "Recomenda\u00e7\u00f5es" : "O que fazer agora"}
        </div>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: "var(--rm)", padding: "14px 16px", marginBottom: 8,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", background: "var(--ag)", color: "var(--accent)",
              fontSize: 11, fontWeight: 900, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.6, flex: 1 }}>{step}</div>
          </div>
        ))}

        {/* Resumo financeiro inline se há reparos + FIPE */}
        {totalRepairMax > 0 && laudo.asking_price && laudo.fipe_price && (
          <div style={{
            display: "flex", gap: 10, background: "var(--bg3)",
            borderRadius: "var(--rm)", padding: "14px 16px", marginTop: 4,
          }}>
            <div style={{ fontSize: 16, flexShrink: 0 }}>{"\uD83D\uDCA1"}</div>
            <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--t1)" }}>Valor justo sugerido: {fmt(Math.round(laudo.fipe_price - totalRepairMin))}</strong>
              <br />FIPE {fmt(laudo.fipe_price)} menos {fmt(totalRepairMin)} em reparos m\u00ednimos.
            </div>
          </div>
        )}
      </div>

      {/* ── WhatsApp vendedor ─────────────────────────── */}
      {isVendedor && sellerWhatsapp && (
        <div style={{ marginBottom: 16 }}>
          <a href={`https://wa.me/55${sellerWhatsapp}?text=${encodeURIComponent(`Vi o laudo do seu ${laudo.brand} ${laudo.model} ${laudo.year} no Pablo`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", height: 52, background: "#25D366", color: "#fff", border: "none",
              borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800, textDecoration: "none",
            }}>
            {"\uD83D\uDCAC"} Falar com o vendedor
          </a>
        </div>
      )}

      {/* ── CTA ───────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {isVendedor && (
          <div style={{
            background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)",
            borderRadius: "var(--rm)", padding: "12px 14px", marginBottom: 2,
            fontSize: 12, color: "var(--t3)", lineHeight: 1.6,
          }}>
            Este laudo foi preenchido pelo pr\u00f3prio vendedor. Fa\u00e7a sua inspe\u00e7\u00e3o independente antes de fechar neg\u00f3cio.
          </div>
        )}
        <Link href="/laudo/novo" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 50, background: "var(--accent)", color: "#050505",
          borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800, textDecoration: "none",
        }}>
          {isVendedor ? "Fazer minha pr\u00f3pria inspe\u00e7\u00e3o \u2192" : "Criar meu laudo gr\u00e1tis \u2192"}
        </Link>
      </div>

      {/* ── Footer disclaimer ─────────────────────────── */}
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--bd)", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: "var(--t4)", lineHeight: 1.6 }}>
          Gerado por Pablo \u00b7 pabloapps.net
          <br />Este laudo foi gerado com IA + checklist guiado.
          <br />N\u00e3o substitui vistoria mec\u00e2nica presencial.
        </div>
      </div>
    </main>
  );
}
