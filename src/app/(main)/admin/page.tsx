"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Check, X, RefreshCw } from "lucide-react";

const CHAPTERS = [
  { value: "", label: "Tüm Şubeler" },
  { value: "ADANA", label: "Adana" },
  { value: "ANKARA", label: "Ankara" },
  { value: "ANTALYA", label: "Antalya" },
  { value: "BURSA", label: "Bursa" },
  { value: "DENIZLI", label: "Denizli" },
  { value: "DOGU_AKDENIZ", label: "Doğu Akdeniz" },
  { value: "ESKISEHIR", label: "Eskişehir" },
  { value: "GAZIANTEP", label: "Gaziantep" },
  { value: "ISTANBUL", label: "İstanbul" },
  { value: "ISTANBUL_ASYA", label: "İstanbul Asya" },
  { value: "BATI_ISTANBUL", label: "Batı İstanbul" },
  { value: "IZMIR", label: "İzmir" },
  { value: "KOCAELI", label: "Kocaeli" },
  { value: "KONYA", label: "Konya" },
  { value: "KUTAHYA", label: "Kütahya" },
  { value: "SAKARYA", label: "Sakarya" },
  { value: "TRABZON", label: "Trabzon" },
];

const ROLES = ["TM", "TL", "LCVP", "LCP", "MCVP", "MCP", "ADMIN"];

const ROLE_LABELS: Record<string, string> = {
  TM: "Team Member", TL: "Team Leader", LCVP: "LCVP",
  LCP: "LCP", MCVP: "MCVP", MCP: "MCP", ADMIN: "Admin",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor", ACTIVE: "Aktif", REJECTED: "Reddedildi",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", ACTIVE: "#10b981", REJECTED: "#ef4444",
};

export default function AdminPage() {
  const { user, status } = useAuth() as any;
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChapter, setFilterChapter] = useState("");
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && user?.role !== "ADMIN") router.push("/");
  }, [status, user, router]);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchUsers();
  }, [filterChapter, filterStatus, user]);

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterChapter) params.set("chapter", filterChapter);
    if (filterStatus) params.set("status", filterStatus);

    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleAction = async (userId: number, action: string, role?: string) => {
    setActionLoading(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, role }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setActionLoading(null);
    fetchUsers();
    setTimeout(() => setMessage(""), 3000);
  };

  if (status === "loading" || !user) return null;
  if (user?.role !== "ADMIN") return null;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
          Admin Paneli
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Kullanıcı onay ve yönetim ekranı</p>
      </div>

      {message && (
        <div style={{ backgroundColor: "#f0fdf4", color: "#16a34a", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          {message}
        </div>
      )}

      {/* Filtreler */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <select
          value={filterChapter}
          onChange={(e) => setFilterChapter(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", backgroundColor: "white" }}
        >
          {CHAPTERS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", backgroundColor: "white" }}
        >
          <option value="">Tüm Durumlar</option>
          <option value="PENDING">Bekleyenler</option>
          <option value="ACTIVE">Aktifler</option>
          <option value="REJECTED">Reddedilenler</option>
        </select>

        <button
          onClick={fetchUsers}
          style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", backgroundColor: "white", cursor: "pointer" }}
        >
          <RefreshCw size={14} />
          Yenile
        </button>
      </div>

      {/* Kullanıcı Tablosu */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}>Yükleniyor...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#6b7280", backgroundColor: "white", borderRadius: "12px" }}>
          Bu filtreye uygun kullanıcı bulunamadı.
        </div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Ad Soyad", "Email", "Rol", "Şube", "Durum", "Kayıt Tarihi", "İşlemler"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{u.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleAction(u.id, "change-role", e.target.value)}
                      style={{ border: "1px solid #d1d5db", borderRadius: "6px", padding: "4px 8px", fontSize: "13px", backgroundColor: "white" }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", color: "#6b7280" }}>
                    {u.chapter ? CHAPTERS.find(c => c.value === u.chapter)?.label || u.chapter : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ backgroundColor: STATUS_COLORS[u.status] + "20", color: STATUS_COLORS[u.status], padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                      {STATUS_LABELS[u.status]}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>
                    {new Date(u.createdAt * 1000).toLocaleDateString("tr-TR")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {u.status !== "ACTIVE" && (
                        <button
                          onClick={() => handleAction(u.id, "approve")}
                          disabled={actionLoading === u.id}
                          style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: "pointer" }}
                        >
                          <Check size={14} />
                          Onayla
                        </button>
                      )}
                      {u.status !== "REJECTED" && (
                        <button
                          onClick={() => handleAction(u.id, "reject")}
                          disabled={actionLoading === u.id}
                          style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: "pointer" }}
                        >
                          <X size={14} />
                          Reddet
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}