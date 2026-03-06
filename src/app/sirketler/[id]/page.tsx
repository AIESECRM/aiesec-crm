'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit3,
  Settings,
  ExternalLink,
  User,
  MessageSquare,
  Clock,
  Search,
  Filter,
  MoreVertical,
  DollarSign,
  Users,
  RefreshCw,
  X,
  Bell,
  Trash2,
  Shield,
  Eye,
  Copy,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyById } from '@/actions/companies';
import {
  getActivitiesByCompany,
  updateActivity,
  deleteActivity,
  addActivityComment
} from '@/actions/activities';
import { getProposalsByCompany } from '@/actions/proposals';
import { getContactsByCompany } from '@/actions/contacts';
import { Company } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmModal from '@/components/common/ConfirmModal';
import './page.css';


export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, permissions } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [addProposalModal, setAddProposalModal] = useState<{ isOpen: boolean }>({ isOpen: false });
  const [deleteProposalModal, setDeleteProposalModal] = useState<{ isOpen: boolean; proposal: any | null }>({ isOpen: false, proposal: null });
  const [addContactModal, setAddContactModal] = useState<{ isOpen: boolean }>({ isOpen: false });
  const [deleteContactModal, setDeleteContactModal] = useState<{ isOpen: boolean; contact: any | null }>({ isOpen: false, contact: null });
  const [newProposalData, setNewProposalData] = useState({ title: '', value: '', currency: 'TRY', stage: 'proposal' as const });
  const [newContactData, setNewContactData] = useState({ name: '', email: '', phone: '', position: '', isPrimary: false });
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; activity: any | null }>({ isOpen: false, activity: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [deleteActivityModal, setDeleteActivityModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [deleteCompanyModal, setDeleteCompanyModal] = useState(false);
  const [editCompanyModalOpen, setEditCompanyModalOpen] = useState(false);
  const [editCompanyData, setEditCompanyData] = useState<Partial<Company>>({});
  const [editFormData, setEditFormData] = useState({ status: '', notes: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]); // Need to implement Server Actions for these later
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    async function fetchCompanyData() {
      setIsLoading(true);
      if (params.id && typeof params.id === 'string' && user?.id && user.id !== 'loading') {
        const fetchedCompany = await getCompanyById(params.id, user.id);
        const fetchedActivities = await getActivitiesByCompany(params.id, user.id);
        const fetchedProposals = await getProposalsByCompany(params.id, user.id);
        const fetchedContacts = await getContactsByCompany(params.id, user.id);

        setCompany(fetchedCompany);
        setAllActivities(fetchedActivities);
        setProposals(fetchedProposals);
        setContacts(fetchedContacts);
      }
      setIsLoading(false);
    }
    fetchCompanyData();
  }, [params.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);
  const filteredActivities = allActivities.filter(activity => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const typeLabels: Record<string, string> = {
      'cold_call': 'cold call',
      'postponed': 'ertelendi',
      'meeting': 'görüşmede',
      'proposal': 'teklif'
    };
    return (
      (activity.notes && activity.notes.toLowerCase().includes(query)) ||
      activity.type.toLowerCase().includes(query) ||
      (typeLabels[activity.type] && typeLabels[activity.type].includes(query))
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const activities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="company-detail">
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          Şirket yükleniyor...
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="company-detail">
        <p>Şirket bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="company-detail">
      {/* Header */}
      <div className="company-detail__header">
        <button
          className="company-detail__back"
          onClick={() => router.back()}
        >
          <ArrowLeft className="company-detail__back-icon" />
          Geri Dön
        </button>

        <div className="company-detail__actions">
          <button
            className="company-detail__action-btn company-detail__action-btn--outline"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="company-detail__action-icon" />
            Şirket Ayarları
          </button>
          {permissions.canEditCompany && (
            <button
              className="company-detail__action-btn company-detail__action-btn--primary"
              onClick={() => {
                setEditCompanyData({ name: company.name, category: company.category, location: company.location, phone: company.phone, email: company.email, website: company.website });
                setEditCompanyModalOpen(true);
              }}
            >
              <ExternalLink className="company-detail__action-icon" />
              Şirket Bilgilerini Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="company-detail__content">
        {/* Company Info */}
        <div className="company-detail__info">
          <div className="company-detail__info-header">
            <div className="company-detail__icon">
              <Building2 />
            </div>
            <div className="company-detail__title">
              <h1 className="company-detail__name">{company.name}</h1>
              <div className="company-detail__meta">
                <span className="company-detail__meta-item">
                  <FileText className="company-detail__meta-icon" />
                  {company.category}
                </span>
                <span>•</span>
                <span className="company-detail__meta-item">
                  <MapPin className="company-detail__meta-icon" />
                  {company.location}
                </span>
              </div>
            </div>
          </div>

          <div className="company-detail__info-grid">
            <div className="company-detail__info-row">
              <MapPin className="company-detail__info-icon" />
              <div className="company-detail__info-content">
                <div className="company-detail__info-label">Konum:</div>
                <div className="company-detail__info-value">{company.location}</div>
              </div>
            </div>

            <div className="company-detail__info-row">
              <Phone className="company-detail__info-icon" />
              <div className="company-detail__info-content">
                <div className="company-detail__info-label">Telefon:</div>
                <div className="company-detail__info-value">{company.phone}</div>
              </div>
            </div>

            <div className="company-detail__info-row">
              <Mail className="company-detail__info-icon" />
              <div className="company-detail__info-content">
                <div className="company-detail__info-label">E-Posta:</div>
                <div className="company-detail__info-value">{company.email}</div>
              </div>
            </div>

            {company.website && (
              <div className="company-detail__info-row">
                <Globe className="company-detail__info-icon" />
                <div className="company-detail__info-content">
                  <div className="company-detail__info-label">Website:</div>
                  <div className="company-detail__info-value">{company.website}</div>
                </div>
              </div>
            )}
          </div>

          {permissions.canEditCompany && (
            <button
              className="company-detail__edit-btn"
              onClick={() => {
                setEditCompanyData({ name: company.name, category: company.category, location: company.location, phone: company.phone, email: company.email, website: company.website });
                setEditCompanyModalOpen(true);
              }}
            >
              <Edit3 className="company-detail__edit-icon" />
              Bilgileri Düzenle
            </button>
          )}
        </div>

        {/* Contacts */}
        <div className="company-detail__card">
          <div className="company-detail__card-header">
            <h3 className="company-detail__card-title">Bağlantılar</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="company-detail__card-count">
                <Users className="company-detail__card-count-icon" />
                {contacts.length}
              </div>
              {permissions.canEditCompany && (
                <button
                  onClick={() => setAddContactModal({ isOpen: true })}
                  style={{ padding: '6px 12px', backgroundColor: 'var(--primary-500)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <UserPlus size={14} /> Yeni Kişi
                </button>
              )}
            </div>
          </div>

          <div className="company-detail__contact-list">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <div key={contact.id} className="company-detail__contact-item">
                  <div className="company-detail__contact-left">
                    <div className="company-detail__contact-avatar">
                      <User className="company-detail__contact-avatar-icon" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="company-detail__contact-name">{contact.name} {contact.isPrimary && <span style={{ fontSize: '10px', color: 'var(--primary-500)', border: '1px solid var(--primary-500)', borderRadius: '4px', padding: '0 4px', marginLeft: '4px' }}>Birincil</span>}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{contact.position || 'Belirtilmedi'}</span>
                      {contact.phone && <span style={{ fontSize: '11px', color: 'var(--text-regular)' }}>{contact.phone}</span>}
                    </div>
                  </div>
                  <div className="company-detail__contact-actions">
                    <button
                      className="company-detail__contact-action"
                      style={{ color: 'var(--status-negative)' }}
                      onClick={() => setDeleteContactModal({ isOpen: true, contact })}
                    >
                      <Trash2 className="company-detail__contact-action-icon" size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-light)', padding: '16px', textAlign: 'center' }}>Henüz bağlantı kişi bulunmuyor.</div>
            )}
          </div>
        </div>

        {/* Proposals */}
        <div className="company-detail__card">
          <div className="company-detail__card-header">
            <h3 className="company-detail__card-title">Teklifler</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="company-detail__card-count">
                <RefreshCw className="company-detail__card-count-icon" />
                {proposals.length}
              </div>
              {permissions.canEditCompany && (
                <button
                  onClick={() => setAddProposalModal({ isOpen: true })}
                  style={{ padding: '6px 12px', backgroundColor: 'var(--primary-500)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <DollarSign size={14} /> Yeni Teklif
                </button>
              )}
            </div>
          </div>

          <div className="company-detail__proposal-list">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <div key={proposal.id} className="company-detail__proposal-item">
                  <div className="company-detail__proposal-left">
                    <DollarSign className="company-detail__proposal-icon" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '2px' }}>{proposal.title}</span>
                      <span className="company-detail__proposal-value" style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                        {proposal.value.toLocaleString('tr-TR')} {proposal.currency}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <StatusBadge status={proposal.stage as any} />
                    <button
                      className="company-detail__proposal-action"
                      style={{ color: 'var(--status-negative)' }}
                      onClick={() => setDeleteProposalModal({ isOpen: true, proposal })}
                    >
                      <Trash2 className="company-detail__proposal-action-icon" size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-light)', padding: '16px', textAlign: 'center' }}>Henüz teklif bulunmuyor.</div>
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
            <button className="company-detail__activities-filter">
              <Filter className="company-detail__activities-filter-icon" />
              Filtrele
            </button>
          </div>
        </div>

        <div className="company-detail__table-wrapper">
          <table className="company-detail__table">
            <thead>
              <tr>
                <th>Durum</th>
                <th>Tarih</th>
                <th>Yetki</th>
                <th>Not</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <StatusBadge status={activity.type} showIcon />
                    </td>
                    <td>
                      {(activity.completedAt || activity.createdAt).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>Admin</td>
                    <td>{activity.notes || '-'}</td>
                    <td>
                      <div className="company-detail__menu-wrapper" ref={openMenuId === activity.id ? menuRef : null}>
                        <button
                          className="company-detail__table-action"
                          onClick={() => setOpenMenuId(openMenuId === activity.id ? null : activity.id)}
                        >
                          <MoreVertical className="company-detail__table-action-icon" />
                        </button>
                        {openMenuId === activity.id && (
                          <div className="company-detail__dropdown">
                            <button className="company-detail__dropdown-item" onClick={() => { setDetailModal({ isOpen: true, activity }); setOpenMenuId(null); }}>
                              <Eye className="company-detail__dropdown-icon" />
                              Detaylar
                            </button>
                            <button className="company-detail__dropdown-item" onClick={() => { setEditModal({ isOpen: true, activity }); setEditFormData({ status: activity.type, notes: activity.notes || '' }); setOpenMenuId(null); }}>
                              <Edit3 className="company-detail__dropdown-icon" />
                              Düzenle
                            </button>
                            <button className="company-detail__dropdown-item" onClick={() => { alert('Kopyalandı'); setOpenMenuId(null); }}>
                              <Copy className="company-detail__dropdown-icon" />
                              Kopyala
                            </button>
                            <button className="company-detail__dropdown-item company-detail__dropdown-item--danger" onClick={() => { setDeleteActivityModal({ isOpen: true, activity }); setOpenMenuId(null); }}>
                              <Trash2 className="company-detail__dropdown-icon" />
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="company-detail__table-empty">
                    Sonuç bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination__pages">
                {(() => {
                  const pages: (number | string)[] = [];

                  // Always show first page
                  pages.push(1);

                  // Add ellipsis after first page if needed
                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  // Add pages around current page
                  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                    if (!pages.includes(i)) {
                      pages.push(i);
                    }
                  }

                  // Add ellipsis before last page if needed
                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }

                  // Always show last page
                  if (totalPages > 1 && !pages.includes(totalPages)) {
                    pages.push(totalPages);
                  }

                  return pages.map((page, idx) => (
                    typeof page === 'string' ? (
                      <span key={`ellipsis-${idx}`} className="pagination__ellipsis">...</span>
                    ) : (
                      <button
                        key={page}
                        className={`pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    )
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <>
          <div
            className="company-detail__modal-overlay"
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="company-detail__settings-modal">
            <div className="company-detail__settings-header">
              <h2 className="company-detail__settings-title">Şirket Ayarları</h2>
              <button
                className="company-detail__settings-close"
                onClick={() => setShowSettingsModal(false)}
              >
                <X />
              </button>
            </div>
            <div className="company-detail__settings-content">
              <div className="company-detail__settings-section">
                <h3 className="company-detail__settings-section-title">Bildirim Ayarları</h3>
                <div className="company-detail__settings-option">
                  <div className="company-detail__settings-option-left">
                    <Bell className="company-detail__settings-option-icon" />
                    <div>
                      <div className="company-detail__settings-option-label">E-posta Bildirimleri</div>
                      <div className="company-detail__settings-option-desc">Bu şirketle ilgili e-posta al</div>
                    </div>
                  </div>
                  <label className="company-detail__settings-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="company-detail__settings-toggle-slider"></span>
                  </label>
                </div>
                <div className="company-detail__settings-option">
                  <div className="company-detail__settings-option-left">
                    <Bell className="company-detail__settings-option-icon" />
                    <div>
                      <div className="company-detail__settings-option-label">Aktivite Bildirimleri</div>
                      <div className="company-detail__settings-option-desc">Yeni aktivitelerde bildirim al</div>
                    </div>
                  </div>
                  <label className="company-detail__settings-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="company-detail__settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="company-detail__settings-section">
                <h3 className="company-detail__settings-section-title">Erişim Ayarları</h3>

                {/* Manager Management Inside Settings */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Atanan Menajerler
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {company.managers?.map(manager => {
                      if (!manager) return null;
                      return (
                        <div key={manager.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--activity-main-bg)', borderRadius: 'var(--border-radius-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={16} color="var(--primary-500)" />
                            <span style={{ fontSize: '14px', color: 'var(--text-regular)' }}>{manager.name}</span>
                          </div>
                          {(permissions.canManageRoles || user.id === manager.id) && (
                            <button
                              onClick={() => alert('Menajer silindi! (Demo)')}
                              style={{ color: 'var(--status-negative)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Trash2 size={12} />
                              Kaldır
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {permissions.canManageRoles && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        defaultValue=""
                        style={{ flex: 1, padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: '13px' }}
                      >
                        <option value="" disabled>Yeni Menajer Seç...</option>
                        {/* mockUsers replacement pending */}
                      </select>
                      <button
                        onClick={() => alert('Menajer eklendi! (Demo)')}
                        style={{ padding: '8px 12px', backgroundColor: 'var(--primary-500)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                      >
                        <UserPlus size={14} /> Ekle
                      </button>
                    </div>
                  )}
                </div>

                <div className="company-detail__settings-option">
                  <div className="company-detail__settings-option-left">
                    <Shield className="company-detail__settings-option-icon" />
                    <div>
                      <div className="company-detail__settings-option-label">Herkese Açık</div>
                      <div className="company-detail__settings-option-desc">Tüm ekip üyeleri görebilir</div>
                    </div>
                  </div>
                  <label className="company-detail__settings-toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="company-detail__settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="company-detail__settings-section company-detail__settings-section--danger">
                <h3 className="company-detail__settings-section-title">Diğer</h3>
                <button
                  className="company-detail__settings-danger-btn"
                  onClick={() => { setShowSettingsModal(false); setDeleteCompanyModal(true); }}
                >
                  <Trash2 />
                  Şirketi Sil
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Activity Detail Modal */}
      {detailModal.isOpen && detailModal.activity && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setDetailModal({ isOpen: false, activity: null })} />
          <div className="company-detail__activity-modal">
            <div className="company-detail__activity-modal-header">
              <h2 className="company-detail__activity-modal-title">Aktivite Detayı</h2>
              <button className="company-detail__activity-modal-close" onClick={() => setDetailModal({ isOpen: false, activity: null })}>
                <X />
              </button>
            </div>
            <div className="company-detail__activity-modal-content">
              <div className="company-detail__activity-modal-row">
                <span className="company-detail__activity-modal-label">Durum</span>
                <StatusBadge status={detailModal.activity.type} showIcon />
              </div>
              <div className="company-detail__activity-modal-row">
                <span className="company-detail__activity-modal-label">Tarih</span>
                <span className="company-detail__activity-modal-value">
                  {(detailModal.activity.completedAt || detailModal.activity.createdAt).toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="company-detail__activity-modal-row">
                <span className="company-detail__activity-modal-label">Yetki</span>
                <span className="company-detail__activity-modal-value">Admin</span>
              </div>
              <div className="company-detail__activity-modal-row">
                <span className="company-detail__activity-modal-label">Not</span>
                <span className="company-detail__activity-modal-value">{detailModal.activity.notes || '-'}</span>
              </div>

              {/* Yorumlar Bölümü */}
              <div className="company-detail__activity-modal-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <span className="company-detail__activity-modal-label" style={{ marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>Yorumlar</span>

                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {detailModal.activity.comments && detailModal.activity.comments.length > 0 ? (
                    detailModal.activity.comments.map((comment: any) => (
                      <div key={comment.id} style={{ padding: '8px', backgroundColor: 'var(--activity-main-bg)', borderRadius: 'var(--border-radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-regular)' }}>{comment.author}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>{comment.createdAt.toLocaleString('tr-TR')}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-regular)' }}>{comment.text}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>Henüz yorum yapılmamış.</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="new-comment-input"
                    placeholder="Yorum ekle..."
                    style={{ flex: 1, padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: '13px', outline: 'none' }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value;
                        if (val.trim()) {
                          const newComment = await addActivityComment(detailModal.activity.id, user.name, val, user.id);
                          if (newComment) {
                            const updatedActivity = {
                              ...detailModal.activity,
                              comments: [...(detailModal.activity.comments || []), newComment]
                            };
                            setDetailModal({ ...detailModal, activity: updatedActivity });

                            // Update it in the global list so it persists
                            setAllActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));

                            e.currentTarget.value = '';
                          } else {
                            alert('Yorum eklenirken hata oluştu');
                          }
                        }
                      }
                    }}
                  />
                  <button
                    onClick={async () => {
                      const input = document.getElementById('new-comment-input') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        const val = input.value;
                        const newComment = await addActivityComment(detailModal.activity.id, user.name, val, user.id);
                        if (newComment) {
                          const updatedActivity = {
                            ...detailModal.activity,
                            comments: [...(detailModal.activity.comments || []), newComment]
                          };
                          setDetailModal({ ...detailModal, activity: updatedActivity });
                          setAllActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
                          input.value = '';
                        }
                      }
                    }}
                    style={{ padding: '8px 12px', backgroundColor: 'var(--primary-500)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Gönder
                  </button>
                </div>
              </div>

            </div>
            <div className="company-detail__activity-modal-actions">
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--secondary" onClick={() => setDetailModal({ isOpen: false, activity: null })}>
                Kapat
              </button>
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--primary" onClick={() => { setEditModal({ isOpen: true, activity: detailModal.activity }); setEditFormData({ status: detailModal.activity.type, notes: detailModal.activity.notes || '' }); setDetailModal({ isOpen: false, activity: null }); }}>
                Düzenle
              </button>
            </div>
          </div>
        </>
      )}

      {/* Activity Edit Modal */}
      {editModal.isOpen && editModal.activity && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setEditModal({ isOpen: false, activity: null })} />
          <div className="company-detail__activity-modal">
            <div className="company-detail__activity-modal-header">
              <h2 className="company-detail__activity-modal-title">Aktivite Düzenle</h2>
              <button className="company-detail__activity-modal-close" onClick={() => setEditModal({ isOpen: false, activity: null })}>
                <X />
              </button>
            </div>
            <div className="company-detail__activity-modal-content">
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Durum</label>
                <select
                  className="company-detail__activity-modal-form-select"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="cold_call">Cold Call</option>
                  <option value="postponed">Ertelendi</option>
                  <option value="meeting">Görüşmede</option>
                  <option value="proposal">Teklif Verildi</option>
                </select>
              </div>
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Not</label>
                <textarea
                  className="company-detail__activity-modal-form-textarea"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="company-detail__activity-modal-actions">
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--secondary" onClick={() => setEditModal({ isOpen: false, activity: null })}>
                İptal
              </button>
              <button
                className="company-detail__activity-modal-btn company-detail__activity-modal-btn--primary"
                onClick={async () => {
                  const updated = await updateActivity(editModal.activity.id, {
                    type: editFormData.status as any,
                    notes: editFormData.notes
                  }, user.id);
                  if (updated) {
                    setAllActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
                    setEditModal({ isOpen: false, activity: null });
                  } else {
                    alert('Düzenleme başarısız');
                  }
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Company Modal */}
      {editCompanyModalOpen && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setEditCompanyModalOpen(false)} />
          <div className="company-detail__activity-modal" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="company-detail__activity-modal-header">
              <h2 className="company-detail__activity-modal-title">Şirket Bilgilerini Düzenle</h2>
              <button className="company-detail__activity-modal-close" onClick={() => setEditCompanyModalOpen(false)}>
                <X />
              </button>
            </div>
            <div className="company-detail__activity-modal-content">
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Şirket Adı</label>
                <input type="text" className="company-detail__activity-modal-form-input" value={editCompanyData.name || ''} onChange={(e) => setEditCompanyData({ ...editCompanyData, name: e.target.value })} />
              </div>
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Sektör</label>
                <input type="text" className="company-detail__activity-modal-form-input" value={editCompanyData.category || ''} onChange={(e) => setEditCompanyData({ ...editCompanyData, category: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="company-detail__activity-modal-form-group" style={{ flex: 1 }}>
                  <label className="company-detail__activity-modal-form-label">Konum</label>
                  <input type="text" className="company-detail__activity-modal-form-input" value={editCompanyData.location || ''} onChange={(e) => setEditCompanyData({ ...editCompanyData, location: e.target.value })} />
                </div>
                <div className="company-detail__activity-modal-form-group" style={{ flex: 1 }}>
                  <label className="company-detail__activity-modal-form-label">Telefon</label>
                  <input type="text" className="company-detail__activity-modal-form-input" value={editCompanyData.phone || ''} onChange={(e) => setEditCompanyData({ ...editCompanyData, phone: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="company-detail__activity-modal-form-group" style={{ flex: 1 }}>
                  <label className="company-detail__activity-modal-form-label">E-Posta</label>
                  <input type="email" className="company-detail__activity-modal-form-input" value={editCompanyData.email || ''} onChange={(e) => setEditCompanyData({ ...editCompanyData, email: e.target.value })} />
                </div>
                <div className="company-detail__activity-modal-form-group" style={{ flex: 1 }}>
                  <label className="company-detail__activity-modal-form-label">Website</label>
                  <input type="text" className="company-detail__activity-modal-form-input" value={editCompanyData.website || ''} onChange={(e) => setEditCompanyData({ ...editCompanyData, website: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="company-detail__activity-modal-actions">
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--secondary" onClick={() => setEditCompanyModalOpen(false)}>
                İptal
              </button>
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--primary" onClick={async () => {
                if (user) {
                  const { updateCompany } = await import('@/actions/companies');
                  const result = await updateCompany(company.id, editCompanyData, user.id);
                  if (result.success && result.data) {
                    setCompany(result.data);
                    setEditCompanyModalOpen(false);
                  } else {
                    alert('Hata: ' + result.error);
                  }
                }
              }}>
                Kaydet
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Activity Confirmation */}
      <ConfirmModal
        isOpen={deleteActivityModal.isOpen}
        onClose={() => setDeleteActivityModal({ isOpen: false, activity: null })}
        onConfirm={async () => {
          if (deleteActivityModal.activity && user) {
            const success = await deleteActivity(deleteActivityModal.activity.id, user.id);
            if (success) {
              setAllActivities(prev => prev.filter(a => a.id !== deleteActivityModal.activity.id));
              setDeleteActivityModal({ isOpen: false, activity: null });
            } else {
              alert('Aktivite silinemedi');
            }
          }
        }}
        title="Aktiviteyi Sil"
        message="Bu aktiviteyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />

      {/* Add Proposal Modal */}
      {addProposalModal.isOpen && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setAddProposalModal({ isOpen: false })} />
          <div className="company-detail__activity-modal">
            <div className="company-detail__activity-modal-header">
              <h2 className="company-detail__activity-modal-title">Yeni Teklif Ekle</h2>
              <button className="company-detail__activity-modal-close" onClick={() => setAddProposalModal({ isOpen: false })}>
                <X />
              </button>
            </div>
            <div className="company-detail__activity-modal-content">
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Teklif Başlığı</label>
                <input
                  type="text"
                  className="company-detail__activity-modal-form-input"
                  placeholder="Örn: 2026 Yıllık Bakım Anlaşması"
                  value={newProposalData.title}
                  onChange={(e) => setNewProposalData({ ...newProposalData, title: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="company-detail__activity-modal-form-group" style={{ flex: 2 }}>
                  <label className="company-detail__activity-modal-form-label">Tutar</label>
                  <input
                    type="number"
                    className="company-detail__activity-modal-form-input"
                    value={newProposalData.value}
                    onChange={(e) => setNewProposalData({ ...newProposalData, value: e.target.value })}
                  />
                </div>
                <div className="company-detail__activity-modal-form-group" style={{ flex: 1 }}>
                  <label className="company-detail__activity-modal-form-label">Para Birimi</label>
                  <select
                    className="company-detail__activity-modal-form-select"
                    value={newProposalData.currency}
                    onChange={(e) => setNewProposalData({ ...newProposalData, currency: e.target.value })}
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Aşama</label>
                <select
                  className="company-detail__activity-modal-form-select"
                  value={newProposalData.stage}
                  onChange={(e) => setNewProposalData({ ...newProposalData, stage: e.target.value as any })}
                >
                  <option value="proposal">Teklif Gönderildi</option>
                  <option value="negotiation">Müzakere Sürecinde</option>
                  <option value="closed_won">Kazanıldı</option>
                  <option value="closed_lost">Kaybedildi</option>
                </select>
              </div>
            </div>
            <div className="company-detail__activity-modal-actions">
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--secondary" onClick={() => setAddProposalModal({ isOpen: false })}>
                İptal
              </button>
              <button
                className="company-detail__activity-modal-btn company-detail__activity-modal-btn--primary"
                onClick={async () => {
                  if (!newProposalData.title || !newProposalData.value) {
                    alert("Lütfen başlık ve tutar girin.");
                    return;
                  }
                  const { createProposal } = await import('@/actions/proposals');
                  const created = await createProposal({
                    companyId: company?.id!,
                    title: newProposalData.title,
                    value: parseFloat(newProposalData.value),
                    currency: newProposalData.currency,
                    stage: newProposalData.stage as any,
                    ownerId: user?.id!,
                    ownerName: user?.name!
                  }, user.id);
                  if (created) {
                    setProposals([created, ...proposals]);
                    setAddProposalModal({ isOpen: false });
                    setNewProposalData({ title: '', value: '', currency: 'TRY', stage: 'proposal' });
                  } else {
                    alert("Teklif eklenirken bir hata oluştu.");
                  }
                }}
              >
                Ekle
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Proposal Confirmation */}
      <ConfirmModal
        isOpen={deleteProposalModal.isOpen}
        onClose={() => setDeleteProposalModal({ isOpen: false, proposal: null })}
        onConfirm={async () => {
          if (deleteProposalModal.proposal && user) {
            const { deleteProposal } = await import('@/actions/proposals');
            const success = await deleteProposal(deleteProposalModal.proposal.id, user.id);
            if (success) {
              setProposals(prev => prev.filter(p => p.id !== deleteProposalModal.proposal.id));
              setDeleteProposalModal({ isOpen: false, proposal: null });
            } else {
              alert('Teklif silinemedi');
            }
          }
        }}
        title="Teklifi Sil"
        message={`"${deleteProposalModal.proposal?.title}" başlıklı teklifi silmek istediğinizden emin misiniz?`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />

      {/* Add Contact Modal */}
      {addContactModal.isOpen && (
        <>
          <div className="company-detail__modal-overlay" onClick={() => setAddContactModal({ isOpen: false })} />
          <div className="company-detail__activity-modal">
            <div className="company-detail__activity-modal-header">
              <h2 className="company-detail__activity-modal-title">Yeni Bağlantı Ekle</h2>
              <button className="company-detail__activity-modal-close" onClick={() => setAddContactModal({ isOpen: false })}>
                <X />
              </button>
            </div>
            <div className="company-detail__activity-modal-content">
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Ad Soyad</label>
                <input
                  type="text"
                  className="company-detail__activity-modal-form-input"
                  value={newContactData.name}
                  onChange={(e) => setNewContactData({ ...newContactData, name: e.target.value })}
                />
              </div>
              <div className="company-detail__activity-modal-form-group">
                <label className="company-detail__activity-modal-form-label">Pozisyon/Unvan</label>
                <input
                  type="text"
                  className="company-detail__activity-modal-form-input"
                  value={newContactData.position}
                  onChange={(e) => setNewContactData({ ...newContactData, position: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="company-detail__activity-modal-form-group" style={{ flex: 1 }}>
                  <label className="company-detail__activity-modal-form-label">E-Posta</label>
                  <input
                    type="email"
                    className="company-detail__activity-modal-form-input"
                    value={newContactData.email}
                    onChange={(e) => setNewContactData({ ...newContactData, email: e.target.value })}
                  />
                </div>
                <div className="company-detail__activity-modal-form-group" style={{ flex: 1 }}>
                  <label className="company-detail__activity-modal-form-label">Telefon</label>
                  <input
                    type="text"
                    className="company-detail__activity-modal-form-input"
                    value={newContactData.phone}
                    onChange={(e) => setNewContactData({ ...newContactData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="company-detail__activity-modal-form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  id="is-primary"
                  type="checkbox"
                  checked={newContactData.isPrimary}
                  onChange={(e) => setNewContactData({ ...newContactData, isPrimary: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="is-primary" className="company-detail__activity-modal-form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Birincil Yetkili Olarak İşaretle</label>
              </div>
            </div>
            <div className="company-detail__activity-modal-actions">
              <button className="company-detail__activity-modal-btn company-detail__activity-modal-btn--secondary" onClick={() => setAddContactModal({ isOpen: false })}>
                İptal
              </button>
              <button
                className="company-detail__activity-modal-btn company-detail__activity-modal-btn--primary"
                onClick={async () => {
                  if (!newContactData.name) {
                    alert("Ad Soyad zorunludur.");
                    return;
                  }
                  const { createContact } = await import('@/actions/contacts');
                  const created = await createContact({
                    companyId: company?.id!,
                    name: newContactData.name,
                    email: newContactData.email,
                    phone: newContactData.phone,
                    position: newContactData.position,
                    isPrimary: newContactData.isPrimary,
                  }, user.id);
                  if (created) {
                    setContacts([created, ...contacts]);
                    setAddContactModal({ isOpen: false });
                    setNewContactData({ name: '', email: '', phone: '', position: '', isPrimary: false });
                  } else {
                    alert("Bağlantı kişi eklenirken bir hata oluştu.");
                  }
                }}
              >
                Ekle
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Contact Confirmation */}
      <ConfirmModal
        isOpen={deleteContactModal.isOpen}
        onClose={() => setDeleteContactModal({ isOpen: false, contact: null })}
        onConfirm={async () => {
          if (deleteContactModal.contact && user) {
            const { deleteContact } = await import('@/actions/contacts');
            const success = await deleteContact(deleteContactModal.contact.id, user.id);
            if (success) {
              setContacts(prev => prev.filter(c => c.id !== deleteContactModal.contact.id));
              setDeleteContactModal({ isOpen: false, contact: null });
            } else {
              alert('Kişi silinemedi');
            }
          }
        }}
        title="Bağlantıyı Sil"
        message={`"${deleteContactModal.contact?.name}" isimli yetkiliyi silmek istediğinizden emin misiniz?`}
        confirmText="Sil"
        cancelText="İptal"
        type="danger"
      />

      <ConfirmModal
        isOpen={deleteCompanyModal}
        onClose={() => setDeleteCompanyModal(false)}
        onConfirm={async () => {
          if (user) {
            const { deleteCompany } = await import('@/actions/companies');
            const success = await deleteCompany(company.id, user.id);
            if (success) {
              router.push('/sirketler');
            } else {
              alert('Şirket silinirken bir hata oluştu veya yetkiniz yok.');
              setDeleteCompanyModal(false);
            }
          }
        }}
        title="Şirketi Sil"
        message={`"${company.name}" şirketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve şirkete ait tüm veriler silinecektir.`}
        confirmText="Şirketi Sil"
        cancelText="İptal"
        type="danger"
      />
    </div>
  );
}
