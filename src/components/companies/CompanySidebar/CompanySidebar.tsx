'use client';

import React from 'react';
import {
  Building2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Eye,
  Settings,
  User as UserIcon,
  Users,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Company, Activity, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/common/StatusBadge';
import './CompanySidebar.css';
import { generateEmailContent, summarizeMeetingNotes } from '@/actions/ai';

const ACTIVITY_LABELS: Record<string, string> = {
  COLD_CALL: 'Cold Call',
  MEETING: 'Görüşme',
  EMAIL: 'Email',
  FOLLOW_UP: 'Takip',
  TASK: 'Görev',
  PROPOSAL: 'Teklif',
  POSTPONED: 'Ertelendi',
};

interface CompanySidebarProps {
  company: Company;
  recentActivities?: Activity[];
  onViewProfile?: () => void;
  onManageActivities?: () => void;
}

function formatRelativeTime(date: Date | number): string {
  const now = new Date();
  const d = typeof date === 'number' ? new Date(date * 1000) : date;
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return '1 gün önce';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return `${Math.floor(diffDays / 30)} ay önce`;
}

export default function CompanySidebar({
  company,
  recentActivities = [],
  onViewProfile,
  onManageActivities
}: CompanySidebarProps) {
  const { permissions } = useAuth();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    const result = await generateEmailContent(
      company.name,
      'Yetkili',
      'Bir süredir irtibat halindeyiz, B2B yetenek yönetimi hizmetlerimizi (uzun dönemli proje bazlı) anlatmak ve online tanışma toplantısı talep etmek istiyorum.',
      'formal'
    );
    setIsGenerating(false);

    if (result.success && result.content) {
      alert(`AI Tarafından Oluşturulan E-Posta:\n\n${result.content}`);
    } else {
      alert(result.error);
    }
  };

  const handleSummarizeNotes = async () => {
    setIsGenerating(true);
    const result = await summarizeMeetingNotes(
      company.name,
      'Müşteri ile görüştük. Şube müdürü Ali bey çok ilgiliydi. Özellikle yazılımcı açıklarını AIESEC GT programıyla kapatmak istiyorlar. 2 hafta sonra tekrar görüşelim dediler. Bütçe sorunları var ama ikna edilebilirler.'
    );
    setIsGenerating(false);

    if (result.success && result.content) {
      alert(`AI Toplantı Özeti:\n\n${result.content}`);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="company-sidebar">
      <div className="company-sidebar__header">
        <div className="company-sidebar__icon">
          <Building2 />
        </div>
        <div className="company-sidebar__title">
          <h2 className="company-sidebar__name">{company.name}</h2>
          {company.category && (
            <div className="company-sidebar__category">
              <FileText className="company-sidebar__category-icon" />
              {company.category}
            </div>
          )}
          <div style={{ marginTop: '4px' }}>
            <StatusBadge status={company.status} />
          </div>
        </div>
      </div>

      <div className="company-sidebar__section">
        <div className="company-sidebar__section-header">
          <h3 className="company-sidebar__section-title">İletişim Bilgileri</h3>
          {permissions.canEditCompany && (
            <button className="company-sidebar__section-edit">
              <Edit3 className="company-sidebar__section-edit-icon" />
            </button>
          )}
        </div>

        <div className="company-sidebar__info-item">
          <Phone className="company-sidebar__info-icon" />
          <div className="company-sidebar__info-content">
            <div className="company-sidebar__info-label">Telefon Numarası</div>
            <div className="company-sidebar__info-value">{company.phone || '—'}</div>
          </div>
        </div>

        <div className="company-sidebar__info-item">
          <Mail className="company-sidebar__info-icon" />
          <div className="company-sidebar__info-content">
            <div className="company-sidebar__info-label">E-Posta Adresi</div>
            <div className="company-sidebar__info-value">{company.email || '—'}</div>
          </div>
        </div>

        {company.location && (
          <div className="company-sidebar__info-item">
            <MapPin className="company-sidebar__info-icon" />
            <div className="company-sidebar__info-content">
              <div className="company-sidebar__info-label">Lokasyon</div>
              <div className="company-sidebar__info-value">{company.location}</div>
            </div>
          </div>
        )}

        {/* Assigned Managers */}
        {company.managers && (
          <div className="company-sidebar__info-item" style={{ marginTop: '16px' }}>
            <Users className="company-sidebar__info-icon" />
            <div className="company-sidebar__info-content">
              <div className="company-sidebar__info-label">Atanan Menajer(ler)</div>
              <div className="company-sidebar__info-value" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                {company.managers.length > 0 ? (
                  company.managers.map((manager: User) => (
                    <span key={manager.id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-400)' }}></span>
                      {manager.name}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Atanmış menajer yok</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {recentActivities.length > 0 && (
        <div className="company-sidebar__section">
          <div className="company-sidebar__section-header">
            <h3 className="company-sidebar__section-title">Son Aktiviteler</h3>
            <button className="company-sidebar__section-edit">
              <Settings className="company-sidebar__section-edit-icon" />
            </button>
          </div>

          {recentActivities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="company-sidebar__activity-item">
              <div className="company-sidebar__activity-left">
                <span style={{
                  backgroundColor: '#e0f2fe', color: '#0369a1',
                  padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                }}>
                  {ACTIVITY_LABELS[activity.type] || activity.type}
                </span>
              </div>
              <div className="company-sidebar__activity-user">
                <UserIcon className="company-sidebar__activity-user-icon" />
                <span className="company-sidebar__activity-name" title={activity.userName}>
                  {activity.userName || activity.user?.name || '—'}
                </span>
              </div>
              <span className="company-sidebar__activity-date">
                {formatRelativeTime(activity.completedAt || activity.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="company-sidebar__actions">
        <button
          className="company-sidebar__action-btn company-sidebar__action-btn--primary"
          onClick={onViewProfile}
        >
          <Eye className="company-sidebar__action-icon" />
          Tam Profili Görüntüle
        </button>
        <button
          className="company-sidebar__action-btn company-sidebar__action-btn--secondary"
          onClick={onManageActivities}
          style={{ marginBottom: '12px' }}
        >
          <Settings className="company-sidebar__action-icon" />
          Aktiviteyi Yönet
        </button>

        <button
          className="company-sidebar__action-btn"
          style={{ backgroundColor: '#F3F4F6', color: '#4F46E5', marginBottom: '12px', borderColor: '#4F46E5' }}
          onClick={handleGenerateEmail}
          disabled={isGenerating}
        >
          <Sparkles className="company-sidebar__action-icon" size={16} />
          {isGenerating ? 'Hazırlanıyor...' : 'AI ile E-Posta Yaz'}
        </button>

        <button
          className="company-sidebar__action-btn"
          style={{ backgroundColor: '#F3F4F6', color: '#059669', borderColor: '#059669' }}
          onClick={handleSummarizeNotes}
          disabled={isGenerating}
        >
          <MessageSquare className="company-sidebar__action-icon" size={16} />
          {isGenerating ? 'Hazırlanıyor...' : 'AI Toplantı Özeti Çıkart'}
        </button>
      </div>
    </div>
  );
}
