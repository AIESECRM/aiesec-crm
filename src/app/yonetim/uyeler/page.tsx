'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole, Company } from '@/types';
import { Shield, Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';

const NATIONAL_ROLES = ['MCP', 'MCVP', 'ADMIN'];

export default function RoleManagementPage() {
    const context = useAuth() as any;
    const user = context?.user;
    const permissions = context?.permissions;
    const [companies, setCompanies] = useState<any[]>([]);

    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setIsLoading(true);
            try {
                const [usersRes, companiesRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/companies')
                ]);
                const usersData = await usersRes.json();
                const companiesData = await companiesRes.json();

                let fetchedUsers = usersData.users || [];
                // LCP/LCVP sadece kendi şubesini görsün
                if (!NATIONAL_ROLES.includes(user.role)) {
                    fetchedUsers = fetchedUsers.filter((u: User) => u.chapter === user.chapter);
                }
                setUsers(fetchedUsers);
                setCompanies(companiesData.companies || []);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        }
        fetchData();
    }, [user]);
    // Sadece LCVP ve üstü yetkililer için şirketleri önceden çekiyoruz
    useEffect(() => {
        if (['ADMIN', 'MCP', 'MCVP', 'LCP', 'LCVP'].includes(user?.role)) {
            fetch('/api/companies').then(r => r.json()).then(d => setCompanies(d.companies || []));
        }
    }, [user]);

    const handleAssignManager = async (userId: number, companyId: string) => {
        if (!companyId) return;
        try {
            // Şirketin mevcut menajerlerini alıyoruz ki silinmeden üstüne ekleyelim
            const compRes = await fetch(`/api/companies/${companyId}`);
            const compData = await compRes.json();
            const existingIds = compData.company?.managers?.map((m: any) => m.id) || [];

            if (!existingIds.includes(userId)) {
                await fetch(`/api/companies/${companyId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ managerIds: [...existingIds, userId] })
                });
                alert('Üye başarıyla seçilen şirkete atandı!');
            } else {
                alert('Uyarı: Bu üye zaten seçili şirketin menajeri konumunda.');
            }
        } catch (error) {
            alert('Atama işlemi sırasında bir hata oluştu.');
        }
    };

    if (isLoading || !user) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
    }

    if (!permissions?.canManageRoles) {
        return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>Rol yönetimi için yetkiniz bulunmamaktadır.</div>;
    }

    const pendingUsers = users.filter((u: any) => u.status === 'PENDING');
    const activeUsers = users.filter((u: any) => u.status === 'ACTIVE');

    const handleApprove = async (userId: string) => {
        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'approve' })
        });
        if (res.ok) {
            setUsers(users.map((u: any) => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
            alert('Kullanıcı onaylandı!');
        }
    };

    const handleReject = async (userId: string) => {
        if (!confirm('Bu kullanıcıyı reddetmek istediğinize emin misiniz?')) return;
        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'reject' })
        });
        if (res.ok) {
            setUsers(users.filter((u: any) => u.id !== userId));
            alert('Kullanıcı reddedildi.');
        }
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'change-role', role: newRole })
        });
        if (res.ok) {
            setUsers(users.map((u: any) => u.id === userId ? { ...u, role: newRole } : u));
            alert('Rol başarıyla güncellendi.');
        }
    };

    const assignableRoles: UserRole[] = user.role === 'LCP'
        ? ['LCVP', 'TL', 'TM']
        : NATIONAL_ROLES.includes(user.role)
        ? ['LCP', 'LCVP', 'TL', 'TM']
        : ['TL', 'TM'];

    const tabStyle = (tab: string) => ({
        padding: '8px 20px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        backgroundColor: activeTab === tab ? 'var(--primary-400)' : 'var(--dashboard-bg)',
        color: activeTab === tab ? 'white' : 'var(--text-regular)',
    });

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                <Shield size={24} />
                Üye ve Rol Yönetimi
            </h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button style={tabStyle('pending')} onClick={() => setActiveTab('pending')}>
                    <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Onay Bekleyenler {pendingUsers.length > 0 && `(${pendingUsers.length})`}
                </button>
                <button style={tabStyle('active')} onClick={() => setActiveTab('active')}>
                    Aktif Üyeler ({activeUsers.length})
                </button>
            </div>

            {/* Pending Users */}
            {activeTab === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingUsers.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)', backgroundColor: 'var(--neutral-light)', borderRadius: '12px' }}>
                            Onay bekleyen üye yok.
                        </div>
                    ) : pendingUsers.map((member: any) => (
                        <div key={member.id} style={{ backgroundColor: 'var(--neutral-light)', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f59e0b' }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '600' }}>{member.name}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{member.email}</div>
                                <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '2px' }}>{member.role} • {member.chapter || 'Şube Yok'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleApprove(member.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                                    <CheckCircle size={16} /> Onayla
                                </button>
                                <button onClick={() => handleReject(member.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                                    <XCircle size={16} /> Reddet
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Active Users */}
            {activeTab === 'active' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeUsers.map((member: any) => (
                        <div key={member.id} style={{ backgroundColor: 'var(--neutral-light)', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '600' }}>{member.name}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{member.email}</div>
                                <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '2px' }}>{member.role} • {member.chapter || 'Genel Merkez'}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-light)' }}>Rol:</label>
                                <select
                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px',backgroundColor: 'var(--neutral-light)',color: 'var(--text-regular)', outline: 'none'}}
                                    value={member.role}
                                    onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                                    disabled={member.role === 'ADMIN'}
                                >
                                    {assignableRoles.map(role => (
                                        <option key={role} value={role} style={{ backgroundColor: 'var(--neutral-light)', color: 'var(--text-regular)' }}>{role}</option>
                                    ))}
                                </select>
                                {['ADMIN', 'MCP', 'MCVP', 'LCP', 'LCVP'].includes(user?.role) && (
                                    <select
                                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'var(--neutral-light)', color: 'var(--text-regular)', outline: 'none', maxWidth: '170px' }}
                                        onChange={(e) => {
                                            handleAssignManager(member.id, e.target.value);
                                            e.target.value = ""; // Seçimden sonra eski placeholder haline geri döner
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled style={{ backgroundColor: 'var(--neutral-light)', color: 'var(--text-light)' }}>Şirkete Ata...</option>
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id} style={{ backgroundColor: 'var(--neutral-light)', color: 'var(--text-regular)' }}>{c.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
