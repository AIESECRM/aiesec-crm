'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_OPTIONS = [
  { value: 'NO_ANSWER', label: 'Cevap Yok' },
  { value: 'POSITIVE', label: 'Pozitif' },
  { value: 'NEGATIVE', label: 'Negatif' },
  { value: 'CALL_AGAIN', label: 'Tekrar Ara' },
  { value: 'MEETING_PLANNED', label: 'Toplantı Planlandı' },
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

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: any;
  onSuccess: () => void;
}

export default function EditCompanyModal({ isOpen, onClose, company, onSuccess }: EditCompanyModalProps) {
  const { user } = useAuth() as any;
  const isNationalRole = user && ['MCP', 'MCVP', 'ADMIN'].includes(user.role);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: '',
    notes: '',
    chapter: '',
    category: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        phone: company.phone || '',
        email: company.email || '',
        status: company.status || 'NO_ANSWER',
        notes: company.notes || '',
        chapter: company.chapter || '',
        category: company.category || '',
        location: company.location || '',
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        console.error('Şirket güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Şirket güncellenirken hata:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Şirket Bilgilerini Düzenle" maxWidth="600px">
      <form className="modal__form" onSubmit={handleSubmit}>
        <div className="modal__section">
          <h4 className="modal__section-title">Temel Bilgiler</h4>
          <div className="modal__field">
            <label className="modal__label modal__label--required">Şirket Adı</label>
            <input
              type="text"
              className="modal__input"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label">Durum</label>
              <select
                className="modal__select"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="modal__field">
              <label className="modal__label">Sektör / Kategori</label>
              <input
                type="text"
                className="modal__input"
                placeholder="Örn: Bilişim"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
          </div>
          {isNationalRole && (
            <div className="modal__field" style={{ marginTop: '16px' }}>
              <label className="modal__label">Şube</label>
              <select
                className="modal__select"
                value={formData.chapter}
                onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
              >
                <option value="">Şube seçin</option>
                {CHAPTER_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="modal__section">
          <h4 className="modal__section-title">İletişim Bilgileri</h4>
          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label">Telefon</label>
              <input
                type="tel"
                className="modal__input"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="modal__field">
              <label className="modal__label">E-posta</label>
              <input
                type="email"
                className="modal__input"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="modal__field" style={{ marginTop: '16px' }}>
            <label className="modal__label">Lokasyon</label>
            <input
              type="text"
              className="modal__input"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
        </div>

        <div className="modal__section">
          <h4 className="modal__section-title">Notlar</h4>
          <div className="modal__field">
            <textarea
              className="modal__textarea"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <div className="modal__actions">
          <button type="button" className="modal__btn modal__btn--secondary" onClick={onClose}>İptal</button>
          <button type="submit" className="modal__btn modal__btn--primary" disabled={submitting}>
            <Save />
            {submitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
