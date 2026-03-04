'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ListTodo, 
  Filter, 
  Phone, 
  Clock, 
  MessageSquare, 
  Mail,
  Building2,
  User,
  MoreVertical,
  X,
  Eye,
  Edit3,
  Trash2,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityType } from '@/types';
import ConfirmModal from '@/components/common/ConfirmModal';
import './page.css';

const activityTypes: { type: ActivityType; label: string; icon: React.ReactNode }[] = [
  { type: 'COLD_CALL', label: 'Cold Call', icon: <Phone /> },
  { type: 'FOLLOW_UP', label: 'Takip', icon: <Clock /> },
  { type: 'MEETING', label: 'Görüşme', icon: <MessageSquare /> },
  { type: 'EMAIL', label: 'Email', icon: <Mail /> },
];

const activityTypeLabels: Record<ActivityType, string> = {
  COLD_CALL: 'Cold Call',
  FOLLOW_UP: 'Takip',
  MEETING: 'Görüşme',
  EMAIL: 'Email',
};

const CHAPTER_LABELS: Record<string, string> = {
  ADANA: 'Adana', ANKARA: 'Ankara', ANTALYA: 'Antalya', BURSA: 'Bursa',
  DENIZLI: 'Denizli', DOGU_AKDENIZ: 'Doğu Akdeniz', ESKISEHIR: 'Eskişehir',
  GAZIANTEP: 'Gaziantep', ISTANBUL: 'İstanbul', ISTANBUL_ASYA: 'İstanbul Asya',
  BATI_ISTANBUL: 'Batı İstanbul', IZMIR: 'İzmir', KOCAELI: 'Kocaeli',
  KONYA: 'Konya', KUTAHYA: 'Kütahya', SAKARYA: 'Sakarya', TRABZON: 'Trabzon',
};

