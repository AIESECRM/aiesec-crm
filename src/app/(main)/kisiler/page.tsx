'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Building2, User, Phone, Mail, MessageSquare, Info, Save
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import AppLoader from '@/components/common/AppLoader';
import AppToast from '@/components/common/AppToast';
import './page.css';


export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState({
    companyId: '',
    name: '',
    email: '',
    phone: '',
  });
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'warning' | 'info' }>({
    open: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    fetchData();
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
    try {
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
        setToast({ open: true, message: 'Kişi başarıyla eklendi.', type: 'success' });
        return;
      }
      setToast({ open: true, message: 'Kişi eklenemedi. Lütfen tekrar dene.', type: 'warning' });
    } catch {
      setToast({ open: true, message: 'Bağlantı hatası nedeniyle kişi eklenemedi.', type: 'warning' });
    }
  };

  const companiesWithContacts = companies.map(company => {
    const companyContacts = contacts.filter(c => c.companyId === company.id).filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { ...company, contacts: companyContacts };
  }).filter(company => company.contacts.length > 0 || searchQuery === '');
  const lastUpdatedLabel = new Date().toLocaleDateString('tr-TR');

  if (loading) return <AppLoader label="Kisiler yukleniyor..." showSkeleton />;

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

      <div className="people-page__context-bar">
        <span className="people-page__context-item">Toplam şirket: {companies.length}</span>
        <span className="people-page__context-separator" aria-hidden="true">•</span>
        <span className="people-page__context-item">Toplam kişi: {contacts.length}</span>
        <span className="people-page__context-separator" aria-hidden="true">•</span>
        <span className="people-page__context-item">Güncellendi: {lastUpdatedLabel}</span>
      </div>

      <div className="people-page__companies">
        {companiesWithContacts.map((company) => (
          <div key={company.id} className="people-page__company">
            <div className="people-page__company-header">
              <div className="people-page__company-info">
                <div className="people-page__company-icon"><Building2 /></div>
                <div className="people-page__company-details">
                  <h3 className="people-page__company-name">{company.name}</h3>
                  <p className="people-page__company-meta">{company.email || '—'}</p>
                </div>
              </div>
              <span className="people-page__company-count">{company.contacts.length} kişi</span>
            </div>

            {company.contacts.length > 0 ? (
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
                <div className="app-empty-state">
                  <Users className="app-empty-state__icon" />
                  <div className="app-empty-state__title">Bu şirkette henüz kişi yok</div>
                  <div className="app-empty-state__hint">Kişi eklemek için sağ üstteki butonu kullanabilirsin.</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {companiesWithContacts.length === 0 && searchQuery && (
        <div className="app-empty-state">
          <Search className="app-empty-state__icon" />
          <div className="app-empty-state__title">Sonuç bulunamadı</div>
          <div className="app-empty-state__hint">&quot;{searchQuery}&quot; için eşleşen kişi yok.</div>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Kişi Ekle" maxWidth="520px">
        <form className="modal__form" onSubmit={handleAddContact}>
          <div className="modal__section">
            <h4 className="modal__section-title">Şirket Seçimi</h4>
            <div className="modal__field">
              <label className="modal__label modal__label--required">Şirket</label>
              <select
                className="modal__select"
                value={newContact.companyId}
                onChange={(e) => setNewContact(prev => ({ ...prev, companyId: e.target.value }))}
                required
              >
                <option value="">Şirket seçin</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
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

      <AppToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}