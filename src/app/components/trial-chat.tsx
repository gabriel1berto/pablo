"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type Step = "closed" | "email" | "chat" | "done";

export default function TrialChat() {
  const [step, setStep] = useState<Step>("closed");
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) continue;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStep("chat");
  }

  async function send() {
    const text = input.trim();
    if (!text && !images.length) return;
    if (streaming) return;
    setStreaming(true);

    // Build content
    let content: string | Array<any> = text || "Analise esta imagem.";
    if (images.length) {
      const parts: Array<any> = [];
      for (const uri of images) {
        const match = uri.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          parts.push({ type: "image", source: { type: "base64", media_type: match[1], data: match[2] } });
        }
      }
      parts.push({ type: "text", text: text || "Analise esta imagem." });
      content = parts;
    }

    try {
      const res = await fetch("/api/chat-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, email }),
      });

      if (!res.ok) { setStreaming(false); return; }
      const reader = res.body?.getReader();
      if (!reader) { setStreaming(false); return; }

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const { text: t } = JSON.parse(data);
            if (t) { result += t; setResponse(result); }
          } catch {}
        }
      }
      reader.releaseLock();
    } catch {}
    setStreaming(false);
    setStep("done");
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, resize: "none", background: "var(--bg3)", border: "1px solid var(--bd)",
    borderRadius: 18, padding: "10px 16px", fontSize: 14, color: "var(--t1)",
    outline: "none", lineHeight: 1.4, maxHeight: 80, overflow: "auto",
  };

  // ── Closed ──
  if (step === "closed") {
    return (
      <button
        type="button"
        onClick={() => setStep("email")}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          width: "100%", padding: "16px",
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <img src="/icon-pablo.png" alt="P" style={{ width: 36, height: 36, borderRadius: "50%" }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>
            Faça uma pergunta para o Pablo
          </div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>
            Sobre qualquer carro. Sem criar conta.
          </div>
        </div>
      </button>
    );
  }

  // ── Email capture ──
  if (step === "email") {
    return (
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--bd)",
        borderRadius: "var(--rm)", padding: "20px", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <img src="/icon-pablo.png" alt="P" style={{ width: 32, height: 32, borderRadius: "50%" }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>Fale com o Pablo</div>
        </div>
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 16 }}>
          Coloque seu e-mail e faça uma pergunta. Pode ser sobre um carro que você está olhando, um barulho, ou mande a foto de uma peça.
        </div>
        <form onSubmit={handleEmailSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            style={{
              flex: 1, height: 44, background: "var(--bg3)", border: "1px solid var(--bd)",
              borderRadius: "var(--rs)", padding: "0 14px", fontSize: 14,
              color: "var(--t1)", outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              height: 44, padding: "0 20px", background: "var(--accent)", color: "#050505",
              border: "none", borderRadius: "var(--rs)", fontSize: 13, fontWeight: 800,
              cursor: "pointer", flexShrink: 0,
            }}
          >
            Enviar
          </button>
        </form>
      </div>
    );
  }

  // ── Chat (1 pergunta) ──
  if (step === "chat") {
    return (
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--bd)",
        borderRadius: "var(--rm)", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 16px", borderBottom: "1px solid var(--bd)",
        }}>
          <img src="/icon-pablo.png" alt="P" style={{ width: 28, height: 28, borderRadius: "50%" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>Pablo</span>
        </div>

        <div style={{ padding: "16px" }}>
          <div style={{
            display: "flex", justifyContent: "flex-start", marginBottom: 14,
          }}>
            <div style={{
              background: "var(--bg3)", color: "var(--t1)",
              borderRadius: "14px 14px 14px 4px", padding: "12px 16px",
              maxWidth: "90%", fontSize: 13, lineHeight: 1.6,
            }}>
              Me conta: qual carro você está olhando? Marca, modelo, ano e km. Pode mandar foto também. Uma pergunta e eu mostro como posso ajudar.
            </div>
          </div>

          {/* Image previews */}
          {images.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover" }} />
                  <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} style={{
                    position: "absolute", top: -6, right: -6, width: 20, height: 20,
                    borderRadius: "50%", background: "var(--danger)", color: "#fff",
                    border: "2px solid var(--bg2)", fontSize: 10, fontWeight: 900,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>x</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} style={{ display: "none" }} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
            <button type="button" onClick={() => cameraRef.current?.click()} style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "var(--bg3)", border: "1px solid var(--bd)",
              color: "var(--t2)", cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "var(--bg3)", border: "1px solid var(--bd)",
              color: "var(--t3)", fontSize: 20, cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>+</button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Sua pergunta..."
              rows={1}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={send}
              disabled={streaming || (!input.trim() && !images.length)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: streaming || (!input.trim() && !images.length) ? "var(--bg3)" : "var(--accent)",
                color: streaming || (!input.trim() && !images.length) ? "var(--t4)" : "#050505",
                border: "none", fontSize: 18, fontWeight: 900,
                cursor: streaming ? "not-allowed" : "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >↑</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Done (response + CTA) ──
  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--bd)",
      borderRadius: "var(--rm)", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px", borderBottom: "1px solid var(--bd)",
      }}>
        <img src="/icon-pablo.png" alt="P" style={{ width: 28, height: 28, borderRadius: "50%" }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>Pablo</span>
      </div>

      <div style={{ padding: "16px" }}>
        {/* User message */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <div style={{
            background: "var(--accent)", color: "#050505",
            borderRadius: "14px 14px 4px 14px", padding: "10px 14px",
            maxWidth: "82%", fontSize: 13, lineHeight: 1.6,
          }}>
            {images.length > 0 && images.map((img, i) => (
              <img key={i} src={img} alt="" style={{ width: "100%", maxWidth: 180, borderRadius: 8, marginBottom: 6, display: "block" }} />
            ))}
            {input || "Analise esta imagem."}
          </div>
        </div>

        {/* Pablo response */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
          <div style={{
            background: "var(--bg3)", color: "var(--t1)",
            borderRadius: "14px 14px 14px 4px", padding: "12px 16px",
            maxWidth: "90%", fontSize: 13, lineHeight: 1.65,
            whiteSpace: "pre-wrap",
          }}>
            {response}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.12)",
          borderRadius: 12, padding: "14px 16px", textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>
            Essa foi só uma amostra. No laudo completo, o Pablo analisa o carro inteiro.
          </div>
          <Link
            href="/cadastro"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              height: 42, padding: "0 24px", background: "var(--accent)", color: "#050505",
              borderRadius: "var(--rs)", fontSize: 13, fontWeight: 800, textDecoration: "none",
              marginTop: 4,
            }}
          >
            Fazer meu laudo
          </Link>
        </div>
      </div>
    </div>
  );
}
