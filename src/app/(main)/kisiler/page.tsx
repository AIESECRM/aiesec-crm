'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Building2, User, Phone, Mail, MessageSquare, Info, Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import './page.css';

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({});
  const [newContact, setNewContact] = useState({
    companyId: '',
    name: '',
    email: '',
    phone: '',
  });
  const toggleCompany = (companyId: string) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyId]: !prev[companyId] // Mevcut değerin tersini yap
    }));
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [companiesRes, contactsRes] = await Promise.all([
      fetch('/api/companies'),
      fetch('/api/contacts'),
    ]);
    const companiesData = await companiesRes.json();
    const contactsData = await contactsRes.json();
    setCompanies(companiesData.companies || []);
    setContacts(contactsData.contacts || []);
    setLoading(false);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanySearch('');
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newContact.name,
        email: newContact.email || null,
        phone: newContact.phone || null,
        companyId: Number(newContact.companyId),
      }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setNewContact({ companyId: '', name: '', email: '', phone: '' });
      fetchData();
    }
  };

  const companiesWithContacts = companies.map(company => {
    const companyContacts = contacts.filter(c => c.companyId === company.id).filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...company, contacts: companyContacts };
  }).filter(company => company.contacts.length > 0 || searchQuery === '');

  if (loading) return <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Yükleniyor...</div>;

  return (
    <div className="people-page">
      <div className="people-page__header">
        <div className="people-page__title">
          <Users className="people-page__title-icon" />
          <h1 className="people-page__title-text">Kişiler</h1>
        </div>
        <div className="people-page__actions">
          <div className="people-page__search">
            <Search className="people-page__search-icon" />
            <input
              type="text"
              className="people-page__search-input"
              placeholder="Kişi ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="people-page__add-btn" onClick={() => setShowAddModal(true)}>
            <Plus className="people-page__add-btn-icon" />
            Kişi Ekle
          </button>
        </div>
      </div>

      <div className="people-page__info">
        <Info className="people-page__info-icon" />
        <span className="people-page__info-text">
          Tüm kişiler şirketlere bağlıdır. Yeni kişi eklemek için önce bir şirket seçin.
        </span>
      </div>

      <div className="people-page__companies">
        {companiesWithContacts.map((company) => {
          // Eğer kullanıcı arama çubuğuna bir şey yazdıysa, sonuçları hemen görebilmesi için paneli açık (true) tutuyoruz.
          // Aksi halde kullanıcının tıklamasına (expandedCompanies state'ine) göre açıp kapatıyoruz.
          const isExpanded = searchQuery.length > 0 || expandedCompanies[company.id];

          return (
            <div key={company.id} className="people-page__company">
              {/* Tıklanabilir (Accordion) Şirket Başlığı */}
              <div
                className="people-page__company-header"
                onClick={() => toggleCompany(company.id)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Kişileri gizle/göster"
              >
                <div className="people-page__company-info">
                  <div className="people-page__company-icon"><Building2 /></div>
                  <div className="people-page__company-details">
                    <h3 className="people-page__company-name">{company.name}</h3>
                    <p className="people-page__company-meta">{company.email || '—'}</p>
                  </div>
                </div>

                {/* Kişi Sayısı ve Açılır/Kapanır Ok İkonu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="people-page__company-count">{company.contacts.length} kişi</span>
                  {isExpanded ? (
                    <ChevronUp size={20} style={{ color: '#6b7280' }} />
                  ) : (
                    <ChevronDown size={20} style={{ color: '#6b7280' }} />
                  )}
                </div>
              </div>

              {/* Sadece isExpanded "true" ise alt kısımdaki kişileri ekrana bas (Render et) */}
              {isExpanded && (
                company.contacts.length > 0 ? (
                  <div className="people-page__contacts">
                    {company.contacts.map((contact: any) => (
                      <div key={contact.id} className="contact-card">
                        <div className="contact-card__avatar">
                          <User className="contact-card__avatar-icon" />
                        </div>
                        <div className="contact-card__content">
                          <div className="contact-card__name">{contact.name}</div>
                          <div className="contact-card__meta">
                            {contact.phone && (
                              <div className="contact-card__meta-item">
                                <Phone className="contact-card__meta-icon" />
                                {contact.phone}
                              </div>
                            )}
                            {contact.email && (
                              <div className="contact-card__meta-item">
                                <Mail className="contact-card__meta-icon" />
                                {contact.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="contact-card__actions">
                          <button className="contact-card__action"><Phone className="contact-card__action-icon" /></button>
                          <button className="contact-card__action"><MessageSquare className="contact-card__action-icon" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="people-page__contacts" style={{ padding: 'var(--spacing-lg)' }}>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Bu şirkette henüz kişi bulunmuyor.</p>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {companiesWithContacts.length === 0 && searchQuery && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <p style={{ color: 'var(--text-light)' }}>&quot;{searchQuery}&quot; için sonuç bulunamadı.</p>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Kişi Ekle" maxWidth="520px">
        <form className="modal__form" onSubmit={handleAddContact}>
          <div className="modal__section">
            <h4 className="modal__section-title">Şirket Seçimi</h4>
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
                    setNewContact(prev => ({ ...prev, companyId: '' }));
                    setShowCompanyDropdown(true);
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  required={!newContact.companyId}
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
                            setNewContact(prev => ({ ...prev, companyId: String(company.id) }));
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
          </div>

          <div className="modal__section">
            <h4 className="modal__section-title">Kişi Bilgileri</h4>
            <div className="modal__field">
              <label className="modal__label modal__label--required">Ad Soyad</label>
              <input
                type="text"
                className="modal__input"
                placeholder="Ad Soyad"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                required
              />
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
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="modal__field">
                <label className="modal__label">E-posta</label>
                <input
                  type="email"
                  className="modal__input"
                  placeholder="email@sirket.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={() => setShowAddModal(false)}>İptal</button>
            <button type="submit" className="modal__btn modal__btn--primary"><Save />Kaydet</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
