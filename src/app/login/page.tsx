"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./page.css";

type Step = "login" | "forgot-email" | "forgot-code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Email veya şifre hatalı!"); setLoading(false); return; }
    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const role = sessionData?.user?.role;
    const status = sessionData?.user?.status;
    if (status === "PENDING") { router.push("/onay-bekleniyor"); }
    else if (status === "REJECTED") { setError("Hesabınız reddedildi. Lütfen yöneticinizle iletişime geçin."); setLoading(false); }
    else if (role === "ADMIN") { router.push("/admin"); }
    else { router.push("/"); }
  };

  const handleSendCode = async () => {
    setError(""); setSuccess("");
    if (!resetEmail) { setError("Email zorunludur!"); return; }
    setLoading(true);
    const res = await fetch("/api/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send-code", email: resetEmail }) });
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
    const res = await fetch("/api/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset-password", email: resetEmail, code: resetCode, newPassword }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess("Şifreniz başarıyla güncellendi!");
    setTimeout(() => { setStep("login"); setSuccess(""); }, 2500);
  };

  return (
    <div className={`auth-page ${mounted ? 'auth-page--mounted' : ''}`}>
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__orb auth-bg__orb--3" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo/primary.svg" alt="AIESEC" className="auth-logo__img" />
          <div className="auth-logo__badge">CRM</div>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">
            {step === "login" && "Hoş Geldiniz"}
            {step === "forgot-email" && "Şifre Sıfırla"}
            {step === "forgot-code" && "Kodu Girin"}
          </h1>
          <p className="auth-subtitle">
            {step === "login" && "Hesabınıza giriş yapın"}
            {step === "forgot-email" && "Email adresinize kod göndereceğiz"}
            {step === "forgot-code" && `${resetEmail} adresine kod gönderdik`}
          </p>
        </div>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}
        {success && <div className="auth-alert auth-alert--success">{success}</div>}

        {step === "login" && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input type="email" className="auth-input" placeholder="ornek@aiesec.net" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Şifre</label>
              <input type="password" className="auth-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="auth-forgot">
              <button type="button" className="auth-link-btn" onClick={() => { setStep("forgot-email"); setError(""); setSuccess(""); }}>
                Şifremi unuttum
              </button>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="auth-btn__spinner" /> : null}
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
            <p className="auth-footer-text">
              Hesabın yok mu?{" "}
              <Link href="/login/register" className="auth-link">Kayıt ol</Link>
            </p>
          </form>
        )}

        {step === "forgot-email" && (
          <div className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email Adresiniz</label>
              <input type="email" className="auth-input" placeholder="ornek@aiesec.net" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
            </div>
            <button className="auth-btn" onClick={handleSendCode} disabled={loading}>
              {loading ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
            </button>
            <button className="auth-back-btn" onClick={() => { setStep("login"); setError(""); setSuccess(""); }}>
              ← Geri dön
            </button>
          </div>
        )}

        {step === "forgot-code" && (
          <div className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Doğrulama Kodu</label>
              <input type="text" className="auth-input auth-input--code" maxLength={6} placeholder="000000" value={resetCode} onChange={e => setResetCode(e.target.value)} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Yeni Şifre</label>
              <input type="password" className="auth-input" placeholder="En az 8 karakter" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Yeni Şifre Tekrar</label>
              <input type="password" className="auth-input" placeholder="Şifrenizi tekrar girin" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} />
            </div>
            <button className="auth-btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
            <button className="auth-back-btn" onClick={() => { setStep("forgot-email"); setError(""); setSuccess(""); }}>
              ← Geri dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}