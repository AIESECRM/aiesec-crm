"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Bell } from "lucide-react";

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
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Mevcut ayarları çek
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile/settings")
        .then((r) => r.json())
        .then((data) => {
          if (typeof data.emailNotifications === "boolean") {
            setEmailNotifications(data.emailNotifications);
          }
        })
        .catch(() => {});
    }
  }, [status]);

  const handleToggleEmail = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/profile/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications: newValue }),
      });
      if (res.ok) {
        setSaveMessage(newValue ? "E-posta bildirimleri açıldı" : "E-posta bildirimleri kapatıldı");
      } else {
        setEmailNotifications(!newValue); // Geri al
        setSaveMessage("Kaydetme başarısız oldu");
      }
    } catch {
      setEmailNotifications(!newValue);
      setSaveMessage("Bağlantı hatası");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

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

        {/* Bildirim Ayarları */}
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={18} />
              Bildirim Ayarları
            </h3>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: emailNotifications ? "#dbeafe" : "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  <Mail size={18} color={emailNotifications ? "#2563eb" : "#9ca3af"} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                    E-posta Bildirimleri
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    İşlemsiz şirketler için mail ile uyarı al
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={handleToggleEmail}
                disabled={isSaving}
                style={{
                  position: "relative",
                  width: "48px",
                  height: "26px",
                  borderRadius: "13px",
                  border: "none",
                  cursor: isSaving ? "wait" : "pointer",
                  backgroundColor: emailNotifications ? "#2563eb" : "#d1d5db",
                  transition: "background-color 0.3s",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: emailNotifications ? "25px" : "3px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    transition: "left 0.3s",
                  }}
                />
              </button>
            </div>

            {/* Kaydetme mesajı */}
            {saveMessage && (
              <div style={{
                marginTop: "8px",
                fontSize: "13px",
                color: saveMessage.includes("başarısız") || saveMessage.includes("hata") ? "#dc2626" : "#16a34a",
                textAlign: "center",
                transition: "opacity 0.3s",
              }}>
                {saveMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}