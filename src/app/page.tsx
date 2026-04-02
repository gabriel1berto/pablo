"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CILADAS = [
  { car: "Civic 2019", problem: "Motor retificado", loss: "R$ 8.000" },
  { car: "HB20 2020", problem: "Leilão não declarado", loss: "R$ 12.000" },
  { car: "Corolla 2018", problem: "Câmbio com tranco", loss: "R$ 6.500" },
  { car: "Onix 2017", problem: "Pintura refeita (batida)", loss: "R$ 4.200" },
  { car: "Gol 2016", problem: "Gravame ativo", loss: "Carro retomado" },
  { car: "Argo 2021", problem: "Hodômetro adulterado", loss: "R$ 5.000" },
  { car: "Kicks 2020", problem: "Alagamento escondido", loss: "R$ 9.000" },
  { car: "Strada 2019", problem: "Chassi remarcado", loss: "Perda total" },
];

export default function LP() {
  const [ciladaIdx, setCiladaIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCiladaIdx((prev) => (prev + 1) % CILADAS.length);
        setFade(true);
      }, 250);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const cilada = CILADAS[ciladaIdx];

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      maxWidth: 480, margin: "0 auto", padding: "0 24px",
    }}>

      {/* ── Logo + Login ────────────────────────────── */}
      <div style={{ paddingTop: 48, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 56, display: "block" }} />
        <Link
          href="/login"
          style={{
            fontSize: 13, fontWeight: 700, color: "var(--t3)",
            textDecoration: "none", padding: "8px 0",
          }}
        >
          Entrar
        </Link>
      </div>

      {/* ── Hero ──────────────────────────────────────── */}
      <div style={{ paddingTop: 48, paddingBottom: 40 }}>
        <h1 style={{
          fontSize: 30, fontWeight: 900, letterSpacing: "-1px",
          lineHeight: 1.15, marginBottom: 0, color: "var(--t1)",
        }}>
          Compre carro usado<br />
          <span style={{ color: "var(--accent)" }}>sem correr riscos.</span>
        </h1>
        <h2 style={{
          fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px",
          lineHeight: 1.3, marginTop: 12, color: "var(--t3)",
        }}>
          Venda com credibilidade.
        </h2>
      </div>

      {/* ── Stats strip ───────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1,
        background: "var(--bd)", borderRadius: "var(--rm)",
        overflow: "hidden", marginBottom: 24,
      }}>
        <div style={{ background: "var(--bg2)", padding: "18px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--accent)", lineHeight: 1 }}>Grátis</div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>primeiro laudo</div>
        </div>
        <div style={{ background: "var(--bg2)", padding: "18px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--t1)", lineHeight: 1 }}>8 min</div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>pra completar</div>
        </div>
        <div style={{ background: "var(--bg2)", padding: "18px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--t1)", lineHeight: 1 }}>R$ 20</div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>depois do primeiro</div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────── */}
      <Link
        href="/cadastro"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 54, background: "var(--accent)", color: "#050505",
          borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
          textDecoration: "none",
          boxShadow: "0 2px 16px rgba(0,212,170,0.18), 0 1px 3px rgba(0,0,0,0.3)",
          marginBottom: 48,
        }}
      >
        Avaliar um carro grátis
      </Link>

      {/* ── Ciladas ───────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1px",
          marginBottom: 16,
        }}>
          Isso acontece todo dia
        </div>

        <div style={{
          background: "rgba(255,68,68,0.04)", border: "1px solid rgba(255,68,68,0.12)",
          borderRadius: "var(--rm)", padding: "20px",
          minHeight: 88,
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.25s, transform 0.25s",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{cilada.car}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
              background: "rgba(255,68,68,0.12)", color: "var(--danger)",
            }}>CILADA</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 4 }}>{cilada.problem}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)" }}>Prejuízo: {cilada.loss}</div>
        </div>

        <div style={{
          display: "flex", justifyContent: "center", gap: 4, marginTop: 12,
        }}>
          {CILADAS.map((_, i) => (
            <div key={i} style={{
              width: i === ciladaIdx ? 16 : 4, height: 4,
              borderRadius: 99, transition: "all 0.3s",
              background: i === ciladaIdx ? "var(--danger)" : "var(--bg4)",
            }} />
          ))}
        </div>
      </div>

      {/* ── Fale com o Pablo ──────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 14,
        }}>
          <img src="/icon-pablo.png" alt="P" style={{ width: 32, height: 32, borderRadius: "50%" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--t1)" }}>Fale com o Pablo</div>
            <div style={{ fontSize: 12, color: "var(--t3)" }}>Seu mecânico de bolso</div>
          </div>
        </div>

        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", padding: "14px",
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <div style={{
              background: "var(--accent)", color: "#050505",
              borderRadius: "14px 14px 4px 14px", padding: "10px 14px", maxWidth: "78%",
            }}>
              <div style={{
                width: "100%", height: 72, borderRadius: 8,
                background: "linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.1))",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                marginBottom: 6,
              }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(0,0,0,0.15)", marginBottom: 3 }} />
                <span style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", fontWeight: 600 }}>foto do motor</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Isso aqui tá normal?</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{
              background: "var(--bg3)", color: "var(--t1)",
              borderRadius: "14px 14px 14px 4px", padding: "10px 14px", maxWidth: "85%",
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Tá suando óleo na junta da tampa de válvulas. No Onix 2017 com 45k km isso é <strong style={{ color: "var(--warn)" }}>comum mas não é normal</strong>. Troca sai <strong style={{ color: "var(--t2)" }}>R$ 150–250</strong>.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <div style={{
              background: "var(--accent)", color: "#050505",
              borderRadius: "14px 14px 4px 14px", padding: "10px 14px", maxWidth: "78%",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>O cara tá pedindo 42 mil, vale?</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              background: "var(--bg3)", color: "var(--t1)",
              borderRadius: "14px 14px 14px 4px", padding: "10px 14px", maxWidth: "85%",
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                FIPE tá R$ 43.800. Com o vazamento + pneus, oferece <strong style={{ color: "var(--accent)" }}>R$ 40.500</strong>. Paga o justo e sobra pra resolver.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Resultado ─────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14,
        }}>
          Resultado do laudo
        </div>

        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px 0", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--t3)" }}>Chevrolet Onix 2017 · 45.000 km</span>
          </div>

          <div style={{
            background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)",
            borderRadius: "var(--rm)", margin: 12, padding: "16px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--warn)", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 6 }}>
              Compra com cautela
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "var(--warn)", letterSpacing: "-1px", lineHeight: 1 }}>6.3</span>
              <span style={{ fontSize: 14, color: "var(--t3)" }}>/10</span>
            </div>
          </div>

          <div style={{ padding: "0 12px" }}>
            <div style={{
              background: "rgba(255,68,68,0.04)", border: "1px solid rgba(255,68,68,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 2 }}>Manutenções sem comprovante</div>
              <div style={{ fontSize: 12, color: "var(--t3)" }}>Sem registro de revisão</div>
            </div>

            <div style={{
              background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Vazamento na junta</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)" }}>R$ 150–250</span>
              </div>
            </div>

            <div style={{
              background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Pneus gastos na borda</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)" }}>R$ 500–800</span>
              </div>
            </div>
          </div>

          <div style={{ padding: "0 12px 12px" }}>
            <div style={{
              display: "flex", gap: 10, background: "var(--bg3)",
              borderRadius: 12, padding: "10px 12px",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "var(--bg4)", color: "var(--accent)",
                fontSize: 11, fontWeight: 900, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>1</div>
              <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>
                Oferece R$ 40.500 em vez de R$ 42.000. Cobre os reparos e fica no preço justo.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Laudo real ────────────────────────────────── */}
      <Link
        href="/laudo/52ce00a0-c142-4739-9141-f273718db41f"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderLeft: "3px solid var(--accent)",
          borderRadius: "var(--rm)", textDecoration: "none",
          marginBottom: 48,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Quer ver um de verdade?</div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>Laudo completo — Onix 2017</div>
        </div>
        <span style={{ fontSize: 14, color: "var(--t3)" }}>→</span>
      </Link>

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
          <span style={{ color: "var(--accent)", fontSize: 18, fontWeight: 900 }}>✓</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>Não gostou? Devolvo os R$ 20</div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>Sem pergunta. Pix de volta em 24h.</div>
        </div>
      </div>

      {/* ── Comprador / Vendedor ──────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        marginBottom: 32,
      }}>
        <Link href="/cadastro" style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", padding: "16px 14px", textDecoration: "none",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)", marginBottom: 6 }}>Comprando</div>
          <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>
            Sabe o que tem de errado antes de fechar
          </div>
        </Link>
        <Link href="/cadastro" style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", padding: "16px 14px", textDecoration: "none",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#A78BFA", marginBottom: 6 }}>Vendendo</div>
          <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>
            Mostra que o carro é confiável
          </div>
        </Link>
      </div>

      {/* ── Bottom CTA ────────────────────────────────── */}
      <div style={{ paddingBottom: "max(48px, calc(24px + env(safe-area-inset-bottom)))" }}>
        <Link
          href="/cadastro"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 54, background: "var(--accent)", color: "#050505",
            borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Fazer meu laudo grátis
        </Link>
      </div>
    </main>
  );
}
