'use client';

import React, { useState } from 'react';
import { Chrome, Download, X, Puzzle, Settings, MapPin, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import './ExtensionBanner.css';

export default function ExtensionBanner() {
  const [showModal, setShowModal] = useState(false);

  const handleDownload = () => {
    // chrome-extension klasörünü ZIP olarak indirtmek için
    // Public'e konan zip dosyası veya GitHub releases linki
    const link = document.createElement('a');
    link.href = '/api/extension-download';
    link.download = 'aiesec-crm-extension.zip';
    link.click();
  };

  return (
    <>
      {/* BANNER */}
      <div className="ext-banner">
        <div className="ext-banner-icon">
          <Puzzle size={22} />
        </div>
        <div className="ext-banner-content">
          <div className="ext-banner-title">
            🚀 Daha fazla ve gerçek sonuç için Chrome Eklentimizi kullanın!
          </div>
          <div className="ext-banner-desc">
            Google Haritalar&apos;da arama yapın, sol paneldeki <strong>tüm işletmeleri toplu olarak tarayın</strong>, CRM çakışma kontrolü yapın ve tek tıkla şubenize ekleyin. API limiti yok, sınırsız arama!
          </div>
        </div>
        <button className="ext-banner-btn" onClick={() => setShowModal(true)}>
          <Chrome size={16} />
          Eklentiyi Kur
          <ArrowRight size={14} />
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="ext-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ext-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="ext-modal-header">
              <div className="ext-modal-header-content">
                <div className="ext-modal-logo">
                  <Puzzle size={24} />
                </div>
                <div>
                  <h2 className="ext-modal-title">AIESEC CRM Chrome Eklentisi</h2>
                  <p className="ext-modal-subtitle">Google Haritalar Pazar Keşfi & Tek Tıkla Ekleme</p>
                </div>
              </div>
              <button className="ext-modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Avantajlar */}
            <div className="ext-modal-body">
              <div className="ext-advantages">
                <div className="ext-advantage-card">
                  <div className="ext-advantage-icon ext-advantage-icon--blue">
                    <MapPin size={20} />
                  </div>
                  <div className="ext-advantage-text">
                    <strong>Gerçek İşletme Verileri</strong>
                    <span>Google Haritalar&apos;dan canlı, güncel veriler</span>
                  </div>
                </div>
                <div className="ext-advantage-card">
                  <div className="ext-advantage-icon ext-advantage-icon--green">
                    <Zap size={20} />
                  </div>
                  <div className="ext-advantage-text">
                    <strong>Sınırsız Arama</strong>
                    <span>API kotası harcamadan dilediğiniz kadar tarayın</span>
                  </div>
                </div>
                <div className="ext-advantage-card">
                  <div className="ext-advantage-icon ext-advantage-icon--purple">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="ext-advantage-text">
                    <strong>Otomatik Çakışma Kontrolü</strong>
                    <span>CRM&apos;deki kayıtlarla anında karşılaştırma</span>
                  </div>
                </div>
              </div>

              {/* Kurulum Adımları */}
              <div className="ext-steps-section">
                <h3 className="ext-steps-title">📋 Kurulum Adımları</h3>
                <div className="ext-steps">
                  <div className="ext-step">
                    <div className="ext-step-number">1</div>
                    <div className="ext-step-content">
                      <strong>Eklentiyi İndirin</strong>
                      <span>Aşağıdaki butona tıklayarak ZIP dosyasını bilgisayarınıza indirin ve bir klasöre çıkartın.</span>
                    </div>
                  </div>
                  <div className="ext-step">
                    <div className="ext-step-number">2</div>
                    <div className="ext-step-content">
                      <strong>Chrome Eklenti Sayfasını Açın</strong>
                      <span>Chrome tarayıcınızda adres çubuğuna <code>chrome://extensions</code> yazıp Enter&apos;a basın.</span>
                    </div>
                  </div>
                  <div className="ext-step">
                    <div className="ext-step-number">3</div>
                    <div className="ext-step-content">
                      <strong>Geliştirici Modunu Aktifleştirin</strong>
                      <span>Sayfanın sağ üst köşesindeki <strong>&quot;Geliştirici modu&quot;</strong> (Developer mode) anahtarını açık konuma getirin.</span>
                    </div>
                  </div>
                  <div className="ext-step">
                    <div className="ext-step-number">4</div>
                    <div className="ext-step-content">
                      <strong>Eklentiyi Yükleyin</strong>
                      <span><strong>&quot;Paketlenmemiş öğe yükle&quot;</strong> (Load unpacked) butonuna tıklayın ve çıkarttığınız klasörü seçin.</span>
                    </div>
                  </div>
                  <div className="ext-step">
                    <div className="ext-step-number">5</div>
                    <div className="ext-step-content">
                      <strong>Giriş Yapın & Kullanmaya Başlayın!</strong>
                      <span>Google Haritalar&apos;a gidin, eklenti ikonuna tıklayın, CRM hesabınızla giriş yapın. Bir arama yapıp <strong>&quot;⚡ Tüm Sonuçları Tara&quot;</strong> butonuna basın!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kullanım İpuçları */}
              <div className="ext-tips-section">
                <h3 className="ext-tips-title">💡 Kullanım İpuçları</h3>
                <ul className="ext-tips-list">
                  <li>Google Haritalar&apos;da bir arama yapın (ör. &quot;Denizli dil okulları&quot;), sonuçlar yüklendikten sonra eklenti ikonuna tıklayıp <strong>&quot;⚡ Tüm Sonuçları Tara&quot;</strong> butonuna basın.</li>
                  <li>Eklenti, sol paneldeki <strong>tüm işletmelerin</strong> adı, telefon ve adres bilgilerini toplu olarak tarar.</li>
                  <li>Her işletme için CRM çakışma kontrolü otomatik yapılır — kayıtlı olanlar 🔴, yeni olanlar 🟢 ile gösterilir.</li>
                  <li>Uygun işletmeleri tek tek <strong>&quot;+ Ekle&quot;</strong> butonu ile şubenize ekleyebilirsiniz.</li>
                  <li>İşletme detay sayfasında beliren <strong>&quot;AIESEC CRM&quot;</strong> widget&apos;ı ile popup açmadan da tek tıkla ekleyebilirsiniz.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="ext-modal-footer">
              <button className="ext-download-btn" onClick={handleDownload}>
                <Download size={18} />
                Eklentiyi İndir (.zip)
              </button>
              <button className="ext-close-btn" onClick={() => setShowModal(false)}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
