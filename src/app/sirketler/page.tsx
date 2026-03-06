'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Filter, Plus, X, Save, Download } from 'lucide-react';
import { CompanyCard, CompanySidebar } from '@/components/companies';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanies, createCompany } from '@/actions/companies';
import { getAllActivities } from '@/actions/activities';
import Modal from '@/components/common/Modal';
import { Company, CompanyFilter, CompanyStatus, Activity } from '@/types';
import './page.css';


const categories = ['Teknoloji', 'Kamu', 'Startup', 'Finans', 'Sağlık', 'Eğitim'];
const statuses: { value: CompanyStatus; label: string }[] = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'pasif', label: 'Pasif' },
  { value: 'pozitif', label: 'Pozitif' },
  { value: 'negatif', label: 'Negatif' },
];

const contactCounts = [
  { value: '', label: 'Tümü' },
  { value: 'none', label: 'Bağlantı Yok' },
  { value: 'some', label: '1-5 Bağlantı' },
  { value: 'many', label: '5+ Bağlantı' },
];
const proposalStatuses = [
  { value: '', label: 'Tümü' },
  { value: 'true', label: 'Teklif Var' },
  { value: 'false', label: 'Teklif Yok' },
];
const companyStatuses = [
  { value: '', label: 'Aktif & Pasif' },
  { value: 'aktif', label: 'Sadece Aktif' },
  { value: 'pasif', label: 'Sadece Pasif' },
];

