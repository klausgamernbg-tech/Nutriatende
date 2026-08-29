// ============================================================
// Nutri Atende — Dashboard Layout
// Sidebar + Main content area with real user data
// Uses admin client since middleware already verified auth
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Sidebar from "./sidebar";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userName = "Usuário";
  let clinicName = "Minha Clínica";
  let userEmail = "";
  let userInitials = "US";
  let userPerfil = "nutricionista";

  try {
    // Middleware sets x-user-id header after verifying auth
    const headersList = headers();
    const userId =
      typeof headersList.get === "function"
        ? headersList.get("x-user-id")
        : null;

    if (!userId) {
      redirect("/login");
    }

    // Verify env vars are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Dashboard Layout] Missing env vars:", {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
      // Still render with defaults — don't crash
    } else {
      // Use admin client for all data queries (bypasses RLS)
      const admin = createAdminClient();

      // Fetch profile + clinic
      const { data: profile, error: profileError } = await admin
        .from("usuario_sistema")
        .select("*, clinica:clinica_id (nome)")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("[Dashboard Layout] Profile query error:", profileError.message);
        // If profile query fails, render with defaults instead of crashing
      }

      if (profile) {
        userName = profile.nome || profile.email?.split("@")[0] || "Usuário";
        clinicName = (profile.clinica as any)?.nome || "Minha Clínica";
        userEmail = profile.email || "";
        userPerfil = profile.perfil || "nutricionista";
        userInitials = userName
          .split(" ")
          .map((n: string) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
      } else if (!profileError) {
        // No profile found and no error → first-time user
        redirect("/setup");
      }
    }
  } catch (err: any) {
    // If it's a redirect, re-throw it (Next.js requires this)
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[Dashboard Layout] Unexpected error:", err);
    // Don't crash — render with defaults
  }

  return (
    <Sidebar
      userName={userName}
      userEmail={userEmail}
      clinicName={clinicName}
      userInitials={userInitials}
      userPerfil={userPerfil}
    >
      {children}
    </Sidebar>
  );
}
