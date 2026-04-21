'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home, Building2, Phone, Calendar, Users, CalendarClock, CheckCircle2, X
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
  TASK: 'Görev',
  PROPOSAL: 'Teklif İletimi',
  POSTPONED: 'Ertelenmiş İşlem',
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

  // Planlı Aktiviteler İçin State'ler
  const [plannedActivities, setPlannedActivities] = useState<any[]>([]);
  const [completeModal, setCompleteModal] = useState<{ isOpen: boolean; activity: any }>({ isOpen: false, activity: null });
  const [completionNote, setCompletionNote] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

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
    
    const allActivities = activitiesData.activities || [];
    setCompanies(companiesData.companies || []);
    setActivities(allActivities);
    
    // Kullanıcıya ait "Planlı" aktiviteleri filtrele
    if (user) {
      const myPlanned = user?.id 
        ? allActivities.filter((a: any) => 
            a.isPlanned && String(a.userId) === String(user.id)
          )
        : [];
      setPlannedActivities(myPlanned);
    }
    
    setLoading(false);
  };

  // Aktiviteyi Tamamlama Fonksiyonu
  const handleCompleteActivity = async () => {
    if (!completeModal.activity) return;
    setIsCompleting(true);

    const combinedNote = `${completeModal.activity.note || ''}\n\n[Tamamlandı - Sonuç]: ${completionNote}`.trim();

    try {
      const response = await fetch(`/api/activities/${completeModal.activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          note: combinedNote,
          isPlanned: false, // Artık tamamlandı
          date: Math.floor(Date.now() / 1000) 
        }),
      });
      if (!response.ok) {
        throw new Error(`Sunucu Hatası: Veritabanına ulaşılamadı. (Kod: ${response.status})`);
      }
      setCompleteModal({ isOpen: false, activity: null });
      setCompletionNote('');
      await fetchData(); // Listeyi yenile
    } catch (error) {
      console.error("Tamamlama hatası:", error);
    } finally {
      setIsCompleting(false);
    }
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
  // Kodun içindeki tarih kısmını şu şekilde güvenli hale getirelim:
const formatActivityDate = (timestamp: any) => {
  // Eğer timestamp sayı değilse veya yoksa güvenli bir varsayılan dön
  if (!timestamp || isNaN(Number(timestamp))) return "Tarih Belirtilmedi";
  
  try {
    return new Date(Number(timestamp) * 1000).toLocaleString('tr-TR', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    });
  } catch (e) {
    return "Geçersiz Tarih";
  }
};

  // Sadece isPlanned: false olan tamamlanmış aktiviteleri istatistiklerde sayalım
  const completedActivities = activities.filter(a => !a.isPlanned);

  // İşlemsiz (Unattended) Şirketleri Filtreleme (3 Gün)
  const threeDaysAgo = Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60;
  const unattendedCompanies = companies.filter(c => {
    const isManager = c.managers?.some((m: any) => String(m.id) === String(user.id));
    const isInactive = c.updatedAt < threeDaysAgo; // Son işlem 3 günden eskiyse
    return isManager && isInactive;
  });

  const todayColdCalls = completedActivities.filter(a => {
    const today = new Date();
    const actDate = new Date(a.date * 1000);
    return a.type === 'COLD_CALL' &&
      actDate.getDate() === today.getDate() &&
      actDate.getMonth() === today.getMonth() &&
      actDate.getFullYear() === today.getFullYear();
  }).length;

  const plannedMeetings = completedActivities.filter(a => a.type === 'MEETING').length;
  const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
  const newCompaniesThisWeek = companies.filter(c => c.createdAt > oneWeekAgo).length;

  const stats = [
    { id: 1, label: 'Toplam Şirket', value: companies.length, icon: <Building2 />, iconColor: 'blue' },
    { id: 2, label: 'Cold Call (Bugün)', value: todayColdCalls, icon: <Phone />, iconColor: 'green' },
    { id: 3, label: 'Toplantı', value: plannedMeetings, icon: <Calendar />, iconColor: 'orange' },
    { id: 4, label: 'Bu Hafta Yeni Şirket', value: newCompaniesThisWeek, icon: <Users />, iconColor: 'purple' },
  ];

  const recentCompanies = companies.slice(0, 4);
  const recentActivities = completedActivities.slice(0, 5); // Sadece tamamlanmışları göster

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div style={{ color: 'var(--text-muted, #6b7280)' }}>Yükleniyor...</div>
    </div>
  );
  // Render kısmında liste uzunluğunu kullanırken:
const displayCount = Number(plannedActivities?.length) || 0;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__title">
          <Home className="dashboard__title-icon" />
          <h1 className="dashboard__title-text">Anasayfa</h1>
        </div>
        {user && (
          <div style={{ fontSize: '14px', color: 'var(--text-muted, #6b7280)' }}>
            Hoşgeldin, <strong style={{ color: 'var(--text-regular)' }}>{user.name}</strong>
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

      {/* İŞLEMSİZ ŞİRKETLER BÖLÜMÜ (UNATTENDED COMPANIES) */}
      {unattendedCompanies.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '20px', border: '1px solid #fecaca', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#b91c1c' }}>
            <Building2 color="#dc2626" size={22} />
            Dikkat Bekleyen Şirketler ({unattendedCompanies.length})
            <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#dc2626', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Son 3 gündür işlem yapılmadı
            </span>
          </h2>

          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {unattendedCompanies.map(company => (
              <div 
                key={company.id} 
                onClick={() => router.push(`/sirketler/${company.id}`)} 
                className="hover-card-effect"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fecaca', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }} 
              >
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                    {company.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    Son İşlem: {new Date(company.updatedAt * 1000).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YENİ: PLANLI AKTİVİTELERİM BÖLÜMÜ */}
      {plannedActivities.length > 0 && (
        <div style={{ backgroundColor: 'var(--card, #fff)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-color)', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--foreground)' }}>
            <CalendarClock color="#037EF3" size={22} />
            Yaklaşan Planlı Aktivitelerim ({plannedActivities.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plannedActivities.map(activity => (
              <div key={activity.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--bg-surface, var(--neutral-light))', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#037EF3', marginBottom: '4px' }}>
                    {activity.company?.name || 'Bilinmeyen Şirket'}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-regular)' }}>
                    <strong>Tür:</strong> {ACTIVITY_LABELS[activity.type] || activity.type} • <strong>Tarih:</strong> {new Date(activity.date * 1000).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short'})}
                  </p>
                  {activity.note && (
                    <p style={{ fontSize: '14px', color: 'var(--foreground)', marginTop: '8px', fontStyle: 'italic' }}>
                      "{activity.note}"
                    </p>
                  )}
                </div>
                
                {/* Tamamla Butonu */}
                <button 
                  onClick={() => setCompleteModal({ isOpen: true, activity })}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <CheckCircle2 size={18} /> Tamamla
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEVCUT İÇERİK (Son Şirketler ve Aktiviteler) */}
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
                  className="dashboard__recent-card"
                  style={{
                    padding: '12px 16px', 
                    backgroundColor: 'var(--bg-surface, var(--neutral-light))', 
                    borderRadius: '8px',
                    border: '1px solid var(--border-color-light, var(--border-color))', 
                    cursor: 'pointer', 
                    marginBottom: '8px',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-regular)' }}>{company.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                      {company.email || '—'}
                    </div>
                  </div>
                  <span style={{
                    backgroundColor: 'var(--dashboard-bg)', color: 'var(--text-regular)',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px'
                  }}>
                    {STATUS_LABELS[company.status] || company.status}
                  </span>
                </div>
              )) : (
                <p style={{ color: 'var(--text-muted, #6b7280)', fontSize: '14px' }}>Henüz şirket eklenmemiş.</p>
              )}
            </div>
          </div>

          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Son Tamamlanan Aktiviteler</h2>
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
                // Burada da sadece tamamlanmış olanları sayıyoruz
                const count = completedActivities.filter(a => a.type === type).length;
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

      {/* TAMAMLAMA MODALI */}
      {completeModal.isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setCompleteModal({ isOpen: false, activity: null })} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--card, #fff)', padding: '24px', borderRadius: '12px', zIndex: 1000, width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--foreground)' }}>Aktiviteyi Tamamla</h3>
              <button onClick={() => setCompleteModal({ isOpen: false, activity: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-regular)' }}><X size={20}/></button>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-regular)', marginBottom: '16px' }}>
              <strong>{completeModal.activity?.company?.name}</strong> ile olan planlı görüşmeniz nasıl geçti? Sonuç notunuzu ekleyin.
            </p>

            <textarea
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface, var(--neutral-light))', color: 'var(--foreground)', minHeight: '100px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }}
              placeholder="Görüşme detayları, ulaşılan sonuç vb..."
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setCompleteModal({ isOpen: false, activity: null })} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-regular)', cursor: 'pointer', fontWeight: '600' }}>
                İptal
              </button>
              <button onClick={handleCompleteActivity} disabled={isCompleting} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: isCompleting ? 'not-allowed' : 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', opacity: isCompleting ? 0.7 : 1 }}>
                {isCompleting ? 'Kaydediliyor...' : <><CheckCircle2 size={16} /> Tamamla</>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}