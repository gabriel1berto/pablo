"use client";

import Link from "next/link";
import TrialChat from "./components/trial-chat";
import Footer from "./components/footer";

export default function LP() {
  return (
    <main className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Logo + Login ──────────────────────────────── */}
      <div style={{ paddingTop: 48, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
        <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 48, display: "block" }} />
        <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: "var(--t3)", textDecoration: "none" }}>
          Entrar
        </Link>
      </div>

      {/* ── Hero ──────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: "min(32px, 8.5vw)", fontWeight: 900, letterSpacing: "-1px",
          lineHeight: 1.12, margin: 0, color: "var(--t1)",
        }}>
          Laudo digital de carro{" "}
          <span style={{ color: "var(--accent)" }}>usado</span>{" "}
          em 8 minutos.
        </h1>
        <p style={{
          fontSize: 15, lineHeight: 1.6, marginTop: 14, marginBottom: 0,
          color: "var(--t3)", fontWeight: 400, maxWidth: 380,
        }}>
          O Pablo analisa seu carro com IA e gera um laudo completo direto do celular.
        </p>
      </div>

      {/* ── Split: Comprar / Vender ───────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        marginBottom: 12,
      }}>
        <Link href="/cadastro?tipo=comprador" style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", padding: "20px 16px", textDecoration: "none",
          transition: "border-color 0.2s",
        }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>{"🔍"}</div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)", margin: 0, marginBottom: 8 }}>
            Vou comprar
          </h2>
          <p style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5, margin: 0 }}>
            Descubra o que tem de errado antes de pagar
          </p>
        </Link>
        <Link href="/cadastro?tipo=vendedor" style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", padding: "20px 16px", textDecoration: "none",
          transition: "border-color 0.2s",
        }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>{"🏷️"}</div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#A78BFA", margin: 0, marginBottom: 8 }}>
            Vou vender
          </h2>
          <p style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5, margin: 0 }}>
            Gere um selo de confiança pro seu anúncio
          </p>
        </Link>
      </div>

      <p style={{
        fontSize: 12, color: "var(--t4)", textAlign: "center",
        margin: 0, marginBottom: 48,
      }}>
        Primeiro laudo grátis · R$20 a partir do segundo
      </p>

      {/* ── Como funciona ─────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 20,
        }}>
          Como funciona
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { n: "1", title: "Marca, modelo, km e ano", desc: "Preenche os dados básicos do carro." },
            { n: "2", title: "Checklist guiado por modelo", desc: "O Pablo indica o que olhar no SEU modelo com a quilometragem exata." },
            { n: "3", title: "Score + problemas + preço justo", desc: "Recebe o laudo com nota, custo de cada reparo e valor pra negociar." },
          ].map((step) => (
            <div key={step.n} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              background: "var(--bg2)", border: "1px solid var(--bd)",
              borderRadius: "var(--rm)", padding: "16px",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--ag)", color: "var(--accent)",
                fontSize: 13, fontWeight: 900, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {step.n}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 3 }}>
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

      {/* ── Exemplo de laudo real ──────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 14,
        }}>
          Exemplo de resultado
        </h2>

        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>
              Onix LT 2017 · 45.000 km
            </div>
          </div>

          {/* Score */}
          <div style={{
            background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)",
            borderRadius: "var(--rm)", margin: "12px 12px 0", padding: "16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
              Resultado Pablo
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "var(--warn)", letterSpacing: "-1px", lineHeight: 1 }}>6.3</span>
              <span style={{ fontSize: 14, color: "var(--t3)" }}>/10</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn)" }}>Compra com cautela</div>
          </div>

          {/* Findings */}
          <div style={{ padding: "12px" }}>
            <div style={{
              background: "rgba(255,68,68,0.04)", border: "1px solid rgba(255,68,68,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Junta tampa de válvulas</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)" }}>R$ 150–250</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>Vazamento de óleo visível. Comum nessa km.</div>
            </div>

            <div style={{
              background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Pneus gastos na borda</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)" }}>R$ 500–800</span>
              </div>
            </div>

            <div style={{
              background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--ok)", fontWeight: 700 }}>{"✓"}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>Motor, câmbio e documentação OK</span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div style={{ padding: "0 12px 14px" }}>
            <div style={{
              display: "flex", gap: 10, background: "var(--bg3)",
              borderRadius: 12, padding: "12px",
            }}>
              <div style={{ fontSize: 14, flexShrink: 0 }}>{"💡"}</div>
              <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--t1)" }}>Negocie R$ 40.500</strong> em vez de R$ 42.000. O desconto cobre os dois reparos e você ainda sai no lucro.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trial chat ────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 6,
        }}>
          Tem uma dúvida sobre um carro?
        </h2>
        <p style={{ fontSize: 13, color: "var(--t3)", margin: 0, marginBottom: 14 }}>
          Pergunta pro Pablo. É grátis.
        </p>
        <TrialChat />
      </div>

      {/* ── Números ───────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1,
        background: "var(--bd)", borderRadius: "var(--rm)",
        overflow: "hidden", marginBottom: 48,
      }}>
        <div style={{ background: "var(--bg2)", padding: "18px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--accent)", lineHeight: 1 }}>191</div>
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 6, lineHeight: 1.3 }}>pontos de falha catalogados</div>
        </div>
        <div style={{ background: "var(--bg2)", padding: "18px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--t1)", lineHeight: 1 }}>5.958</div>
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 6, lineHeight: 1.3 }}>modelos na base FIPE</div>
        </div>
        <div style={{ background: "var(--bg2)", padding: "18px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--t1)", lineHeight: 1 }}>8 min</div>
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 6, lineHeight: 1.3 }}>pra completar o laudo</div>
        </div>
      </div>

      {/* ── Comparação ────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 14,
        }}>
          Pablo vs vistoria tradicional
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: "var(--rm)", padding: "16px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--t4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Vistoria presencial
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>R$ 150–300</div>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>Agendar + ir até lá</div>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>2–3 dias úteis</div>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>Resultado em papel</div>
            </div>
          </div>
          <div style={{
            background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)",
            borderRadius: "var(--rm)", padding: "16px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Pablo
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600 }}>R$ 20 <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 400 }}>(1o grátis)</span></div>
              <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600 }}>Do celular, agora</div>
              <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600 }}>8 minutos</div>
              <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600 }}>Link compartilhável</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Garantia ──────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.12)",
        borderRadius: "var(--rm)", padding: "14px 16px",
        marginBottom: 48,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--ag)", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "var(--accent)", fontSize: 18, fontWeight: 900 }}>{"✓"}</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>Não te ajudou a decidir? Devolvemos o valor.</div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>Pix de volta em 24h, sem burocracia.</div>
        </div>
      </div>

      {/* ── CTA final ─────────────────────────────────── */}
      <div style={{ paddingBottom: "max(48px, calc(24px + env(safe-area-inset-bottom)))" }}>
        <Link
          href="/cadastro"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54, background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 2px 16px rgba(0,212,170,0.18), 0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          Criar meu laudo grátis
        </Link>
        <p style={{
          fontSize: 11, color: "var(--t4)", textAlign: "center",
          marginTop: 10, marginBottom: 0,
        }}>
          Sem cartão. Leva 8 minutos.
        </p>
      </div>

      <Footer />
    </main>
  );
}
