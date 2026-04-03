"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp, signInWithGoogle } from "./actions";

export default function Cadastro() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setStatus("error");
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
          Crie sua conta
        </h1>
        <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6 }}>
          Leva 30 segundos. Primeiro checkup grátis.
        </p>
      </div>

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
          Continuar com Google
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
        <span style={{ fontSize: 12, color: "var(--t3)" }}>ou</span>
        <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
      </div>

      {/* Email + senha */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>Nome</label>
          <input name="name" type="text" placeholder="Seu nome" required style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>E-mail</label>
          <input name="email" type="email" placeholder="seu@email.com" required style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>WhatsApp</label>
          <input name="whatsapp" type="tel" placeholder="(11) 99999-9999" style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>Senha</label>
          <input name="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6} style={inputStyle} />
        </div>

        {errorMsg && <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>{errorMsg}</p>}

        <div style={{ marginTop: "auto", paddingBottom: 48, paddingTop: 16 }}>
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
            {status === "loading" ? "Criando..." : "Criar conta grátis"}
          </button>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--t3)", marginTop: 20 }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
