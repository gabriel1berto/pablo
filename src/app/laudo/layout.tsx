import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LaudoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // getSession is local (reads cookie) — no network call, safe for display-only purposes.
  // Individual pages use getUser() (network) for actual auth enforcement.
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <>
      {children}
      {session && (
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
      )}
    </>
  );
}
