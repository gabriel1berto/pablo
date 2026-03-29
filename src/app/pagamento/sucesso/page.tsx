"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PagamentoSucesso() {
  const [status, setStatus] = useState<"polling" | "ready" | "timeout">("polling");

  useEffect(() => {
    const supabase = createClient();
    let attempts = 0;
    const MAX = 15; // ~30s

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus("ready"); return; } // fallback — let them try

      const { count } = await supabase
        .from("laudo_credits")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("used_at", null);

      if (count && count > 0) {
        setStatus("ready");
        return;
      }

      attempts++;
      if (attempts >= MAX) {
        setStatus("timeout");
        return;
      }

      setTimeout(check, 2000);
    }

    check();
  }, []);

  return (
    <main style={{
      minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      padding: "52px 24px 64px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
    }}>
      {status === "polling" ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 10 }}>
            Confirmando pagamento...
          </h1>
          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, maxWidth: 300 }}>
            Aguarde um instante enquanto processamos.
          </p>
        </>
      ) : status === "timeout" ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 10 }}>
            Processando seu pagamento
          </h1>
          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 24, maxWidth: 300 }}>
            Está demorando mais que o esperado. Se o pagamento foi aprovado, seu crédito já estará disponível em instantes.
          </p>
          <Link
            href="/laudo/novo"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", maxWidth: 320, height: 54, background: "var(--accent)",
              color: "#050505", borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Gerar laudo →
          </Link>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>✓</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 10 }}>
            Pagamento confirmado
          </h1>
          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 36, maxWidth: 300 }}>
            Seu crédito foi adicionado. Você já pode gerar um novo laudo.
          </p>
          <Link
            href="/laudo/novo"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", maxWidth: 320, height: 54, background: "var(--accent)",
              color: "#050505", borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Gerar laudo →
          </Link>
        </>
      )}
    </main>
  );
}
