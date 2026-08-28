// ============================================================
// Nutri Atende — Dashboard Layout
// Sidebar + Main content area with real user data
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile + clinic
  const { data: profile } = await supabase
    .from("usuario_sistema")
    .select("*, clinica:clinica_id (nome)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/setup");
  }

  const userName = profile.nome || user.email?.split("@")[0] || "Usuário";
  const clinicName =
    (profile.clinica as any)?.nome || "Minha Clínica";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar
      userName={userName}
      userEmail={user.email || ""}
      clinicName={clinicName}
      userInitials={userInitials}
      userPerfil={profile.perfil}
    >
      {children}
    </Sidebar>
  );
}
