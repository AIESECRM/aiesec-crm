'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home, Building2, Phone, Calendar, Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard';
import './page.css';

const NATIONAL_ROLES = ['MCP', 'MCVP', 'ADMIN'];

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

export default function DashboardPage() {
  const { user } = useAuth() as any;
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sadece normal roller için veri çek
    if (user && !NATIONAL_ROLES.includes(user.role)) {
      fetchData();
    } else if (user && NATIONAL_ROLES.includes(user.role)) {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [companiesRes, activitiesRes] = await Promise.all([
      fetch('/api/companies'),
      fetch('/api/activities'),
    ]);
    const companiesData = await companiesRes.json();
    const activitiesData = await activitiesRes.json();
    setCompanies(companiesData.companies || []);
    setActivities(activitiesData.activities || []);
    setLoading(false);
  };

  // User henüz yüklenmediyse bekle
  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div style={{ color: '#6b7280' }}>Yükleniyor...</div>
    </div>
  );

  // MCVP/MCP/ADMIN → Executive Dashboard
  if (NATIONAL_ROLES.includes(user.role)) {
    return <ExecutiveDashboard />;
  }

  const todayColdCalls = activities.filter(a => {
    const today = new Date();
    const actDate = new Date(a.date * 1000);
    return a.type === 'COLD_CALL' &&
      actDate.getDate() === today.getDate() &&
      actDate.getMonth() === today.getMonth() &&
      actDate.getFullYear() === today.getFullYear();
  }).length;

  const plannedMeetings = activities.filter(a => a.type === 'MEETING').length;
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const newCompaniesThisWeek = companies.filter(c => c.createdAt > oneWeekAgo).length;

  const stats = [
    { id: 1, label: 'Toplam Şirket', value: companies.length, icon: <Building2 />, iconColor: 'blue' },
    { id: 2, label: 'Cold Call (Bugün)', value: todayColdCalls, icon: <Phone />, iconColor: 'green' },
    { id: 3, label: 'Toplantı', value: plannedMeetings, icon: <Calendar />, iconColor: 'orange' },
    { id: 4, label: 'Bu Hafta Yeni Şirket', value: newCompaniesThisWeek, icon: <Users />, iconColor: 'purple' },
  ];

  const recentCompanies = companies.slice(0, 4);
  const recentActivities = activities.slice(0, 5);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div style={{ color: '#6b7280' }}>Yükleniyor...</div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__title">
          <Home className="dashboard__title-icon" />
          <h1 className="dashboard__title-text">Anasayfa</h1>
        </div>
        {user && (
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Hoşgeldin, <strong>{user.name}</strong>
          </div>
        )}
      </div>

      <div className="dashboard__stats">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-card__header">
              <div className={`stat-card__icon stat-card__icon--${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-card__value">{stat.value}</div>
            <div className="stat-card__label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard__content">
        <div className="dashboard__main">
          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Son Eklenen Şirketler</h2>
              <Link href="/sirketler" className="dashboard__section-action">Tümünü Gör</Link>
            </div>
            <div className="dashboard__recent-companies">
              {recentCompanies.length > 0 ? recentCompanies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => router.push(`/sirketler/${company.id}`)}
                  style={{
                    padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px',
                    border: '1px solid #e5e7eb', cursor: 'pointer', marginBottom: '8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{company.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {company.email || '—'}
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: '#f3f4f6', color: '#374151',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px'
                  }}>
                    {STATUS_LABELS[company.status] || company.status}
                  </span>
                </div>
              )) : (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Henüz şirket eklenmemiş.</p>
              )}
            </div>
          </div>

          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Son Aktiviteler</h2>
              <Link href="/aktiviteler" className="dashboard__section-action">Tümünü Gör</Link>
            </div>
            <div className="dashboard__activity-list">
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="dashboard__activity-item">
                  <div className="dashboard__activity-left">
                    <div className="dashboard__activity-info">
                      <div className="dashboard__activity-company">{activity.company?.name || '—'}</div>
                      <div className="dashboard__activity-meta">
                        {activity.user?.name} • {ACTIVITY_LABELS[activity.type] || activity.type}
                      </div>
                    </div>
                  </div>
                  <div className="dashboard__activity-right">
                    <span className="dashboard__activity-date">
                      {new Date(activity.date * 1000).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              )) : (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Henüz aktivite eklenmemiş.</p>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard__sidebar">
          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Aktivite Özeti</h2>
            </div>
            <div className="dashboard__activity-list">
              {['COLD_CALL', 'MEETING', 'EMAIL', 'FOLLOW_UP'].map(type => {
                const count = activities.filter(a => a.type === type).length;
                return (
                  <div key={type} className="dashboard__activity-item">
                    <div className="dashboard__activity-left">
                      <div>
                        <div className="dashboard__activity-company">{ACTIVITY_LABELS[type]}</div>
                        <div className="dashboard__activity-meta">Toplam</div>
                      </div>
                    </div>
                    <div className="dashboard__activity-right">
                      <span className="stat-card__value" style={{ fontSize: 20 }}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}