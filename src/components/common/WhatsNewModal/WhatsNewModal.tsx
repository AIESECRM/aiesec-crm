"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, MapPin, Chrome, Users, Phone, Package, Filter, ArrowRight } from "lucide-react";
import "./WhatsNewModal.css";

const ANNOUNCEMENT_KEY = "aiesec_b2b_announcement_v1.6";

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
            <Sparkles size={13} /> Güncel Yenilikler
          </div>
          <h2 className="whats-new-title">AIESEC CRM Süper Güçlendi!</h2>
          <p className="whats-new-subtitle">
            B2B süreçlerinizi hızlandıran ve pazar keşfini kolaylaştıran son iyileştirmeler.
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
                  Pazar Keşfi modülüyle şehrinizdeki işletmeleri saniyeler içinde tarayın. Ücretsiz bütçe koruması ve akıllı rehberle anında sonuçlar!
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
                  Harita üzerinde gezinirken işletmelerin hemen altında çıkan &quot;⚡ Şubeme Ekle&quot; butonu ile bilgileri kopyalamadan tek tıkla aktarın.
                </div>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box icon-emerald">
                <Users size={22} />
              </div>
              <div className="feature-content">
                <div className="feature-title">Şirketlerde Sorumlu (Mesajer) Filtresi</div>
                <div className="feature-desc">
                  Şirket listesini doğrudan ilgilendiğiniz sorumlu ekip üyesine göre kolayca filtreleyebilirsiniz.
                </div>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box icon-blue">
                <Phone size={22} />
              </div>
              <div className="feature-content">
                <div className="feature-title">Tabloda Telefon Numarası Sütunu</div>
                <div className="feature-desc">
                  Şirketler tablosunda sektör yerine doğrudan telefon numaraları gösterilerek aramalar ve iletişim hızlandırıldı.
                </div>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box icon-purple">
                <Package size={22} />
              </div>
              <div className="feature-content">
                <div className="feature-title">Hızlı Şirket Eklemede Ürün Atama</div>
                <div className="feature-desc">
                  Yeni şirket veya aktivite kaydederken AIESEC ürününü (iGT, iGV vb.) pratik bir şekilde seçebilme özelliği eklendi.
                </div>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box icon-emerald">
                <Filter size={22} />
              </div>
              <div className="feature-content">
                <div className="feature-title">Arama & Filtre Hafızası</div>
                <div className="feature-desc">
                  Bir şirketin detayına girip listeye geri döndüğünüzde seçtiğiniz filtrelerin ve aramanızın kaybolması engellendi.
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
