import Link from "next/link";

export default function PagamentoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Link
        href="/laudos"
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 36,
          padding: "0 16px",
          background: "var(--bg2)",
          border: "1px solid var(--bd)",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 600,
          color: "var(--t3)",
          textDecoration: "none",
          whiteSpace: "nowrap",
          zIndex: 50,
        }}
      >
        ← Meus laudos
      </Link>
    </>
  );
}
