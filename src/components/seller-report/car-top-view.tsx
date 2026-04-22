"use client";
import { C } from "./styles";
import type { InspectionItem } from "./types";

type Props = { items: InspectionItem[] };

export function CarTopView({ items }: Props) {
  const damages = items.filter((i) => i.item_type === "damage");
  const hasDamage = damages.length > 0;
  const strokeColor = hasDamage ? C.yellowText : C.green;

  return (
    <div style={{ background: C.bgSec, borderRadius: 6, padding: "10px 12px", display: "flex", alignItems: "center", gap: 14 }}>
      <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Corpo do carro top-view */}
        <rect x="10" y="15" width="40" height="70" rx="12" stroke={strokeColor} strokeWidth="2" />
        {/* Capô */}
        <line x1="15" y1="30" x2="45" y2="30" stroke={strokeColor} strokeWidth="1.5" />
        {/* Traseira */}
        <line x1="15" y1="70" x2="45" y2="70" stroke={strokeColor} strokeWidth="1.5" />
        {/* Para-brisa */}
        <rect x="15" y="32" width="30" height="8" rx="2" stroke={strokeColor} strokeWidth="1" />
        {/* Vidro traseiro */}
        <rect x="15" y="62" width="30" height="6" rx="2" stroke={strokeColor} strokeWidth="1" />
        {/* Rodas */}
        <rect x="4" y="22" width="6" height="12" rx="2" fill={strokeColor} opacity="0.3" stroke={strokeColor} strokeWidth="1" />
        <rect x="50" y="22" width="6" height="12" rx="2" fill={strokeColor} opacity="0.3" stroke={strokeColor} strokeWidth="1" />
        <rect x="4" y="66" width="6" height="12" rx="2" fill={strokeColor} opacity="0.3" stroke={strokeColor} strokeWidth="1" />
        <rect x="50" y="66" width="6" height="12" rx="2" fill={strokeColor} opacity="0.3" stroke={strokeColor} strokeWidth="1" />
        {/* Indicadores de dano */}
        {damages.map((d, i) => {
          const positions: Record<string, { cx: number; cy: number }> = {
            frente: { cx: 30, cy: 20 },
            traseira: { cx: 30, cy: 80 },
            lateral_esq: { cx: 8, cy: 50 },
            lateral_dir: { cx: 52, cy: 50 },
            teto: { cx: 30, cy: 50 },
          };
          const loc = d.section?.replace("damage_", "") ?? "";
          const pos = positions[loc] ?? { cx: 30, cy: 50 };
          return <circle key={i} cx={pos.cx} cy={pos.cy} r="4" fill={C.yellowText} opacity="0.8" />;
        })}
      </svg>
      <div>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.text }}>
          {hasDamage ? `${damages.length} dano${damages.length > 1 ? "s" : ""} declarado${damages.length > 1 ? "s" : ""}` : "Nenhum dano declarado"}
        </div>
        <div style={{ fontSize: 10, color: C.textTer, marginTop: 2 }}>
          {hasDamage ? "toque no mapa para detalhes" : "vendedor confirmou 5 áreas"}
        </div>
      </div>
    </div>
  );
}
