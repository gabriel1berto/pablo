import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CadastroLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/laudos");

  return <>{children}</>;
}
