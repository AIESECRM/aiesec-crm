'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Phone, Calendar, TrendingUp } from 'lucide-react';
import { Activity, User } from '@/types';

export default function YonetimPage() {
    const context = useAuth() as any;
    const user = context?.user;

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allActivities, setAllActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setIsLoading(true);
            try {
                const [usersRes, activitiesRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/activities')
                ]);
                const usersData = await usersRes.json();
                const activitiesData = await activitiesRes.json();

                setAllUsers(usersData.users || []);
                setAllActivities(activitiesData.activities || []);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        }
        fetchData();
    }, [user]);

    if (isLoading || !user) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
    }

    // Filter by chapter
    const branchUsers = allUsers.filter(u => u.chapter === user.chapter);
    const branchUserIds = branchUsers.map(u => u.id);

    const branchActivities = allActivities.filter(a => branchUserIds.includes(a.userId));

    // Calculate basic performance
    const coldCalls = branchActivities.filter(a => a.type === 'COLD_CALL').length;
    const meetings = branchActivities.filter(a => a.type === 'MEETING').length;
    const companiesHandled = new Set(branchActivities.map(a => a.companyId)).size;

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                <TrendingUp size={24} />
                Şube Genel Durumu ({user.chapter || 'Belirtilmedi'})
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: 'var(--neutral-light)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '500' }}>Toplam Cold Call</h3>
                        <Phone size={20} color="#2563eb" />
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-regular)' }}>{coldCalls}</p>
                </div>

                <div style={{ backgroundColor: 'var(--neutral-light)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '500' }}>Toplantı</h3>
                        <Calendar size={20} color="#059669" />
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-regular)' }}>{meetings}</p>
                </div>

                <div style={{ backgroundColor: 'var(--neutral-light)', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '500' }}>İlgilenilen Şirket</h3>
                        <Building2 size={20} color="#7c3aed" />
                    </div>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-regular)' }}>{companiesHandled}</p>
                </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Üye Performans Tablosu</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {branchUsers.map(member => {
                    const memberActivities = branchActivities.filter(a => a.userId === member.id);
                    const mCalls = memberActivities.filter(a => a.type === 'COLD_CALL').length;
                    const mMeetings = memberActivities.filter(a => a.type === 'MEETING').length;

                    return (
                        <div key={member.id} style={{ backgroundColor: 'var(--neutral-light)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '600', fontSize: '16px' }}>{member.name}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{member.role}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', fontWeight: 'bold' }}>CALLS</span>
                                    <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{mCalls}</span>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-light)', fontWeight: 'bold' }}>MEETS</span>
                                    <span style={{ fontWeight: 'bold', color: '#059669' }}>{mMeetings}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
