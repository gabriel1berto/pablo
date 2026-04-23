"use client";

import { useState, useRef } from "react";
import { uploadMedia } from "./actions";

// ── Estilos compartilhados ──────────────────────────────

export const C = {
  brand: "#F25C05",
  text: "#1A1A19",
  textSec: "#6B6A65",
  textTer: "#9C9B95",
  bg: "#FFFFFF",
  bgSec: "#F5F4F0",
  border: "#E3E2DD",
  green: "#1D9E75",
  yellow: "#BA7517",
};

export const pageStyle: React.CSSProperties = {
  minHeight: "100vh", maxWidth: 480, margin: "0 auto", padding: "0 24px 80px",
};

export const headerStyle: React.CSSProperties = {
  paddingTop: 52, paddingBottom: 20,
};

export const sectionTitle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: C.textTer,
  textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 12, marginTop: 24,
};

export const dropdownStyle: React.CSSProperties = {
  width: "100%", height: 46, padding: "0 12px",
  background: C.bgSec, border: `1px solid ${C.border}`,
  borderRadius: 8, fontSize: 13, color: C.text,
  WebkitAppearance: "none", outline: "none",
};

export const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: C.textSec, marginBottom: 6, display: "block",
};

export const btnPrimary: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: "100%", height: 54,
  background: C.brand, color: "#fff", border: "none", borderRadius: 8,
  fontSize: 15, fontWeight: 700, cursor: "pointer",
};

export const btnSecondary: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: "100%", height: 46,
  background: "transparent", color: C.textSec,
  border: `1px solid ${C.border}`, borderRadius: 8,
  fontSize: 13, fontWeight: 500, cursor: "pointer", textDecoration: "none",
};

// ── Stepper ─────────────────────────────────────────────

export function Stepper({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div style={headerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: C.textTer }}>Passo {step} de {total}</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i < step ? C.brand : C.border,
          }} />
        ))}
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>{label}</h1>
    </div>
  );
}

// ── Photo Upload ────────────────────────────────────────

export function PhotoUpload({
  laudoId, tab, mediaKey, label, onUploaded,
}: {
  laudoId: string; tab: string; mediaKey: string; label: string;
  onUploaded?: (url: string) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("laudoId", laudoId);
    fd.set("tab", tab);
    fd.set("mediaKey", mediaKey);
    fd.set("mediaType", "photo");
    fd.set("file", file);
    const result = await uploadMedia(fd);
    if (result.publicUrl) {
      setUrl(result.publicUrl);
      onUploaded?.(result.publicUrl);
    } else {
      setError(result.error ?? "Erro no upload");
    }
    setUploading(false);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        aspectRatio: "3/2", borderRadius: 8, overflow: "hidden",
        background: url ? "none" : C.bgSec, border: `1px dashed ${error ? "#A32D2D" : C.border}`,
        cursor: "pointer", position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}
    >
      {url ? (
        <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <>
          <span style={{ fontSize: 24, color: C.textTer }}>📷</span>
          <span style={{ fontSize: 11, color: error ? "#A32D2D" : C.textTer, marginTop: 4 }}>
            {uploading ? "Enviando..." : error ?? label}
          </span>
        </>
      )}
      <input
        ref={inputRef} type="file" accept="image/*" capture="environment"
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ── Video Upload ────────────────────────────────────────

export function VideoUpload({
  laudoId, tab, mediaKey, label, minSeconds,
}: {
  laudoId: string; tab: string; mediaKey: string; label: string; minSeconds: number;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.set("laudoId", laudoId);
    fd.set("tab", tab);
    fd.set("mediaKey", mediaKey);
    fd.set("mediaType", "video");
    fd.set("file", file);
    const result = await uploadMedia(fd);
    if (result.publicUrl) {
      setUrl(result.publicUrl);
    } else {
      setError(result.error ?? "Erro no upload");
    }
    setUploading(false);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      style={{
        aspectRatio: "16/9", borderRadius: 8, overflow: "hidden",
        background: url ? "#000" : "#2C2C2A", border: `1px dashed ${C.border}`,
        cursor: "pointer", position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}
    >
      {url ? (
        <video src={url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 20 }}>🎥</span>
          </div>
          <span style={{ fontSize: 11, color: error ? "#A32D2D" : "#ccc", marginTop: 8 }}>
            {uploading ? "Enviando..." : error ?? `${label} (mín. ${minSeconds}s)`}
          </span>
        </>
      )}
      <input
        ref={inputRef} type="file" accept="video/*" capture="environment"
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ── Dropdown ────────────────────────────────────────────

export function Dropdown({
  label, name, options, value, onChange,
}: {
  label: string; name: string;
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      <select
        name={name} value={value}
        onChange={(e) => onChange(e.target.value)}
        style={dropdownStyle}
      >
        <option value="">Selecionar</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
