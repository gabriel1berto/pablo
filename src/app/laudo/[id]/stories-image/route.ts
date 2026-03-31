import { ImageResponse } from "next/og";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = createServiceClient();
  const { data: laudo } = await service
    .from("laudos")
    .select("brand, model, year, km, score, verdict, tipo")
    .eq("id", id)
    .single();

  const score = laudo?.score?.toFixed(1) ?? "—";
  const verdict = laudo?.verdict ?? "Laudo Pablo";
  const title = laudo ? `${laudo.brand} ${laudo.model}` : "Laudo Pablo";
  const year = laudo?.year ? String(laudo.year) : "";
  const km = laudo ? `${laudo.km.toLocaleString("pt-BR")} km` : "";
  const isVendedor = laudo?.tipo === "vendedor";

  const vc =
    verdict === "Boa Compra"
      ? "#22c55e"
      : verdict === "Não Recomendado"
      ? "#ef4444"
      : "#eab308";

  const vcBg =
    verdict === "Boa Compra"
      ? "rgba(34,197,94,0.12)"
      : verdict === "Não Recomendado"
      ? "rgba(239,68,68,0.12)"
      : "rgba(234,179,8,0.1)";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#050505",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 72px",
      }}
    >
      {/* Top branding */}
      <div style={{
        display: "flex",
        position: "absolute",
        top: 72,
        left: 72,
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
          pa<span style={{ color: "#00D4AA" }}>b</span>lo
        </span>
        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>
          {isVendedor ? "Laudo de transparência" : "Laudo de veículo"}
        </span>
      </div>

      {/* Center content */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 0,
      }}>
        {/* Vehicle */}
        <div style={{
          fontSize: 58,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-2px",
          lineHeight: 1.05,
          marginBottom: 8,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 32,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 72,
          display: "flex",
          gap: 24,
        }}>
          <span>{year}</span>
          <span>·</span>
          <span>{km}</span>
        </div>

        {/* Score block */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: vcBg,
          border: `2px solid ${vc}`,
          borderRadius: 32,
          padding: "48px 80px",
          marginBottom: 40,
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            {isVendedor ? "Declaração do vendedor" : "Avaliação"}
          </div>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 140, fontWeight: 900, color: vc, letterSpacing: "-6px", lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: 42, color: "rgba(255,255,255,0.3)" }}>/10</span>
          </div>
          <div style={{
            fontSize: 42,
            fontWeight: 900,
            color: vc,
            textTransform: "uppercase",
            letterSpacing: "-0.5px",
          }}>
            {verdict}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        display: "flex",
        position: "absolute",
        bottom: 72,
        alignItems: "center",
        flexDirection: "column",
        gap: 12,
      }}>
        <div style={{
          fontSize: 24,
          color: "rgba(255,255,255,0.45)",
          textAlign: "center",
        }}>
          Avalie qualquer carro usado antes de comprar
        </div>
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#00D4AA",
        }}>
          pablo.com.br · Laudo grátis
        </div>
      </div>
    </div>,
    { width: 1080, height: 1920 }
  );
}
