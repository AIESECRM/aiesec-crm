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
              style={{ width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "600", fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: "8px" }}>
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
