'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Building2, Phone, Mail, Edit3, Settings, ExternalLink,
  User, MessageSquare, Clock, Search, Filter, MoreVertical, Users,
  RefreshCw, X, Bell, Trash2, Shield, Eye, Copy, FileText, Upload, Plus
} from 'lucide-react';
import ConfirmModal from '@/components/common/ConfirmModal';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import './page.css';

const ACTIVITY_LABELS: Record<string, string> = {
  COLD_CALL: 'Cold Call', MEETING: 'Görüşme', EMAIL: 'Email', FOLLOW_UP: 'Takip',
};

const STATUS_LABELS: Record<string, string> = {
  POSITIVE: 'Pozitif', NEGATIVE: 'Negatif', NO_ANSWER: 'Cevap Yok',
  CALL_AGAIN: 'Tekrar Ara', MEETING_PLANNED: 'Toplantı Planlandı',
};

const CHAPTER_LABELS: Record<string, string> = {
  ADANA: 'Adana', ANKARA: 'Ankara', ANTALYA: 'Antalya', BURSA: 'Bursa',
  DENIZLI: 'Denizli', DOGU_AKDENIZ: 'Doğu Akdeniz', ESKISEHIR: 'Eskişehir',
  GAZIANTEP: 'Gaziantep', ISTANBUL: 'İstanbul', ISTANBUL_ASYA: 'İstanbul Asya',
  BATI_ISTANBUL: 'Batı İstanbul', IZMIR: 'İzmir', KOCAELI: 'Kocaeli',
  KONYA: 'Konya', KUTAHYA: 'Kütahya', SAKARYA: 'Sakarya', TRABZON: 'Trabzon',
};

