import { ImageResponse } from "next/og";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = createServiceClient();
  const { data: laudo } = await service
    .from("laudos")
    .select("brand, model, year, km, score, verdict")
    .eq("id", id)
    .single();

  const score = laudo?.score?.toFixed(1) ?? "—";
  const verdict = laudo?.verdict ?? "Laudo Pablo";
  const title = laudo ? `${laudo.brand} ${laudo.model} ${laudo.year}` : "Laudo Pablo";
  const km = laudo ? `${laudo.km.toLocaleString("pt-BR")} km` : "";

  const vc =
    verdict === "Boa Compra"
      ? "#22c55e"
      : verdict === "Não Recomendado"
      ? "#ef4444"
      : "#eab308";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#050505",
        padding: "64px 72px",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Branding */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-1px",
          }}
        >
          pa
          <span style={{ color: "#00D4AA" }}>b</span>
          lo
        </span>
        <span
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.35)",
            marginLeft: 16,
          }}
        >
          Laudo de veículo
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {/* Left: vehicle info */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-2px",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.45)" }}>
            {km}
          </div>
        </div>

        {/* Right: score */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: vc,
                letterSpacing: "-4px",
                lineHeight: 1,
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.4)",
                marginLeft: 8,
              }}
            >
              /10
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 800,
              color: vc,
              marginTop: 8,
            }}
          >
            {verdict}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex" }}>
        <span style={{ fontSize: 15, color: "rgba(255,255,255,0.2)" }}>
          pablo.com.br · Avalie qualquer carro usado antes de comprar
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
