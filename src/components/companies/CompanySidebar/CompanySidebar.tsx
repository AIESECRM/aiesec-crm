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
  Users,
  Sparkles,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import { Company, Activity, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/common/StatusBadge';
import Avatar from '@/components/common/Avatar';
import './CompanySidebar.css';
import { generateEmailContent, summarizeMeetingNotes } from '@/actions/ai';

const ACTIVITY_LABELS: Record<string, string> = {
  COLD_CALL: 'Soğuk Arama',
  MEETING: 'Görüşme',
  EMAIL: 'E-posta',
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
  const [showMoreActions, setShowMoreActions] = React.useState(false);
  const moreActionsRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!moreActionsRef.current) return;
      if (!moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="company-sidebar__status">
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

        {company.managers && (
          <div className="company-sidebar__info-item company-sidebar__info-item--managers">
            <Users className="company-sidebar__info-icon" />
            <div className="company-sidebar__info-content">
              <div className="company-sidebar__info-label">Atanan Menajer(ler)</div>
              <div className="company-sidebar__manager-list">
                {company.managers.length > 0 ? (
                  company.managers.map((manager: User) => (
                    <span key={manager.id} className="company-sidebar__manager-item">
                      <Avatar
                        src={manager.image}
                        alt={manager.name}
                        size={22}
                        fallbackIcon={<span className="company-sidebar__manager-fallback">{manager.name.charAt(0).toUpperCase()}</span>}
                        className="company-sidebar__manager-avatar"
                        style={{ backgroundColor: 'var(--primary-400)' }}
                      />
                      {manager.name}
                    </span>
                  ))
                ) : (
                  <span className="company-sidebar__manager-empty">Atanmış menajer yok</span>
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
                <span className="company-sidebar__activity-type">
                  {ACTIVITY_LABELS[activity.type] || activity.type}
                </span>
              </div>
              <div className="company-sidebar__activity-user">
                <Avatar 
                  src={activity.user?.image} 
                  alt={activity.user?.name} 
                  size={18} 
                  className="company-sidebar__activity-avatar" 
                />
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
        >
          <Settings className="company-sidebar__action-icon" />
          Aktiviteyi Yönet
        </button>

        <div className="company-sidebar__more" ref={moreActionsRef}>
          {showMoreActions && (
            <div className="company-sidebar__more-panel">
              <button
                className="company-sidebar__action-btn company-sidebar__action-btn--ai-email"
                onClick={async () => {
                  setShowMoreActions(false);
                  await handleGenerateEmail();
                }}
                disabled={isGenerating}
              >
                <Sparkles className="company-sidebar__action-icon" size={16} />
                {isGenerating ? 'Hazırlanıyor...' : 'AI ile E-Posta Yaz'}
              </button>

              <button
                className="company-sidebar__action-btn company-sidebar__action-btn--ai-summary"
                onClick={async () => {
                  setShowMoreActions(false);
                  await handleSummarizeNotes();
                }}
                disabled={isGenerating}
              >
                <MessageSquare className="company-sidebar__action-icon" size={16} />
                {isGenerating ? 'Hazırlanıyor...' : 'AI Toplantı Özeti Çıkart'}
              </button>
            </div>
          )}

          <button
            className="company-sidebar__action-btn company-sidebar__action-btn--more"
            onClick={() => setShowMoreActions(prev => !prev)}
            disabled={isGenerating}
          >
            <MoreHorizontal className="company-sidebar__action-icon" />
            Daha fazla
          </button>
        </div>
      </div>
    </div>
  );
}