const PRODUCT_LABELS: Record<string, string> = { GTA: 'GTa', GV: 'GV', GTE: 'GTe' };
const DURATION_LABELS: Record<string, string> = { SHORT: 'Kısa Dönem', MEDIUM: 'Orta Dönem', LONG: 'Uzun Dönem' };
const OPEN_STATUS_LABELS: Record<string, string> = { NEW_OPEN: 'New Open', RE_OPEN: 'Re Open' };

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [deleteActivityModal, setDeleteActivityModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [deleteCompanyModal, setDeleteCompanyModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const menuRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchData();
  }, [params.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

 const fetchData = async () => {
    try {
      setLoading(true);
      // fetch isteklerine { cache: 'no-store' } ekliyoruz
      const fetchOptions = { cache: 'no-store' as RequestCache };

      const [companyRes, contactsRes, activitiesRes, offersRes] = await Promise.all([
        fetch(`/api/companies/${params.id}`, fetchOptions),
        fetch(`/api/contacts?companyId=${params.id}`, fetchOptions),
        fetch(`/api/activities?companyId=${params.id}`, fetchOptions),
        fetch(`/api/offers?companyId=${params.id}`, fetchOptions),
      ]);

      const companyData = companyRes.ok ? await companyRes.json() : { company: null };
      const contactsData = contactsRes.ok ? await contactsRes.json() : { contacts: [] };
      const activitiesData = activitiesRes.ok ? await activitiesRes.json() : { activities: [] };
      const offersData = offersRes.ok ? await offersRes.json() : { offers: [] };

      setCompany(companyData.company || null);
      setContacts(contactsData.contacts || []);
      setActivities(activitiesData.activities || []);
      setOffers(offersData.offers || []);
      setDocuments(companyData.company?.documents || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteActivity = async () => {
    if (!deleteActivityModal.activity) return;
    await fetch(`/api/activities/${deleteActivityModal.activity.id}`, { method: 'DELETE' });
    setDeleteActivityModal({ isOpen: false, activity: null });
    fetchData();
  };

  const handleEditActivity = async () => {
    if (!editModal.activity) return;
    await fetch(`/api/activities/${editModal.activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: editNote }),
    });
    setEditModal({ isOpen: false, activity: null });
    fetchData();
  };

  const handleDeleteCompany = async () => {
    await fetch(`/api/companies/${params.id}`, { method: 'DELETE' });
    router.push('/sirketler');
  };

  const filteredActivities = activities.filter(activity => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (activity.note && activity.note.toLowerCase().includes(query)) ||
      activity.type.toLowerCase().includes(query) ||
      (ACTIVITY_LABELS[activity.type] && ACTIVITY_LABELS[activity.type].toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Yükleniyor...</div>; 

  if (!company) return (
    <div className="company-detail">
      <p>Şirket bulunamadı</p>
    </div>
  );

  return (
    <div className="company-detail">
      <div className="company-detail__header">
        <button className="company-detail__back" onClick={() => router.back()}>
          <ArrowLeft className="company-detail__back-icon" />
          Geri Dön
        </button>
        <div className="company-detail__actions">
          <button className="company-detail__action-btn company-detail__action-btn--outline" onClick={() => setShowSettingsModal(true)}>
            <Settings className="company-detail__action-icon" />
            Şirket Ayarları
          </button>
        </div>
      </div>

      <div className="company-detail__content">
        {/* Company Info */}
        <div className="company-detail__info">
          <div className="company-detail__info-header">
            <div className="company-detail__icon"><Building2 /></div>
            <div className="company-detail__title">
              <h1 className="company-detail__name">{company.name}</h1>
              <div className="company-detail__meta">
                <span className="company-detail__meta-item">
                  {STATUS_LABELS[company.status] || company.status}
                </span>
                {company.chapter && (
                  <>
                    <span>•</span>
                    <span className="company-detail__meta-item">
                      {CHAPTER_LABELS[company.chapter] || company.chapter}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="company-detail__info-grid">
            <div className="company-detail__info-row">
              <Phone className="company-detail__info-icon" />
              <div className="company-detail__info-content">
                <div className="company-detail__info-label">Telefon:</div>
                <div className="company-detail__info-value">{company.phone || '—'}</div>
              </div>
            </div>
            <div className="company-detail__info-row">
              <Mail className="company-detail__info-icon" />
              <div className="company-detail__info-content">
                <div className="company-detail__info-label">E-Posta:</div>
                <div className="company-detail__info-value">{company.email || '—'}</div>
              </div>
            </div>
          </div>

          {company.notes && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: '#374151' }}>
              {company.notes}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="company-detail__card">
          <div className="company-detail__card-header">
            <h3 className="company-detail__card-title">Bağlantılar</h3>
            <div className="company-detail__card-count">
              <Users className="company-detail__card-count-icon" />
              {contacts.length}
            </div>
          </div>
          <div className="company-detail__contact-list">
            {contacts.length > 0 ? contacts.map((contact: any) => (
              <div key={contact.id} className="company-detail__contact-item">
                <div className="company-detail__contact-left">
                  <div className="company-detail__contact-avatar">
                    <User className="company-detail__contact-avatar-icon" />
                  </div>
                  <div>
                    <div className="company-detail__contact-name">{contact.name}</div>
                    {contact.email && <div style={{ fontSize: '12px', color: '#6b7280' }}>{contact.email}</div>}
                  </div>
                </div>
                <div className="company-detail__contact-actions">
                  {contact.phone && (
                    <button className="company-detail__contact-action"><Phone className="company-detail__contact-action-icon" /></button>
                  )}
                  <button className="company-detail__contact-action"><MessageSquare className="company-detail__contact-action-icon" /></button>
                </div>
              </div>
            )) : (
              <p style={{ color: '#6b7280', fontSize: '14px', padding: '8px' }}>Henüz bağlantı eklenmemiş.</p>
            )}
          </div>
        </div>

        {/* Offers */}
        <div className="company-detail__card">
          <div className="company-detail__card-header">
            <h3 className="company-detail__card-title">Teklifler</h3>
            <div className="company-detail__card-count">
              <RefreshCw className="company-detail__card-count-icon" />
              {offers.length}
            </div>
          </div>
          <div className="company-detail__proposal-list">
            {offers.length > 0 ? offers.map((offer: any) => (
              <div key={offer.id} className="company-detail__proposal-item">
                <div className="company-detail__proposal-left">
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{offer.title}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {PRODUCT_LABELS[offer.product]} • {DURATION_LABELS[offer.duration]} • {OPEN_STATUS_LABELS[offer.openStatus]}
                    </div>
                  </div>
                </div>
                {offer.value && (
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#059669' }}>
                    {offer.value.toLocaleString('tr-TR')} TL
                  </span>
                )}
              </div>
            )) : (
              <p style={{ color: '#6b7280', fontSize: '14px', padding: '8px' }}>Henüz teklif eklenmemiş.</p>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="company-detail__card">
          <div className="company-detail__card-header">
            <h3 className="company-detail__card-title">Dokümanlar</h3>
            <div className="company-detail__card-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="company-detail__card-count">
                <FileText className="company-detail__card-count-icon" />
                {documents.length}
              </div>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="company-detail__add-doc-btn"
                style={{ background: '#037EF3', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s shadow-sm hover:bg-[#0266c8] active:scale-95' }}
              >
                <Plus size={16} /> Yeni Doküman Ekle
              </button>
            </div>
          </div>
          <div className="company-detail__proposal-list">
            {documents.length > 0 ? documents.map((doc: any) => (
              <div key={doc.id} className="company-detail__proposal-item" style={{ alignItems: 'center' }}>
                <div className="company-detail__proposal-left">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} className="text-gray-400" />
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{doc.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {new Date(doc.createdAt * 1000).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontWeight: '500', fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={14} /> Aç
                </a>
              </div>
            )) : (
              <p style={{ color: '#6b7280', fontSize: '14px', padding: '8px' }}>Doküman bulunmamaktadır.</p>
            )}
          </div>
        </div>

      </div>

      {/* Activities Table */}
      <div className="company-detail__activities">
        <div className="company-detail__activities-header">
          <h2 className="company-detail__activities-title">Aktiviteler</h2>
          <div className="company-detail__activities-actions">
            <div className="company-detail__activities-search">
              <Search className="company-detail__activities-search-icon" />
              <input
                type="text"
                className="company-detail__activities-search-input"
                placeholder="Ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="company-detail__table-wrapper">
          <table className="company-detail__table">
            <thead>
              <tr>
                <th>Tür</th>
                <th>Tarih</th>
                <th>Kullanıcı</th>
                <th>Not</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedActivities.length > 0 ? paginatedActivities.map((activity: any) => (
                <tr key={activity.id}>
                  <td>
                    <span style={{
                      backgroundColor: '#e0f2fe', color: '#0369a1',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                    }}>
                      {ACTIVITY_LABELS[activity.type] || activity.type}
                    </span>
                  </td>
                  <td>{new Date(activity.date * 1000).toLocaleDateString('tr-TR')}</td>
                  <td>{activity.user?.name || '—'}</td>
                  <td>
                    <div className="company-detail__table-note">
                      {activity.note || '—'}
                    </div>
                  </td>
                  <td>
                    <div className="company-detail__menu-wrapper" ref={openMenuId === String(activity.id) ? menuRef : null}>
                      <button className="company-detail__table-action" onClick={() => setOpenMenuId(openMenuId === String(activity.id) ? null : String(activity.id))}>
                        <MoreVertical className="company-detail__table-action-icon" />
                      </button>
                      {openMenuId === String(activity.id) && (
                        <div className="company-detail__dropdown">
                          <button className="company-detail__dropdown-item" onClick={() => { setDetailModal({ isOpen: true, activity }); setOpenMenuId(null); }}>
                            <Eye className="company-detail__dropdown-icon" /> Detaylar
                          </button>
                          <button className="company-detail__dropdown-item" onClick={() => { setEditModal({ isOpen: true, activity }); setEditNote(activity.note || ''); setOpenMenuId(null); }}>
                            <Edit3 className="company-detail__dropdown-icon" /> Düzenle
                          </button>
                          <button className="company-detail__dropdown-item company-detail__dropdown-item--danger" onClick={() => { setDeleteActivityModal({ isOpen: true, activity }); setOpenMenuId(null); }}>
                            <Trash2 className="company-detail__dropdown-icon" /> Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="company-detail__table-empty">Aktivite bulunamadı</td></tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination__pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setShowSettingsModal(false)} />
          <div className="company-detail__settings-modal">
            <div className="company-detail__settings-header">
              <h2 className="company-detail__settings-title">Şirket Ayarları</h2>
              <button className="company-detail__settings-close" onClick={() => setShowSettingsModal(false)}><X /></button>
            </div>
            <div className="company-detail__settings-content">
              <div className="company-detail__settings-section company-detail__settings-section--danger">
                <h3 className="company-detail__settings-section-title">Tehlikeli Alan</h3>
                <button className="company-detail__settings-danger-btn" onClick={() => { setShowSettingsModal(false); setDeleteCompanyModal(true); }}>
                  <Trash2 /> Şirketi Sil
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.activity && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setDetailModal({ isOpen: false, activity: null })} />
          <div className="company-detail__activity-modal">
            <div className="company-detail__activity-modal-header">
              <h2 className="company-detail__activity-modal-title">Aktivite Detayı</h2>
              <button className="company-detail__activity-modal-close" onClick={() => setDetailModal({ isOpen: false, activity: null })}><X /></button>
            </div>
            <div className="company-detail__activity-modal-content">
              <div className="company-detail__activity-modal-row">
                <span className="company-detail__activity-modal-label">Tür</span>
                <span className="company-detail__activity-modal-value">{ACTIVITY_LABELS[detailModal.activity.type]}</span>
              </div>
              <div className="company-detail__activity-modal-row">
                <span className="company-detail__activity-modal-label">Kullanıcı</span>
                <span className="company-detail__activity-modal-value">{detailModal.activity.user?.name || '—'}</span>
              </div>
              <div className="company-detail__activity-modal-row">
                <span className="company-detail__activity-modal-label">Tarih</span>
                <span className="company-detail__activity-modal-value">{new Date(detailModal.activity.date * 1000).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="company-detail__activity-modal-row">
                <span className="company-detail__activity-modal-label">Not</span>
                <span className="company-detail__activity-modal-value">{detailModal.activity.note || '—'}</span>
              </div>
            </div>
            <div className="company-detail__activity-modal-actions">
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--secondary" onClick={() => setDetailModal({ isOpen: false, activity: null })}>Kapat</button>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && editModal.activity && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setEditModal({ isOpen: false, activity: null })} />
          <div className="company-detail__activity-modal">
            <div className="company-detail__activity-modal-header">
              <h2 className="company-detail__activity-modal-title">Aktivite Düzenle</h2>
              <button className="company-detail__activity-modal-close" onClick={() => setEditModal({ isOpen: false, activity: null })}><X /></button>
            </div>
            <div className="company-detail__activity-modal-content">
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Not</label>
                <textarea
                  className="company-detail__activity-modal-form-textarea"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>
            </div>
            <div className="company-detail__activity-modal-actions">
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--secondary" onClick={() => setEditModal({ isOpen: false, activity: null })}>İptal</button>
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--primary" onClick={handleEditActivity}>Kaydet</button>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteActivityModal.isOpen}
        onClose={() => setDeleteActivityModal({ isOpen: false, activity: null })}
        onConfirm={handleDeleteActivity}
        title="Aktiviteyi Sil"
        message="Bu aktiviteyi silmek istediğinizden emin misiniz?"
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />

      <ConfirmModal
        isOpen={deleteCompanyModal}
        onClose={() => setDeleteCompanyModal(false)}
        onConfirm={handleDeleteCompany}
        title="Şirketi Sil"
        message={`"${company.name}" şirketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Şirketi Sil"
        cancelText="İptal"
        type="danger"
      />

      {/* Upload Document Modal */}
      {showUploadModal && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setShowUploadModal(false)} />
          <div className="company-detail__activity-modal">
            <div className="company-detail__activity-modal-header">
              <h2 className="company-detail__activity-modal-title">Doküman Yükle</h2>
              <button className="company-detail__activity-modal-close" onClick={() => setShowUploadModal(false)}><X /></button>
            </div>
            <div className="company-detail__activity-modal-content" style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
              <FileUpload
                onUploadSuccess={async (url, name) => {
                  setUploadingDoc(true);
                  try {
                    // Dosya veritabanına kaydedilir
                    const res = await fetch(`/api/companies/${params.id}/documents`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, url })
                    });
                    
                    if (res.ok) {
                      const data = await res.json();
                      
                      // 1. Yeni dökümanı anında mevcut listeye ekle (State Güncellemesi)
                      // API'den dönen data.document objesini listeye dahil ediyoruz
                      setDocuments(prevDocs => [...prevDocs, data.document]);
                      
                      // 2. Modalı kapat
                      setShowUploadModal(false);
                      
                      // Not: fetchData() çağrısını kaldırdık. Böylece sayfa loading ekranına 
                      // düşmeyecek ve yeni doküman anında listede belirecektir.
                    } else {
                      console.error("Doküman veritabanına kaydedilemedi.");
                    }
                  } catch (error) {
                    console.error("Doküman yükleme hatası:", error);
                  } finally {
                    setUploadingDoc(false);
                  }
                }}
              />
              {uploadingDoc && (
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                  Veritabanına kaydediliyor...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
