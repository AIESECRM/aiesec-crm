'use client';

import React from 'react';
import { Phone, Clock, Mail, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
}

const statusLabels: Record<string, string> = {
  // Company Status
  POSITIVE: 'Pozitif',
  NEGATIVE: 'Negatif',
  NO_ANSWER: 'Cevap Yok',
  CALL_AGAIN: 'Tekrar Ara',
  MEETING_PLANNED: 'Toplantı Planlandı',

  // Activity Type
  COLD_CALL: 'Cold Call',
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

export default function StatusBadge({ status, showIcon = false }: StatusBadgeProps) {
  const normStatus = typeof status === 'string' ? status.toUpperCase() : String(status);
  const label = statusLabels[normStatus] || status;
  const icon = showIcon ? statusIcons[normStatus] : null;

  return (
    <span className={`status-badge status-badge--${normStatus.toLowerCase()}`}>
      {icon}
      {label}
    </span>
  );
}