'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, BarChart3, Settings, CalendarPlus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import './yonetim.css';

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { permissions } = useAuth();

    if (!permissions.canViewTeamStats) {
        return <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>Bu sayfayı görüntüleme yetkiniz yok.</div>;
    }

    const tabs = [
        { href: '/yonetim', label: 'Genel Durum', icon: <BarChart3 size={16} /> },
        { href: '/yonetim/uyeler', label: 'Üye ve Rol Yönetimi', icon: <Users size={16} /> },
        { href: '/yonetim/aktivite-planla', label: 'Aktivite Planla', icon: <CalendarPlus size={16} /> },
        { href: '/yonetim/devir-teslim', label: 'Devir Teslim', icon: <RefreshCw size={16} /> },
    ];

    return (
        <div className="yonetim-layout">
            <div className="yonetim-layout__header">
                <div className="yonetim-layout__title-group">
                    <Settings className="yonetim-layout__icon" />
                    <h1 className="yonetim-layout__title">Yönetim Paneli</h1>
                </div>
                <p className="yonetim-layout__subtitle">
                    Şube performansınızı ve üye faaliyetlerini buradan takip edebilirsiniz.
                </p>
            </div>

            <div className="yonetim-layout__tabs">
                {tabs.map(tab => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`yonetim-layout__tab ${pathname === tab.href ? 'yonetim-layout__tab--active' : ''}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </Link>
                ))}
            </div>

            <div className="yonetim-layout__content">
                {children}
            </div>
        </div>
    );
}
