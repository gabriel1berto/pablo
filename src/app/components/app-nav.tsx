import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/app/laudos/logout-button";

export default async function AppNav() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      display: "flex", justifyContent: "center",
      paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      paddingTop: 8,
      background: "linear-gradient(transparent, var(--bg0) 40%)",
      zIndex: 50, pointerEvents: "none",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "var(--bg2)", border: "1px solid var(--bd)",
        borderRadius: 99, padding: "0 6px 0 14px", height: 40,
        pointerEvents: "auto",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}>
        <Link href="/laudo/novo" style={{ fontSize: 12, fontWeight: 600, color: "var(--t3)", textDecoration: "none", padding: "4px 6px" }}>
          + Novo
        </Link>
        <div style={{ width: 1, height: 16, background: "var(--bd)" }} />
        <Link href="/laudos" style={{ fontSize: 12, fontWeight: 600, color: "var(--t3)", textDecoration: "none", padding: "4px 6px" }}>
          Meus laudos
        </Link>
        <div style={{ width: 1, height: 16, background: "var(--bd)" }} />
        <LogoutButton />
      </div>
    </div>
  );
}
