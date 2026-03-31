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
          Não compre carro{" "}
          <span style={{ color: "var(--accent)" }}>no escuro.</span>
        </h1>

        <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.65, marginBottom: 8 }}>
          Você preenche um checklist sobre o carro, tira fotos, conversa
          com o Pablo e sai com um laudo dizendo se vale a pena ou não.
        </p>

        {laudoCount > 10 && (
          <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 0 }}>
            {laudoCount.toLocaleString("pt-BR")} laudos gerados
          </p>
        )}
      </div>

      {/* ── Fale com o Pablo (showcase) ──────────────────── */}
      <div style={{ paddingTop: 32, marginBottom: 8 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 14,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--ag)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, flexShrink: 0,
          }}>AI</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--t1)" }}>
              Fale com o Pablo
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              Seu mecânico de bolso durante a visita
            </div>
          </div>
        </div>

        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden",
          padding: "14px",
        }}>
          {/* User: foto de motor */}
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
              }}>foto do motor</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Isso aqui ta normal?</div>
            </div>
          </div>

          {/* Pablo responde */}
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{
              background: "var(--bg3)", color: "var(--t1)",
              borderRadius: "14px 14px 14px 4px", padding: "10px 14px",
              maxWidth: "85%",
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Tá com vazamento na junta da tampa de válvulas. No Onix 2017 com 45k km isso é <strong style={{ color: "var(--warn)" }}>comum mas não é normal</strong>. Se deixar, o óleo vai respingar na correia. Troca da junta sai <strong style={{ color: "var(--t2)" }}>R$ 150–250</strong>.
              </div>
            </div>
          </div>

          {/* User: pergunta sobre preço */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <div style={{
              background: "var(--accent)", color: "#050505",
              borderRadius: "14px 14px 4px 14px", padding: "10px 14px",
              maxWidth: "78%",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>O cara ta pedindo 42 mil, vale?</div>
            </div>
          </div>

          {/* Pablo responde sobre preço */}
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{
              background: "var(--bg3)", color: "var(--t1)",
              borderRadius: "14px 14px 14px 4px", padding: "10px 14px",
              maxWidth: "85%",
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                FIPE tá em R$ 43.800. Com o vazamento + pneus que você marcou como problema, pede <strong style={{ color: "var(--accent)" }}>R$ 40.500</strong>. Tá pagando o preço justo e sobrando pra resolver os dois pontos.
              </div>
            </div>
          </div>

          {/* User: mais uma dúvida */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <div style={{
              background: "var(--accent)", color: "#050505",
              borderRadius: "14px 14px 4px 14px", padding: "10px 14px",
              maxWidth: "78%",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>O vendedor falou que fez revisão em dia</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              background: "var(--bg3)", color: "var(--t1)",
              borderRadius: "14px 14px 14px 4px", padding: "10px 14px",
              maxWidth: "85%",
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                Pede pra ver o manual carimbado ou NF da concessionária. Revisão "em dia" sem comprovante não conta. No checklist você marcou manutenções como <strong style={{ color: "var(--danger)" }}>alerta</strong> — tá certo em desconfiar.
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 10, lineHeight: 1.5 }}>
          Tira foto, manda áudio do barulho, pergunta o que quiser. O Pablo conhece
          o modelo que você tá olhando e já viu o que você preencheu no checklist.
        </div>
      </div>

      {/* ── Primary CTA ──────────────────────────────────── */}
      <div style={{ paddingTop: 32, paddingBottom: 40 }}>
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
          Primeiro laudo de graça · leva uns 8 minutos
        </div>
      </div>

      {/* ── Result preview ───────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: "var(--t4)",
          textTransform: "uppercase", letterSpacing: "1px",
          marginBottom: 14,
        }}>
          Isso é o que sai no final
        </div>

        <div style={{
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", overflow: "hidden",
        }}>
          {/* Header */}
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
            background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)",
            borderRadius: "var(--rm)", margin: 12, padding: "16px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
              Laudo Pablo
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--warn)", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 6 }}>
              Compra com cautela
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3, marginBottom: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "var(--warn)", letterSpacing: "-1px", lineHeight: 1 }}>6.3</span>
              <span style={{ fontSize: 14, color: "var(--t3)" }}>/10</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)" }}>2 problemas · 1 alerta documental · preço acima da FIPE</div>
          </div>

          {/* Alerta documental */}
          <div style={{ padding: "0 12px" }}>
            <div style={{
              background: "rgba(255,68,68,0.05)", border: "1px solid rgba(255,68,68,0.2)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 99, background: "rgba(255,68,68,0.15)", color: "var(--danger)", letterSpacing: "0.3px" }}>DOCUMENTAL</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 2 }}>
                Manutenções sem comprovante
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.4 }}>
                Sem registro de revisão. Não dá pra saber o estado real do motor.
              </div>
            </div>
          </div>

          {/* Findings */}
          <div style={{ padding: "0 12px" }}>
            <div style={{
              background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.2)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Vazamento na junta da tampa de válvulas</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 99, background: "rgba(234,179,8,0.15)", color: "var(--warn)", letterSpacing: "0.3px" }}>ATENÇÃO</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>
                Reparo: <strong style={{ color: "var(--t2)" }}>R$ 150–250</strong>
              </div>
            </div>

            <div style={{
              background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.2)",
              borderRadius: 12, padding: "10px 12px", marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Pneus dianteiros gastos na borda</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 99, background: "rgba(234,179,8,0.15)", color: "var(--warn)", letterSpacing: "0.3px" }}>ATENÇÃO</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>
                Alinhamento + 2 pneus: <strong style={{ color: "var(--t2)" }}>R$ 500–800</strong>
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
                Oferece R$ 40.500 em vez de R$ 42.000. Cobre os reparos e fica no preço justo.
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
            Quer ver um de verdade?
          </div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>
            Laudo completo de um Onix 2017
          </div>
        </div>
        <span style={{ fontSize: 14, color: "var(--t3)", flexShrink: 0 }}>→</span>
      </Link>

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
            { n: "1", title: "Coloca os dados do carro", desc: "Marca, modelo, ano, km e quanto tão pedindo" },
            { n: "2", title: "Passa pelo checklist", desc: "O Pablo monta os pontos certos pro modelo. Você vai marcando o que vê" },
            { n: "3", title: "Sai o laudo", desc: "Nota de 0 a 10, lista de problemas com custo e o quanto pedir de desconto" },
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
          Vistoria em oficina: R$ 250+ e 3 dias de espera
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
            Sabe o que tem de errado antes de fechar
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
            Mostra que o carro é confiável e vende mais rápido
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
          Fazer meu laudo gratis →
        </Link>
      </div>
    </main>
  );
}
