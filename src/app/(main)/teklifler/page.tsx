'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Filter, Plus, User, Building2, X, Save, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import Avatar from '@/components/common/Avatar';
import './page.css';

type OfferProduct = 'GTA' | 'GV' | 'GTE';
type OfferDuration = 'SHORT' | 'MEDIUM' | 'LONG';
type OfferOpenStatus = 'NEW_OPEN' | 'RE_OPEN';

const PRODUCT_LABELS: Record<OfferProduct, string> = { GTA: 'GTa', GV: 'GV', GTE: 'GTe' };
const DURATION_LABELS: Record<OfferDuration, string> = { SHORT: 'Kısa Dönem', MEDIUM: 'Orta Dönem', LONG: 'Uzun Dönem' };
const OPEN_STATUS_LABELS: Record<OfferOpenStatus, string> = { NEW_OPEN: 'New Open', RE_OPEN: 'Re Open' };

const PRODUCT_OPTIONS: OfferProduct[] = ['GTA', 'GV', 'GTE'];
const DURATION_OPTIONS: OfferDuration[] = ['SHORT', 'MEDIUM', 'LONG'];

export default function DealsPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState({ newOpen: 0, reOpen: 0, totalOpen: 0 });
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProduct, setFilterProduct] = useState<OfferProduct | ''>('');
  const [filterOpenStatus, setFilterOpenStatus] = useState<OfferOpenStatus | ''>('');
  const [tempFilterProduct, setTempFilterProduct] = useState<OfferProduct | ''>('');
  const [tempFilterOpenStatus, setTempFilterOpenStatus] = useState<OfferOpenStatus | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const filterWrapperRef = useRef<HTMLDivElement>(null);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  const [newOffer, setNewOffer] = useState({
    companyId: '',
    title: '',
    product: 'GTA' as OfferProduct,
    duration: 'SHORT' as OfferDuration,
    openStatus: 'NEW_OPEN' as OfferOpenStatus,
    value: '',
    documentUrl: '',
    documentName: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [editOffer, setEditOffer] = useState({
    id: '', title: '', product: 'GTA' as OfferProduct, duration: 'SHORT' as OfferDuration, openStatus: 'NEW_OPEN' as OfferOpenStatus, value: '', companyId: '', documentUrl: '', documentName: ''
  });
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    fetchData('', '');
    fetchCompanies();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
      if (!event.target || !(event.target as Element).closest('.deal-card__dropdown')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showFilter) {
      setTempFilterProduct(filterProduct);
      setTempFilterOpenStatus(filterOpenStatus);
    }
  }, [showFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterWrapperRef.current && !filterWrapperRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    if (showFilter) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilter]);

  const fetchData = async (product: string, openStatus: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (product) params.set('product', product);
    if (openStatus) params.set('openStatus', openStatus);

    const res = await fetch(`/api/offers?${params.toString()}`);
    if (res.status === 403) { setUnauthorized(true); setLoading(false); return; }
    const data = await res.json();
    setOffers(data.offers || []);
    setStats(data.stats || { newOpen: 0, reOpen: 0, totalOpen: 0 });
    setLoading(false);
  };

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies');
    const data = await res.json();
    setCompanies(data.companies || []);
  };

  const handleApplyFilter = () => {
    setFilterProduct(tempFilterProduct);
    setFilterOpenStatus(tempFilterOpenStatus);
    fetchData(tempFilterProduct, tempFilterOpenStatus);
    setShowFilter(false);
  };

  const handleResetFilter = () => {
    setTempFilterProduct('');
    setTempFilterOpenStatus('');
    setFilterProduct('');
    setFilterOpenStatus('');
    fetchData('', '');
    setShowFilter(false);
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newOffer.title,
        product: newOffer.product,
        duration: newOffer.duration,
        openStatus: newOffer.openStatus,
        value: newOffer.value ? Number(newOffer.value) : null,
        companyId: Number(newOffer.companyId),
        documentUrl: newOffer.documentUrl,
      }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewOffer({ companyId: '', title: '', product: 'GTA', duration: 'SHORT', openStatus: 'NEW_OPEN', value: '', documentUrl: '', documentName: '' });
      fetchData(filterProduct, filterOpenStatus);
    }
    setSubmitting(false);
  };

  const handleEditOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/offers/${editOffer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editOffer.title,
        product: editOffer.product,
        duration: editOffer.duration,
        openStatus: editOffer.openStatus,
        value: editOffer.value ? Number(editOffer.value) : null,
      }),
    });
    if (res.ok) {
      setShowEditModal(false);
      fetchData(filterProduct, filterOpenStatus);
    }
    setSubmitting(false);
  };

  const handleDeleteOffer = async () => {
    if (!selectedOffer) return;
    setSubmitting(true);
    const res = await fetch(`/api/offers/${selectedOffer.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setShowDeleteModal(false);
      setSelectedOffer(null);
      fetchData(filterProduct, filterOpenStatus);
    }
    setSubmitting(false);
  };

  const offersByProduct = PRODUCT_OPTIONS.reduce((acc, product) => {
    acc[product] = offers.filter(o => o.product === product);
    return acc;
  }, {} as Record<OfferProduct, any[]>);

  const totalValue = offers.reduce((sum, o) => sum + (o.value || 0), 0);

  if (unauthorized) return (
    <div className="deals-page">
      <div className="deals-page__header">
        <div className="deals-page__title">
          <DollarSign className="deals-page__title-icon" />
          <h1 className="deals-page__title-text">Satışlar</h1>
        </div>
      </div>
      <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
        Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.
      </p>
    </div>
  );

  return (
    <div className="deals-page">
      <div className="deals-page__header">
        <div className="deals-page__title">
          <DollarSign className="deals-page__title-icon" />
          <h1 className="deals-page__title-text">Satışlar</h1>
        </div>
        <div className="deals-page__actions">
          <div className="deals-page__filter-wrapper" ref={filterWrapperRef}>
            <button
              className={`deals-page__filter-btn ${filterProduct || filterOpenStatus ? 'deals-page__filter-btn--active' : ''}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="deals-page__filter-btn-icon" />
              Filtrele {filterProduct || filterOpenStatus ? '●' : ''}
            </button>
            {showFilter && (
              <div className="deals-page__filter-dropdown">
                <div className="filter-panel">
                  <div className="filter-panel__header">
                    <h3 className="filter-panel__title">Filtrele</h3>
                    <button className="filter-panel__close" onClick={() => setShowFilter(false)}><X /></button>
                  </div>
                  <div className="filter-panel__group">
                    <label className="filter-panel__label">Ürün</label>
                    <select
                      className="filter-panel__select"
                      value={tempFilterProduct}
                      onChange={(e) => setTempFilterProduct(e.target.value as OfferProduct | '')}
                    >
                      <option value="">Tümü</option>
                      {PRODUCT_OPTIONS.map(p => <option key={p} value={p}>{PRODUCT_LABELS[p]}</option>)}
                    </select>
                  </div>
                  <div className="filter-panel__group">
                    <label className="filter-panel__label">Durum</label>
                    <select
                      className="filter-panel__select"
                      value={tempFilterOpenStatus}
                      onChange={(e) => setTempFilterOpenStatus(e.target.value as OfferOpenStatus | '')}
                    >
                      <option value="">Tümü</option>
                      <option value="NEW_OPEN">New Open</option>
                      <option value="RE_OPEN">Re Open</option>
                    </select>
                  </div>
                  <div className="filter-panel__actions">
                    <button className="filter-panel__btn filter-panel__btn--primary" onClick={handleApplyFilter}>
                      Uygula
                    </button>
                    <button className="filter-panel__btn filter-panel__btn--secondary" onClick={handleResetFilter}>
                      Temizle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="deals-page__add-btn" onClick={() => setShowAddModal(true)}>
            <Plus className="deals-page__add-btn-icon" />
            Yeni Teklif
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="deals-page__stats">
        <div className="deals-page__stat">
          <div className="deals-page__stat-label">New Open</div>
          <div className="deals-page__stat-value">{stats.newOpen}</div>
        </div>
        <div className="deals-page__stat">
          <div className="deals-page__stat-label">Re Open</div>
          <div className="deals-page__stat-value">{stats.reOpen}</div>
        </div>
        <div className="deals-page__stat">
          <div className="deals-page__stat-label">Total Open</div>
          <div className="deals-page__stat-value">{stats.totalOpen}</div>
        </div>
        <div className="deals-page__stat">
          <div className="deals-page__stat-label">Toplam Değer</div>
          <div className="deals-page__stat-value deals-page__stat-value--currency">
            {totalValue.toLocaleString('tr-TR')} TL
          </div>
        </div>
      </div>

      {/* Offers by Product */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Yükleniyor...</div>
      ) : (
        <div className="kanban-wrapper">
          <div className="kanban">
            {PRODUCT_OPTIONS.map((product) => (
              <div key={product} className="kanban__column">
                <div className="kanban__column-header">
                  <span className="kanban__column-title">{PRODUCT_LABELS[product]}</span>
                  <span className="kanban__column-count">{offersByProduct[product].length}</span>
                </div>
                <div className="kanban__cards">
                  {offersByProduct[product].length > 0 ? offersByProduct[product].map((offer: any) => (
                    <div key={offer.id} className="deal-card">
                      <div className="deal-card__header">
                        <span className="deal-card__company">{offer.company?.name || '—'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {offer.value ? <span className="deal-card__value">{offer.value.toLocaleString('tr-TR')} TL</span> : <span />}
                          <div className="deal-card__dropdown" style={{ position: 'relative' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === offer.id ? null : offer.id); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-light)', borderRadius: '4px' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-light)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <MoreVertical size={16} />
                            </button>
                            {activeDropdown === offer.id && (
                              <div style={{
                                position: 'absolute', right: 0, top: '100%', backgroundColor: 'var(--dashboard-bg)',
                                border: '1px solid var(--border-color)', borderRadius: '8px', zIndex: 10,
                                minWidth: '150px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                              }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(null);
                                    setEditOffer({
                                      id: offer.id, title: offer.title, product: offer.product, duration: offer.duration, openStatus: offer.openStatus,
                                      value: offer.value || '', companyId: String(offer.companyId), documentUrl: offer.documentUrl || '', documentName: ''
                                    });
                                    setShowEditModal(true);
                                  }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px',
                                    border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-regular)'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-light)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Edit2 size={14} /> Düzenle
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(null);
                                    setSelectedOffer(offer);
                                    setShowDeleteModal(true);
                                  }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px',
                                    border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#ef4444'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-light)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <Trash2 size={14} /> Sil
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="deal-card__title">{offer.title}</div>
                      <div className="deal-card__meta">
                        <div className="deal-card__meta-row">
                          <Building2 className="deal-card__meta-icon" />
                          <span>{DURATION_LABELS[offer.duration as OfferDuration]}</span>
                        </div>
                        {offer.documentUrl && (
                          <div className="deal-card__meta-row mt-1">
                            <a href={offer.documentUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                              <span>Belge</span>
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="deal-card__footer">
                        <div className="deal-card__owner">
                          <Avatar 
                            src={offer.createdBy?.image} 
                            alt={offer.createdBy?.name} 
                            size={24} 
                            className="deal-card__owner-avatar" 
                          />
                          <span>{offer.createdBy?.name || '—'}</span>
                        </div>
                        <span style={{
                          backgroundColor: offer.openStatus === 'NEW_OPEN' ? '#dcfce7' : '#fef9c3',
                          color: offer.openStatus === 'NEW_OPEN' ? '#16a34a' : '#ca8a04',
                          padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                        }}>
                          {OPEN_STATUS_LABELS[offer.openStatus as OfferOpenStatus]}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '13px' }}>
                      Teklif yok
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Offer Modal */}
     {/* Add Offer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Teklif Ekle" maxWidth="600px">
        <form className="modal__form" onSubmit={handleAddOffer}>
          <div className="modal__section">
            <h4 className="modal__section-title">Teklif Bilgileri</h4>
            <div className="modal__row">
              
              {/* Arama özellikli şirket seçimi bloğu */}
              <div className="modal__field" ref={companyDropdownRef}>
                <label className="modal__label modal__label--required">Şirket</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="modal__input"
                    placeholder="Şirket ara..."
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setNewOffer(prev => ({ ...prev, companyId: '' }));
                      setShowCompanyDropdown(true);
                    }}
                    onFocus={() => setShowCompanyDropdown(true)}
                    required={!newOffer.companyId}
                  />
                  {showCompanyDropdown && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '200px',
                      overflowY: 'auto', backgroundColor: 'var(--dashboard-bg)', border: '1px solid var(--border-color)',
                      borderRadius: '8px', zIndex: 50, marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>
                      {companies.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase())).length > 0 ? (
                        companies.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase())).map(company => (
                          <div
                            key={company.id}
                            style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-regular)' }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setNewOffer(prev => ({ ...prev, companyId: String(company.id) }));
                              setCompanySearch(company.name);
                              setShowCompanyDropdown(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-light)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {company.name}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--text-light)' }}>Şirket bulunamadı</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal__field">
                <label className="modal__label modal__label--required">Ürün</label>
                <select className="modal__select" value={newOffer.product} onChange={(e) => setNewOffer(prev => ({ ...prev, product: e.target.value as OfferProduct }))}>
                  {PRODUCT_OPTIONS.map(p => <option key={p} value={p}>{PRODUCT_LABELS[p]}</option>)}
                </select>
              </div>
            </div>
            
            <div className="modal__field">
              <label className="modal__label modal__label--required">Teklif Başlığı</label>
              <input type="text" className="modal__input" placeholder="Proje adı girin" value={newOffer.title} onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div className="modal__row">
              <div className="modal__field">
                <label className="modal__label modal__label--required">Dönem</label>
                <select className="modal__select" value={newOffer.duration} onChange={(e) => setNewOffer(prev => ({ ...prev, duration: e.target.value as OfferDuration }))}>
                  {DURATION_OPTIONS.map(d => <option key={d} value={d}>{DURATION_LABELS[d]}</option>)}
                </select>
              </div>
              <div className="modal__field">
                <label className="modal__label modal__label--required">Durum</label>
                <select className="modal__select" value={newOffer.openStatus} onChange={(e) => setNewOffer(prev => ({ ...prev, openStatus: e.target.value as OfferOpenStatus }))}>
                  <option value="NEW_OPEN">New Open</option>
                  <option value="RE_OPEN">Re Open</option>
                </select>
              </div>
            </div>
            <div className="modal__field">
              <label className="modal__label">Değer (TL)</label>
              <input type="number" className="modal__input" placeholder="0" value={newOffer.value} onChange={(e) => setNewOffer(prev => ({ ...prev, value: e.target.value }))} min="0" />
            </div>
            
            <div className="modal__field" style={{ marginTop: '16px' }}>
              <label className="modal__label">Doküman (Opsiyonel)</label>
              <FileUpload
                onUploadSuccess={(url, name) => setNewOffer(prev => ({ ...prev, documentUrl: url, documentName: name }))}
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

      {/* Edit Offer Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Teklif Düzenle" maxWidth="600px">
        <form className="modal__form" onSubmit={handleEditOfferSubmit}>
          <div className="modal__section">
            <h4 className="modal__section-title">Teklif Bilgileri</h4>
            <div className="modal__field">
              <label className="modal__label modal__label--required">Teklif Başlığı</label>
              <input type="text" className="modal__input" placeholder="Proje adı girin" value={editOffer.title} onChange={(e) => setEditOffer(prev => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div className="modal__field">
              <label className="modal__label">Değer (TL)</label>
              <input type="number" className="modal__input" placeholder="0" value={editOffer.value} onChange={(e) => setEditOffer(prev => ({ ...prev, value: e.target.value }))} min="0" />
            </div>
          </div>
          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setShowEditModal(false)}>İptal</button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={submitting}>
              <Save />
              {submitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Teklifi Sil" maxWidth="400px">
        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-regular)', marginBottom: '24px' }}>
            Bu teklifi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setShowDeleteModal(false)}>İptal</button>
            <button type="button" className="modal__btn" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={handleDeleteOffer} disabled={submitting}>
              {submitting ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
