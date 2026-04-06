"use client";

import Link from "next/link";
import Footer from "../../components/footer";

export default function LPSelo() {
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
          Venda seu carro{" "}
          <span style={{ color: "var(--accent)" }}>mais rápido.</span>
        </h1>
        <p style={{
          fontSize: 15, lineHeight: 1.6, marginTop: 14, marginBottom: 0,
          color: "var(--t3)", fontWeight: 400, maxWidth: 380,
        }}>
          Gere o selo de confiança que faz o comprador decidir.
        </p>
      </div>

      {/* ── CTA principal ─────────────────────────────── */}
      <Link
        href="/cadastro?ref=selo&tipo=vendedor"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 54, background: "var(--accent)", color: "#050505",
          borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
          textDecoration: "none",
          boxShadow: "0 2px 16px rgba(0,212,170,0.18), 0 1px 3px rgba(0,0,0,0.3)",
          marginBottom: 8,
        }}
      >
        Gerar meu selo grátis
      </Link>
      <p style={{ fontSize: 12, color: "var(--t4)", textAlign: "center", margin: 0, marginBottom: 48 }}>
        Primeiro laudo grátis · 8 minutos · do celular
      </p>

      {/* ── Antes / Depois ────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 14,
        }}>
          Seu anúncio com e sem selo
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {/* Sem selo */}
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: "var(--rm)", padding: "16px", opacity: 0.6,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--t4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Sem selo
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t2)", marginBottom: 8 }}>HB20 2020 · 62 mil km</div>
            <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5, marginBottom: 12 }}>
              &quot;Carro revisado, pronto pra uso, aceito troca.&quot;
            </div>
            <div style={{
              fontSize: 11, color: "var(--danger)", fontWeight: 700,
              background: "rgba(255,68,68,0.08)", borderRadius: 8, padding: "8px 10px", textAlign: "center",
            }}>
              23 dias pra vender
            </div>
          </div>

          {/* Com selo */}
          <div style={{
            background: "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.15)",
            borderRadius: "var(--rm)", padding: "16px",
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Com selo Pablo
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 8 }}>HB20 2020 · 62 mil km</div>
            <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5, marginBottom: 4 }}>
              Score 8.7/10 · 0 problemas
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5, marginBottom: 12 }}>
              &quot;Revisado. Laudo completo disponível.&quot;
            </div>
            <div style={{
              fontSize: 11, color: "var(--accent)", fontWeight: 700,
              background: "var(--ag)", borderRadius: 8, padding: "8px 10px", textAlign: "center",
            }}>
              9 dias pra vender
            </div>
          </div>
        </div>
      </div>

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
            { n: "1", title: "Preenche o estado do carro", desc: "Checklist guiado por modelo. 8 minutos no celular." },
            { n: "2", title: "Pablo gera laudo + score + selo", desc: "Nota de 0 a 10, problemas declarados, preço FIPE." },
            { n: "3", title: "Cola no anúncio", desc: "Link compartilhável. Comprador escaneia e vê tudo." },
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
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mockup do selo ────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 14,
        }}>
          O que o comprador vê
        </h2>

        <div style={{
          background: "var(--bg2)", border: "1px solid rgba(0,212,170,0.15)",
          borderRadius: "var(--rm)", padding: "20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
            {"✓"} Selo Pablo
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--t1)", marginBottom: 4 }}>HB20 Sense 2020</div>
          <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 12 }}>62.000 km · Único dono · Revisado</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: "var(--ok)", letterSpacing: "-1px", lineHeight: 1 }}>8.7</span>
            <span style={{ fontSize: 14, color: "var(--t3)" }}>/10</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ok)", marginBottom: 16 }}>Boa Compra</div>
          <div style={{
            width: 80, height: 80, margin: "0 auto", borderRadius: 8,
            background: "var(--bg3)", border: "1px solid var(--bd)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 10, color: "var(--t4)", textAlign: "center", lineHeight: 1.3 }}>QR Code<br />do laudo</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 10 }}>Comprador escaneia e vê o laudo completo</div>
        </div>
      </div>

      {/* ── Depoimento ────────────────────────────────── */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--bd)",
        borderRadius: "var(--rm)", padding: "18px",
        marginBottom: 48,
      }}>
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 10 }}>
          &quot;Colei o selo no OLX e o cara que comprou disse que só veio ver porque tinha o laudo. Vendi em 6 dias.&quot;
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)" }}>Renata, BH</div>
      </div>

      {/* ── Comparação ────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          margin: 0, marginBottom: 14,
        }}>
          Pablo vs vistoria presencial
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: "var(--rm)", padding: "16px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--t4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Vistoria
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>R$ 150–300</div>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>Agendar + ir até lá</div>
              <div style={{ fontSize: 13, color: "var(--t3)" }}>2–3 dias</div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>Não te ajudou a vender? Devolvemos o valor.</div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>Pix de volta em 24h, sem burocracia.</div>
        </div>
      </div>

      {/* ── CTA final ─────────────────────────────────── */}
      <div style={{ paddingBottom: "max(48px, calc(24px + env(safe-area-inset-bottom)))" }}>
        <Link
          href="/cadastro?ref=selo&tipo=vendedor"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54, background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 2px 16px rgba(0,212,170,0.18), 0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          Gerar meu selo grátis
        </Link>
        <p style={{ fontSize: 11, color: "var(--t4)", textAlign: "center", marginTop: 10, marginBottom: 0 }}>
          Sem cartão. Leva 8 minutos.
        </p>
      </div>

      <Footer />
    </main>
  );
}
