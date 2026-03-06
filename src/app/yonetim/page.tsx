'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllActivities } from '@/actions/activities';
import { getAllUsers } from '@/actions/users';
import { Building2, Phone, Calendar, TrendingUp } from 'lucide-react';
import { Activity, User } from '@/types';

export default function YonetimPage() {
    const { user } = useAuth();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allActivities, setAllActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setIsLoading(true);
            const [fetchedUsers, fetchedActivities] = await Promise.all([
                getAllUsers(),
                getAllActivities(user.id)
            ]);
            setAllUsers(fetchedUsers);
            setAllActivities(fetchedActivities);
            setIsLoading(false);
        }
        fetchData();
    }, [user]);

    if (isLoading || !user) {
        return <div className="yonetim-content" style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
    }

    // Basic stats for the branch members
    const branchUsers = allUsers.filter(u => u.branchId === user.branchId);
    const branchUserIds = branchUsers.map(u => u.id);

    const branchActivities = allActivities.filter(a => branchUserIds.includes(a.userId));

    // Calculate basic performance
    const coldCalls = branchActivities.filter(a => a.type === 'cold_call').length;
    const meetings = branchActivities.filter(a => a.type === 'meeting').length;
    const companiesHandled = new Set(branchActivities.map(a => a.companyId)).size;

    return (
        <div className="yonetim-content">
            <h2 className="yonetim-page-header">
                <TrendingUp className="yonetim-page-icon" size={24} />
                Şube Genel Durumu ({user.branchId?.toUpperCase()})
            </h2>

            <div className="yonetim-stats-grid">
                <div className="yonetim-stat-card">
                    <div className="yonetim-stat-card__header">
                        <h3 className="yonetim-stat-card__title">Toplam Cold Call</h3>
                        <div className="yonetim-stat-card__icon"><Phone size={20} /></div>
                    </div>
                    <p className="yonetim-stat-card__value">{coldCalls}</p>
                </div>

                <div className="yonetim-stat-card">
                    <div className="yonetim-stat-card__header">
                        <h3 className="yonetim-stat-card__title">Toplantı</h3>
                        <div className="yonetim-stat-card__icon"><Calendar size={20} /></div>
                    </div>
                    <p className="yonetim-stat-card__value">{meetings}</p>
                </div>

                <div className="yonetim-stat-card">
                    <div className="yonetim-stat-card__header">
                        <h3 className="yonetim-stat-card__title">İlgilenilen Şirket</h3>
                        <div className="yonetim-stat-card__icon"><Building2 size={20} /></div>
                    </div>
                    <p className="yonetim-stat-card__value">{companiesHandled}</p>
                </div>
            </div>

            <h3 className="yonetim-page-header" style={{ marginTop: 'var(--spacing-2xl)' }}>Üye Performans Tablosu</h3>
            <div className="yonetim-members-list">
                {branchUsers.map(member => {
                    const memberActivities = branchActivities.filter(a => a.userId === member.id);
                    const mCalls = memberActivities.filter(a => a.type === 'cold_call').length;
                    const mMeetings = memberActivities.filter(a => a.type === 'meeting').length;

                    return (
                        <div key={member.id} className="yonetim-member-card">
                            <div className="yonetim-member-info">
                                <span className="yonetim-member-name">{member.name}</span>
                                <span className="yonetim-member-role">{member.role}</span>
                            </div>
                            <div className="yonetim-member-stats">
                                <div className="yonetim-member-stat">
                                    <span className="yonetim-member-stat-label">Calls</span>
                                    <span className="yonetim-member-stat-value">{mCalls}</span>
                                </div>
                                <div className="yonetim-member-stat">
                                    <span className="yonetim-member-stat-label">Meetings</span>
                                    <span className="yonetim-member-stat-value">{mMeetings}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
