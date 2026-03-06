'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers } from '@/actions/users';
import { getCompanies } from '@/actions/companies';
import { User, UserRole, Company } from '@/types';
import { Shield, Briefcase, ChevronDown } from 'lucide-react';

export default function RoleManagementPage() {
    const { user, permissions } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setIsLoading(true);
            const [fetchedUsers, fetchedCompanies] = await Promise.all([
                getAllUsers(),
                getCompanies(user.id)
            ]);
            setUsers(fetchedUsers.filter(u => u.branchId === user.branchId));
            setCompanies(fetchedCompanies);
            setIsLoading(false);
        }
        fetchData();
    }, [user]);

    if (isLoading || !user) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
    }

    if (!permissions?.canManageRoles) {
        return <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--status-negative)' }}>Rol yönetimi için yetkiniz bulunmamaktadır.</div>;
    }

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        // Only LCPs can assign/demote LCVP
        if (newRole === 'LCVP' && user.role !== 'LCP') {
            alert('Sadece LCP LCVP ataması yapabilir.');
            return;
        }

        const userToUpdate = users.find(u => u.id === userId);
        if (userToUpdate?.role === 'LCVP' && user.role !== 'LCP') {
            alert('Sadece LCP bir LCVP\'nin rolünü düşürebilir.');
            return;
        }

        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        alert('Rol başarıyla güncellendi.');
    };

    const handleCompanyAssign = (userId: string, companyId: string) => {
        // Mock adding user as manager
        alert(`Kullanıcı başarıyla şirkete menajer olarak atandı! (Demo)`);
    };

    // Roles available to assign (filtered by current user role)
    const assignableRoles: UserRole[] = user.role === 'LCP'
        ? ['LCVP', 'TeamLeader', 'TeamMember']
        : ['TeamLeader', 'TeamMember'];

    return (
        <div className="yonetim-content">
            <h2 className="yonetim-page-header">
                <Shield className="yonetim-page-icon" size={24} />
                Üye ve Rol Yönetimi
            </h2>

            <div className="yonetim-members-list">
                {users.map(member => (
                    <div key={member.id} className="yonetim-member-card">
                        <div className="yonetim-member-info" style={{ flex: 1 }}>
                            <span className="yonetim-member-name" style={{ fontSize: '18px' }}>{member.name}</span>
                            <span className="yonetim-member-role" style={{ color: 'var(--primary-400)', fontWeight: 500 }}>{member.role}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>{member.email}</span>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center', flexWrap: 'wrap' }}>

                            {/* Role Assignment */}
                            <div className="yonetim-form-group">
                                <label className="yonetim-label">Rol Ata</label>
                                <select
                                    className="yonetim-select"
                                    value={member.role}
                                    onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                                    disabled={member.role === 'LCP'} // LCP cannot be changed here
                                >
                                    <option value={member.role} disabled>{member.role}</option>
                                    {assignableRoles.filter(r => r !== member.role).map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Company Assignment */}
                            <div className="yonetim-form-group">
                                <label className="yonetim-label">
                                    <Briefcase size={12} /> Menajer Ata
                                </label>
                                <select
                                    className="yonetim-select"
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
