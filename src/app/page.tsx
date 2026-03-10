'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Building2,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Bell,
  Trophy,
  Medal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyCard } from '@/components/companies';
import { getCompanies } from '@/actions/companies';
import { getAllActivities } from '@/actions/activities';
import { Company } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import './page.css';
export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      if (user?.id && user?.id !== 'loading') {
        const [fetchedCompanies, fetchedActivities] = await Promise.all([
          getCompanies(user.id),
          getAllActivities(user.id)
        ]);
        setCompanies(fetchedCompanies);
        setActivities(fetchedActivities);
      }
      setIsLoading(false);
    }
    fetchDashboardData();
  }, [user?.id]);

  const stats = [
    {
      id: 1,
      label: 'Toplam Şirket',
      value: companies.length,
      icon: <Building2 />,
      iconColor: 'blue',
      trend: '+12%',
      trendUp: true,
    },
    {
      id: 2,
      label: 'Cold Call (Bugün)',
      value: activities.filter(a => a.type === 'cold_call' && new Date(a.completedAt || a.createdAt).toDateString() === new Date().toDateString()).length,
      icon: <Phone />,
      iconColor: 'green',
      trend: '+5',
      trendUp: true,
    },
    {
      id: 3,
      label: 'Son Aktiviteler',
      value: activities.length,
      icon: <Calendar />,
      iconColor: 'orange',
    },
    {
      id: 4,
      label: 'Bu Hafta Yeni Şirket',
      value: companies.filter(c => new Date(c.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
      icon: <Users />,
      iconColor: 'purple',
      trend: '-2',
      trendUp: false,
    },
  ];

  const recentCompanies = companies.slice(0, 4);
  const recentActivities = activities.slice(0, 5);

  const inactiveCompanies = React.useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return companies.map(company => {
      const companyActs = activities.filter(a => a.companyId === company.id);
      if (companyActs.length === 0) return { ...company, lastActivityDate: null };

      const lastActivity = companyActs.reduce((latest, current) => {
        const currentD = new Date(current.completedAt || current.createdAt);
        const latestD = new Date(latest.completedAt || latest.createdAt);
        return currentD > latestD ? current : latest;
      });
      return { ...company, lastActivityDate: new Date(lastActivity.completedAt || lastActivity.createdAt) };
    }).filter(c => c.lastActivityDate === null || c.lastActivityDate < thirtyDaysAgo).slice(0, 5);
  }, [companies, activities]);

  const leaderboard = React.useMemo(() => {
    const scores: Record<string, { name: string, score: number, calls: number, meetings: number }> = {};
    activities.forEach(a => {
      const name = a.userName || 'Bilinmeyen Kullanıcı';
      if (!scores[name]) scores[name] = { name: name, score: 0, calls: 0, meetings: 0 };

      if (a.type === 'cold_call') {
        scores[name].score += 1;
        scores[name].calls += 1;
      } else if (a.type === 'meeting') {
        scores[name].score += 5;
        scores[name].meetings += 1;
      } else if (a.type === 'proposal') {
        scores[name].score += 10;
      }
    });
    return Object.values(scores).sort((a, b) => b.score - a.score).slice(0, 5);
  }, [activities]);

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__title">
          <Home className="dashboard__title-icon" />
          <h1 className="dashboard__title-text">Anasayfa</h1>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          Yükleniyor...
        </div>
      ) : (
        <>
          <div className="dashboard__stats">
            {stats.map((stat) => (
              <div key={stat.id} className="stat-card">
                <div className="stat-card__header">
                  <div className={`stat-card__icon stat-card__icon--${stat.iconColor}`}>
                    {stat.icon}
                  </div>
                  {stat.trend && (
                    <span className={`stat-card__trend ${stat.trendUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
                      {stat.trendUp ? <TrendingUp className="stat-card__trend-icon" /> : <TrendingDown className="stat-card__trend-icon" />}
                      {stat.trend}
                    </span>
                  )}
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
                  <Link href="/sirketler" className="dashboard__section-action">
                    Tümünü Gör
                  </Link>
                </div>
                <div className="dashboard__recent-companies">
                  {recentCompanies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      onClick={() => router.push(`/sirketler/${company.id}`)}
                    />
                  ))}
                </div>
              </div>

              <div className="dashboard__section">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Son Aktiviteler</h2>
                  <Link href="/aktiviteler" className="dashboard__section-action">
                    Tümünü Gör
                  </Link>
                </div>
                <div className="dashboard__activity-list">
                  {recentActivities.map((activity) => {
                    const company = companies.find(c => c.id === activity.companyId);
                    return (
                      <div key={activity.id} className="dashboard__activity-item">
                        <div className="dashboard__activity-left">
                          <div className="dashboard__activity-status">
                            <StatusBadge status={activity.type} showIcon />
                          </div>
                          <div className="dashboard__activity-info">
                            <div className="dashboard__activity-company">{company?.name}</div>
                            <div className="dashboard__activity-meta">{activity.userName}</div>
                          </div>
                        </div>
                        <div className="dashboard__activity-right">
                          <span className="dashboard__activity-date">
                            {new Date((activity.completedAt || activity.createdAt) * 1000).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="dashboard__section">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={20} color="var(--primary-500)" />
                    Liderlik Tablosu
                  </h2>
                </div>
                <div className="dashboard__activity-list">
                  {leaderboard.map((userStats, index) => (
                    <div key={index} className="dashboard__activity-item">
                      <div className="dashboard__activity-left">
                        <div className="stat-card__icon" style={{
                          width: 32, height: 32,
                          backgroundColor: index === 0 ? '#FEF3C7' : index === 1 ? '#F3F4F6' : index === 2 ? '#FFEDD5' : 'transparent',
                          color: index === 0 ? '#D97706' : index === 1 ? '#6B7280' : index === 2 ? '#C2410C' : 'var(--text-light)'
                        }}>
                          {index < 3 ? <Medal style={{ width: 18, height: 18 }} /> : <span style={{ fontWeight: 'bold' }}>{index + 1}</span>}
                        </div>
                        <div>
                          <div className="dashboard__activity-company">{userStats.name}</div>
                          <div className="dashboard__activity-meta">
                            {userStats.calls} Arama, {userStats.meetings} Toplantı
                          </div>
                        </div>
                      </div>
                      <div className="dashboard__activity-right">
                        <span className="stat-card__value" style={{ fontSize: 18, color: 'var(--primary-600)' }}>
                          {userStats.score} Puan
                        </span>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--text-light)', padding: '8px 0' }}>Henüz aktivite bulunmuyor.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="dashboard__sidebar">
              <div className="dashboard__section">
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title">Bekleyen Görevler</h2>
                </div>
                <div className="dashboard__activity-list">
                  {activities.filter(a => a.status === 'pending').slice(0, 3).map(task => {
                    const taskComp = companies.find(c => c.id === task.companyId);
                    return (
                      <div key={task.id} className="dashboard__activity-item">
                        <div className="dashboard__activity-left">
                          <div>
                            <div className="dashboard__activity-company">{taskComp?.name} - {task.type}</div>
                            <div className="dashboard__activity-meta">Planlanan: {task.scheduledAt ? new Date(task.scheduledAt).toLocaleDateString() : 'Belirtilmedi'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activities.filter(a => a.status === 'pending').length === 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--text-light)', padding: '8px 0' }}>Hiç bekleyen görev yok.</div>
                  )}
                </div>
              </div>

              <div className="dashboard__section" style={{ marginTop: '24px' }}>
                <div className="dashboard__section-header">
                  <h2 className="dashboard__section-title" style={{ color: 'var(--status-pending)' }}>İşlemsiz Şirketler</h2>
                </div>
                <div className="dashboard__activity-list">
                  {inactiveCompanies.map(company => (
                    <div key={company.id} className="dashboard__activity-item">
                      <div className="dashboard__activity-left">
                        <div>
                          <div className="dashboard__activity-company">{company.name}</div>
                          <div className="dashboard__activity-meta">
                            Son Akt: {company.lastActivityDate ? company.lastActivityDate.toLocaleDateString() : 'Hiç Yok'}
                          </div>
                        </div>
                      </div>
                      <div className="dashboard__activity-right">
                        <button
                          onClick={() => alert(`${company.name} menajerine(lerine) bildirim gönderildi!`)}
                          style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--status-pending-bg)', color: 'var(--status-pending)', border: 'none', cursor: 'pointer' }}
                          title="Menajere Bildirim Gönder"
                        >
                          <Bell size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {inactiveCompanies.length === 0 && (
                    <div style={{ fontSize: '13px', color: 'var(--text-light)', padding: '8px 0' }}>Tüm şirketler güncel.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
