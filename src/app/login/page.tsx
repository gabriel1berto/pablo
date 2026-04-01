"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, verifyOtpCode } from "@/app/cadastro/actions";

export default function Login() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "verifying" | "error">("idle");
  const [erro, setErro] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const emailValue = fd.get("email") as string;
    const result = await signIn(fd);
    if (result?.error) {
      setErro(result.error);
      setStatus("error");
    } else {
      setEmail(emailValue);
      setStatus("sent");
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("verifying");
    const fd = new FormData(e.currentTarget);
    const token = (fd.get("token") as string).trim();
    const result = await verifyOtpCode(email, token);
    if (result?.error) {
      setErro(result.error);
      setStatus("sent");
    }
  }

  const inp = {
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

  const btn = (loading: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 54,
    background: loading ? "#00a884" : "var(--accent)",
    color: "#050505",
    border: "none",
    borderRadius: "var(--rs)",
    fontSize: 15,
    fontWeight: 800,
    cursor: loading ? "not-allowed" : "pointer",
  } as React.CSSProperties);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ paddingTop: 56 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/logo-pablo.jpeg" alt="pablo" style={{ height: 28 }} />
        </Link>
      </div>

      {status === "sent" || status === "verifying" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 80 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 8 }}>
            Código enviado
          </h2>
          <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, marginBottom: 24 }}>
            Digite o código que chegou em <strong>{email}</strong>.
          </p>
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              name="token"
              type="text"
              inputMode="numeric"
              placeholder="00000000"
              required
              maxLength={8}
              autoFocus
              style={{ ...inp, fontSize: 18, letterSpacing: 4, textAlign: "center" }}
            />
            {erro && <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>{erro}</p>}
            <button type="submit" disabled={status === "verifying"} style={btn(status === "verifying")}>
              {status === "verifying" ? "Verificando..." : "Entrar →"}
            </button>
          </form>
          <p style={{ fontSize: 13, color: "var(--t3)", marginTop: 16, textAlign: "center" }}>
            Não recebeu?{" "}
            <button onClick={() => setStatus("idle")} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Reenviar
            </button>
          </p>
        </div>
      ) : (
        <>
          <div style={{ paddingTop: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.7px", lineHeight: 1.15, marginBottom: 10 }}>
              Entrar
            </h1>
            <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6 }}>
              Vamos enviar um código para o seu e-mail.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>E-mail</label>
              <input name="email" type="email" placeholder="seu@email.com" required style={inp} />
            </div>

            {status === "error" && <p style={{ fontSize: 13, color: "var(--danger)" }}>{erro}</p>}

            <div style={{ paddingTop: 8, paddingBottom: 48 }}>
              <button type="submit" disabled={status === "loading"} style={btn(status === "loading")}>
                {status === "loading" ? "Enviando..." : "Enviar código →"}
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
