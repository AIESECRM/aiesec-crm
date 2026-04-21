"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../page.css";

const CHAPTERS = [
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

const ROLES = [
  { value: "TM", label: "Team Member" },
  { value: "TL", label: "Team Leader" },
  { value: "LCVP", label: "LCVP" },
  { value: "LCP", label: "LCP" },
  { value: "MCVP", label: "MCVP" },
  { value: "MCP", label: "MCP" },
];

const NATIONAL_ROLES = ["MCP", "MCVP"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", passwordConfirm: "",
    role: "TM", chapter: "", phone: "",
  });
  const [code, setCode] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const isNational = NATIONAL_ROLES.includes(form.role);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "role") {
      if (NATIONAL_ROLES.includes(value)) {
        setForm({ ...form, role: value, chapter: "GENEL_MERKEZ" });
      } else {
        setForm({ ...form, role: value, chapter: "" });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || (!isNational && !form.chapter)) {
      setError("Lütfen tüm zorunlu alanları doldurun!"); return;
    }
    if (form.password !== form.passwordConfirm) { setError("Şifreler eşleşmiyor!"); return; }
    if (form.password.length < 8) { setError("Şifre en az 8 karakter olmalı!"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-code", ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); }
      else { setStep("verify"); setSuccess("Doğrulama kodu email adresinize gönderildi!"); }
    } catch { setError("Sunucu hatası!"); }
    setLoading(false);
  };

  const handleVerify = async () => {
    setError("");
    if (!code || code.length !== 6) { setError("Lütfen 6 haneli kodu girin!"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-code", email: form.email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); }
      else { setSuccess("Hesabınız oluşturuldu! Yönlendiriliyorsunuz..."); setTimeout(() => router.push("/onay-bekleniyor"), 2000); }
    } catch { setError("Sunucu hatası!"); }
    setLoading(false);
  };

  return (
    <div className={`auth-page ${mounted ? 'auth-page--mounted' : ''}`}>
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__orb auth-bg__orb--3" />
      </div>

      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <img src="/logo/primary.svg" alt="AIESEC" className="auth-logo__img" />
          <div className="auth-logo__badge">CRM</div>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">
            {step === "form" ? "Hesap Oluştur" : "Email Doğrulama"}
          </h1>
          <p className="auth-subtitle">
            {step === "form" ? "Yeni hesabınızı oluşturun" : `${form.email} adresine kod gönderdik`}
          </p>
        </div>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}
        {success && <div className="auth-alert auth-alert--success">{success}</div>}

        {step === "form" && (
          <div className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Ad Soyad *</label>
              <input type="text" name="name" className="auth-input" placeholder="Adınız Soyadınız" value={form.name} onChange={handleChange} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Email *</label>
              <input type="email" name="email" className="auth-input" placeholder="ornek@aiesec.net" value={form.email} onChange={handleChange} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Telefon</label>
              <input type="tel" name="phone" className="auth-input" placeholder="05XX XXX XX XX" value={form.phone} onChange={handleChange} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Rol</label>
              <select name="role" className="auth-input" value={form.role} onChange={handleChange}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {isNational ? (
              <div style={{ backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "10px", padding: "12px", fontSize: "14px", color: "var(--primary)" }}>
                🏢 <strong>Genel Merkez</strong> — MCP/MCVP tüm şubeleri görüntüleyebilir
              </div>
            ) : (
              <div className="auth-field">
                <label className="auth-label">Şube *</label>
                <select name="chapter" className="auth-input" value={form.chapter} onChange={handleChange}>
                  <option value="">Şube seçin...</option>
                  {CHAPTERS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label">Şifre *</label>
              <input type="password" name="password" className="auth-input" placeholder="En az 8 karakter" value={form.password} onChange={handleChange} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Şifre Tekrar *</label>
              <input type="password" name="passwordConfirm" className="auth-input" placeholder="Şifrenizi tekrar girin" value={form.passwordConfirm} onChange={handleChange} />
            </div>

            <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="auth-btn__spinner" /> : null}
              {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
            </button>
            <p className="auth-footer-text">
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="auth-link">Giriş yap</Link>
            </p>
          </div>
        )}

        {step === "verify" && (
          <div className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Doğrulama Kodu</label>
              <input type="text" className="auth-input auth-input--code" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value)} />
            </div>
            <button className="auth-btn" onClick={handleVerify} disabled={loading}>
              {loading ? <span className="auth-btn__spinner" /> : null}
              {loading ? "Doğrulanıyor..." : "Hesabı Oluştur"}
            </button>
            <button className="auth-back-btn" onClick={() => { setStep("form"); setError(""); setSuccess(""); }}>
              ← Geri dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}