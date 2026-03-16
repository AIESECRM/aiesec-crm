"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "login" | "forgot-email" | "forgot-code" | "forgot-newpass";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Şifremi unuttum
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Email veya şifre hatalı!");
      setLoading(false);
      return;
    }

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
      router.push("/sirketler");
    }
  };

  const handleSendCode = async () => {
    setError(""); setSuccess("");
    if (!resetEmail) { setError("Email zorunludur!"); return; }
    setLoading(true);
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send-code", email: resetEmail }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess("Doğrulama kodu email adresinize gönderildi!");
    setStep("forgot-code");
  };

  const handleResetPassword = async () => {
    setError(""); setSuccess("");
    if (!resetCode || resetCode.length !== 6) { setError("6 haneli kodu girin!"); return; }
    if (!newPassword || newPassword.length < 8) { setError("Şifre en az 8 karakter olmalıdır!"); return; }
    if (newPassword !== newPasswordConfirm) { setError("Şifreler eşleşmiyor!"); return; }
    setLoading(true);
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password", email: resetEmail, code: resetCode, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess("Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.");
    setTimeout(() => { setStep("login"); setSuccess(""); }, 2500);
  };

  const inputStyle = { width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" as const };
  const btnStyle = (disabled: boolean) => ({ width: "100%", backgroundColor: disabled ? "#93c5fd" : "#2563eb", color: "white", padding: "10px", borderRadius: "8px", fontWeight: "600", fontSize: "16px", border: "none", cursor: disabled ? "not-allowed" : "pointer" });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
      <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>

        <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "#1d4ed8", marginBottom: "8px" }}>AIESEC CRM</h1>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>
          {step === "login" && "Hesabınıza giriş yapın"}
          {step === "forgot-email" && "Şifre sıfırlama"}
          {step === "forgot-code" && "Doğrulama kodu"}
        </p>

        {error && <div style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}
        {success && <div style={{ backgroundColor: "#f0fdf4", color: "#16a34a", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{success}</div>}

        {/* LOGIN */}
        {step === "login" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="ornek@aiesec.net" required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Şifre</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" required />
            </div>
            <div style={{ textAlign: "right" }}>
              <button type="button" onClick={() => { setStep("forgot-email"); setError(""); setSuccess(""); }}
                style={{ background: "none", border: "none", color: "#2563eb", fontSize: "13px", cursor: "pointer" }}>
                Şifremi unuttum
              </button>
            </div>
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
            <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
              Hesabın yok mu?{" "}
              <Link href="/login/register" style={{ color: "#2563eb" }}>Kayıt ol</Link>
            </p>
          </form>
        )}

        {/* FORGOT - EMAIL */}
        {step === "forgot-email" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Email Adresiniz</label>
              <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} style={inputStyle} placeholder="ornek@aiesec.net" />
            </div>
            <button onClick={handleSendCode} disabled={loading} style={btnStyle(loading)}>
              {loading ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
            </button>
            <button onClick={() => { setStep("login"); setError(""); setSuccess(""); }}
              style={{ background: "none", border: "none", color: "#6b7280", fontSize: "14px", cursor: "pointer" }}>
              ← Geri dön
            </button>
          </div>
        )}

        {/* FORGOT - CODE + NEW PASS */}
        {step === "forgot-code" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "14px", color: "#6b7280", textAlign: "center" }}>
              <strong>{resetEmail}</strong> adresine kod gönderdik.
            </p>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Doğrulama Kodu</label>
              <input type="text" value={resetCode} onChange={e => setResetCode(e.target.value)} maxLength={6}
                style={{ ...inputStyle, fontSize: "24px", fontWeight: "bold", textAlign: "center", letterSpacing: "8px" }} placeholder="000000" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Yeni Şifre</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="En az 8 karakter" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "4px" }}>Yeni Şifre Tekrar</label>
              <input type="password" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} style={inputStyle} placeholder="Şifrenizi tekrar girin" />
            </div>
            <button onClick={handleResetPassword} disabled={loading} style={btnStyle(loading)}>
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
            <button onClick={() => { setStep("forgot-email"); setError(""); setSuccess(""); }}
              style={{ background: "none", border: "none", color: "#6b7280", fontSize: "14px", cursor: "pointer" }}>
              ← Geri dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}