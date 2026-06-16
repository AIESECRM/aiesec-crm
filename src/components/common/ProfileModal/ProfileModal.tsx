'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Eye, EyeOff, Check, AlertCircle, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut, useSession } from 'next-auth/react';
import ConfirmModal from '@/components/common/ConfirmModal';
import { FileUpload } from '@/components/common/FileUpload/FileUpload';
import Avatar from '@/components/common/Avatar';
import './ProfileModal.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleLabels: Record<string, string> = {
  MCP: 'MCP', MCVP: 'MCVP', LCP: 'LCP', LCVP: 'LCVP',
  TL: 'Team Leader', TM: 'Takım Üyesi', ADMIN: 'Admin',
};

const CHAPTER_LABELS: Record<string, string> = {
  ADANA: 'Adana', ANKARA: 'Ankara', ANTALYA: 'Antalya', BURSA: 'Bursa',
  DENIZLI: 'Denizli', DOGU_AKDENIZ: 'Doğu Akdeniz', ESKISEHIR: 'Eskişehir',
  GAZIANTEP: 'Gaziantep', ISTANBUL: 'İstanbul', ISTANBUL_ASYA: 'İstanbul Asya',
  BATI_ISTANBUL: 'Batı İstanbul', IZMIR: 'İzmir', KOCAELI: 'Kocaeli',
  KONYA: 'Konya', KUTAHYA: 'Kütahya', SAKARYA: 'Sakarya', TRABZON: 'Trabzon',
};

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth() as any;
  const { update } = useSession();
  const modalRef = useRef<HTMLDivElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setSaveSuccess(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('');
      // E-posta bildirim ayarını çek
      fetch('/api/profile/settings')
        .then(r => r.json())
        .then(data => {
          if (typeof data.emailNotifications === 'boolean') {
            setEmailNotifications(data.emailNotifications);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleToggleEmail = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    setEmailSaving(true);
    try {
      await fetch('/api/profile/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: newValue }),
      });
    } catch {
      setEmailNotifications(!newValue);
    } finally {
      setEmailSaving(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!currentPassword) newErrors.currentPassword = 'Mevcut şifrenizi girin';
    if (!newPassword) newErrors.newPassword = 'Yeni şifre zorunludur';
    else if (newPassword.length < 8) newErrors.newPassword = 'Şifre en az 8 karakter olmalıdır';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Hata oluştu!');
      } else {
        setSaveSuccess(true);
        setMessage('Şifre başarıyla güncellendi!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setMessage('Sunucu hatası!');
    }
    setIsSaving(false);
  };

  const handleProfileImageUpdate = async (url: string) => {
    try {
      setPreviewImage(url); // Hemen önizleme
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url }),
      });
      if (res.ok) {
        await update({ image: url });
      } else {
        setMessage('Resim güncellenirken hata oluştu.');
      }
    } catch {
      setMessage('Sunucu hatası!');
    }
  };

  if (!isOpen || !user) return null;

  return createPortal(
    <div className="profile-modal__overlay" onClick={handleBackdropClick}>
      <div className="profile-modal" ref={modalRef}>
        <div className="profile-modal__header">
          <h2 className="profile-modal__title">Profil Ayarları</h2>
          <button className="profile-modal__close" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="profile-modal__content">
          {/* Profil Bilgileri */}
          <div className="profile-modal__section">
            <h3 className="profile-modal__section-title">Profil Bilgileri</h3>
            <div className="profile-modal__avatar-wrapper">
              <Avatar 
                src={previewImage || user.image} 
                alt={user.name} 
                size={80} 
                className="profile-modal__avatar" 
              />
              <div className="profile-modal__avatar-actions">
                <div style={{ fontWeight: '600', fontSize: '18px', color: 'var(--foreground)' }}>{user.name}</div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '8px' }}>{user.email}</div>
                <FileUpload 
                  onUploadSuccess={(url) => handleProfileImageUpdate(url)}
                  onFileSelect={(localUrl) => setPreviewImage(localUrl)}
                  accept="image/*"
                  label="Fotoğrafı Değiştir"
                  autoUpload={true}
                  variant="avatar"
                  className="profile-modal__avatar-uploader"
                />
              </div>
            </div>

            <div className="profile-modal__field" style={{ marginTop: '16px' }}>
              <label className="profile-modal__label">Rol</label>
              <input
                type="text"
                className="profile-modal__input profile-modal__input--readonly"
                value={roleLabels[user.role] || user.role}
                readOnly
              />
            </div>

            <div className="profile-modal__field">
              <label className="profile-modal__label">Şube</label>
              <input
                type="text"
                className="profile-modal__input profile-modal__input--readonly"
                value={user.chapter ? CHAPTER_LABELS[user.chapter] || user.chapter : '—'}
                readOnly
              />
            </div>
          </div>

          {/* E-posta Bildirim Ayarı */}
          <div className="profile-modal__section">
            <h3 className="profile-modal__section-title">Bildirim Ayarları</h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              backgroundColor: 'var(--muted, #f9fafb)',
              borderRadius: '8px',
              border: '1px solid var(--border, #e5e7eb)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color={emailNotifications ? '#2563eb' : '#9ca3af'} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)' }}>E-posta Bildirimleri</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground, #6b7280)' }}>İşlemsiz şirketler için mail uyarısı</div>
                </div>
              </div>
              <button
                onClick={handleToggleEmail}
                disabled={emailSaving}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: emailSaving ? 'wait' : 'pointer',
                  backgroundColor: emailNotifications ? '#2563eb' : '#d1d5db',
                  transition: 'background-color 0.3s',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: emailNotifications ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.3s',
                }} />
              </button>
            </div>
          </div>

          {/* Şifre Değiştir */}
          <form className="profile-modal__section" onSubmit={handlePasswordChange}>
            <h3 className="profile-modal__section-title">Şifre Değiştir</h3>

            {message && (
              <div style={{ backgroundColor: saveSuccess ? '#f0fdf4' : '#fef2f2', color: saveSuccess ? '#16a34a' : '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' }}>
                {message}
              </div>
            )}

            <div className="profile-modal__field">
              <label className="profile-modal__label">Mevcut Şifre</label>
              <div className="profile-modal__password-wrapper">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  className={`profile-modal__input ${errors.currentPassword ? 'profile-modal__input--error' : ''}`}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className="profile-modal__password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.currentPassword && <span className="profile-modal__error"><AlertCircle />{errors.currentPassword}</span>}
            </div>

            <div className="profile-modal__field">
              <label className="profile-modal__label">Yeni Şifre</label>
              <div className="profile-modal__password-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className={`profile-modal__input ${errors.newPassword ? 'profile-modal__input--error' : ''}`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className="profile-modal__password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.newPassword && <span className="profile-modal__error"><AlertCircle />{errors.newPassword}</span>}
            </div>

            <div className="profile-modal__field">
              <label className="profile-modal__label">Şifreyi Onayla</label>
              <div className="profile-modal__password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`profile-modal__input ${errors.confirmPassword ? 'profile-modal__input--error' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className="profile-modal__password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="profile-modal__error"><AlertCircle />{errors.confirmPassword}</span>}
            </div>

            <div className="profile-modal__actions">
              <button
                type="button"
                className="profile-modal__btn profile-modal__btn--logout"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut />
                Çıkış Yap
              </button>
              <div className="profile-modal__actions-right">
                <button type="button" className="profile-modal__btn profile-modal__btn--secondary" onClick={onClose}>
                  İptal
                </button>
                <button
                  type="submit"
                  className={`profile-modal__btn profile-modal__btn--primary ${saveSuccess ? 'profile-modal__btn--success' : ''}`}
                  disabled={isSaving}
                >
                  {isSaving ? 'Kaydediliyor...' : saveSuccess ? <><Check />Kaydedildi</> : 'Şifreyi Güncelle'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => { signOut({ callbackUrl: '/login' }); onClose(); }}
          title="Çıkış Yap"
          message="Hesabınızdan çıkış yapmak istediğinizden emin misiniz?"
          confirmText="Çıkış Yap"
          cancelText="İptal"
          type="danger"
        />
      </div>
    </div>,
    document.body
  );
}
