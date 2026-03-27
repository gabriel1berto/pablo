"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp, verifyOtpCode } from "./actions";

export default function Cadastro() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "verifying" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    const result = await signUp(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setStatus("error");
    } else {
      setEmail(emailValue);
      setStatus("sent");
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("verifying");
    const formData = new FormData(e.currentTarget);
    const token = (formData.get("token") as string).trim();
    const result = await verifyOtpCode(email, token);
    if (result?.error) {
      setErrorMsg(result.error);
      setStatus("sent");
    }
  }

  const inputStyle = {
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

  const btnStyle = (loading: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 54,
    background: loading ? "var(--accent-dim, #00a884)" : "var(--accent)",
    color: "#050505",
    border: "none",
    borderRadius: "var(--rs)",
    fontSize: 15,
    fontWeight: 800,
    cursor: loading ? "not-allowed" : "pointer",
    letterSpacing: "-0.2px",
  } as React.CSSProperties);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ paddingTop: 56 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>
            pa<span style={{ color: "var(--accent)" }}>b</span>lo
          </span>
        </Link>
      </div>

      {status === "sent" || status === "verifying" ? (
        /* ── Digitar código ── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 80 }}>
          <div style={{ fontSize: 32, marginBottom: 24 }}>✉️</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.6px", marginBottom: 10 }}>
            Verifique seu e-mail
          </h2>
          <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.6, marginBottom: 28 }}>
            Enviamos um código de 6 dígitos para <strong>{email}</strong>.
          </p>
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              name="token"
              type="text"
              inputMode="numeric"
              placeholder="00000000"
              required
              maxLength={8}
              style={{ ...inputStyle, fontSize: 24, letterSpacing: 8, textAlign: "center" }}
            />
            {errorMsg && <p style={{ fontSize: 13, color: "var(--danger)" }}>{errorMsg}</p>}
            <button type="submit" disabled={status === "verifying"} style={btnStyle(status === "verifying")}>
              {status === "verifying" ? "Verificando..." : "Confirmar código →"}
            </button>
          </form>
          <p style={{ fontSize: 13, color: "var(--t3)", marginTop: 16, textAlign: "center" }}>
            Não recebeu?{" "}
            <button onClick={() => setStatus("idle")} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Tentar novamente
            </button>
          </p>
        </div>
      ) : (
        /* ── Formulário ── */
        <>
          <div style={{ paddingTop: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.7px", lineHeight: 1.15, marginBottom: 10 }}>
              Criar conta<br />gratuita
            </h1>
            <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6 }}>
              Salve o laudo, acesse de qualquer lugar e receba alertas sobre o veículo.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32, flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>Nome</label>
              <input name="name" type="text" placeholder="Seu nome completo" required style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>E-mail</label>
              <input name="email" type="email" placeholder="seu@email.com" required style={inputStyle} />
            </div>

            {status === "error" && <p style={{ fontSize: 13, color: "var(--danger)" }}>{errorMsg}</p>}

            <p style={{ fontSize: 11, color: "var(--t3)", textAlign: "center", lineHeight: 1.6 }}>
              Ao continuar você concorda com os{" "}
              <span style={{ color: "var(--accent)" }}>Termos de Uso</span> e{" "}
              <span style={{ color: "var(--accent)" }}>Política de Privacidade</span>
            </p>

            <div style={{ marginTop: "auto", paddingBottom: 48, paddingTop: 16 }}>
              <button type="submit" disabled={status === "loading"} style={btnStyle(status === "loading")}>
                {status === "loading" ? "Enviando..." : "Continuar →"}
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
        </>
      )}
    </main>
  );
}
