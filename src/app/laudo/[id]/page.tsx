import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const CAUTELAR_LABEL: Record<string, string> = {
  crlv: "CRLV vencido / irregular",
  multas: "Multas pendentes no veículo",
  sinistro: "Histórico de batida ou sinistro",
  gravame: "Financiamento / gravame ativo",
  recall: "Recall pendente não atendido",
  manutencoes: "Manutenções atrasadas ou sem comprovante",
};

const CAUTELAR_DETAIL: Record<string, string> = {
  crlv: "Veículo com documentação irregular pode ser apreendido. O comprador assume o risco.",
  multas: "Multas vinculadas ao veículo são transferidas automaticamente ao novo proprietário.",
  sinistro: "Histórico de batida pode indicar reparos ocultos que comprometem estrutura e segurança.",
  gravame: "Financiamento ativo — a venda sem quitação é ilegal e o carro pode ser retomado pelo banco.",
  recall: "Defeito reconhecido pelo fabricante ainda não corrigido.",
  manutencoes: "Sem comprovante de revisão não há como atestar o estado real de motor e câmbio.",
};

const SEV_COLOR: Record<string, string> = {
  critical: "var(--danger)",
  warn: "var(--warn)",
  ok: "var(--ok)",
};

function verdictColor(label: string) {
  if (label === "Boa Compra") return "var(--ok)";
  if (label === "Não Recomendado") return "var(--danger)";
  return "var(--warn)";
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default async function LaudoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Auth check (may be null for anonymous visitors)
  const userSupabase = await createClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  // Data fetch via service client (bypasses RLS for public access)
  const service = createServiceClient();

  const { data: laudo } = await service
    .from("laudos")
    .select("id, user_id, brand, model, year, km, score, verdict, asking_price, fipe_price, state, created_at")
    .eq("id", id)
    .single();

  if (!laudo) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ textAlign: "center" }}>
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
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 320 }}>
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

  // Fetch items for the completed laudo
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
        .select("id, title, description, severity, category, repair_cost")
        .in("id", issueIds)
    : { data: [] };

  // Reconstruct findings
  type Finding = {
    text: string;
    detail?: string;
    severity: "critical" | "warn" | "ok";
    category: string;
    repair_cost?: string | null;
  };
  const findings: Finding[] = [];

  for (const issue of issues ?? []) {
    const item = checklistItems.find((i) => i.item_key === String(issue.id));
    if (item?.notes === "problema") {
      findings.push({
        text: issue.title,
        detail: issue.description,
        severity: issue.severity === "critical" ? "critical" : "warn",
        category: issue.category ?? "Inspeção",
        repair_cost: issue.repair_cost,
      });
    }
  }

  if (laudo.fipe_price && laudo.asking_price) {
    const diffPct = ((laudo.asking_price - laudo.fipe_price) / laudo.fipe_price) * 100;
    if (diffPct > 5) {
      findings.push({
        text: `Preço ${diffPct.toFixed(1)}% acima da FIPE`,
        detail: `Pedindo ${fmt(laudo.asking_price)} · FIPE ${fmt(laudo.fipe_price)}`,
        severity: diffPct > 20 ? "critical" : "warn",
        category: "Precificação",
      });
    }
  }

  type CautelarAlert = { key: string; label: string; detail: string };
  const cautelarAlerts: CautelarAlert[] = cautelarItems
    .filter((c) => c.notes === "atencao")
    .map((c) => ({
      key: c.item_key,
      label: CAUTELAR_LABEL[c.item_key] ?? c.item_key,
      detail: CAUTELAR_DETAIL[c.item_key] ?? "",
    }));

  const vc = verdictColor(laudo.verdict ?? "");
  const date = new Date(laudo.created_at).toLocaleDateString("pt-BR");

  const groups: Record<string, typeof findings> = {};
  for (const f of findings) {
    if (!groups[f.category]) groups[f.category] = [];
    groups[f.category].push(f);
  }

  return (
    <main style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px 80px" }}>
      {/* Brand header */}
      <div style={{ paddingTop: 40, paddingBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px" }}>
          pa<span style={{ color: "var(--accent)" }}>b</span>lo
        </span>
        <span style={{ fontSize: 12, color: "var(--t4)" }}>{date}</span>
      </div>

      {/* Vehicle */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 4 }}>
          {laudo.brand} {laudo.model} {laudo.year}
        </h1>
        <div style={{ fontSize: 13, color: "var(--t3)" }}>
          {laudo.km.toLocaleString("pt-BR")} km{laudo.state ? ` · ${laudo.state}` : ""}
        </div>
      </div>

      {/* Score */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "var(--bg2)", border: "1px solid var(--bd)",
        borderRadius: "var(--rm)", padding: "16px 20px", margin: "20px 0",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: vc, letterSpacing: "-2px", lineHeight: 1 }}>
            {laudo.score?.toFixed(1)}
          </span>
          <span style={{ fontSize: 16, color: "var(--t3)" }}>/10</span>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: vc }}>{laudo.verdict}</div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>Laudo Pablo</div>
        </div>
      </div>

      {/* Cautelar alerts */}
      {cautelarAlerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
            Alertas documentais
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cautelarAlerts.map((alert) => (
              <div key={alert.key} style={{
                background: "var(--dg)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "var(--rm)", padding: "12px 14px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>
                  {alert.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{alert.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Findings */}
      {Object.keys(groups).length > 0 ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
            Problemas identificados
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {Object.entries(groups).map(([category, items]) => (
              <div key={category}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
                  {category}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map((f, i) => (
                    <div key={i} style={{
                      background: "var(--bg2)",
                      border: `1px solid ${f.severity === "critical" ? "rgba(239,68,68,0.2)" : f.severity === "warn" ? "rgba(234,179,8,0.2)" : "rgba(34,197,94,0.2)"}`,
                      borderRadius: "var(--rm)", padding: "12px 14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", lineHeight: 1.4, flex: 1 }}>
                          {f.text}
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, flexShrink: 0,
                          background: f.severity === "critical" ? "var(--dg)" : f.severity === "warn" ? "var(--wg)" : "var(--og)",
                          color: SEV_COLOR[f.severity],
                        }}>
                          {f.severity === "critical" ? "Crítico" : f.severity === "warn" ? "Atenção" : "OK"}
                        </span>
                      </div>
                      {f.detail && (
                        <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 6, lineHeight: 1.5 }}>{f.detail}</div>
                      )}
                      {f.repair_cost && (
                        <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 5 }}>
                          Reparo estimado: <strong style={{ color: "var(--t3)" }}>{f.repair_cost}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: "var(--og)", border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: "var(--rm)", padding: "14px 16px", marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ok)" }}>
            Nenhum problema identificado na inspeção.
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 16 }}>
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
        <div style={{ fontSize: 11, color: "var(--t4)", textAlign: "center", marginTop: 10 }}>
          Avalie qualquer carro usado antes de comprar
        </div>
      </div>
    </main>
  );
}
