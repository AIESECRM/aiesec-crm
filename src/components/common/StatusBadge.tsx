import React from 'react';

interface StatusBadgeProps {
    status: string | boolean;
    type?: 'success' | 'warning' | 'error' | 'info' | 'default';
    showIcon?: boolean;
}

const statusMap: Record<string, { label: string, bg: string, color: string }> = {
    // Company Status
    'aktif': { label: 'Aktif', bg: 'var(--status-active-bg)', color: 'var(--status-active)' },
    'pasif': { label: 'Pasif', bg: 'var(--status-passive-bg)', color: 'var(--status-passive)' },
    'pozitif': { label: 'Pozitif', bg: 'var(--status-active-bg)', color: 'var(--status-active)' },
    'negatif': { label: 'Negatif', bg: 'var(--status-negative-bg)', color: 'var(--status-negative)' },
    'cevap_yok': { label: 'Cevap Yok', bg: 'var(--status-passive-bg)', color: 'var(--status-passive)' },
    'tekrar_ara': { label: 'Tekrar Ara', bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
    'toplanti_planlandi': { label: 'Toplantı Planlandı', bg: 'var(--status-active-bg)', color: 'var(--status-active)' },

    // Activity Statuses / Types
    'completed': { label: 'Tamamlandı', bg: 'var(--status-active-bg)', color: 'var(--status-active)' },
    'pending': { label: 'Bekliyor', bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
    'overdue': { label: 'Gecikmiş', bg: 'var(--status-negative-bg)', color: 'var(--status-negative)' },
    'cancelled': { label: 'İptal', bg: 'var(--status-passive-bg)', color: 'var(--status-passive)' },
    'cold_call': { label: 'Cold Call', bg: 'var(--activity-cold-call-bg)', color: 'var(--activity-cold-call)' },
    'meeting': { label: 'Toplantı', bg: 'var(--activity-meeting-bg)', color: 'var(--activity-meeting)' },
    'proposal': { label: 'Teklif', bg: 'var(--activity-proposal-bg)', color: 'var(--activity-proposal)' },
    'email': { label: 'E-posta', bg: 'var(--activity-cold-call-bg)', color: 'var(--activity-cold-call)' },
    'task': { label: 'Görev', bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
    'postponed': { label: 'Ertelendi', bg: 'var(--activity-postponed-bg)', color: 'var(--activity-postponed)' },
};

export default function StatusBadge({ status, type = 'default', showIcon = false }: StatusBadgeProps) {
    let colors = { bg: 'var(--border-color-light)', color: 'var(--text-regular)' };
    let label = typeof status === 'boolean' ? (status ? 'Evet' : 'Hayır') : status;

    if (typeof status === 'string' && statusMap[status]) {
        colors = { bg: statusMap[status].bg, color: statusMap[status].color };
        label = statusMap[status].label;
    } else {
        switch (type) {
            case 'success': colors = { bg: 'var(--status-active-bg)', color: 'var(--status-active)' }; break;
            case 'error': colors = { bg: 'var(--status-negative-bg)', color: 'var(--status-negative)' }; break;
            case 'warning': colors = { bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' }; break;
            case 'info': colors = { bg: 'var(--activity-cold-call-bg)', color: 'var(--activity-cold-call)' }; break;
            default: break;
        }
    }

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: colors.bg,
            color: colors.color,
            whiteSpace: 'nowrap'
        }}>
            {showIcon && <span style={{ marginRight: '6px' }}>•</span>}
            {label}
        </span>
    );
}
