"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type ChecklistState = {
  id: number;
  title: string;
  category: string;
  severity: string;
  state: "ok" | "problema" | null;
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  images?: string[];
};

type ApiContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
    >;

function buildApiContent(text: string, images?: string[]): ApiContent {
  if (!images?.length) return text;
  const parts: Array<
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  > = [];
  for (const dataUri of images) {
    const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      parts.push({
        type: "image",
        source: { type: "base64", media_type: match[1], data: match[2] },
      });
    }
  }
  if (text.trim()) parts.push({ type: "text", text });
  else if (parts.length) parts.push({ type: "text", text: "Analise esta imagem." });
  return parts;
}

export default function Chat({
  laudoId,
  checklistState,
  carInfo,
}: {
  laudoId: string;
  checklistState: ChecklistState[];
  carInfo: { brand: string; model: string; year: number; km: number };
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, streaming, scrollToBottom]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function send() {
    const text = input.trim();
    if (!text && !images.length) return;
    if (streaming) return;

    const userMsg: Msg = {
      role: "user",
      content: text || "Analise esta imagem.",
      images: images.length ? [...images] : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setImages([]);
    setStreaming(true);

    const apiMessages = newMessages.map((m) => {
      if (m.role === "user" && m.images?.length) {
        return { role: m.role as "user" | "assistant", content: buildApiContent(m.content, m.images) };
      }
      return { role: m.role as "user" | "assistant", content: m.content };
    });

    const controller = new AbortController();
    abortRef.current = controller;

    // Timeout: 30s max per request
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          laudoId,
          messages: apiMessages,
          checklistState: checklistState.filter((i) => i.state !== null),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Erro ao conectar. Tente de novo." }]);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStreaming(false); return; }

      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                assistantText = parsed.error;
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content: assistantText };
                  return copy;
                });
                break;
              }
              if (parsed.text) {
                assistantText += parsed.text;
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content: assistantText };
                  return copy;
                });
              }
            } catch {}
          }
        }
      } finally {
        reader.releaseLock();
      }

      // If no response text came through
      if (!assistantText) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: "Sem resposta. Tente de novo." };
          return copy;
        });
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setMessages((prev) => [...prev, { role: "assistant", content: "Timeout — tente uma pergunta mais curta." }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Erro de conexão. Tente de novo." }]);
      }
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const answered = checklistState.filter((i) => i.state !== null);
  const problems = answered.filter((i) => i.state === "problema");

  // Closed state — trigger button
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "14px 16px",
          background: "var(--bg2)", border: "1px solid var(--bd)",
          borderRadius: "var(--rm)", cursor: "pointer",
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--ag)", color: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, flexShrink: 0,
        }}>AI</div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>
            Dúvida? Pergunte ao Pablo
          </div>
          <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 1 }}>
            Tire fotos e receba análise instantânea
          </div>
        </div>
        {messages.length > 0 && (
          <span style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 700,
            background: "var(--accent)", color: "#050505",
            borderRadius: 99, padding: "2px 8px",
          }}>{messages.length}</span>
        )}
      </button>
    );
  }

  // Open state — fullscreen overlay
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--bg0)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        paddingTop: "max(12px, env(safe-area-inset-top))",
        background: "var(--bg1)", borderBottom: "1px solid var(--bd)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "var(--ag)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900,
          }}>AI</div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>Pablo</span>
            {answered.length > 0 && (
              <div style={{ fontSize: 10, color: "var(--t4)", marginTop: 1 }}>
                {answered.length} itens respondidos{problems.length > 0 ? ` · ${problems.length} problema${problems.length > 1 ? "s" : ""}` : ""}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--bg2)", border: "1px solid var(--bd)",
            color: "var(--t2)", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", padding: "16px 16px",
          display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            padding: "16px 4px", gap: 14,
          }}>
            {/* Welcome message as assistant bubble */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                maxWidth: "90%", background: "var(--bg2)", color: "var(--t1)",
                borderRadius: 16, borderBottomLeftRadius: 4,
                padding: "14px 16px",
              }}>
                <div style={{ fontSize: 14, lineHeight: 1.65 }}>
                  {(() => {
                    const p = problems.length;
                    const a = answered.length;
                    const total = checklistState.length;
                    if (a === 0) {
                      return `Tô aqui pra te ajudar com o ${carInfo.brand} ${carInfo.model} ${carInfo.year}. Pode me mandar foto de qualquer parte do carro ou perguntar sobre os ${total} itens do checklist.`;
                    }
                    if (p > 0) {
                      return `Já vi que você marcou ${p} problema${p > 1 ? "s" : ""} no checklist (${a}/${total} itens). Manda foto dos pontos com problema ou me pergunta o que quiser.`;
                    }
                    return `${a}/${total} itens verificados e tudo OK até agora. Quer que eu analise alguma foto do carro ou tem alguma dúvida?`;
                  })()}
                </div>
              </div>
            </div>

            {/* Contextual suggestions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 4 }}>
              {(problems.length > 0
                ? [
                    `O que significa "${problems[0].title.toLowerCase()}"?`,
                    "Manda foto de um problema",
                    `Quanto custa pra resolver?`,
                  ]
                : [
                    `Pontos fracos do ${carInfo.model} ${carInfo.year}?`,
                    "Manda foto de uma peça",
                    `Com ${carInfo.km.toLocaleString("pt-BR")} km, o que checar?`,
                  ]
              ).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  style={{
                    fontSize: 13, fontWeight: 600, color: "var(--t1)",
                    background: "var(--bg2)", border: "1px solid var(--bd)",
                    borderRadius: 12, padding: "12px 16px", cursor: "pointer",
                    textAlign: "left",
                  }}
                >{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%",
              background: msg.role === "user" ? "var(--accent)" : "var(--bg2)",
              color: msg.role === "user" ? "#050505" : "var(--t1)",
              borderRadius: 16,
              borderBottomRightRadius: msg.role === "user" ? 4 : 16,
              borderBottomLeftRadius: msg.role === "assistant" ? 4 : 16,
              padding: "12px 16px",
            }}>
              {msg.images?.map((img, j) => (
                <img key={j} src={img} alt="" style={{
                  width: "100%", maxWidth: 240, borderRadius: 10,
                  marginBottom: msg.content ? 10 : 0, display: "block",
                }} />
              ))}
              {msg.content && (
                <div style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {msg.content}
                  {msg.role === "assistant" && streaming && i === messages.length - 1 && (
                    <span style={{
                      display: "inline-block", width: 6, height: 16,
                      background: "var(--accent)", marginLeft: 2,
                      animation: "blink 1s infinite", verticalAlign: "text-bottom",
                      borderRadius: 1,
                    }} />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div style={{
          display: "flex", gap: 8, padding: "8px 16px",
          overflowX: "auto", flexShrink: 0, background: "var(--bg0)",
        }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative", flexShrink: 0 }}>
              <img src={img} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover" }} />
              <button type="button" onClick={() => removeImage(i)} style={{
                position: "absolute", top: -6, right: -6, width: 20, height: 20,
                borderRadius: "50%", background: "var(--danger)", color: "#fff",
                border: "2px solid var(--bg0)", fontSize: 10, fontWeight: 900,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>x</button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 8,
        padding: "10px 12px",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        borderTop: "1px solid var(--bd)",
        background: "var(--bg1)", flexShrink: 0,
      }}>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} style={{ display: "none" }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />

        <button type="button" onClick={() => cameraRef.current?.click()} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--bg2)", border: "1px solid var(--bd)",
          color: "var(--t2)", cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>

        <button type="button" onClick={() => fileRef.current?.click()} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--bg2)", border: "1px solid var(--bd)",
          color: "var(--t3)", fontSize: 20, cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>+</button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte algo..."
          rows={1}
          style={{
            flex: 1, resize: "none",
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: 20, padding: "10px 16px",
            fontSize: 14, color: "var(--t1)",
            outline: "none", lineHeight: 1.4,
            maxHeight: 100, overflow: "auto",
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={streaming || (!input.trim() && !images.length)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: streaming || (!input.trim() && !images.length) ? "var(--bg2)" : "var(--accent)",
            color: streaming || (!input.trim() && !images.length) ? "var(--t4)" : "#050505",
            border: "none", fontSize: 18, fontWeight: 900,
            cursor: streaming ? "not-allowed" : "pointer", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >↑</button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
