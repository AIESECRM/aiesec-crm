'use client';

import React, { useState, useEffect } from 'react';
import { CalendarPlus, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityType, Company, User } from '@/types';
import TimeKeeper from 'react-timekeeper';
import { Calendar, Clock } from 'lucide-react';

export default function AktivitePlanlaPage() {
    const { user } = useAuth();

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [selectedManagerId, setSelectedManagerId] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('09:00');
    const [showClock, setShowClock] = useState(false);
    const [type, setType] = useState<ActivityType>('COLD_CALL');
    const [notes, setNotes] = useState<string>('');

    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            if (!user) return;
            try {
                const [companiesRes, usersRes] = await Promise.all([
                    fetch('/api/companies'),
                    fetch('/api/admin/users')
                ]);
                const companiesData = await companiesRes.json();
                const usersData = await usersRes.json();

                setCompanies(companiesData.companies || []);
                setUsers(usersData.users || []);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        }
        loadData();
    }, [user]);

    // When company changes, try to default manager
    useEffect(() => {
        if (selectedCompanyId && companies.length > 0) {
            const comp = companies.find(c => c.id === selectedCompanyId);
            if (comp && comp.assignedManagerIds?.length > 0) {
                setSelectedManagerId(comp.assignedManagerIds[0]); // default to first manager
            } else if (user) {
                setSelectedManagerId(user.id);
            }
        }
    }, [selectedCompanyId, user, companies]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId || !selectedManagerId || !date || !time) {
            alert('Lütfen gerekli tüm alanları doldurun.');
            return;
        }

        const res = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                companyId: selectedCompanyId,
                userId: selectedManagerId,
                type: type,
                note: notes,
                date: `${date}T${time}:00`,
                isPlanned: true
            })
        });

        if (res.ok) {
            alert('Aktivite başarıyla planlandı!');
            // Reset form
            setSelectedCompanyId('');
            setSelectedManagerId('');
            setDate('');
            setTime('');
            setType('COLD_CALL');
            setNotes('');
        } else {
            alert('Bir hata oluştu.');
        }
    };
    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Ortak input stili (Karanlık tema uyumlu)
    const inputStyle = {
        padding: '10px', 
        borderRadius: '8px', 
        border: '1px solid var(--border-color)', 
        fontSize: '15px',
        backgroundColor: 'var(--neutral-light)', // Tema değişince otomatik adapte olur
        color: 'var(--foreground)',              // Yazı rengi
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box' as const
    };

    return (
        <div style={{ maxWidth: '600px', padding: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                <CalendarPlus size={24} />
                Ek Aktivite Planla
            </h2>

            {isLoading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Yükleniyor...</div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Şirket Seçimi</label>
                        <select
                            style={inputStyle}
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Şirket Seç...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Menajer / Yetkili</label>
                        <select
                            style={inputStyle}
                            value={selectedManagerId}
                            onChange={(e) => setSelectedManagerId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Menajer Seç...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>

                    {/* TARİH VE SAAT BÖLÜMÜ */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {/* 1. Tarih Seçici */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Tarih</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    style={{ ...inputStyle, paddingLeft: '36px' }}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                                <CalendarPlus
                                    size={18}
                                    style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280', pointerEvents: 'none' }}
                                />
                            </div>
                            {/* Formatlanmış Tarih Gösterimi */}
                            {date && (
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                    Seçilen: {formatDisplayDate(date)}
                                </span>
                            )}
                        </div>

                        {/* 2. Yuvarlak Saat Seçici */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Saat</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    style={{ ...inputStyle, paddingLeft: '36px', cursor: 'pointer' }}
                                    value={time}
                                    readOnly
                                    onClick={() => setShowClock(true)}
                                    placeholder="Saat seçin"
                                    required
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280', pointerEvents: 'none' }}
                                >
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>

                                {showClock && (
                                    <div style={{ position: 'absolute', zIndex: 1000, marginTop: '4px', left: 0 }}>
                                        {/* Tıklayınca kapanması için arkaplan */}
                                        <div
                                            style={{ position: 'fixed', inset: 0 }}
                                            onClick={() => setShowClock(false)}
                                        />
                                        {/* Karanlık temaya uygun saat popup çerçevesi */}
                                        <div style={{ position: 'relative', backgroundColor: 'var(--card)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                                            <TimeKeeper
                                                time={time || '09:00'}
                                                onChange={(newTime: any) => setTime(newTime.formatted24)}
                                                onDoneClick={() => setShowClock(false)}
                                                switchToMinuteOnHourSelect={true}
                                            />
                                            {/* Özel Tamam Butonu (Tema Uyumlu) */}
                                            <div
                                                onClick={() => setShowClock(false)}
                                                style={{ textAlign: 'center', padding: '12px 0', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--neutral-light)' }}
                                            >
                                                Tamam
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Aktivite Tipi</label>
                        <select
                            style={inputStyle}
                            value={type}
                            onChange={(e) => setType(e.target.value as ActivityType)}
                        >
                            <option value="COLD_CALL">Cold Call</option>
                            <option value="MEETING">Toplantı</option>
                            <option value="EMAIL">E-posta</option>
                            <option value="TASK">Görev</option>
                            <option value="PROPOSAL">Teklif İletimi</option>
                            <option value="POSTPONED">Ertelenmiş İşlem</option>
                            <option value="FOLLOW_UP">Takip</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Notlar</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: '100px' }}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Aktivite detayları..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: '12px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '8px'
                        }}
                    >
                        <Save size={18} /> Planla ve Bildir
                    </button>

                </form>
            )}
        </div>
    );
}