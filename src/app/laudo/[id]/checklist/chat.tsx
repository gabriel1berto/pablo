"use client";

import { useState, useRef, useEffect } from "react";

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
}: {
  laudoId: string;
  checklistState: ChecklistState[];
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          laudoId,
          messages: apiMessages,
          checklistState: checklistState.filter((i) => i.state !== null),
        }),
      });

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Erro ao conectar. Tente novamente." }]);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStreaming(false); return; }

      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text: t } = JSON.parse(data);
            if (t) {
              assistantText += t;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erro de conexão. Tente novamente." }]);
    }
    setStreaming(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const answered = checklistState.filter((i) => i.state !== null);
  const problems = answered.filter((i) => i.state === "problema");

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
        }}>
          AI
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>
            Dúvida? Pergunte ao Pablo
          </div>
          <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 1 }}>
            Tire fotos e receba análise instantânea
          </div>
        </div>
      </button>
    );
  }

  return (
    <div style={{
      border: "1px solid var(--bd)", borderRadius: "var(--rm)",
      overflow: "hidden", background: "var(--bg1)",
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(false)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "var(--bg2)",
          borderBottom: "1px solid var(--bd)", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "var(--ag)", color: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 900,
          }}>AI</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>Pablo</span>
          {answered.length > 0 && (
            <span style={{ fontSize: 10, color: "var(--t4)" }}>
              vendo {answered.length} itens{problems.length > 0 ? ` · ${problems.length} problema${problems.length > 1 ? "s" : ""}` : ""}
            </span>
          )}
        </div>
        <span style={{ fontSize: 18, color: "var(--t4)" }}>-</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          height: 320, overflowY: "auto", padding: "12px 14px",
          display: "flex", flexDirection: "column", gap: 10,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 10px" }}>
            <div style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.6, marginBottom: 16 }}>
              Pergunte sobre o carro ou tire uma foto para análise.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {[
                "O preço tá justo?",
                "Esse desgaste é grave?",
                "O que verificar primeiro?",
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  style={{
                    fontSize: 11, fontWeight: 600, color: "var(--accent)",
                    background: "var(--ag)", border: "1px solid rgba(0,212,170,0.2)",
                    borderRadius: 99, padding: "5px 12px", cursor: "pointer",
                  }}
                >{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%",
              background: msg.role === "user" ? "var(--accent)" : "var(--bg3)",
              color: msg.role === "user" ? "#050505" : "var(--t1)",
              borderRadius: 14,
              borderBottomRightRadius: msg.role === "user" ? 4 : 14,
              borderBottomLeftRadius: msg.role === "assistant" ? 4 : 14,
              padding: "10px 14px",
            }}>
              {msg.images?.map((img, j) => (
                <img key={j} src={img} alt="" style={{
                  width: "100%", maxWidth: 200, borderRadius: 8,
                  marginBottom: msg.content ? 8 : 0, display: "block",
                }} />
              ))}
              {msg.content && (
                <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {msg.content}
                  {msg.role === "assistant" && streaming && i === messages.length - 1 && (
                    <span style={{
                      display: "inline-block", width: 5, height: 14,
                      background: "var(--accent)", marginLeft: 2,
                      animation: "blink 1s infinite", verticalAlign: "text-bottom",
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
        <div style={{ display: "flex", gap: 8, padding: "8px 14px 0", overflowX: "auto" }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: "relative", flexShrink: 0 }}>
              <img src={img} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />
              <button type="button" onClick={() => removeImage(i)} style={{
                position: "absolute", top: -6, right: -6, width: 18, height: 18,
                borderRadius: "50%", background: "var(--danger)", color: "#fff",
                border: "none", fontSize: 10, fontWeight: 900, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>x</button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 6,
        padding: "10px 12px 12px",
        borderTop: "1px solid var(--bd)",
      }}>
        {/* Hidden file inputs */}
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} style={{ display: "none" }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />

        {/* Camera button */}
        <button type="button" onClick={() => cameraRef.current?.click()} style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--bg3)", border: "1px solid var(--bd)",
          color: "var(--t2)", fontSize: 16, cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>

        {/* Gallery button */}
        <button type="button" onClick={() => fileRef.current?.click()} style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--bg3)", border: "1px solid var(--bd)",
          color: "var(--t3)", fontSize: 16, cursor: "pointer", flexShrink: 0,
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
            background: "var(--bg3)", border: "1px solid var(--bd)",
            borderRadius: 18, padding: "8px 14px",
            fontSize: 13, color: "var(--t1)",
            outline: "none", lineHeight: 1.4,
            maxHeight: 80, overflow: "auto",
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={streaming || (!input.trim() && !images.length)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: streaming || (!input.trim() && !images.length) ? "var(--bg3)" : "var(--accent)",
            color: streaming || (!input.trim() && !images.length) ? "var(--t4)" : "#050505",
            border: "none", fontSize: 16, fontWeight: 900,
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
