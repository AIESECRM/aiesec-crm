'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole, Company } from '@/types';
import { Shield, Briefcase } from 'lucide-react';

export default function RoleManagementPage() {
    const context = useAuth() as any;
    const user = context?.user;
    const permissions = context?.permissions;

    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

                setUsers((usersData.users || []).filter((u: User) => u.chapter === user.chapter));
                setCompanies(companiesData.companies || []);
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

    if (!permissions?.canManageRoles) {
        return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>Rol yönetimi için yetkiniz bulunmamaktadır.</div>;
    }

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (newRole === 'LCVP' && user.role !== 'LCP') {
            alert('Sadece LCP LCVP ataması yapabilir.');
            return;
        }

        const userToUpdate = users.find(u => u.id === userId);
        if (userToUpdate?.role === 'LCVP' && user.role !== 'LCP') {
            alert('Sadece LCP bir LCVP\'nin rolünü düşürebilir.');
            return;
        }

        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'change-role', role: newRole })
        });

        if (res.ok) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert('Rol başarıyla güncellendi.');
        }
    };

    const handleCompanyAssign = (userId: string, companyId: string) => {
        alert(`Kullanıcı başarıyla şirkete menajer olarak atandı! (Demo)`);
    };

    const assignableRoles: UserRole[] = user.role === 'LCP'
        ? ['LCVP', 'TL', 'TM']
        : ['TL', 'TM'];

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                <Shield size={24} />
                Üye ve Rol Yönetimi
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {users.map(member => (
                    <div key={member.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '18px', fontWeight: '600' }}>{member.name}</span>
                            <span style={{ color: '#2563eb', fontWeight: '500', fontSize: '14px' }}>{member.role}</span>
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>{member.email}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>Rol Ata</label>
                                <select
                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                                    value={member.role}
                                    onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                                    disabled={member.role === 'LCP' || member.role === 'ADMIN'}
                                >
                                    <option value={member.role} disabled>{member.role}</option>
                                    {assignableRoles.filter(r => r !== member.role).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                                    <Briefcase size={12} /> Menajer Ata
                                </label>
                                <select
                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                                    defaultValue=""
                                    onChange={(e) => handleCompanyAssign(member.id, e.target.value)}
                                >
                                    <option value="" disabled>Şirket Seç...</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
