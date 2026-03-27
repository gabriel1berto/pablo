import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CautelarForm from "./form";

export default async function CautelarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: laudo } = await supabase
    .from("laudos")
    .select("brand, model, year, km")
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
        maxWidth: 480,
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      <div style={{ paddingTop: 52, paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Link href={`/laudo/${id}/checklist`} style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none" }}>← Voltar</Link>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>Passo 3 de 5</span>
        </div>
        <div
          style={{
            height: 3,
            background: "var(--bg3)",
            borderRadius: 99,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div style={{ width: "60%", height: "100%", background: "var(--accent)", borderRadius: 99 }} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 4 }}>
          Cautelar
        </h1>
        <p style={{ fontSize: 14, color: "var(--t2)" }}>
          {laudo.brand} {laudo.model} {laudo.year} · {laudo.km.toLocaleString("pt-BR")} km
        </p>
      </div>

      <div style={{ paddingTop: 24 }}>
        <CautelarForm laudoId={id} />
      </div>
    </main>
  );
}
