'use client';

import React from 'react';
<<<<<<< HEAD
import { Building2, FileText, MapPin, Users, RefreshCw } from 'lucide-react';
import { Company } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import './CompanyCard.css';


interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

const iconColors = ['blue', 'green', 'orange'];

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const colorIndex = parseInt(company.id) % iconColors.length;
  const iconColor = iconColors[colorIndex];
=======
import { Building2, Users, RefreshCw } from 'lucide-react';
import './CompanyCard.css';

const STATUS_LABELS: Record<string, string> = {
  POSITIVE: 'Pozitif',
  NEGATIVE: 'Negatif',
  NO_ANSWER: 'Cevap Yok',
  CALL_AGAIN: 'Tekrar Ara',
  MEETING_PLANNED: 'Toplantı Planlandı',
};

const STATUS_COLORS: Record<string, string> = {
  POSITIVE: '#10b981',
  NEGATIVE: '#ef4444',
  NO_ANSWER: '#6b7280',
  CALL_AGAIN: '#f59e0b',
  MEETING_PLANNED: '#3b82f6',
};

const iconColors = ['blue', 'green', 'orange'];

interface CompanyCardProps {
  company: any;
  onClick?: () => void;
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const colorIndex = company.id % iconColors.length;
  const iconColor = iconColors[colorIndex];
  const contactCount = company._count?.contacts || 0;
  const offerCount = company._count?.offers || 0;
>>>>>>> ortak-repo/main

  return (
    <div className="company-card" onClick={onClick}>
      <div className="company-card__header">
        <div className={`company-card__icon-wrapper company-card__icon-wrapper--${iconColor}`}>
          <Building2 className="company-card__icon" />
        </div>
        <div className="company-card__info">
          <div className="company-card__title-row">
            <h3 className="company-card__name">{company.name}</h3>
<<<<<<< HEAD
            <div className="company-card__status">
              <StatusBadge status={company.status} />
            </div>
          </div>
          <div className="company-card__meta">
            <span className="company-card__category">
              <FileText className="company-card__meta-icon" />
              {company.category}
            </span>
            <span className="company-card__location">
              <MapPin className="company-card__meta-icon" />
              {company.location}
=======
            <span style={{
              backgroundColor: (STATUS_COLORS[company.status] || '#6b7280') + '20',
              color: STATUS_COLORS[company.status] || '#6b7280',
              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
            }}>
              {STATUS_LABELS[company.status] || company.status}
            </span>
          </div>
          <div className="company-card__meta">
            <span className="company-card__location">
              {company.email || '—'}
>>>>>>> ortak-repo/main
            </span>
          </div>
        </div>
      </div>

      <div className="company-card__footer">
<<<<<<< HEAD
        <div className={`company-card__proposals ${company.activeProposals === 0 ? 'company-card__proposals--empty' : ''}`}>
          <RefreshCw className="company-card__proposals-icon" />
          {company.activeProposals > 0
            ? `${company.activeProposals} Adet Aktif Teklif`
            : 'Teklif Yok'
          }
        </div>
        <div className={`company-card__contacts ${company.contactCount === 0 ? 'company-card__contacts--empty' : ''}`}>
          <Users className="company-card__contacts-icon" />
          {company.contactCount > 0
            ? `${company.contactCount} Bağlantı`
            : 'Bağlantı Yok'
          }
        </div>
      </div>

      {/* assigned managers display (added below footer) */}
      {company.assignedManagerIds && company.assignedManagerIds.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color-light)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-light)' }}>
          <Users size={14} />
          <span>{company.assignedManagerIds.length} Menajer</span>
        </div>
      )}
    </div>
  );
}
=======
        <div className={`company-card__proposals ${offerCount === 0 ? 'company-card__proposals--empty' : ''}`}>
          <RefreshCw className="company-card__proposals-icon" />
          {offerCount > 0 ? `${offerCount} Adet Aktif Teklif` : 'Teklif Yok'}
        </div>
        <div className={`company-card__contacts ${contactCount === 0 ? 'company-card__contacts--empty' : ''}`}>
          <Users className="company-card__contacts-icon" />
          {contactCount > 0 ? `${contactCount} Bağlantı` : 'Bağlantı Yok'}
        </div>
      </div>
    </div>
  );
}
>>>>>>> ortak-repo/main
