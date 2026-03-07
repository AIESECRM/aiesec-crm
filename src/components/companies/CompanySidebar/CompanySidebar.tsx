'use client';

import React from 'react';
import { Building2, Phone, Mail, Eye, Settings, User } from 'lucide-react';
import './CompanySidebar.css';

const ACTIVITY_LABELS: Record<string, string> = {
  COLD_CALL: 'Cold Call',
  MEETING: 'Görüşme',
  EMAIL: 'Email',
  FOLLOW_UP: 'Takip',
};

const STATUS_LABELS: Record<string, string> = {
  POSITIVE: 'Pozitif',
  NEGATIVE: 'Negatif',
  NO_ANSWER: 'Cevap Yok',
  CALL_AGAIN: 'Tekrar Ara',
  MEETING_PLANNED: 'Toplantı Planlandı',
};

function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  const days = Math.floor(diff / 86400);
  if (days === 0) return 'Bugün';
  if (days === 1) return '1 gün önce';
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return `${Math.floor(days / 30)} ay önce`;
}

interface CompanySidebarProps {
  company: any;
  recentActivities?: any[];
  onViewProfile?: () => void;
  onManageActivities?: () => void;
}

export default function CompanySidebar({
  company,
  recentActivities = [],
  onViewProfile,
  onManageActivities
}: CompanySidebarProps) {
  return (
    <div className="company-sidebar">
      <div className="company-sidebar__header">
        <div className="company-sidebar__icon"><Building2 /></div>
        <div className="company-sidebar__title">
          <h2 className="company-sidebar__name">{company.name}</h2>
          <div style={{ marginTop: '4px', fontSize: '13px', color: '#6b7280' }}>
            {STATUS_LABELS[company.status] || company.status}
          </div>
        </div>
      </div>

      <div className="company-sidebar__section">
        <div className="company-sidebar__section-header">
          <h3 className="company-sidebar__section-title">İletişim Bilgileri</h3>
        </div>
        <div className="company-sidebar__info-item">
          <Phone className="company-sidebar__info-icon" />
          <div className="company-sidebar__info-content">
            <div className="company-sidebar__info-label">Telefon</div>
            <div className="company-sidebar__info-value">{company.phone || '—'}</div>
          </div>
        </div>
        <div className="company-sidebar__info-item">
          <Mail className="company-sidebar__info-icon" />
          <div className="company-sidebar__info-content">
            <div className="company-sidebar__info-label">E-Posta</div>
            <div className="company-sidebar__info-value">{company.email || '—'}</div>
          </div>
        </div>
      </div>

      {recentActivities.length > 0 && (
        <div className="company-sidebar__section">
          <div className="company-sidebar__section-header">
            <h3 className="company-sidebar__section-title">Son Aktiviteler</h3>
          </div>
          {recentActivities.slice(0, 4).map((activity: any) => (
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
                <User className="company-sidebar__activity-user-icon" />
                <span className="company-sidebar__activity-name">{activity.user?.name || '—'}</span>
              </div>
              <span className="company-sidebar__activity-date">
                {formatRelativeTime(activity.date)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="company-sidebar__actions">
        <button className="company-sidebar__action-btn company-sidebar__action-btn--primary" onClick={onViewProfile}>
          <Eye className="company-sidebar__action-icon" />
          Tam Profili Görüntüle
        </button>
        <button className="company-sidebar__action-btn company-sidebar__action-btn--secondary" onClick={onManageActivities}>
          <Settings className="company-sidebar__action-icon" />
          Aktiviteyi Yönet
        </button>
      </div>
    </div>
  );
}