"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "TM",
    chapter: "",
    phone: "",
  });
  const [code, setCode] = useState("");

  const isNational = NATIONAL_ROLES.includes(form.role);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "role") {
      if (NATIONAL_ROLES.includes(value)) {
        // MCP/MCVP için chapter'ı otomatik GENEL_MERKEZ yap
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
      setError("Lütfen tüm zorunlu alanları doldurun!");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("Şifreler eşleşmiyor!");
      return;
    }
    if (form.password.length < 8) {
      setError("Şifre en az 8 karakter olmalı!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-code", ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setStep("verify");
        setSuccess("Doğrulama kodu email adresinize gönderildi!");
      }
    } catch {
      setError("Sunucu hatası!");
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setError("");
    if (!code || code.length !== 6) {
      setError("Lütfen 6 haneli kodu girin!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-code", email: form.email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess("Hesabınız oluşturuldu! Yönlendiriliyorsunuz...");
        setTimeout(() => router.push("/onay-bekleniyor"), 2000);
      }
    } catch {
      setError("Sunucu hatası!");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div style={{ backgroundColor: "var(--card)", padding: "32px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", maxWidth: "480px" }}>

        <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", color: "var(--primary)", marginBottom: "8px" }}>
          AIESEC CRM
        </h1>
        <p style={{ textAlign: "center", color: "var(--text-regular)", marginBottom: "24px", fontWeight: "500" }}>
          {step === "form" ? "Yeni hesap oluşturun" : "Email doğrulama"}
        </p>

        {error && (
          <div style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "500" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.3)", color: "#10b981", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "500" }}>
            {success}
          </div>
        )}

        {step === "form" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--foreground)" }}>Ad Soyad *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", boxSizing: "border-box", backgroundColor: "var(--neutral-light)", color: "var(--foreground)", outline: "none" }}
                placeholder="Adınız Soyadınız" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--foreground)" }}>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", boxSizing: "border-box", backgroundColor: "var(--neutral-light)", color: "var(--foreground)", outline: "none" }}
                placeholder="ornek@aiesec.net" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--foreground)" }}>Telefon</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", boxSizing: "border-box", backgroundColor: "var(--neutral-light)", color: "var(--foreground)", outline: "none" }}
                placeholder="05XX XXX XX XX" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--foreground)" }}>Rol</label>
              <select name="role" value={form.role} onChange={handleChange}
                style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", boxSizing: "border-box", backgroundColor: "var(--neutral-light)", color: "var(--foreground)", outline: "none" }}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {isNational ? (
              <div style={{ backgroundColor: "rgba(3, 126, 243, 0.08)", border: "1px solid rgba(3, 126, 243, 0.2)", borderRadius: "8px", padding: "12px", fontSize: "14px", color: "var(--primary)" }}>
                🏢 <strong>Genel Merkez</strong> — MCP/MCVP tüm şubeleri görüntüleyebilir
              </div>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--foreground)" }}>Şube *</label>
                <select name="chapter" value={form.chapter} onChange={handleChange}
                  style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", boxSizing: "border-box", backgroundColor: "var(--neutral-light)", color: "var(--foreground)", outline: "none" }}>
                  <option value="">Şube seçin...</option>
                  {CHAPTERS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--foreground)" }}>Şifre *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", boxSizing: "border-box", backgroundColor: "var(--neutral-light)", color: "var(--foreground)", outline: "none" }}
                placeholder="En az 8 karakter" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--foreground)" }}>Şifre Tekrar *</label>
              <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange}
                style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "10px 12px", fontSize: "15px", boxSizing: "border-box", backgroundColor: "var(--neutral-light)", color: "var(--foreground)", outline: "none" }}
                placeholder="Şifrenizi tekrar girin" />
            </div>

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "600", fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginTop: "8px", transition: "all 0.2s ease-in-out" }}>
              {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
            </button>

            <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-regular)", marginTop: "4px" }}>
              Zaten hesabın var mı?{" "}
              <Link href="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Giriş yap</Link>
            </p>
          </div>
        )}

        {step === "verify" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-regular)" }}>
              <strong style={{ color: "var(--foreground)" }}>{form.email}</strong> adresine 6 haneli kod gönderdik.
            </p>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "var(--foreground)" }}>Doğrulama Kodu</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6}
                style={{ width: "100%", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px", fontSize: "28px", fontWeight: "bold", textAlign: "center", letterSpacing: "12px", boxSizing: "border-box", backgroundColor: "var(--neutral-light)", color: "var(--primary)", outline: "none" }}
                placeholder="000000" />
            </div>

            <button onClick={handleVerify} disabled={loading}
              style={{ width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "600", fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: "8px" }}>
              {loading ? "Doğrulanıyor..." : "Hesabı Oluştur"}
            </button>

            <button onClick={() => { setStep("form"); setError(""); setSuccess(""); }}
              style={{ width: "100%", backgroundColor: "transparent", color: "var(--text-regular)", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer", marginTop: "4px" }}>
              ← Geri dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
