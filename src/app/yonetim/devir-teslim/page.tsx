'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers } from '@/actions/users';
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
            const fetchedUsers = await getAllUsers();
            // Typically an LCVP or LCP would see members of their branch
            setUsers(fetchedUsers.filter(u => u.branchId === user.branchId));
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
        <div className="yonetim-content" style={{ maxWidth: '600px' }}>
            <h2 className="yonetim-page-header">
                <RefreshCw className="yonetim-page-icon" size={24} />
                Devir Teslim (Handover) İşlemi
            </h2>

            <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--bg-light)', borderRadius: 'var(--border-radius)', marginBottom: 'var(--spacing-xl)' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                    Bu modül ile görevi bırakan, değişen veya ayrılan bir üyenin sorumluluğundaki tüm şirketleri,
                    teklifleri ve beklemedeki aktiviteleri tek bir işlemle başka bir üyeye aktarabilirsiniz.
                    <br /><br />
                    <strong>Dikkat:</strong> Bu işlem geri alınamaz.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="yonetim-form-group">
                    <label className="yonetim-label">Kaynak Üye (Devreden)</label>
                    <select
                        className="yonetim-select"
                        value={fromUserId}
                        onChange={(e) => setFromUserId(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    >
                        <option value="" disabled>Üye Seçin...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div className="yonetim-form-group">
                    <label className="yonetim-label">Hedef Üye (Devralan)</label>
                    <select
                        className="yonetim-select"
                        value={toUserId}
                        onChange={(e) => setToUserId(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    >
                        <option value="" disabled>Üye Seçin...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div className="yonetim-form-group">
                    <label className="yonetim-label">Devir Sebebi (Opsiyonel)</label>
                    <textarea
                        className="yonetim-select"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Örn: Görev değişikliği, ekipten ayrılma..."
                        rows={3}
                        style={{ width: '100%', resize: 'vertical', cursor: 'text' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: isSubmitting ? 'var(--text-light)' : 'var(--status-negative)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius)',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '15px',
                        fontWeight: 600
                    }}
                >
                    <Save size={18} /> {isSubmitting ? 'Aktarılıyor...' : 'Devri Başlat'}
                </button>
            </form>
        </div>
    );
}
