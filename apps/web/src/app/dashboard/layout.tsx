// ============================================================
// Nutri Atende — Dashboard Layout
// Sidebar + Main content area with real user data
// Uses admin client since middleware already verified auth
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Sidebar from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already verified auth — extract user ID from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-khaxithzlhsctkvdxllp-auth-token")?.value;
  let userId: string | null = null;

  if (token) {
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length >= 2) {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64url").toString()
        );
        userId = payload.sub;
      }
    } catch {
      // ignore
    }
  }

  if (!userId) {
    redirect("/login");
  }

  // Use admin client for all data queries (bypasses RLS)
  const admin = createAdminClient();

  // Fetch profile + clinic
  const { data: profile, error: profileError } = await admin
    .from("usuario_sistema")
    .select("*, clinica:clinica_id (nome)")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    // Profile not found → first-time user
    redirect("/setup");
  }

  const userName = profile.nome || profile.email?.split("@")[0] || "Usuário";
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
      userEmail={profile.email || ""}
      clinicName={clinicName}
      userInitials={userInitials}
      userPerfil={profile.perfil}
    >
      {children}
    </Sidebar>
  );
}
