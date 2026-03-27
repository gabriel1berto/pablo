"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/cadastro/actions";

export default function Login() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const result = await signUp(fd);
    if (result?.error) {
      setErro(result.error);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      <div style={{ paddingTop: 56 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>
            pa<span style={{ color: "var(--accent)" }}>b</span>lo
          </span>
        </Link>
      </div>

      {status === "sent" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 80 }}>
          <div style={{ fontSize: 32, marginBottom: 24 }}>✉️</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.6px", marginBottom: 10 }}>
            Verifique seu e-mail
          </h2>
          <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.6 }}>
            Enviamos um link de acesso. Clique nele para entrar.
          </p>
          <p style={{ fontSize: 13, color: "var(--t3)", marginTop: 10 }}>
            Não recebeu? Verifique a pasta de spam.
          </p>
        </div>
      ) : (
        <>
          <div style={{ paddingTop: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.7px", lineHeight: 1.15, marginBottom: 10 }}>
              Entrar
            </h1>
            <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6 }}>
              Vamos enviar um link de acesso para o seu e-mail.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>E-mail</label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                style={{
                  height: 50,
                  background: "var(--bg2)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "var(--rs)",
                  color: "var(--t1)",
                  fontSize: 15,
                  padding: "0 16px",
                  outline: "none",
                  width: "100%",
                }}
              />
            </div>

            {status === "error" && (
              <p style={{ fontSize: 13, color: "var(--danger)" }}>{erro}</p>
            )}

            <div style={{ paddingTop: 8, paddingBottom: 48 }}>
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: 54,
                  background: status === "loading" ? "#00a884" : "var(--accent)",
                  color: "#050505",
                  border: "none",
                  borderRadius: "var(--rs)",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                }}
              >
                {status === "loading" ? "Enviando..." : "Enviar link de acesso →"}
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
