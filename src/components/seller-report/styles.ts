// ── Design tokens do relatório vendedor ──────────────────
export const C = {
  brand: "#F25C05",
  brandDark: "#993C1D",
  brandBg: "#FAECE7",
  text: "#1A1A19",
  textSec: "#6B6A65",
  textTer: "#9C9B95",
  bg: "#FFFFFF",
  bgSec: "#F5F4F0",
  border: "#E3E2DD",
  green: "#1D9E75",
  yellowText: "#BA7517",
  yellowBg: "#FAEEDA",
  yellowDark: "#412402",
  yellowMid: "#854F0B",
  yellowBorder: "#EF9F27",
  redText: "#A32D2D",
  redBg: "#FCEBEB",
  scoreCircle: "#2C2C2A",
  placeholder: "#D3D1C7",
  videoBg: "#2C2C2A",
} as const;

export const headerStyle: React.CSSProperties = {
  height: 44, padding: "0 16px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  borderBottom: `0.5px solid ${C.border}`, background: C.bg,
};

export const sectionLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 800, color: C.textTer,
  textTransform: "uppercase", letterSpacing: "0.08em",
  marginBottom: 10,
};

export const sectionHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "baseline",
  marginBottom: 12,
};

export const listRow: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "6px 0", borderBottom: `0.5px solid ${C.border}`,
  fontSize: 12,
};

export const cardStyle: React.CSSProperties = {
  background: C.bgSec, borderRadius: 8, padding: "10px 12px",
};

export const photoPlaceholder: React.CSSProperties = {
  background: C.placeholder, borderRadius: 6, overflow: "hidden",
  position: "relative",
};

export const photoLabel: React.CSSProperties = {
  position: "absolute", bottom: 4, left: 4,
  background: "rgba(0,0,0,0.6)", color: "#fff",
  fontSize: 8, padding: "2px 6px", borderRadius: 3,
};

export const badgeCritico: React.CSSProperties = {
  fontSize: 9, fontWeight: 500, color: C.redText,
  background: C.redBg, padding: "2px 6px", borderRadius: 3,
};

export const badgeAtencao: React.CSSProperties = {
  fontSize: 9, fontWeight: 500, color: C.yellowMid,
  background: C.yellowBg, padding: "2px 6px", borderRadius: 3,
};

export const statusOk = { color: C.green, fontWeight: 500 as const };
export const statusWarn = { color: C.yellowText, fontWeight: 500 as const };
export const statusRed = { color: C.redText, fontWeight: 500 as const };
