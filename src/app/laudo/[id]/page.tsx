import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LaudoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/cadastro");

  const { data: laudo } = await supabase
    .from("laudos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!laudo) redirect("/laudo/novo");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--ag)",
          border: "1px solid rgba(0,212,170,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          marginBottom: 24,
        }}
      >
        ✅
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 10 }}>
        Veículo salvo
      </h1>

      <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.6, marginBottom: 32 }}>
        <strong style={{ color: "var(--t1)" }}>
          {laudo.brand} {laudo.model} {laudo.year}
        </strong>
        <br />
        {laudo.km.toLocaleString("pt-BR")} km · {laudo.state}
      </p>

      <a
        href={`/laudo/${id}/checklist`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: 54, background: "var(--accent)", color: "#050505",
          borderRadius: "var(--rs)", fontSize: 15, fontWeight: 800, textDecoration: "none",
        }}
      >
        Iniciar checklist →
      </a>
    </main>
  );
}
