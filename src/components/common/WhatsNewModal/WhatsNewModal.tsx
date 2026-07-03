"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, MapPin, Chrome, ShieldCheck, ArrowRight } from "lucide-react";
import "./WhatsNewModal.css";

const ANNOUNCEMENT_KEY = "aiesec_b2b_announcement_v1.5";

export default function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Tarayıcı hafızasında daha önce görülmemişse otomatik aç
    const seen = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, "true");
    setIsOpen(false);
  };

  const handleGoToExplore = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, "true");
    setIsOpen(false);
    router.push("/pazar-kesfi");
  };

  if (!isOpen) return null;

  return (
    <div className="whats-new-overlay" onClick={handleClose}>
      <div className="whats-new-card" onClick={e => e.stopPropagation()}>
        {/* ÜST BAŞLIK */}
        <div className="whats-new-header">
          <button className="whats-new-close" onClick={handleClose} title="Kapat">
            <X size={18} />
          </button>
          <div className="whats-new-badge">
            <Sparkles size={13} /> v1.5 Büyük Güncelleme
          </div>
          <h2 className="whats-new-title">AIESEC CRM Akıllı Keşif Dönemi!</h2>
          <p className="whats-new-subtitle">
            B2B Pazar araştırmalarını ve şube çakışmalarını kökten çözen süper özellikler yayında.
          </p>
        </div>

        {/* İÇERİK */}
        <div className="whats-new-body">
          <div className="feature-list">
            
            <div className="feature-item">
              <div className="feature-icon-box icon-blue">
                <MapPin size={24} />
              </div>
              <div className="feature-content">
                <div className="feature-title">CRM İçi Pazar Keşfi (50+ Sonuç)</div>
                <div className="feature-desc">
                  Sol menüden ulaşabileceğiniz Pazar Keşfi modülüyle şehrinizdeki işletmeleri saniyeler içinde tarayın. Ücretsiz bütçe koruması ve akıllı rehberle anında sonuçlar!
                </div>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box icon-purple">
                <Chrome size={24} />
              </div>
              <div className="feature-content">
                <div className="feature-title">Google Haritalar Chrome Eklentisi</div>
                <div className="feature-desc">
                  Harita üzerinde gezinirken işletmelerin hemen altında çıkan &quot;⚡ Şubeme Ekle&quot; butonu ile bilgileri kopyalamadan tek tıkla CRM şubenize aktarın.
                </div>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box icon-emerald">
                <ShieldCheck size={24} />
              </div>
              <div className="feature-content">
                <div className="feature-title">Kesin Şube İzolasyonu & Telefon Kontrolü</div>
                <div className="feature-desc">
                  Başka şubelerin kayıtları gizlendi! Çakışma kontrolü öncelikle telefon numarasından yapılır; şubenizde kayıtlıysa anında uyarı verir ve çift kaydı engeller.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ALT BUTONLAR */}
        <div className="whats-new-footer">
          <button className="btn-modal-sec" onClick={handleClose}>
            Daha Sonra
          </button>
          <button className="btn-modal-pri" onClick={handleGoToExplore}>
            <span>Pazar Keşfini Deneyimle</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
