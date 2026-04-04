export function SectionDivider({ label, counter }: { label: string; counter?: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      marginBottom: 16, marginTop: 8,
    }}>
      <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          {label}
        </span>
        {counter && (
          <span style={{ fontSize: 10, color: "var(--t4)", fontWeight: 600 }}>{counter}</span>
        )}
      </div>
      <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
    </div>
  );
}
