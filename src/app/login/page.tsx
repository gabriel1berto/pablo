"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, resetPassword, signInWithGoogle } from "@/app/cadastro/actions";

export default function Login() {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "reset-sent">("idle");
  const [erro, setErro] = useState("");

  useEffect(() => {
    document.title = "Entrar — Pablo";
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErro("");
    const fd = new FormData(e.currentTarget);
    const result = await signIn(fd);
    if (result?.error) {
      setErro(result.error);
      setStatus("error");
    }
  }

  async function handleReset() {
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const email = emailInput?.value;
    if (!email) {
      setErro("Preenche o e-mail primeiro.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    const fd = new FormData();
    fd.set("email", email);
    const result = await resetPassword(fd);
    if (result?.error) {
      setErro(result.error);
      setStatus("error");
    } else {
      setStatus("reset-sent");
    }
  }

  const inputStyle: React.CSSProperties = {
    height: 50,
    background: "var(--bg2)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "var(--rs)",
    color: "var(--t1)",
    fontSize: 15,
    padding: "0 16px",
    outline: "none",
    width: "100%",
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ paddingTop: 56 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 44 }} />
        </Link>
      </div>

      <div style={{ paddingTop: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.7px", lineHeight: 1.15, marginBottom: 10 }}>
          Entrar
        </h1>
        <p style={{ color: "var(--t3)", fontSize: 14 }}>Seu checkup de veículos.</p>
      </div>

      {status === "reset-sent" ? (
        <div style={{ paddingTop: 24 }}>
          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 16 }}>
            Link de redefinição enviado. Confere seu e-mail.
          </p>
          <button
            onClick={() => setStatus("idle")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--accent)", fontWeight: 700,
            }}
          >
            Voltar pro login
          </button>
        </div>
      ) : (
        <>
          {/* Google */}
          <form action={signInWithGoogle} style={{ marginTop: 24 }}>
            <button
              type="submit"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                width: "100%", height: 50,
                background: "var(--bg2)", border: "1px solid var(--bd)",
                borderRadius: "var(--rs)", fontSize: 14, fontWeight: 700,
                color: "var(--t1)", cursor: "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Entrar com Google
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
            <span style={{ fontSize: 12, color: "var(--t3)" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
          </div>

          {/* Email + senha */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>E-mail</label>
              <input name="email" type="email" placeholder="seu@email.com" required style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>Senha</label>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 11, color: "var(--t3)",
                  }}
                >
                  Esqueci a senha
                </button>
              </div>
              <input name="password" type="password" placeholder="Sua senha" required style={inputStyle} />
            </div>

            {erro && <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>{erro}</p>}

            <div style={{ paddingTop: 8, paddingBottom: 48 }}>
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "100%", height: 54,
                  background: status === "loading" ? "#00a884" : "var(--accent)",
                  color: "#050505", border: "none", borderRadius: "var(--rs)",
                  fontSize: 15, fontWeight: 800,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                }}
              >
                {status === "loading" ? "Entrando..." : "Entrar"}
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "var(--t3)", marginTop: 20 }}>
                Não tem conta?{" "}
                <Link href="/cadastro" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
