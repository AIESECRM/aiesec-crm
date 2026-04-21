'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2, Plus, X, Save, LayoutList, Columns, Edit2, Linkedin,
  Phone, Mail, Users, RefreshCw
} from 'lucide-react';
import { CompanySidebar } from '@/components/companies';
import Modal from '@/components/common/Modal';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import StatusBadge from '@/components/common/StatusBadge';
import './page.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'POSITIVE', label: 'Pozitif' },
  { value: 'NEGATIVE', label: 'Negatif' },
  { value: 'NO_ANSWER', label: 'Cevap Yok' },
  { value: 'CALL_AGAIN', label: 'Tekrar Ara' },
  { value: 'MEETING_PLANNED', label: 'Toplantı Planlandı' },
];

// Durum → Türkçe etiket
const STATUS_LABELS: Record<string, string> = {
  POSITIVE: 'Pozitif',
  NEGATIVE: 'Negatif',
  NO_ANSWER: 'Cevap Yok',
  CALL_AGAIN: 'Tekrar Ara',
  MEETING_PLANNED: 'Toplantı Planlandı',
};

// Durum rengi
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  POSITIVE:        { bg: '#dcfce7', color: '#16a34a' },
  NEGATIVE:        { bg: '#fee2e2', color: '#dc2626' },
  NO_ANSWER:       { bg: '#f3f4f6', color: '#6b7280' },
  CALL_AGAIN:      { bg: '#fef9c3', color: '#ca8a04' },
  MEETING_PLANNED: { bg: '#dbeafe', color: '#1d4ed8' },
};

const PRODUCT_TABS = [
  { value: '', label: 'Tümü' },
  { value: 'GTE', label: 'GTe' },
  { value: 'GTA', label: 'GTa' },
  { value: 'EWA', label: 'EwA' },
  { value: 'GV', label: 'GV' },
];

const PRODUCT_COLORS: Record<string, string> = {
  GTE: '#037EF3',
  GTA: '#F85A40',
  EWA: '#00A651',
  GV: '#FAB432',
};

const KANBAN_COLUMNS = [
  { status: 'NO_ANSWER', label: 'Cevap Yok', color: '#6b7280' },
  { status: 'CALL_AGAIN', label: 'Tekrar Ara', color: '#f59e0b' },
  { status: 'POSITIVE', label: 'Pozitif', color: '#10b981' },
  { status: 'MEETING_PLANNED', label: 'Toplantı Planlandı', color: '#3b82f6' },
  { status: 'NEGATIVE', label: 'Negatif', color: '#ef4444' },
];

