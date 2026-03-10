'use client';

import React from 'react';
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
  const colorIndex = parseInt(String(company.id)) % iconColors.length;
  const iconColor = iconColors[colorIndex];
  const contactCount = company.contactCount ?? company._count?.contacts ?? 0;
  const offerCount = company.activeProposals ?? company._count?.offers ?? 0;

  return (
    <div className="company-card" onClick={onClick}>
      <div className="company-card__header">
        <div className={`company-card__icon-wrapper company-card__icon-wrapper--${iconColor}`}>
          <Building2 className="company-card__icon" />
        </div>
        <div className="company-card__info">
          <div className="company-card__title-row">
            <h3 className="company-card__name">{company.name}</h3>
            <div className="company-card__status">
              <StatusBadge status={company.status} />
            </div>
          </div>
          <div className="company-card__meta">
            {company.category && (
              <span className="company-card__category">
                <FileText className="company-card__meta-icon" />
                {company.category}
              </span>
            )}
            {company.location && (
              <span className="company-card__location">
                <MapPin className="company-card__meta-icon" />
                {company.location}
              </span>
            )}
            {!company.category && !company.location && company.email && (
              <span className="company-card__location">{company.email}</span>
            )}
          </div>
        </div>
      </div>

      <div className="company-card__footer">
        <div className={`company-card__proposals ${offerCount === 0 ? 'company-card__proposals--empty' : ''}`}>
          <RefreshCw className="company-card__proposals-icon" />
          {offerCount > 0 ? `${offerCount} Adet Aktif Teklif` : 'Teklif Yok'}
        </div>
        <div className={`company-card__contacts ${contactCount === 0 ? 'company-card__contacts--empty' : ''}`}>
          <Users className="company-card__contacts-icon" />
          {contactCount > 0 ? `${contactCount} Bağlantı` : 'Bağlantı Yok'}
        </div>
      </div>

      {company.managers && company.managers.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color-light)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-light)' }}>
          <Users size={14} />
          <span>{company.managers.length} Menajer</span>
        </div>
      )}
    </div>
  );
}
