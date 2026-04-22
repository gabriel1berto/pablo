import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export default async function VenderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = createServiceClient();
  const { data: laudo } = await service
    .from("laudos")
    .select("user_id, score_version, brand, model, year")
    .eq("id", id)
    .single();

  if (!laudo || laudo.user_id !== user.id || laudo.score_version !== "v2") {
    redirect("/laudos");
  }

  return <>{children}</>;
}
