import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VeiculoForm from "./form";

export default async function NovoLaudo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/cadastro");

  // Primeiro laudo é gratuito; demais exigem crédito pago
  const { count: laudoCount } = await supabase
    .from("laudos")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((laudoCount ?? 0) >= 1) {
    const { count: creditCount } = await supabase
      .from("laudo_credits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("used_at", null);

    if ((creditCount ?? 0) === 0) redirect("/pagamento");
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
      {/* Header */}
      <div style={{ paddingTop: 52, paddingBottom: 8 }}>
        <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 6 }}>
          Passo 1 de 5
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
          <div style={{ width: "20%", height: "100%", background: "var(--accent)", borderRadius: 99 }} />
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: "-0.5px",
            marginBottom: 6,
          }}
        >
          Dados do veículo
        </h1>
        <p style={{ fontSize: 14, color: "var(--t2)" }}>
          Informe o carro que você quer avaliar.
        </p>
      </div>

      <div style={{ paddingTop: 24, paddingBottom: 48 }}>
        <VeiculoForm />
      </div>
    </main>
  );
}
