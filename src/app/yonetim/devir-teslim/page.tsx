'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { executeHandover } from '@/actions/handover';
import { User } from '@/types';
import { RefreshCw, Save } from 'lucide-react';

export default function HandoverPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [fromUserId, setFromUserId] = useState('');
    const [toUserId, setToUserId] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            if (!user) return;
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/users');
                const data = await res.json();
                const fetchedUsers = data.users || [];
                // Filter by same chapter
                setUsers(fetchedUsers.filter((u: User) => u.chapter === user.chapter));
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        }
        fetchUsers();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (fromUserId === toUserId) {
            alert('Kaynak ve hedef kullanıcı aynı olamaz.');
            return;
        }
        if (!fromUserId || !toUserId) {
            alert('Lütfen kaynak ve hedef kullanıcıları seçin.');
            return;
        }

        const confirmTransfer = window.confirm("Bu işlem, seçili kullanıcının tüm şirket, teklif ve aktivitelerini yeni kullanıcıya aktaracaktır. Onaylıyor musunuz?");
        if (!confirmTransfer) return;

        setIsSubmitting(true);
        const result = await executeHandover(fromUserId, toUserId, user.id, reason);
        setIsSubmitting(false);

        if (result.success) {
            window.alert('Devir teslim işlemi başarıyla tamamlandı!');
            setFromUserId('');
            setToUserId('');
            setReason('');
        } else {
            window.alert(`Hata: ${result.error}`);
        }
    };

    if (isLoading || !user) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>;
    }

    return (
        <div style={{ maxWidth: '600px', padding: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                <RefreshCw size={24} />
                Devir Teslim (Handover) İşlemi
            </h2>

            <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '12px', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                    Bu modül ile görevi bırakan bir üyenin tüm portföyünü (şirketler, teklifler, aktiviteler) tek bir işlemle başka bir üyeye aktarabilirsiniz.
                    <br /><br />
                    <strong>Dikkat:</strong> Bu işlem geri alınamaz.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Kaynak Üye (Devreden)</label>
                    <select
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
                        value={fromUserId}
                        onChange={(e) => setFromUserId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Üye Seçin...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Hedef Üye (Devralan)</label>
                    <select
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
                        value={toUserId}
                        onChange={(e) => setToUserId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Üye Seçin...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Devir Sebebi (Opsiyonel)</label>
                    <textarea
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', minHeight: '80px' }}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Örn: Görev değişikliği..."
                        rows={3}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: '12px',
                        backgroundColor: isSubmitting ? '#9ca3af' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Save size={18} /> {isSubmitting ? 'Aktarılıyor...' : 'Devri Başlat'}
                </button>
            </form>
        </div>
    );
}
