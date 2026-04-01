import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/app/laudos/logout-button";

export default async function LaudoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <>
      {children}
      {session && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 4,
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: 99, padding: "0 6px 0 16px", height: 36,
          zIndex: 50,
        }}>
          <Link
            href="/laudos"
            style={{
              fontSize: 12, fontWeight: 600, color: "var(--t3)",
              textDecoration: "none", whiteSpace: "nowrap",
            }}
          >
            ← Meus laudos
          </Link>
          <div style={{ width: 1, height: 16, background: "var(--bd)", margin: "0 4px" }} />
          <LogoutButton />
        </div>
      )}
    </>
  );
}