export default function ActivitiesPage() {
  const { user } = useAuth() as any;
  const [selectedType, setSelectedType] = useState<ActivityType>('COLD_CALL');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<ActivityType | ''>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [companies, setCompanies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [editNote, setEditNote] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchCompanies();
    fetchActivities();
  }, []);

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
  }, [filterType, searchQuery]);

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies');
    const data = await res.json();
    setCompanies(data.companies || []);
    if (data.companies?.length > 0) setSelectedCompanyId(String(data.companies[0].id));
  };

  const fetchActivities = async () => {
    setLoading(true);
    const res = await fetch('/api/activities');
    const data = await res.json();
    setActivities(data.activities || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setSubmitting(true);

    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: selectedType,
        note: notes,
        companyId: Number(selectedCompanyId),
        date: new Date().toISOString(),
      }),
    });

    if (res.ok) {
      setNotes('');
      fetchActivities();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.activity) return;
    await fetch(`/api/activities/${deleteModal.activity.id}`, { method: 'DELETE' });
    setDeleteModal({ isOpen: false, activity: null });
    fetchActivities();
  };

  const handleEdit = async () => {
    if (!editModal.activity) return;
    await fetch(`/api/activities/${editModal.activity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: editNote }),
    });
    setEditModal({ isOpen: false, activity: null });
    fetchActivities();
  };

  const filteredActivities = activities.filter(a => {
    if (filterType && a.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.user?.name?.toLowerCase().includes(q) ||
        a.company?.name?.toLowerCase().includes(q) ||
        a.note?.toLowerCase().includes(q) ||
        activityTypeLabels[a.type as ActivityType]?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="activities-page">
      {/* Activity Form Sidebar */}
      <div className="activities-page__sidebar">
        <form className="activity-form" onSubmit={handleSubmit}>
          <h2 className="activity-form__title">Aktivite Ekle</h2>

          <div className="activity-form__group">
            <label className="activity-form__label">Şirket Seçimi</label>
            <select
              className="activity-form__select"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              required
            >
              <option value="">Şirket seçin...</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>

          <div className="activity-form__group">
            <label className="activity-form__label">Aktivite Seçimi</label>
            <div className="activity-form__types">
              {activityTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  type="button"
                  className={`activity-form__type activity-form__type--${type.toLowerCase()} ${selectedType === type ? 'activity-form__type--selected' : ''}`}
                  onClick={() => setSelectedType(type)}
                >
                  <span className="activity-form__type-icon">{icon}</span>
                  <span className="activity-form__type-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="activity-form__group">
            <label className="activity-form__label">Notlar</label>
            <textarea
              className="activity-form__textarea"
              placeholder="Aktivite ile ilgili notlarınızı yazın..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="activity-form__submit" disabled={submitting}>
            {submitting ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </form>
      </div>

      {/* Activity List */}
      <div className="activities-page__main">
        <div className="activities-page__header">
          <div className="activities-page__title">
            <ListTodo className="activities-page__title-icon" />
            <h1 className="activities-page__title-text">Aktiviteler</h1>
          </div>
          <div className="activities-page__header-actions">
            <div className="activities-page__search">
              <Search className="activities-page__search-icon" />
              <input
                type="text"
                className="activities-page__search-input"
                placeholder="Ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="activities-page__filter-btn" onClick={() => setShowFilter(!showFilter)}>
              <Filter className="activities-page__filter-btn-icon" />
              Filtrele
            </button>
          </div>
        </div>

        {/* Activity Log Table */}
        <div className="activity-log">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Yükleniyor...</div>
          ) : (
            <table className="activity-log__table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Şirket</th>
                  <th>Tür</th>
                  <th>Tarih</th>
                  <th>Not</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.length > 0 ? paginatedActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="activity-log__user">
                      <div className="activity-log__user-avatar"><User /></div>
                      <span className="activity-log__user-name">{activity.user?.name || '—'}</span>
                    </td>
                    <td style={{ fontSize: '14px', color: '#374151' }}>{activity.company?.name || '—'}</td>
                    <td>
                      <span style={{
                        backgroundColor: '#e0f2fe', color: '#0369a1',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {activityTypeLabels[activity.type as ActivityType] || activity.type}
                      </span>
                    </td>
                    <td className="activity-log__date">
                      {new Date(activity.date * 1000).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="activity-log__note">{activity.note || '—'}</td>
                    <td className="activity-log__actions">
                      <div className="activity-log__menu-wrapper" ref={openMenuId === String(activity.id) ? menuRef : null}>
                        <button className="activity-log__action-btn" onClick={() => setOpenMenuId(openMenuId === String(activity.id) ? null : String(activity.id))}>
                          <MoreVertical />
                        </button>
                        {openMenuId === String(activity.id) && (
                          <div className="activity-log__dropdown">
                            <button className="activity-log__dropdown-item" onClick={() => { setDetailModal({ isOpen: true, activity }); setOpenMenuId(null); }}>
                              <Eye className="activity-log__dropdown-icon" /> Detaylar
                            </button>
                            <button className="activity-log__dropdown-item" onClick={() => { setEditModal({ isOpen: true, activity }); setEditNote(activity.note || ''); setOpenMenuId(null); }}>
                              <Edit3 className="activity-log__dropdown-icon" /> Düzenle
                            </button>
                            <button className="activity-log__dropdown-item activity-log__dropdown-item--danger" onClick={() => { setDeleteModal({ isOpen: true, activity }); setOpenMenuId(null); }}>
                              <Trash2 className="activity-log__dropdown-icon" /> Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="activity-log__empty">Aktivite bulunamadı</td></tr>
                )}
              </tbody>
            </table>
          )}

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

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.activity && (
        <>
          <div className="activity-modal__overlay" onClick={() => setDetailModal({ isOpen: false, activity: null })} />
          <div className="activity-modal">
            <div className="activity-modal__header">
              <h2 className="activity-modal__title">Aktivite Detayı</h2>
              <button className="activity-modal__close" onClick={() => setDetailModal({ isOpen: false, activity: null })}><X /></button>
            </div>
            <div className="activity-modal__content">
              <div className="activity-modal__row">
                <span className="activity-modal__label">Kullanıcı</span>
                <span className="activity-modal__value">{detailModal.activity.user?.name || '—'}</span>
              </div>
              <div className="activity-modal__row">
                <span className="activity-modal__label">Şirket</span>
                <span className="activity-modal__value">{detailModal.activity.company?.name || '—'}</span>
              </div>
              <div className="activity-modal__row">
                <span className="activity-modal__label">Tür</span>
                <span className="activity-modal__value">{activityTypeLabels[detailModal.activity.type as ActivityType]}</span>
              </div>
              <div className="activity-modal__row">
                <span className="activity-modal__label">Şube</span>
                <span className="activity-modal__value">{detailModal.activity.company?.chapter ? CHAPTER_LABELS[detailModal.activity.company.chapter] : '—'}</span>
              </div>
              <div className="activity-modal__row">
                <span className="activity-modal__label">Tarih</span>
                <span className="activity-modal__value">{new Date(detailModal.activity.date * 1000).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="activity-modal__row">
                <span className="activity-modal__label">Not</span>
                <span className="activity-modal__value">{detailModal.activity.note || '—'}</span>
              </div>
            </div>
            <div className="activity-modal__actions">
              <button className="activity-modal__btn activity-modal__btn--secondary" onClick={() => setDetailModal({ isOpen: false, activity: null })}>Kapat</button>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && editModal.activity && (
        <>
          <div className="activity-modal__overlay" onClick={() => setEditModal({ isOpen: false, activity: null })} />
          <div className="activity-modal">
            <div className="activity-modal__header">
              <h2 className="activity-modal__title">Aktivite Düzenle</h2>
              <button className="activity-modal__close" onClick={() => setEditModal({ isOpen: false, activity: null })}><X /></button>
            </div>
            <div className="activity-modal__content">
              <div className="activity-modal__form-group">
                <label className="activity-modal__form-label">Not</label>
                <textarea
                  className="activity-modal__form-textarea"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>
            </div>
            <div className="activity-modal__actions">
              <button className="activity-modal__btn activity-modal__btn--secondary" onClick={() => setEditModal({ isOpen: false, activity: null })}>İptal</button>
              <button className="activity-modal__btn activity-modal__btn--primary" onClick={handleEdit}>Kaydet</button>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, activity: null })}
        onConfirm={handleDelete}
        title="Aktiviteyi Sil"
        message="Bu aktiviteyi silmek istediğinizden emin misiniz?"
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />

      {/* Filter Modal */}
      {showFilter && (
        <>
          <div className="filter-modal__overlay" onClick={() => setShowFilter(false)} />
          <div className="filter-modal">
            <div className="filter-modal__header">
              <div className="filter-modal__icon"><Filter /></div>
              <button className="filter-modal__close" onClick={() => setShowFilter(false)}><X /></button>
            </div>
            <div className="filter-modal__content">
              <h2 className="filter-modal__title">Aktivite Türü</h2>
            </div>
            <div className="filter-modal__options">
              <label className="filter-modal__option">
                <input type="radio" name="filterType" checked={filterType === ''} onChange={() => setFilterType('')} />
                <span className="filter-modal__radio"></span>
                <span>Tümü</span>
              </label>
              {activityTypes.map(({ type, label }) => (
                <label key={type} className="filter-modal__option">
                  <input type="radio" name="filterType" checked={filterType === type} onChange={() => setFilterType(type)} />
                  <span className="filter-modal__radio"></span>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="filter-modal__actions">
              <button className="filter-modal__btn filter-modal__btn--cancel" onClick={() => { setFilterType(''); setShowFilter(false); }}>Sıfırla</button>
              <button className="filter-modal__btn filter-modal__btn--primary" onClick={() => setShowFilter(false)}>Uygula</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}