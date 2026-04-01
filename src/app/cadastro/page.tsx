"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "./actions";

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
          Criar conta
        </h1>
        <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6 }}>
          Leva 30 segundos. Primeiro laudo é grátis.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>Nome</label>
          <input name="name" type="text" placeholder="Seu nome" required style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>E-mail</label>
          <input name="email" type="email" placeholder="seu@email.com" required style={inputStyle} />
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
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
            <span style={{ fontSize: 12, color: "var(--t3)" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--t3)" }}>
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
