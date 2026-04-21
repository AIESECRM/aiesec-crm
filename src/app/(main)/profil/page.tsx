"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CHAPTER_LABELS: Record<string, string> = {
  ADANA: "Adana",
  ANKARA: "Ankara",
  ANTALYA: "Antalya",
  BURSA: "Bursa",
  DENIZLI: "Denizli",
  DOGU_AKDENIZ: "Doğu Akdeniz",
  ESKISEHIR: "Eskişehir",
  GAZIANTEP: "Gaziantep",
  ISTANBUL: "İstanbul",
  ISTANBUL_ASYA: "İstanbul Asya",
  BATI_ISTANBUL: "Batı İstanbul",
  IZMIR: "İzmir",
  KOCAELI: "Kocaeli",
  KONYA: "Konya",
  KUTAHYA: "Kütahya",
  SAKARYA: "Sakarya",
  TRABZON: "Trabzon",
};

const ROLE_LABELS: Record<string, string> = {
  TM: "Team Member",
  TL: "Team Leader",
  LCVP: "LCVP",
  LCP: "LCP",
  MCVP: "MCVP",
  MCP: "MCP",
};

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as any;

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ backgroundColor: "#2563eb", padding: "32px", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "white", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "#2563eb" }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ color: "white", fontSize: "22px", fontWeight: "bold", margin: "0 0 4px" }}>
            {user.name}
          </h1>
          <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "13px" }}>
            {ROLE_LABELS[user.role] || user.role}
          </span>
        </div>

        {/* Bilgiler */}
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>Email</span>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>{user.email}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>Şube</span>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                {user.chapter ? CHAPTER_LABELS[user.chapter] || user.chapter : "—"}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>Rol</span>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}