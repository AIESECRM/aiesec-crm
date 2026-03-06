'use client';

import React, { useState, useEffect } from 'react';
import { CalendarPlus, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanies } from '@/actions/companies';
import { getAllUsers } from '@/actions/users';
import { ActivityType, Company, User } from '@/types';

export default function AktivitePlanlaPage() {
    const { user } = useAuth();

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const [selectedManagerId, setSelectedManagerId] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [type, setType] = useState<ActivityType>('cold_call');
    const [notes, setNotes] = useState<string>('');

    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            if (!user) return;
            const [fetchedCompanies, fetchedUsers] = await Promise.all([
                getCompanies(user.id),
                getAllUsers()
            ]);
            setCompanies(fetchedCompanies);
            setUsers(fetchedUsers);
            setIsLoading(false);
        }
        loadData();
    }, []);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId || !selectedManagerId || !date || !time) {
            alert('Lütfen gerekli tüm alanları doldurun.');
            return;
        }

        // Simulate save
        alert('Aktivite başarıyla planlandı ve ilgili menajere bildirim gönderildi! (Demo)');

        // Reset form
        setSelectedCompanyId('');
        setSelectedManagerId('');
        setDate('');
        setTime('');
        setType('cold_call');
        setNotes('');
    };

    return (
        <div className="yonetim-content" style={{ maxWidth: '600px' }}>
            <h2 className="yonetim-page-header">
                <CalendarPlus className="yonetim-page-icon" size={24} />
                Ek Aktivite Planla
            </h2>

            {isLoading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Yükleniyor...</div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div className="yonetim-form-group">
                        <label className="yonetim-label">Şirket Seçimi</label>
                        <select
                            className="yonetim-select"
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        >
                            <option value="" disabled>Şirket Seç...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="yonetim-form-group">
                        <label className="yonetim-label">Menajer / Yetkili</label>
                        <select
                            className="yonetim-select"
                            value={selectedManagerId}
                            onChange={(e) => setSelectedManagerId(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        >
                            <option value="" disabled>Menajer Seç...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                            Varsayılan olarak şirketin bir menajeri seçilir. İsterseniz değiştirebilirsiniz.
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="yonetim-form-group" style={{ flex: 1 }}>
                            <label className="yonetim-label">Tarih</label>
                            <input
                                type="date"
                                className="yonetim-select"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                style={{ width: '100%', cursor: 'text' }}
                            />
                        </div>
                        <div className="yonetim-form-group" style={{ flex: 1 }}>
                            <label className="yonetim-label">Saat</label>
                            <input
                                type="time"
                                className="yonetim-select"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                style={{ width: '100%', cursor: 'text' }}
                            />
                        </div>
                    </div>

                    <div className="yonetim-form-group">
                        <label className="yonetim-label">Aktivite Tipi</label>
                        <select
                            className="yonetim-select"
                            value={type}
                            onChange={(e) => setType(e.target.value as ActivityType)}
                            style={{ width: '100%' }}
                        >
                            <option value="cold_call">Cold Call</option>
                            <option value="meeting">Toplantı</option>
                            <option value="email">E-posta</option>
                            <option value="task">Görev</option>
                            <option value="proposal">Teklif İletimi</option>
                            <option value="postponed">Ertelenmiş İşlem</option>
                        </select>
                    </div>

                    <div className="yonetim-form-group">
                        <label className="yonetim-label">Aktivite Detayları / Notlar</label>
                        <textarea
                            className="yonetim-select"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Aktivitenin amacı, konuşulacak konular vb. detaylar..."
                            rows={4}
                            required
                            style={{ width: '100%', resize: 'vertical', cursor: 'text' }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            backgroundColor: 'var(--primary-500)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--border-radius)',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: 600
                        }}
                    >
                        <Save size={18} /> Planla ve Bildir
                    </button>

                </form>
            )}
        </div>
    );
}
