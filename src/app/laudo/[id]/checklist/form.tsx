"use client";

import { useState, useRef } from "react";
import { salvarChecklist } from "./actions";
import Chat from "./chat";
import { createClient } from "@/lib/supabase/client";

type Issue = {
  id: number;
  category: string;
  title: string;
  description: string;
  severity: "critical" | "warn";
  how_to_check: string | null;
  why_important: string | null;
  if_bad: string | null;
  repair_cost: string | null;
};

type State = "ok" | "problema";
type Level = "leigo" | "preparado" | null;
type PhotoData = { url: string; analysis: string | null; analyzing: boolean };

const CAT_LABEL: Record<string, string> = {
  motor: "Motor", transmissao: "Transmissão", suspensao: "Suspensão",
  freios: "Freios", pneus: "Pneus", carroceria: "Carroceria",
  eletrica: "Elétrica", documentacao: "Documentação",
};

const SEV: Record<string, { color: string; label: string }> = {
  critical: { color: "var(--danger)", label: "Crítico" },
  warn: { color: "var(--warn)", label: "Atenção" },
};

const MECHANIC_KEYWORDS = [
  "elevador", "desmontag", "oficina", "mecânico", "mecanic",
  "técnico", "técnica", "perito", "escâner", "scanner", "diagnóstico", "diagnos",
  "compressão", "torquímetro", "multímetro", "osciloscópio",
];

function requiresMechanic(issue: Issue): boolean {
  const text = [(issue.how_to_check ?? ""), (issue.if_bad ?? ""), (issue.description ?? "")].join(" ").toLowerCase();
  return MECHANIC_KEYWORDS.some((k) => text.includes(k));
}

// ── Componente de foto por item ──────────────────────────
function PhotoCapture({
  issueId, issueTitle, category, carInfo, onPhoto,
}: {
  issueId: number;
  issueTitle: string;
  category: string;
  carInfo: { brand: string; model: string; year: number; km: number };
  onPhoto: (id: number, data: PhotoData) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      // 1. Upload pro Supabase Storage
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${issueId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("laudo-photos")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error("[photo] upload error:", uploadError);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("laudo-photos")
        .getPublicUrl(path);

      const photoUrl = urlData.publicUrl;

      // Notifica o form com a URL (análise começa depois)
      onPhoto(issueId, { url: photoUrl, analysis: null, analyzing: true });

      // 2. Converter pra base64 e chamar análise
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        try {
          const res = await fetch("/api/analyze-photo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64,
              mediaType: file.type,
              itemTitle: issueTitle,
              category,
              carModel: `${carInfo.brand} ${carInfo.model}`,
              carYear: carInfo.year,
              carKm: carInfo.km,
            }),
          });
          if (res.ok) {
            const analysis = await res.json();
            onPhoto(issueId, { url: photoUrl, analysis: JSON.stringify(analysis), analyzing: false });
          } else {
            onPhoto(issueId, { url: photoUrl, analysis: null, analyzing: false });
          }
        } catch {
          onPhoto(issueId, { url: photoUrl, analysis: null, analyzing: false });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("[photo] error:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{
          flex: "0 0 auto", height: 36, fontSize: 11, fontWeight: 700,
          border: "1px solid var(--bg4)", borderRadius: 8, cursor: "pointer",
          background: "var(--bg3)", color: "var(--t3)",
          transition: "all .12s", padding: "0 10px",
          opacity: uploading ? 0.5 : 1,
        }}
      >
        {uploading ? "..." : "📷"}
      </button>
    </>
  );
}

