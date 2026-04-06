"use client";

import Link from "next/link";
import TrialChat from "../../components/trial-chat";
import Footer from "../../components/footer";

export default function LPCompra() {
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
          Sabe o que tem de{" "}
          <span style={{ color: "var(--warn)" }}>errado</span>{" "}
          nesse carro?
        </h1>
        <p style={{
          fontSize: 15, lineHeight: 1.6, marginTop: 14, marginBottom: 0,
          color: "var(--t3)", fontWeight: 400, maxWidth: 380,
        }}>
          O Pablo encontra os problemas, calcula o custo de cada reparo e diz o preço justo pra negociar.
        </p>
      </div>

      {/* ── CTA principal ─────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <Link
          href="/cadastro?ref=compra&tipo=comprador"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            flex: 1, height: 54, background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 14, fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 2px 16px rgba(0,212,170,0.18), 0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          Verificar carro grátis
        </Link>
        <button
          onClick={() => document.getElementById("trial-section")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: 54, padding: "0 20px",
            background: "var(--bg2)", color: "var(--t2)",
            border: "1px solid var(--bd)", borderRadius: "var(--rs)",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          Tirar dúvida
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--t4)", textAlign: "center", margin: 0, marginBottom: 48 }}>
        Primeiro laudo grátis · 8 minutos · do celular
      </p>

      {/* ── Laudo de exemplo ──────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 14,
        }}>
          Isso é o que você recebe
        </h2>

        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden",
        }}>
          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>Civic 2019 · 58.000 km</div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>Pedindo R$ 82.000 · FIPE R$ 79.500</div>
          </div>

          {/* Score */}
          <div style={{
            background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)",
            borderRadius: "var(--rm)", margin: "12px 12px 0", padding: "16px", textAlign: "center",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "var(--warn)", letterSpacing: "-1px", lineHeight: 1 }}>6.8</span>
              <span style={{ fontSize: 14, color: "var(--t3)" }}>/10</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn)" }}>Compra com cautela</div>
          </div>

          {/* Problemas */}
          <div style={{ padding: "12px" }}>
            <div style={{
              background: "rgba(255,68,68,0.04)", border: "1px solid rgba(255,68,68,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Câmbio com tranco na 3a</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--danger)" }}>R$ 2.800</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>Problema comum no Civic 2018-2020. Precisa trocar válvula solenoide.</div>
            </div>

            <div style={{
              background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Pastilhas de freio gastas</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)" }}>R$ 350</span>
              </div>
            </div>

            <div style={{
              background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--ok)", fontWeight: 700 }}>{"✓"}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>Motor, suspensão e documentação OK</span>
              </div>
            </div>
          </div>

          {/* Recomendação */}
          <div style={{ padding: "0 12px 14px" }}>
            <div style={{
              display: "flex", gap: 10, background: "var(--bg3)",
              borderRadius: 12, padding: "12px",
            }}>
              <div style={{ fontSize: 14, flexShrink: 0 }}>{"💡"}</div>
              <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--t1)" }}>Ofereça R$ 78.000.</strong> O desconto de R$ 4.000 cobre o câmbio + freios. Vendedor pediu R$ 82k mas FIPE é R$ 79.5k — você tem argumento.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── O que o Pablo faz ─────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 20,
        }}>
          O que o Pablo faz por você
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { icon: "🔍", title: "Encontra problemas", desc: "Checklist específico pro modelo e km" },
            { icon: "🧮", title: "Calcula custo", desc: "Preço real de cada reparo em R$" },
            { icon: "💰", title: "Diz o preço justo", desc: "FIPE + descontos = valor pra negociar" },
          ].map((item) => (
            <div key={item.title} style={{
              background: "var(--bg2)", border: "1px solid var(--bd)",
              borderRadius: "var(--rm)", padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)", marginBottom: 4, lineHeight: 1.3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trial chat ────────────────────────────────── */}
      <div id="trial-section" style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 6,
        }}>
          Tem uma dúvida sobre um carro?
        </h2>
        <p style={{ fontSize: 13, color: "var(--t3)", margin: 0, marginBottom: 14 }}>
          Pergunta pro Pablo. É grátis, sem criar conta.
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
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 6, lineHeight: 1.3 }}>pra completar</div>
        </div>
      </div>

      {/* ── Comparação ────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 14,
        }}>
          Pablo vs levar no mecânico
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: "var(--rm)", padding: "16px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--t4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Mecânico
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>R$ 150–300</div>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>Precisa levar o carro</div>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>Depende da agenda</div>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>Diagnóstico verbal</div>
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
              <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600 }}>Faz do celular</div>
              <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600 }}>Agora, 8 minutos</div>
              <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 600 }}>Laudo com custos em R$</div>
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
          href="/cadastro?ref=compra&tipo=comprador"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54, background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 2px 16px rgba(0,212,170,0.18), 0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          Verificar meu carro grátis
        </Link>
        <p style={{ fontSize: 11, color: "var(--t4)", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
          Sem cartão. Leva 8 minutos.
        </p>
      </div>

      <Footer />
    </main>
  );
}
