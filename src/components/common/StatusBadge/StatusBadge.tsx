'use client';

import React from 'react';
import { Phone, Clock, Mail, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
}

const statusAliases: Record<string, string> = {
  POZITIF: 'POSITIVE',
  NEGATIF: 'NEGATIVE',
  CEVAP_YOK: 'NO_ANSWER',
  TEKRAR_ARA: 'CALL_AGAIN',
  TOPLANTI_PLANLANDI: 'MEETING_PLANNED',
  AKTIF: 'ACTIVE',
  PASIF: 'PASSIVE',
};

const statusLabels: Record<string, string> = {
  POSITIVE: 'Pozitif',
  NEGATIVE: 'Negatif',
  NO_ANSWER: 'Cevap Yok',
  CALL_AGAIN: 'Tekrar Ara',
  MEETING_PLANNED: 'Toplantı Planlandı',
  ACTIVE: 'Aktif',
  PASSIVE: 'Pasif',

  COLD_CALL: 'Soğuk Arama',
  MEETING: 'Görüşme',
  EMAIL: 'E-posta',
  FOLLOW_UP: 'Takip',
};

const statusIcons: Record<string, React.ReactNode> = {
  COLD_CALL: <Phone className="status-badge__icon" />,
  MEETING: <MessageSquare className="status-badge__icon" />,
  FOLLOW_UP: <Clock className="status-badge__icon" />,
  EMAIL: <Mail className="status-badge__icon" />,
  MEETING_PLANNED: <CheckCircle className="status-badge__icon" />,
  NO_ANSWER: <RefreshCw className="status-badge__icon" />,
};

function toStatusKey(value: string): string {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replaceAll('İ', 'I')
    .replaceAll('Ş', 'S')
    .replaceAll('Ğ', 'G')
    .replaceAll('Ü', 'U')
    .replaceAll('Ö', 'O')
    .replaceAll('Ç', 'C')
    .replace(/[\s-]+/g, '_');

  return statusAliases[normalized] || normalized;
}

export default function StatusBadge({ status, showIcon = false }: StatusBadgeProps) {
  const statusKey = toStatusKey(status);
  const label = statusLabels[statusKey] || statusKey.replaceAll('_', ' ');
  const icon = showIcon ? statusIcons[statusKey] : null;
  const classNameSuffix = statusKey.toLowerCase();

  return (
    <span className={`status-badge status-badge--${classNameSuffix}`}>
      {icon}
      {label}
    </span>
  );
}