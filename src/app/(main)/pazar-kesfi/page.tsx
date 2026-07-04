'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  ShieldCheck,
  Building2,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import './page.css';

const CITY_OPTIONS = [
  "Aydın", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya",
  "Denizli", "Eskişehir", "Gaziantep", "Kocaeli", "Konya",
  "Kütahya", "Sakarya", "Trabzon", "Adana"
];

const KEYWORD_SUGGESTIONS = [
  "Dil Okulları", "Yazılım Şirketleri", "Tekstil Fabrikaları",
  "Oteller & Turizm", "Lojistik Firmaları", "İhracat Şirketleri"
];

interface ResearchItem {
  name: string;
  phone: string;
  address: string;
  matchStatus: 'NONE' | 'SAME_CHAPTER';
  matchedCompany?: {
    id: number;
    name: string;
    status: string;
    chapter?: string;
    lastActivityDate?: number;
  };
}

export default function MarketResearchPage() {
  const router = useRouter();
  const { user } = useAuth() as any;
  const [city, setCity] = useState("Aydın");
  const [keyword, setKeyword] = useState("Dil Okulları");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<ResearchItem[]>([]);
  const [quota, setQuota] = useState<{ used: number; maxLimit: number; fromCache: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [addingName, setAddingName] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!city.trim() || !keyword.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/market-research?city=${encodeURIComponent(city)}&keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data.items || []);
        setQuota(data.quota || null);
      } else {
        setErrorMsg(data.error || "Arama sırasında bir hata oluştu.");
        if (data.quota) setQuota(data.quota);
      }
    } catch (err) {
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (item: ResearchItem) => {
    setAddingName(item.name);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          phone: item.phone,
          category: keyword,
          chapter: user?.chapter || '',
          status: 'NO_ANSWER',
          notes: `${city} Pazar Keşfi üzerinden eklendi. Adres: ${item.address}`
        })
      });

      const data = await res.json();
      if (res.ok && data.company) {
        // Kartı şubede kayıtlı olarak güncelle
        setResults(prev => prev.map(r => r.name === item.name ? {
          ...r,
          matchStatus: 'SAME_CHAPTER',
          matchedCompany: {
            id: data.company.id,
            name: data.company.name,
            status: data.company.status,
            chapter: data.company.chapter
          }
        } : r));
      } else {
        alert(data.error || "Şirket eklenemedi.");
      }
    } catch (err) {
      alert("Bağlantı hatası.");
    } finally {
      setAddingName(null);
    }
  };

  const quotaPerc = quota ? Math.min(100, Math.round((quota.used / quota.maxLimit) * 100)) : 0;

  return (
    <div className="pazar-container">
      <div className="pazar-header">
        <h1 className="pazar-title">
          <Compass size={30} color="var(--primary-400)" />
          Akıllı Pazar Keşfi (Market Research)
        </h1>
        <p className="pazar-subtitle">
          Google üzerinde manuel arama yapma ve CRM çakışma kontrolü eziyetine son! İşletmeleri arayın, CRM veritabanı ile çakışma kontrolü yapın ve tek tıkla şubenize ekleyin.
        </p>
      </div>

      {/* KOTA BARI */}
      <div className="quota-card">
        <div className="quota-info">
          <ShieldCheck size={24} color="var(--primary-400)" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-regular)' }}>
              Aylık Ücretsiz Google API Bütçe Koruması
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {quota ? (
                <>Bu ay kullanılan sorgu: <strong>{quota.used}</strong> / {quota.maxLimit} (%{quotaPerc}) {quota.fromCache ? '(⚡ Son arama önbellekten 0 maliyetle geldi)' : ''}</>
              ) : (
                'Bütçe koruma sistemi aktif. Aylık ücretsiz limitler asla aşılmaz.'
              )}
            </div>
          </div>
        </div>
        {quota && (
          <div className="quota-bar-wrapper">
            <div className="quota-bar-fill" style={{ width: `${quotaPerc}%` }} />
          </div>
        )}
      </div>

      {/* ARAMA KUTUSU */}
      <div className="pazar-search-box">
        <form onSubmit={handleSearch} className="pazar-form">
          <div className="form-group">
            <label className="form-label"><MapPin size={15} /> Şehir / Bölge</label>
            <select
              className="form-select"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label"><Building2 size={15} /> Sektör veya Anahtar Kelime</label>
            <input
              type="text"
              className="form-input"
              placeholder="Örn: Dil Okulları, Tekstil Şirketleri..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            <div className="keyword-suggestions">
              {KEYWORD_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setKeyword(s)}
                  className="keyword-suggestion-btn"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="search-btn" disabled={loading}>
            <Search size={18} />
            {loading ? "Taranıyor..." : "Keşfet ve Kontrol Et"}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="pazar-error-box">
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && !errorMsg && (
        <div className="pazar-empty-state">
          <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>Bu Bölgede İşletme Bulunamadı</h3>
          <p>
            &quot;{city}&quot; bölgesinde &quot;{keyword}&quot; araması için sonuç bulunamadı. Lütfen aramanızı genelleştirin veya Google Places API anahtarınızın yapılandırmasını kontrol edin.
          </p>
        </div>
      )}

      {/* SONUÇLAR */}
      {results.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-regular)' }}>
            Bulunan İşletmeler ({results.length})
          </h2>
          <div className="results-grid">
            {results.map((item, idx) => (
              <div key={idx} className="result-card">
                <div className="card-top">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div className="company-name">{item.name}</div>
                    {item.matchStatus === 'SAME_CHAPTER' ? (
                      <span className="badge badge--same">
                        <AlertCircle size={13} /> Şubenizde Kayıtlı
                      </span>
                    ) : (
                      <span className="badge badge--clean">
                        <CheckCircle2 size={13} /> Uygun / Yeni
                      </span>
                    )}
                  </div>

                  <div className="info-row">
                    <Phone size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item.phone || "Telefon belirtilmemiş"}</span>
                  </div>

                  <div className="info-row">
                    <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item.address}</span>
                  </div>
                </div>

                <div className="card-actions">
                  {item.matchStatus === 'SAME_CHAPTER' && item.matchedCompany ? (
                    <button
                      type="button"
                      className="view-btn"
                      onClick={() => router.push(`/sirketler/${item.matchedCompany!.id}`)}
                    >
                      <ExternalLink size={15} /> CRM&apos;de Görüntüle
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="add-btn"
                      disabled={addingName === item.name || !item.phone}
                      onClick={() => handleQuickAdd(item)}
                    >
                      <Plus size={16} />
                      {addingName === item.name ? "Ekleniyor..." : "Şubeme Ekle & Başla"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
