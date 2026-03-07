"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email veya şifre hatalı!");
      setLoading(false);
      return;
    }

    // Giriş başarılı, session'dan status ve role al
    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const role = sessionData?.user?.role;
    const status = sessionData?.user?.status;

    if (status === "PENDING") {
      router.push("/onay-bekleniyor");
    } else if (status === "REJECTED") {
      setError("Hesabınız reddedildi. Lütfen yöneticinizle iletişime geçin.");
      setLoading(false);
    } else if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
      <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        
        <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "#1d4ed8", marginBottom: "8px" }}>
          AIESEC CRM
        </h1>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>
          Hesabınıza giriş yapın
        </p>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              placeholder="ornek@aiesec.net"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", backgroundColor: loading ? "#93c5fd" : "#2563eb", color: "white", padding: "10px", borderRadius: "8px", fontWeight: "600", fontSize: "16px", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginTop: "16px" }}>
          Hesabın yok mu?{" "}
          <Link href="/login/register" style={{ color: "#2563eb" }}>Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}