'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Filter, Plus, X, Save } from 'lucide-react';
import { CompanyCard, CompanySidebar } from '@/components/companies';
import Modal from '@/components/common/Modal';
import AppToast from '@/components/common/AppToast';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import AppLoader from '@/components/common/AppLoader';
import { mockCompanies, mockActivities } from '@/data/mockData';
import './page.css';


const STATUS_OPTIONS = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'POSITIVE', label: 'Pozitif' },
  { value: 'NEGATIVE', label: 'Negatif' },
  { value: 'NO_ANSWER', label: 'Cevap Yok' },
  { value: 'CALL_AGAIN', label: 'Tekrar Ara' },
  { value: 'MEETING_PLANNED', label: 'Toplantı Planlandı' },
];

const CHAPTER_OPTIONS = [
  { value: '', label: 'Tüm Şubeler' },
  { value: 'ADANA', label: 'Adana' },
  { value: 'ANKARA', label: 'Ankara' },
  { value: 'ANTALYA', label: 'Antalya' },
  { value: 'BURSA', label: 'Bursa' },
  { value: 'DENIZLI', label: 'Denizli' },
  { value: 'DOGU_AKDENIZ', label: 'Doğu Akdeniz' },
  { value: 'ESKISEHIR', label: 'Eskişehir' },
  { value: 'GAZIANTEP', label: 'Gaziantep' },
  { value: 'ISTANBUL', label: 'İstanbul' },
  { value: 'ISTANBUL_ASYA', label: 'İstanbul Asya' },
  { value: 'BATI_ISTANBUL', label: 'Batı İstanbul' },
  { value: 'IZMIR', label: 'İzmir' },
  { value: 'KOCAELI', label: 'Kocaeli' },
  { value: 'KONYA', label: 'Konya' },
  { value: 'KUTAHYA', label: 'Kütahya' },
  { value: 'SAKARYA', label: 'Sakarya' },
  { value: 'TRABZON', label: 'Trabzon' },
];

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'warning' | 'info' }>({
    open: false,
    message: '',
    type: 'info',
  });

  const [newCompany, setNewCompany] = useState({
    name: '', phone: '', email: '', status: 'NO_ANSWER', notes: '', chapter: '', documentUrl: '', documentName: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1100);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showMobileModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMobileModal]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [companiesRes, activitiesRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/activities'),
      ]);

      if (!companiesRes.ok || !activitiesRes.ok) {
        throw new Error('API is not available');
      }

      const companiesData = await companiesRes.json();
      const activitiesData = await activitiesRes.json();

      const apiCompanies = companiesData.companies || [];
      const apiActivities = activitiesData.activities || [];

      if (apiCompanies.length === 0) {
        setCompanies(mockCompanies);
        setActivities(mockActivities);
      } else {
        setCompanies(apiCompanies);
        setActivities(apiActivities);
      }
    } catch {
      setCompanies(mockCompanies);
      setActivities(mockActivities);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompany),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewCompany({ name: '', phone: '', email: '', status: 'NO_ANSWER', notes: '', chapter: '', documentUrl: '', documentName: '' });
        fetchData();
        setToast({ open: true, message: 'Şirket başarıyla eklendi.', type: 'success' });
      } else {
        const localCompany = {
          id: `${Date.now()}`,
          name: newCompany.name,
          phone: newCompany.phone || null,
          email: newCompany.email || null,
          status: newCompany.status,
          notes: newCompany.notes || null,
          chapter: newCompany.chapter || null,
          category: null,
          location: null,
          website: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedManagerIds: [],
        };
        setCompanies(prev => [localCompany, ...prev]);
        setShowAddModal(false);
        setNewCompany({ name: '', phone: '', email: '', status: 'NO_ANSWER', notes: '', chapter: '', documentUrl: '', documentName: '' });
        setToast({ open: true, message: 'Şirket eklendi (yerel kayıt).', type: 'warning' });
      }
    } catch {
      const localCompany = {
        id: `${Date.now()}`,
        name: newCompany.name,
        phone: newCompany.phone || null,
        email: newCompany.email || null,
        status: newCompany.status,
        notes: newCompany.notes || null,
        chapter: newCompany.chapter || null,
        category: null,
        location: null,
        website: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedManagerIds: [],
      };
      setCompanies(prev => [localCompany, ...prev]);
      setShowAddModal(false);
      setNewCompany({ name: '', phone: '', email: '', status: 'NO_ANSWER', notes: '', chapter: '', documentUrl: '', documentName: '' });
      setToast({ open: true, message: 'Bağlantı sorunu nedeniyle yerel kayıt yapıldı.', type: 'warning' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(c => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterChapter && c.chapter !== filterChapter) return false;
    return true;
  });

  const displayedCompanies = filteredCompanies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCompanies.length;
  const hasActiveFilters = Boolean(filterStatus || filterChapter);
  const activeFilterCount = Number(Boolean(filterStatus)) + Number(Boolean(filterChapter));
  const statusLabel = STATUS_OPTIONS.find(option => option.value === filterStatus)?.label;
  const chapterLabel = CHAPTER_OPTIONS.find(option => option.value === filterChapter)?.label;
  const lastUpdatedLabel = new Date().toLocaleDateString('tr-TR');

  const activeFilterChips = [
    filterStatus ? { key: 'status', label: `Durum: ${statusLabel}` } : null,
    filterChapter ? { key: 'chapter', label: `Şube: ${chapterLabel}` } : null,
  ].filter(Boolean) as Array<{ key: 'status' | 'chapter'; label: string }>;

  const clearFilter = (key: 'status' | 'chapter') => {
    if (key === 'status') {
      setFilterStatus('');
      return;
    }
    setFilterChapter('');
  };

  const handleCompanyClick = (company: any) => {
    setSelectedCompany(company);
    if (isMobile) setShowMobileModal(true);
  };

  const recentActivities = selectedCompany
    ? activities.filter(a => a.companyId === selectedCompany.id)
    : [];

  if (loading) return <AppLoader label="Sirketler yukleniyor..." showSkeleton skeletonCount={8} />;

  return (
    <div className="companies-page">
      <div className="companies-page__main">
        <div className="companies-page__header">
          <div className="companies-page__title">
            <Building2 className="companies-page__title-icon" />
            <h1 className="companies-page__title-text">Tüm Şirketler</h1>
          </div>
          <div className="companies-page__actions">
            <button className={`companies-page__filter-btn ${hasActiveFilters ? 'companies-page__filter-btn--active' : ''}`} onClick={() => setShowFilter(!showFilter)}>
              <Filter className="companies-page__filter-btn-icon" />
              {hasActiveFilters ? 'Filtreler Aktif' : 'Filtrele'}
            </button>
            <button className="companies-page__add-btn" onClick={() => setShowAddModal(true)}>
              <Plus className="companies-page__add-btn-icon" />
              Yeni Şirket Ekle
            </button>
          </div>
        </div>

        <div className="companies-page__summary">
          <span className="companies-page__summary-count">{filteredCompanies.length}</span>
          <span className="companies-page__summary-label">şirket listeleniyor</span>
        </div>

        <div className="companies-page__context-bar">
          <span className="companies-page__context-item">Toplam: {companies.length}</span>
          <span className="companies-page__context-separator" aria-hidden="true">•</span>
          <span className="companies-page__context-item">Aktif filtre: {activeFilterCount}</span>
          <span className="companies-page__context-separator" aria-hidden="true">•</span>
          <span className="companies-page__context-item">Güncellendi: {lastUpdatedLabel}</span>
        </div>

        {hasActiveFilters && (
          <div className="companies-page__chips">
            {activeFilterChips.map(chip => (
              <button
                key={chip.key}
                className="companies-page__chip"
                onClick={() => clearFilter(chip.key)}
              >
                {chip.label}
                <X className="companies-page__chip-icon" />
              </button>
            ))}
            <button className="companies-page__chip companies-page__chip--clear" onClick={() => { setFilterStatus(''); setFilterChapter(''); }}>
              Tümünü Temizle
            </button>
          </div>
        )}

        {filteredCompanies.length === 0 ? (
          <div className="app-empty-state">
            <Building2 className="app-empty-state__icon" />
            <div className="app-empty-state__title">Şirket bulunamadı</div>
            <div className="app-empty-state__hint">Filtreleri temizleyip tekrar deneyebilirsin.</div>
          </div>
        ) : (
          <div className="companies-page__grid">
            {displayedCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} onClick={() => handleCompanyClick(company)} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="companies-page__load-more">
            <button className="companies-page__load-more-btn" onClick={() => setVisibleCount(prev => prev + 12)}>
              Daha Fazla Yükle
            </button>
          </div>
        )}
      </div>

      {selectedCompany && !isMobile && (
        <CompanySidebar
          company={selectedCompany}
          recentActivities={recentActivities}
          onViewProfile={() => router.push(`/sirketler/${selectedCompany.id}`)}
          onManageActivities={() => router.push('/aktiviteler')}
        />
      )}

      {showMobileModal && selectedCompany && (
        <>
          <div className="companies-page__modal-overlay" onClick={() => setShowMobileModal(false)} />
          <div className="companies-page__modal">
            <button className="companies-page__modal-close" onClick={() => setShowMobileModal(false)}><X /></button>
            <CompanySidebar
              company={selectedCompany}
              recentActivities={recentActivities}
              onViewProfile={() => { setShowMobileModal(false); router.push(`/sirketler/${selectedCompany.id}`); }}
              onManageActivities={() => { setShowMobileModal(false); router.push('/aktiviteler'); }}
            />
          </div>
        </>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Şirket Ekle" maxWidth="600px">
        <form className="modal__form" onSubmit={handleAddCompany}>
          <div className="modal__section">
            <h4 className="modal__section-title">Şirket Bilgileri</h4>
            <div className="modal__field">
              <label className="modal__label modal__label--required">Şirket Adı</label>
              <input
                type="text"
                className="modal__input"
                placeholder="Şirket adı girin"
                value={newCompany.name}
                onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label">Durum</label>
                <select
                  className="modal__select"
                  value={newCompany.status}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.filter(s => s.value).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="modal__field">
                <label className="modal__label">Şube</label>
                <select
                  className="modal__select"
                  value={newCompany.chapter}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, chapter: e.target.value }))}
                >
                  <option value="">Şube seçin</option>
                  {CHAPTER_OPTIONS.filter(c => c.value).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="modal__section">
            <h4 className="modal__section-title">İletişim Bilgileri</h4>
            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label">Telefon</label>
                <input
                  type="tel"
                  className="modal__input"
                  placeholder="+90 XXX XXX XX XX"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="modal__field">
                <label className="modal__label">E-posta</label>
                <input
                  type="email"
                  className="modal__input"
                  placeholder="info@sirket.com"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="modal__section">
            <h4 className="modal__section-title">Notlar</h4>
            <div className="modal__field">
              <textarea
                className="modal__textarea"
                placeholder="Şirket hakkında notlar..."
                value={newCompany.notes}
                onChange={(e) => setNewCompany(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="modal__section">
            <h4 className="modal__section-title">Doküman (Opsiyonel)</h4>
            <div className="modal__field">
              <FileUpload
                onUploadSuccess={(url, name) => setNewCompany(prev => ({ ...prev, documentUrl: url, documentName: name }))}
              />
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setShowAddModal(false)}>İptal</button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={submitting}>
              <Save />
              {submitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {showFilter && (
        <>
          <div className="filter-modal__overlay" onClick={() => setShowFilter(false)} />
          <div className="filter-modal">
            <div className="filter-modal__header">
              <div className="filter-modal__icon"><Filter /></div>
              <button className="filter-modal__close" onClick={() => setShowFilter(false)}><X /></button>
            </div>
            <div className="filter-modal__content">
              <h2 className="filter-modal__title">Filtrele</h2>
            </div>
            <div className="filter-modal__form">
              <div className="filter-modal__group">
                <label className="filter-modal__label">Durum</label>
                <select className="filter-modal__select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="filter-modal__group">
                <label className="filter-modal__label">Şube</label>
                <select className="filter-modal__select" value={filterChapter} onChange={(e) => setFilterChapter(e.target.value)}>
                  {CHAPTER_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="filter-modal__actions">
              <button className="filter-modal__btn filter-modal__btn--cancel" onClick={() => { setFilterStatus(''); setFilterChapter(''); setShowFilter(false); }}>Sıfırla</button>
              <button className="filter-modal__btn filter-modal__btn--primary" onClick={() => setShowFilter(false)}>Uygula</button>
            </div>
          </div>
        </>
      )}

      <AppToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}