import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function LP() {
  let laudoCount = 0;
  try {
    const service = createServiceClient();
    const { count } = await service
      .from("laudos")
      .select("id", { count: "exact", head: true });
    laudoCount = count ?? 0;
  } catch {}


  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div style={{ paddingTop: 48 }}>
        <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.8px" }}>
          pa<span style={{ color: "var(--accent)" }}>b</span>lo
        </span>
      </div>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ paddingTop: 40 }}>
        <h1 style={{
          fontSize: 34, fontWeight: 900,
          letterSpacing: "-1px", lineHeight: 1.1,
          marginBottom: 14,
        }}>
          Descubra os problemas{" "}
          <span style={{ color: "var(--accent)" }}>antes</span>
          <br />de pagar.
        </h1>

        <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.65, marginBottom: 8 }}>
          Responda o checklist, a IA analisa e gera um laudo com nota,
          problemas encontrados e quanto pedir de desconto.
        </p>

        {laudoCount > 10 && (
          <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 0 }}>
            {laudoCount.toLocaleString("pt-BR")} laudos gerados
          </p>
        )}
      </div>

      {/* ── Primary CTA ──────────────────────────────────── */}
      <div style={{ paddingTop: 24, paddingBottom: 40 }}>
        <Link
          href="/cadastro"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54,
            background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
            textDecoration: "none", letterSpacing: "-0.2px",
            boxShadow: "0 0 32px rgba(0,212,170,0.2)",
          }}
        >
          Avaliar um carro gratis →
        </Link>
        <div style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", marginTop: 10 }}>
          Primeiro laudo gratuito · 8 minutos
        </div>
      </div>

      {/* ── Como funciona ────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1px",
          marginBottom: 14,
        }}>
          Como funciona
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { n: "1", title: "Dados do carro", desc: "Marca, modelo, ano, km e preço pedido" },
            { n: "2", title: "Checklist guiado", desc: "A IA monta os pontos certos pro modelo — você marca OK ou Problema" },
            { n: "3", title: "Laudo completo", desc: "Nota, problemas, custos de reparo e quanto pedir de desconto" },
          ].map((step) => (
            <div key={step.n} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              background: "var(--bg2)", border: "1px solid var(--bd)",
              borderRadius: "var(--rm)", padding: "14px 16px",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--ag)", color: "var(--accent)",
                fontSize: 12, fontWeight: 900, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{step.n}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 2 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Chat showcase ─────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 14,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "var(--ag)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900, flexShrink: 0,
          }}>AI</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--t1)" }}>
              Na visita ao carro, o Pablo te acompanha
            </div>
          </div>
        </div>

        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden",
          padding: "14px",
        }}>
          {/* Exchange 1: Photo */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <div style={{
              background: "var(--accent)", color: "#050505",
              borderRadius: "14px 14px 4px 14px", padding: "10px 14px",
              maxWidth: "78%",
            }}>
              <div style={{
                width: "100%", height: 72, borderRadius: 8,
                background: "rgba(0,0,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 6, fontSize: 12, color: "rgba(0,0,0,0.4)", fontWeight: 600,
              }}>foto do pneu</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Esse desgaste e grave?</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{
              background: "var(--bg3)", color: "var(--t1)",
              borderRadius: "14px 14px 14px 4px", padding: "10px 14px",
              maxWidth: "85%",
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Desgaste na borda interna — sinal de <strong style={{ color: "var(--warn)" }}>desalinhamento</strong>. No Onix 2017 com 45k km, recomendo trocar os 2 dianteiros. <strong style={{ color: "var(--t2)" }}>Custo: R$ 400–600.</strong>
              </div>
            </div>
          </div>

          {/* Exchange 2: Follow-up */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <div style={{
              background: "var(--accent)", color: "#050505",
              borderRadius: "14px 14px 4px 14px", padding: "10px 14px",
              maxWidth: "78%",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Dá pra usar até o fim do ano?</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              background: "var(--bg3)", color: "var(--t1)",
              borderRadius: "14px 14px 14px 4px", padding: "10px 14px",
              maxWidth: "85%",
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Com esse nível de desgaste, os dianteiros duram mais 3–4 meses. Peça <strong style={{ color: "var(--accent)" }}>R$ 500 de desconto</strong> na negociação pra cobrir a troca.
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 10, lineHeight: 1.5 }}>
          Câmera, galeria ou texto. A IA analisa qualquer parte do carro em segundos.
        </div>
      </div>

      {/* ── Result preview ───────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1px",
          marginBottom: 14,
        }}>
          O que você recebe
        </div>

        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden",
        }}>
          {/* Preview header */}
          <div style={{
            padding: "14px 16px 0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, color: "var(--t3)" }}>
              Chevrolet Onix 2017 · 45.000 km
            </span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
              background: "var(--ag)", color: "var(--accent)",
              letterSpacing: "0.5px", textTransform: "uppercase",
            }}>Exemplo</span>
          </div>

          {/* Verdict */}
          <div style={{
            background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "var(--rm)", margin: 12, padding: "16px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
              Avaliacao Pablo
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--ok)", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 6 }}>
              Boa Compra
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3, marginBottom: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "var(--ok)", letterSpacing: "-1px", lineHeight: 1 }}>8.8</span>
              <span style={{ fontSize: 14, color: "var(--t3)" }}>/10</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)" }}>1 atencao · preco alinhado com FIPE</div>
          </div>

          {/* Finding */}
          <div style={{ padding: "0 12px" }}>
            <div style={{
              background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.2)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Pneus com desgaste irregular</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 99, background: "rgba(234,179,8,0.15)", color: "var(--warn)", letterSpacing: "0.3px" }}>ATENCAO</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>
                Reparo estimado: <strong style={{ color: "var(--t2)" }}>R$ 400–800</strong>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div style={{ padding: "0 12px 12px" }}>
            <div style={{
              display: "flex", gap: 10,
              background: "var(--bg3)", borderRadius: 12, padding: "10px 12px",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "var(--bg4)", color: "var(--accent)",
                fontSize: 11, fontWeight: 900, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>1</div>
              <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>
                Na negociacao: peca desconto de R$ 400–800 pra cobrir troca dos pneus.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Real report link ─────────────────────────────── */}
      <Link
        href="/laudo/52ce00a0-c142-4739-9141-f273718db41f"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", textDecoration: "none",
          marginBottom: 40,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>
            Ver um laudo real completo
          </div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>
            Onix 2017 · Score, problemas e recomendacoes
          </div>
        </div>
        <span style={{ fontSize: 14, color: "var(--t3)", flexShrink: 0 }}>→</span>
      </Link>

      {/* ── Stats + price anchoring ──────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
        }}>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: 14, padding: "16px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.5px" }}>
              Gratis
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)", fontWeight: 600, marginTop: 6 }}>
              Primeiro laudo
            </div>
          </div>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: 14, padding: "16px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.5px" }}>
              8 min
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)", fontWeight: 600, marginTop: 6 }}>
              Tempo do laudo
            </div>
          </div>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: 14, padding: "16px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--accent)", letterSpacing: "-0.5px" }}>
              R$ 100
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)", fontWeight: 600, marginTop: 6 }}>
              Laudos extras
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--t4)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
          Uma vistoria profissional custa R$ 250+ e leva 3 dias
        </div>
      </div>

      {/* ── Buyer / Seller split ─────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        marginBottom: 32,
      }}>
        <Link href="/cadastro" style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", padding: "16px 14px",
          textDecoration: "none",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)", marginBottom: 4 }}>
            Comprando
          </div>
          <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5, marginBottom: 12 }}>
            Descubra problemas antes de fechar
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)" }}>Comecar →</span>
        </Link>
        <Link href="/cadastro" style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", padding: "16px 14px",
          textDecoration: "none",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#A78BFA", marginBottom: 4 }}>
            Vendendo
          </div>
          <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5, marginBottom: 12 }}>
            Mostre transparencia e venda mais rapido
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)" }}>Comecar →</span>
        </Link>
      </div>

      {/* ── Bottom CTA ───────────────────────────────────── */}
      <div style={{ paddingBottom: "max(48px, calc(24px + env(safe-area-inset-bottom)))" }}>
        <Link
          href="/cadastro"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54,
            background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
            textDecoration: "none", letterSpacing: "-0.2px",
          }}
        >
          Gerar laudo gratis →
        </Link>
      </div>
    </main>
  );
}