// ── Resultado da análise de foto ─────────────────────────
function AnalysisResult({ analysis, photoUrl }: { analysis: string; photoUrl: string }) {
  let parsed: { diagnosis?: string; severity?: string; repair_cost?: string | null; recommendation?: string } = {};
  try { parsed = JSON.parse(analysis); } catch { return null; }

  const sevColor = parsed.severity === "critical" ? "var(--danger)"
    : parsed.severity === "warning" ? "var(--warn)"
    : parsed.severity === "ok" ? "var(--ok)"
    : "var(--t3)";

  const sevBg = parsed.severity === "critical" ? "rgba(239,68,68,0.08)"
    : parsed.severity === "warning" ? "rgba(234,179,8,0.08)"
    : parsed.severity === "ok" ? "rgba(34,197,94,0.08)"
    : "var(--bg3)";

  return (
    <div style={{
      marginLeft: 16, marginBottom: 10,
      background: sevBg, border: `1px solid ${sevColor}22`,
      borderRadius: 10, overflow: "hidden",
    }}>
      <div style={{ display: "flex", gap: 10 }}>
        <img
          src={photoUrl}
          alt="foto"
          style={{ width: 72, height: 72, objectFit: "cover", flexShrink: 0 }}
        />
        <div style={{ padding: "10px 10px 10px 0", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: sevColor, marginBottom: 3 }}>
            {parsed.severity === "ok" ? "✓ OK" : parsed.severity === "critical" ? "⚠ Crítico" : parsed.severity === "warning" ? "⚠ Atenção" : "📷 Análise"}
          </div>
          <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>
            {parsed.diagnosis}
          </div>
          {parsed.repair_cost && (
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>
              Reparo: <strong style={{ color: "var(--t2)" }}>{parsed.repair_cost}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Form principal ───────────────────────────────────────
export default function ChecklistForm({
  laudoId, issues, carInfo, savedStates,
}: {
  laudoId: string;
  issues: Issue[];
  carInfo: { brand: string; model: string; year: number; km: number };
  savedStates?: Record<string, string>;
}) {
  const [level, setLevel] = useState<Level>(null);
  const [states, setStates] = useState<Record<number, State>>(() => {
    if (!savedStates) return {};
    const initial: Record<number, State> = {};
    for (const [key, val] of Object.entries(savedStates)) {
      if (val === "ok" || val === "problema") initial[parseInt(key)] = val;
    }
    return initial;
  });
  const [photos, setPhotos] = useState<Record<number, PhotoData>>({});
  const [openItems, setOpenItems] = useState<Set<number>>(() => {
    const open = new Set<number>();
    const seenCats = new Set<string>();
    for (const issue of issues) {
      if (!seenCats.has(issue.category)) { open.add(issue.id); seenCats.add(issue.category); }
    }
    return open;
  });
  const [mechanicOpen, setMechanicOpen] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [helpQuestion, setHelpQuestion] = useState<string | null>(null);

  const getState = (id: number): State | null => states[id] ?? null;
  const setState = (id: number, s: State) => setStates((prev) => ({ ...prev, [id]: s }));
  const toggleOpen = (id: number) => setOpenItems((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleMechanic = (id: number) => setMechanicOpen((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handlePhoto = (id: number, data: PhotoData) => setPhotos((prev) => ({ ...prev, [id]: data }));

  const grouped = issues.reduce<Record<string, Issue[]>>((acc, issue) => {
    (acc[issue.category] ??= []).push(issue);
    return acc;
  }, {});

  const answered = Object.keys(states).length;
  const problemCount = Object.values(states).filter((s) => s === "problema").length;
  const photoCount = Object.values(photos).filter((p) => p.url).length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const fd = new FormData();
    issues.forEach((issue) => {
      fd.append("item_id", String(issue.id));
      fd.append(`item_state_${issue.id}`, states[issue.id] ?? "nd");
      const photo = photos[issue.id];
      if (photo?.url) fd.append(`item_photo_${issue.id}`, photo.url);
      if (photo?.analysis) fd.append(`item_analysis_${issue.id}`, photo.analysis);
    });
    const result = await salvarChecklist(laudoId, fd);
    if (result?.error) { setErro(result.error); setLoading(false); }
  }

  // ── Level selector ─────────────────────────────────
  if (level === null) {
    return (
      <div style={{ paddingTop: 16, paddingBottom: 48 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--t1)", marginBottom: 6, letterSpacing: "-0.3px" }}>
          Quanto você entende de carro?
        </div>
        <div style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.5, marginBottom: 24 }}>
          O Pablo vai adaptar a linguagem pra você.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button" onClick={() => setLevel("leigo")} style={{
            display: "flex", alignItems: "flex-start", gap: 14,
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: "var(--rm)", padding: "16px", cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ag)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{"👀"}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 3 }}>Sei pouco de carro</div>
              <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>O Pablo vai te guiar com linguagem simples.</div>
            </div>
          </button>
          <button type="button" onClick={() => setLevel("preparado")} style={{
            display: "flex", alignItems: "flex-start", gap: 14,
            background: "var(--bg2)", border: "1px solid var(--bd)",
            borderRadius: "var(--rm)", padding: "16px", cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg3)", color: "var(--t2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{"🔧"}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", marginBottom: 3 }}>Entendo de carro</div>
              <div style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>Linguagem técnica, sem simplificar.</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ── Checklist form ─────────────────────────────────
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: "var(--t3)" }}>
          {issues.length} itens · {level === "leigo" ? "linguagem simples" : "linguagem técnica"}
        </span>
        <button type="button" onClick={() => setLevel(null)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: "var(--t4)", textDecoration: "underline", textUnderlineOffset: "2px",
        }}>Mudar</button>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: "var(--t4)",
            textTransform: "uppercase", letterSpacing: "0.8px",
            paddingBottom: 10, borderBottom: "1px solid var(--bd)", marginBottom: 4,
          }}>
            {CAT_LABEL[cat] ?? cat}
          </div>

          {items.map((issue) => {
            const sev = SEV[issue.severity];
            const state = getState(issue.id);
            const isOpen = openItems.has(issue.id);
            const hasTip = !!(issue.how_to_check || issue.if_bad);
            const needsMechanic = requiresMechanic(issue);
            const isMechanicExpanded = mechanicOpen.has(issue.id);
            const photo = photos[issue.id];

            return (
              <div key={issue.id} style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {/* Title row */}
                <div onClick={() => hasTip && toggleOpen(issue.id)} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  marginBottom: 10, cursor: hasTip ? "pointer" : "default",
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: sev?.color ?? "var(--t3)", flexShrink: 0, marginTop: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", lineHeight: 1.3 }}>
                      {issue.title}
                      {sev && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                          background: issue.severity === "critical" ? "var(--dg)" : "var(--wg)", color: sev.color,
                        }}>{sev.label}</span>
                      )}
                    </div>
                  </div>
                  {hasTip && (
                    <span style={{
                      fontSize: 14, color: "var(--t4)", flexShrink: 0, marginTop: 3,
                      display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .15s",
                    }}>{"▾"}</span>
                  )}
                </div>

                {/* Mechanic badge */}
                {needsMechanic && (
                  <div style={{ marginLeft: 16, marginBottom: 10 }}>
                    <button type="button" onClick={() => toggleMechanic(issue.id)} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 11, fontWeight: 700, color: "var(--warn)", background: "var(--wg)",
                      border: "1px solid rgba(245,166,35,0.2)", borderRadius: 99, padding: "4px 10px", cursor: "pointer",
                    }}>
                      {"🔧"} Precisa de mecânico
                      <span style={{ fontSize: 10, display: "inline-block", transform: isMechanicExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .15s" }}>{"▾"}</span>
                    </button>
                    {isMechanicExpanded && (
                      <div style={{ background: "var(--bg3)", borderRadius: 8, padding: "10px 12px", marginTop: 8, fontSize: 12, color: "var(--t2)", lineHeight: 1.55 }}>
                        Esse item precisa de um mecânico ou ferramenta pra verificar direito.
                        Se já levou numa oficina, marca <strong style={{ color: "var(--t1)" }}>OK</strong> ou <strong style={{ color: "var(--t1)" }}>Problema</strong>.
                        Se não verificou, pula — não vai afetar o laudo.
                      </div>
                    )}
                  </div>
                )}

                {/* Inline tip */}
                {isOpen && hasTip && (
                  <div style={{ marginLeft: 16, marginBottom: 10, background: "var(--bg3)", borderRadius: 8, padding: "10px 12px" }}>
                    {issue.how_to_check && (
                      <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55, marginBottom: (issue.if_bad || issue.repair_cost) ? 6 : 0 }}>
                        <span style={{ fontWeight: 700, color: "var(--t3)" }}>Como verificar: </span>{issue.how_to_check}
                      </div>
                    )}
                    {issue.if_bad && (
                      <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55, marginBottom: issue.repair_cost ? 4 : 0 }}>
                        <span style={{ fontWeight: 700, color: "var(--t3)" }}>Se tiver problema: </span>{issue.if_bad}
                      </div>
                    )}
                    {issue.repair_cost && (
                      <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 4 }}>
                        Reparo estimado: <strong style={{ color: "var(--t2)" }}>{issue.repair_cost}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Análise de foto (se existir) */}
                {photo?.analyzing && (
                  <div style={{ marginLeft: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <img src={photo.url} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                    <span style={{ fontSize: 12, color: "var(--t3)" }}>Analisando foto...</span>
                  </div>
                )}
                {photo?.analysis && !photo.analyzing && (
                  <AnalysisResult analysis={photo.analysis} photoUrl={photo.url} />
                )}

                {/* OK / Problema / Foto / Ajuda */}
                <div style={{ display: "flex", gap: 6, marginLeft: 16 }}>
                  <button type="button" onClick={() => setState(issue.id, "ok")} style={{
                    flex: 1, height: 36, fontSize: 13, fontWeight: 700,
                    border: state === "ok" ? "none" : "1px solid var(--bg4)", borderRadius: 8, cursor: "pointer",
                    background: state === "ok" ? "var(--ok)" : "var(--bg3)",
                    color: state === "ok" ? "#050505" : "var(--t3)", transition: "all .12s",
                  }}>{"✓"} OK</button>
                  <button type="button" onClick={() => setState(issue.id, "problema")} style={{
                    flex: 1, height: 36, fontSize: 13, fontWeight: 700,
                    border: state === "problema" ? "none" : "1px solid var(--bg4)", borderRadius: 8, cursor: "pointer",
                    background: state === "problema" ? "var(--danger)" : "var(--bg3)",
                    color: state === "problema" ? "#fff" : "var(--t3)", transition: "all .12s",
                  }}>{"✗"} Problema</button>
                  <PhotoCapture
                    issueId={issue.id}
                    issueTitle={issue.title}
                    category={issue.category}
                    carInfo={carInfo}
                    onPhoto={handlePhoto}
                  />
                  <button type="button" onClick={() => setHelpQuestion(`Preciso de ajuda com "${issue.title.toLowerCase()}" no ${carInfo.model} ${carInfo.year}. Me diz como verificar de um jeito rápido e se eu mandar foto você analisa?`)} style={{
                    flex: "0 0 auto", height: 36, fontSize: 11, fontWeight: 700,
                    border: "1px solid var(--bg4)", borderRadius: 8, cursor: "pointer",
                    background: "var(--bg3)", color: "var(--accent)", transition: "all .12s", padding: "0 10px",
                  }}>Ajuda</button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* AI Chat */}
      <div style={{ marginBottom: 4 }}>
        <Chat laudoId={laudoId} carInfo={carInfo} userLevel={level} initialQuestion={helpQuestion}
          checklistState={issues.map((iss) => ({
            id: iss.id, title: iss.title, category: iss.category, severity: iss.severity, state: states[iss.id] ?? null,
          }))} />
      </div>

      <div style={{ paddingTop: 8, paddingBottom: 48 }}>
        <div style={{ fontSize: 12, color: answered === 0 ? "var(--warn)" : "var(--t3)", marginBottom: 14, textAlign: "center" }}>
          {answered === 0 ? "Responda ao menos um item antes de continuar"
            : `${answered} de ${issues.length} itens verificados`}
          {answered > 0 && problemCount > 0 && (
            <span style={{ color: "var(--danger)", marginLeft: 8 }}>{"·"} {problemCount} problema{problemCount > 1 ? "s" : ""}</span>
          )}
          {photoCount > 0 && (
            <span style={{ color: "var(--accent)", marginLeft: 8 }}>{"·"} {photoCount} foto{photoCount > 1 ? "s" : ""}</span>
          )}
        </div>
        {erro && <div style={{ fontSize: 13, color: "var(--danger)", textAlign: "center", marginBottom: 10 }}>{erro}</div>}
        <button type="submit" disabled={loading || answered === 0} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 54,
          background: loading ? "#00a884" : "var(--accent)", color: "#050505",
          border: "none", borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800,
          cursor: loading || answered === 0 ? "not-allowed" : "pointer",
          opacity: answered === 0 ? 0.5 : 1,
        }}>
          {loading ? "Salvando..." : "Próximo →"}
        </button>
      </div>
    </form>
  );
}