export default function CompaniesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<CompanyFilter>({});
  const [tempFilters, setTempFilters] = useState<CompanyFilter>({});
  const [visibleCount, setVisibleCount] = useState(12);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add company form state
  const [newCompany, setNewCompany] = useState({
    name: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    domain: '',
    taxId: '',
    status: 'aktif' as CompanyStatus,
    notes: '',
  });

  // Fetch Companies and Activities on Mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      if (user?.id && user?.id !== 'loading') {
        const [fetchedCompanies, fetchedActivities] = await Promise.all([
          getCompanies(user.id),
          getAllActivities(user.id)
        ]);
        setCompanies(fetchedCompanies);
        setAllActivities(fetchedActivities);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [user?.id]);

  // Reset temp filters when modal opens
  useEffect(() => {
    if (showFilter) {
      setTempFilters(filters);
    }
  }, [showFilter, filters]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1100);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showMobileModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileModal]);

  // Close modal on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileModal(false);
        if (!isMobile) setSelectedCompany(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      if (filters.category && company.category !== filters.category) return false;
      if (filters.status && company.status !== filters.status) return false;
      if (filters.hasProposal !== undefined) {
        const hasProposal = company.activeProposals > 0;
        if (filters.hasProposal !== hasProposal) return false;
      }
      if (filters.assignedTo && (!company.assignedManagerIds || !company.assignedManagerIds.includes(filters.assignedTo))) return false;
      if (filters.contactCount) {
        if (filters.contactCount === 'none' && company.contactCount > 0) return false;
        if (filters.contactCount === 'some' && (company.contactCount < 1 || company.contactCount > 5)) return false;
        if (filters.contactCount === 'many' && company.contactCount <= 5) return false;
      }
      return true;
    });
  }, [filters, companies]);

  const displayedCompanies = filteredCompanies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCompanies.length;

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    if (isMobile) {
      setShowMobileModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowMobileModal(false);
  };

  const handleApplyFilters = (newFilters: CompanyFilter) => {
    setFilters(newFilters);
    setVisibleCount(12);
  };

  const handleResetFilters = () => {
    setFilters({});
    setVisibleCount(12);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!user || user.id === 'loading') return;
    const result = await createCompany({
      name: newCompany.name,
      category: newCompany.category,
      location: newCompany.location,
      phone: newCompany.phone,
      email: newCompany.email,
      website: newCompany.website,
      domain: newCompany.domain,
      taxId: newCompany.taxId,
      status: newCompany.status,
      notes: newCompany.notes,
    }, user.id);

    if (result.success && result.data) {
      setCompanies([result.data, ...companies]);
      alert(`Şirket eklendi: ${result.data.name}`);
      setShowAddModal(false);
      setNewCompany({
        name: '',
        category: '',
        location: '',
        phone: '',
        email: '',
        website: '',
        domain: '',
        taxId: '',
        status: 'aktif',
        notes: '',
      });
    } else {
      alert(result.error || "Şirket eklenirken bir hata oluştu.");
    }
    setIsLoading(false);
  };

  const handleExportCSV = () => {
    const headers = ['Şirket Adı', 'Kategori', 'Konum', 'Telefon', 'E-posta', 'Websitesi', 'Durum', 'Açılan Teklif', 'Kayıt Tarihi'];
    const rows = filteredCompanies.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.location.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.website || ''}"`,
      `"${c.status}"`,
      c.activeProposals,
      new Date(c.createdAt).toLocaleDateString('tr-TR')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sirketler_disa_aktarim_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const recentActivities = selectedCompany
    ? allActivities.filter(a => a.companyId === selectedCompany.id)
    : [];

  return (
    <div className="companies-page">
      <div className="companies-page__main">
        <div className="companies-page__header">
          <div className="companies-page__title">
            <Building2 className="companies-page__title-icon" />
            <h1 className="companies-page__title-text">Tüm Şirketler</h1>
          </div>
          <div className="companies-page__actions">
            <button
              className="companies-page__filter-btn"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="companies-page__filter-btn-icon" />
              Filtrele
            </button>
            <button
              className="companies-page__filter-btn"
              onClick={handleExportCSV}
              style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <Download className="companies-page__filter-btn-icon" />
              Dışa Aktar
            </button>
            <button
              className="companies-page__add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="companies-page__add-btn-icon" />
              Yeni Şirket Ekle
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
            Şirketler yükleniyor...
          </div>
        ) : (
          <div className="companies-page__grid">
            {displayedCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => handleCompanyClick(company)}
              />
            ))}
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="companies-page__load-more">
            <button
              className="companies-page__load-more-btn"
              onClick={handleLoadMore}
            >
              Daha Fazla Yükle
            </button>
          </div>
        )}
      </div>

      {selectedCompany && (
        <CompanySidebar
          company={selectedCompany}
          recentActivities={recentActivities}
          onViewProfile={() => router.push(`/sirketler/${selectedCompany.id}`)}
          onManageActivities={() => router.push('/aktiviteler')}
        />
      )}

      {/* Mobile Modal */}
      {showMobileModal && selectedCompany && (
        <>
          <div
            className="companies-page__modal-overlay"
            onClick={handleCloseModal}
          />
          <div className="companies-page__modal">
            <button
              className="companies-page__modal-close"
              onClick={handleCloseModal}
            >
              <X />
            </button>
            <CompanySidebar
              company={selectedCompany}
              recentActivities={recentActivities}
              onViewProfile={() => {
                handleCloseModal();
                router.push(`/sirketler/${selectedCompany.id}`);
              }}
              onManageActivities={() => {
                handleCloseModal();
                router.push('/aktiviteler');
              }}
            />
          </div>
        </>
      )}

      {/* Add Company Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Yeni Şirket Ekle"
        maxWidth="600px"
      >
        <form className="modal__form" onSubmit={handleAddCompany}>
          <div className="modal__section">
            <h4 className="modal__section-title">Şirket Bilgileri</h4>
            <div className="modal__row">
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
              <div className="modal__field">
                <label className="modal__label modal__label--required">Kategori</label>
                <select
                  className="modal__select"
                  value={newCompany.category}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label modal__label--required">Konum</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="Şehir, Ülke"
                  value={newCompany.location}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
              <div className="modal__field">
                <label className="modal__label">Durum</label>
                <select
                  className="modal__select"
                  value={newCompany.status}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, status: e.target.value as CompanyStatus }))}
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
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
            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label">Website</label>
                <input
                  type="url"
                  className="modal__input"
                  placeholder="https://www.sirket.com"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              <div className="modal__field">
                <label className="modal__label">Domain (Alan Adı)</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="sirket.com"
                  value={newCompany.domain}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, domain: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal__field">
              <label className="modal__label">Vergi Numarası (Tax ID)</label>
              <input
                type="text"
                className="modal__input"
                placeholder="Örn: 1234567890"
                value={newCompany.taxId}
                onChange={(e) => setNewCompany(prev => ({ ...prev, taxId: e.target.value }))}
              />
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

          <div className="modal__actions">
            <button
              type="button"
              className="modal__btn modal__btn--secondary"
              onClick={() => setShowAddModal(false)}
            >
              İptal
            </button>
            <button type="submit" className="modal__btn modal__btn--primary">
              <Save />
              Kaydet
            </button>
          </div>
        </form>
      </Modal>

      {/* Filter Modal */}
      {showFilter && (
        <>
          <div className="filter-modal__overlay" onClick={() => setShowFilter(false)} />
          <div className="filter-modal">
            <div className="filter-modal__header">
              <div className="filter-modal__icon">
                <Filter />
              </div>
              <button className="filter-modal__close" onClick={() => setShowFilter(false)}>
                <X />
              </button>
            </div>
            <div className="filter-modal__content">
              <h2 className="filter-modal__title">Filtrele</h2>
              <p className="filter-modal__message">Şirketleri filtrelemek için seçenekleri belirleyin</p>
            </div>
            <div className="filter-modal__form">
              <div className="filter-modal__group">
                <label className="filter-modal__label">Kategori</label>
                <select
                  className="filter-modal__select"
                  value={tempFilters.category || ''}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                >
                  <option value="">Tümü</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="filter-modal__group">
                <label className="filter-modal__label">Bağlantı Sayısı</label>
                <select
                  className="filter-modal__select"
                  value={tempFilters.contactCount || ''}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, contactCount: (e.target.value || undefined) as 'none' | 'some' | 'many' | undefined }))}
                >
                  {contactCounts.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-modal__group">
                <label className="filter-modal__label">Teklif Durumu</label>
                <select
                  className="filter-modal__select"
                  value={tempFilters.hasProposal !== undefined ? String(tempFilters.hasProposal) : ''}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, hasProposal: e.target.value ? e.target.value === 'true' : undefined }))}
                >
                  {proposalStatuses.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-modal__group">
                <label className="filter-modal__label">Durum</label>
                <select
                  className="filter-modal__select"
                  value={tempFilters.status || ''}
                  onChange={(e) => setTempFilters(prev => ({ ...prev, status: (e.target.value || undefined) as CompanyStatus | undefined }))}
                >
                  {companyStatuses.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-modal__actions">
              <button
                className="filter-modal__btn filter-modal__btn--cancel"
                onClick={() => {
                  setTempFilters({});
                  setFilters({});
                  setShowFilter(false);
                }}
              >
                Sıfırla
              </button>
              <button
                className="filter-modal__btn filter-modal__btn--primary"
                onClick={() => {
                  setFilters(tempFilters);
                  setShowFilter(false);
                }}
              >
                Uygula
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