const CHAPTER_OPTIONS = [
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

// Chapter → okunabilir etiket
const CHAPTER_LABELS: Record<string, string> = Object.fromEntries(
  CHAPTER_OPTIONS.map(c => [c.value, c.label])
);

const EMPTY_FORM = {
  name: '', phone: '', email: '', status: 'NO_ANSWER', notes: '',
  chapter: '', documentUrl: '', documentName: '', products: [] as string[], linkedinUrl: ''
};

function ProductBadges({ products }: { products?: string }) {
  if (!products) return null;
  const list = products.split(',').filter(Boolean);
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {list.map(p => (
        <span key={p} style={{
          backgroundColor: `${PRODUCT_COLORS[p] || '#6b7280'}20`,
          color: PRODUCT_COLORS[p] || '#6b7280',
          fontSize: '10px', fontWeight: '700', padding: '2px 7px',
          borderRadius: '20px', border: `1px solid ${PRODUCT_COLORS[p] || '#6b7280'}40`
        }}>{p === 'EWA' ? 'EwA' : p === 'GTE' ? 'GTe' : p === 'GTA' ? 'GTa' : p}</span>
      ))}
    </div>
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const { user } = useAuth() as any;
  const isNationalRole = user && ['MCP', 'MCVP', 'ADMIN'].includes(user.role);
  const isManagerRole = user && ['LCP', 'LCVP', 'TL'].includes(user.role);

  const [companies, setCompanies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [bulkCount, setBulkCount] = useState(0);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [newCompany, setNewCompany] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (user && !isNationalRole && !newCompany.chapter) {
      setNewCompany(prev => ({ ...prev, chapter: user.chapter || '' }));
    }
  }, [user, isNationalRole]);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1100);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showMobileModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMobileModal]);

  // Sidebar'ı dışına tıklayınca kapat
  useEffect(() => {
    if (!selectedCompany || isMobile) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSelectedCompany(null);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [selectedCompany, isMobile]);

  const fetchData = async () => {
    setLoading(true);
    const [companiesRes, activitiesRes] = await Promise.all([
      fetch('/api/companies').then(r => r.json()),
      fetch('/api/activities').then(r => r.json()),
    ]);
    setCompanies(companiesRes.companies || []);
    setActivities(activitiesRes.activities || []);
    setLoading(false);
  };

  const handleAddCompany = async (e: React.FormEvent, keepOpen = false) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newCompany,
        products: newCompany.products.join(','),
      }),
    });
    if (res.ok) {
      setBulkCount(prev => prev + 1);
      if (keepOpen) {
        setNewCompany({
          ...EMPTY_FORM,
          chapter: isNationalRole ? '' : (user?.chapter || ''),
          products: [],
        });
      } else {
        setShowAddModal(false);
        setBulkCount(0);
        setNewCompany({
          ...EMPTY_FORM,
          chapter: isNationalRole ? '' : (user?.chapter || ''),
          products: [],
        });
      }
      fetchData();
    }
    setSubmitting(false);
  };

  // Drag-and-drop kanban: status güncelleme
  const handleDrop = async (companyId: string, newStatus: string) => {
    setCompanies(prev => prev.map(c => c.id === parseInt(companyId) ? { ...c, status: newStatus } : c));
    await fetch(`/api/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setDragOverStatus(null);
  };

  // Product filtresi
  const filteredCompanies = companies.filter(c => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterProduct) {
      const compProducts = (c.products || '').split(',').filter(Boolean);
      if (!compProducts.includes(filterProduct)) return false;
    }
    return true;
  });

  const displayedCompanies = filteredCompanies.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCompanies.length;

  const handleCompanyClick = (company: any) => {
    setSelectedCompany(company);
    if (isMobile) setShowMobileModal(true);
  };

  const recentActivities = selectedCompany
    ? activities.filter(a => a.companyId === selectedCompany.id)
    : [];

  const toggleProduct = (product: string) => {
    setNewCompany(prev => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter(p => p !== product)
        : [...prev.products, product]
    }));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Yükleniyor...</div>;

  return (
    <div className="companies-page">
      <div className="companies-page__main">

        {/* ─── HEADER ─── */}
        <div className="companies-page__header">
          <div className="companies-page__title">
            <Building2 className="companies-page__title-icon" />
            <h1 className="companies-page__title-text">Şirketler &amp; Aramalar</h1>
          </div>
          <div className="companies-page__actions">
            {/* Liste / Kanban toggle */}
            <div className="view-toggle">
              <button
                className={`view-toggle__btn ${viewMode === 'list' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <LayoutList size={15} /> Liste
              </button>
              <button
                className={`view-toggle__btn ${viewMode === 'kanban' ? 'view-toggle__btn--active' : ''}`}
                onClick={() => setViewMode('kanban')}
              >
                <Columns size={15} /> Kanban
              </button>
            </div>
            <button className="companies-page__add-btn" onClick={() => { setBulkCount(0); setShowAddModal(true); }}>
              <Plus className="companies-page__add-btn-icon" />
              Yeni Şirket Ekle
            </button>
          </div>
        </div>

        {/* ─── PRODUCT PILL TABS ─── */}
        <div className="product-tabs">
          {PRODUCT_TABS.map(tab => (
            <button
              key={tab.value}
              className={`product-tab ${filterProduct === tab.value ? 'product-tab--active' : ''}`}
              onClick={() => setFilterProduct(tab.value)}
            >
              {tab.label}
            </button>
          ))}
          {/* Status filter */}
          <select
            className="companies-page__status-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* ─── LIST VIEW ─── */}
        {viewMode === 'list' && (
          <>
            {filteredCompanies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Şirket bulunamadı.</div>
            ) : (
              <div className="companies-table-wrapper">
                <table className="companies-table">
                  <thead>
                    <tr>
                      <th>Şirket Adı</th>
                      <th>Product</th>
                      <th>Sektör</th>
                      <th>Durum</th>
                      <th>Temsilci</th>
                      <th>LC</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedCompanies.map(company => (
                      <tr key={company.id} onClick={() => handleCompanyClick(company)} className="companies-table__row">
                        <td>
                          <div className="companies-table__name">
                            <div className="companies-table__icon">
                              <Building2 size={14} />
                            </div>
                            <span>{company.name}</span>
                            {company.linkedinUrl && (
                              <a
                                href={company.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{ color: '#0a66c2', display: 'flex' }}
                              >
                                <Linkedin size={13} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td><ProductBadges products={company.products} /></td>
                        <td><span className="companies-table__muted">{company.category || '—'}</span></td>
                        <td>
                          {(() => {
                            const s = (company.status || '').toUpperCase();
                            const sc = STATUS_COLORS[s] || { bg: '#f3f4f6', color: '#6b7280' };
                            return (
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: sc.bg,
                                color: sc.color,
                                whiteSpace: 'nowrap'
                              }}>
                                {STATUS_LABELS[s] || company.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td>
                          <span className="companies-table__muted">
                            {company.managers?.[0]?.name || '—'}
                            {company.managers?.length > 1 ? ` +${company.managers.length - 1}` : ''}
                          </span>
                        </td>
                        <td><span className="companies-table__muted">{company.chapter ? (CHAPTER_LABELS[company.chapter] || company.chapter) : '—'}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            className="companies-table__edit-btn"
                            onClick={() => router.push(`/sirketler/${company.id}`)}
                          >
                            <Edit2 size={13} /> Düzenle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {hasMore && (
              <div className="companies-page__load-more">
                <button className="companies-page__load-more-btn" onClick={() => setVisibleCount(prev => prev + 20)}>
                  Daha Fazla Yükle ({filteredCompanies.length - visibleCount} kaldı)
                </button>
              </div>
            )}
          </>
        )}

        {/* ─── KANBAN VIEW ─── */}
        {viewMode === 'kanban' && (
          <div className="kanban-board">
            {KANBAN_COLUMNS.map(col => {
              const colCompanies = filteredCompanies.filter(c => c.status === col.status);
              return (
                <div
                  key={col.status}
                  className={`kanban-col ${dragOverStatus === col.status ? 'kanban-col--drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOverStatus(col.status); }}
                  onDragLeave={() => setDragOverStatus(null)}
                  onDrop={e => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData('companyId');
                    if (id) handleDrop(id, col.status);
                  }}
                >
                  <div className="kanban-col__header" style={{ borderTopColor: col.color }}>
                    <span className="kanban-col__title" style={{ color: col.color }}>{col.label}</span>
                    <span className="kanban-col__count">{colCompanies.length}</span>
                  </div>
                  <div className="kanban-col__cards">
                    {colCompanies.map(company => (
                      <div
                        key={company.id}
                        className="kanban-card"
                        draggable
                        onDragStart={e => e.dataTransfer.setData('companyId', String(company.id))}
                        onClick={() => handleCompanyClick(company)}
                      >
                        <div className="kanban-card__header">
                          <span className="kanban-card__name">{company.name}</span>
                          {company.linkedinUrl && (
                            <a
                              href={company.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ color: '#0a66c2' }}
                            ><Linkedin size={12} /></a>
                          )}
                        </div>
                        {company.category && (
                          <div className="kanban-card__meta">{company.category}</div>
                        )}
                        <ProductBadges products={company.products} />
                        <div className="kanban-card__footer">
                          <span className="kanban-card__info">
                            <RefreshCw size={11} /> {company._count?.offers ?? 0} teklif
                          </span>
                          <span className="kanban-card__info">
                            <Users size={11} /> {company._count?.contacts ?? 0}
                          </span>
                        </div>
                      </div>
                    ))}
                    {colCompanies.length === 0 && (
                      <div className="kanban-col__empty">Şirket yok</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── DESKTOP SIDEBAR ─── */}
      {selectedCompany && !isMobile && (
        <div ref={sidebarRef}>
          <CompanySidebar
            company={selectedCompany}
            recentActivities={recentActivities}
            onViewProfile={() => router.push(`/sirketler/${selectedCompany.id}`)}
            onManageActivities={() => router.push('/aktiviteler')}
            onUpdate={fetchData}
          />
        </div>
      )}

      {/* ─── MOBILE MODAL ─── */}
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
              onUpdate={fetchData}
            />
          </div>
        </>
      )}

      {/* ─── ADD COMPANY MODAL ─── */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setBulkCount(0); }} title="Yeni Şirket Ekle" maxWidth="620px">
        {bulkCount > 0 && (
          <div style={{
            margin: '0 0 12px 0', padding: '10px 16px', backgroundColor: '#dcfce7',
            borderRadius: '8px', color: '#166534', fontSize: '13px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            ✓ {bulkCount} şirket eklendi — yeni ekleyebilirsiniz
          </div>
        )}
        <form className="modal__form" onSubmit={e => handleAddCompany(e, false)}>
          <div className="modal__section">
            <h4 className="modal__section-title">Şirket Bilgileri</h4>
            <div className="modal__field">
              <label className="modal__label modal__label--required">Şirket Adı</label>
              <input
                type="text"
                className="modal__input"
                placeholder="Şirket adı girin"
                value={newCompany.name}
                onChange={e => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label">Durum</label>
                <select
                  className="modal__select"
                  value={newCompany.status}
                  onChange={e => setNewCompany(prev => ({ ...prev, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.filter(s => s.value).map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              {isNationalRole && (
                <div className="modal__field">
                  <label className="modal__label">Şube</label>
                  <select
                    className="modal__select"
                    value={newCompany.chapter}
                    onChange={e => setNewCompany(prev => ({ ...prev, chapter: e.target.value }))}
                  >
                    <option value="">Şube seçin</option>
                    {CHAPTER_OPTIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Product multi-select */}
            <div className="modal__field">
              <label className="modal__label">Hedef Ürün(ler)</label>
              <div className="product-checkbox-group">
                {PRODUCT_TABS.filter(t => t.value).map(tab => (
                  <label key={tab.value} className={`product-checkbox ${newCompany.products.includes(tab.value) ? 'product-checkbox--checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={newCompany.products.includes(tab.value)}
                      onChange={() => toggleProduct(tab.value)}
                    />
                    <span style={{ color: newCompany.products.includes(tab.value) ? PRODUCT_COLORS[tab.value] : undefined }}>
                      {tab.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal__section">
            <h4 className="modal__section-title">İletişim Bilgileri</h4>
            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label">Telefon</label>
                <input type="tel" className="modal__input" placeholder="+90 XXX XXX XX XX"
                  value={newCompany.phone} onChange={e => setNewCompany(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="modal__field">
                <label className="modal__label">E-posta</label>
                <input type="email" className="modal__input" placeholder="info@sirket.com"
                  value={newCompany.email} onChange={e => setNewCompany(prev => ({ ...prev, email: e.target.value }))} />
              </div>
            </div>
            <div className="modal__field">
              <label className="modal__label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Linkedin size={14} color="#0a66c2" /> LinkedIn URL
              </label>
              <input type="url" className="modal__input" placeholder="https://linkedin.com/company/..."
                value={newCompany.linkedinUrl} onChange={e => setNewCompany(prev => ({ ...prev, linkedinUrl: e.target.value }))} />
            </div>
          </div>

          <div className="modal__section">
            <h4 className="modal__section-title">Notlar</h4>
            <div className="modal__field">
              <textarea className="modal__textarea" placeholder="Şirket hakkında notlar..."
                value={newCompany.notes} onChange={e => setNewCompany(prev => ({ ...prev, notes: e.target.value }))} rows={3} />
            </div>
          </div>

          <div className="modal__section">
            <h4 className="modal__section-title">Doküman (Opsiyonel)</h4>
            <div className="modal__field">
              <FileUpload onUploadSuccess={(url, name) => setNewCompany(prev => ({ ...prev, documentUrl: url, documentName: name }))} />
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={() => { setShowAddModal(false); setBulkCount(0); }}>İptal</button>
            <button
              type="button"
              className="modal__btn modal__btn--secondary"
              disabled={submitting || !newCompany.name}
              onClick={e => handleAddCompany(e as any, true)}
              style={{ color: 'var(--primary-400)', borderColor: 'var(--primary-400)' }}
            >
              <Plus size={16} />
              {submitting ? 'Kaydediliyor...' : 'Kaydet & Yeni Ekle'}
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={submitting}>
              <Save size={16} />
              {submitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}