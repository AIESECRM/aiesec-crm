'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { executeHandover } from '@/actions/handover';
import { User } from '@/types';
import { RefreshCw, Save, ChevronDown, Search } from 'lucide-react';

const NATIONAL_ROLES = ['MCP', 'MCVP', 'ADMIN'];

const CHAPTER_OPTIONS = [
    { value: '', label: 'Tüm Şubeler' },
    { value: 'ADANA', label: 'Adana' },
    { value: 'ANKARA', label: 'Ankara' },
    { value: 'ANTALYA', label: 'Antalya' },
    { value: 'BURSA', label: 'Bursa' },
    { value: 'DENIZLI', label: 'Denizli' },
    { value: 'DOGU_AKDENIZ', label: 'Doğu Akdeniz' },
    { value: 'ESKISEHIR', label: 'Eskişehir' },
    { value: 'GAZIANTEP', label: 'Gaziantep' },
    { value: 'ISTANBUL', label: 'İstanbul' },
    { value: 'ISTANBUL_ASYA', label: 'İstanbul Asya' },
    { value: 'BATI_ISTANBUL', label: 'Batı İstanbul' },
    { value: 'IZMIR', label: 'İzmir' },
    { value: 'KOCAELI', label: 'Kocaeli' },
    { value: 'KONYA', label: 'Konya' },
    { value: 'KUTAHYA', label: 'Kütahya' },
    { value: 'SAKARYA', label: 'Sakarya' },
    { value: 'TRABZON', label: 'Trabzon' },
];

function SearchableUserSelect({ value, onChange, options, placeholder }: { value: string, onChange: (v: string) => void, options: any[], placeholder: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
    const selected = options.find(o => o.value === value);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div
                onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                    fontSize: '15px', backgroundColor: 'var(--neutral-light)', cursor: 'pointer',
                    minHeight: '44px'
                }}
            >
                <span style={{ color: selected ? '#111827' : '#6b7280' }}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown size={18} color="var(--text-light)" />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    backgroundColor: 'var(--neutral-light)', border: '1px solid var(--border-color)', borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                        <Search size={16} color="var(--text-light)" />
                        <input
                            type="text"
                            placeholder="Ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '100%', border: 'none', outline: 'none', paddingLeft: '8px', fontSize: '14px' }}
                            autoFocus
                        />
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredOptions.length > 0 ? filteredOptions.map(o => (
                            <div
                                key={o.value}
                                onClick={() => { onChange(o.value); setIsOpen(false); }}
                                style={{
                                    padding: '10px 12px', cursor: 'pointer', fontSize: '14px',
                                    backgroundColor: value === o.value ? 'var(--dashboard-bg)' : 'transparent',
                                    borderBottom: '1px solid var(--border-color-light)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === o.value ? 'var(--dashboard-bg)' : 'transparent'}
                            >
                                {o.label}
                            </div>
                        )) : (
                            <div style={{ padding: '10px 12px', color: 'var(--text-light)', fontSize: '14px', textAlign: 'center' }}>
                                Bulunamadı
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function HandoverPage() {
    const { user } = useAuth();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filterChapter, setFilterChapter] = useState('');
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
                setAllUsers(data.users || []);
            } catch (err) {
                console.error(err);
            }
            setIsLoading(false);
        }
        fetchUsers();
    }, [user]);

    const isNational = user && NATIONAL_ROLES.includes(user.role);

    const filteredUsers = allUsers.filter(u => {
        if (!isNational) {
            return u.chapter === user?.chapter;
        } else {
            return filterChapter ? u.chapter === filterChapter : true;
        }
    });

    const userOptions = filteredUsers.map(u => ({
        value: u.id,
        label: `${u.name} (${u.role}) - ${u.chapter || '?'}`
    }));

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

            <div style={{ padding: '16px', backgroundColor: 'var(--dashboard-bg)', borderRadius: '12px', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-regular)', lineHeight: '1.5' }}>
                    Bu modül ile görevi bırakan bir üyenin tüm portföyünü (şirketler, teklifler, aktiviteler) tek bir işlemle başka bir üyeye aktarabilirsiniz.
                    <br /><br />
                    <strong>Dikkat:</strong> Bu işlem geri alınamaz.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {isNational && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Şube Filtresi (Ulusal Yetki)</label>
                        <select
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '15px', backgroundColor: 'var(--neutral-light)' }}
                            value={filterChapter}
                            onChange={(e) => {
                                setFilterChapter(e.target.value);
                                setFromUserId('');
                                setToUserId('');
                            }}
                        >
                            {CHAPTER_OPTIONS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Kaynak Üye (Devreden)</label>
                    <SearchableUserSelect
                        value={fromUserId}
                        onChange={setFromUserId}
                        options={userOptions}
                        placeholder="Üye seçin veya arayın..."
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Hedef Üye (Devralan)</label>
                    <SearchableUserSelect
                        value={toUserId}
                        onChange={setToUserId}
                        options={userOptions}
                        placeholder="Üye seçin veya arayın..."
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-regular)' }}>Devir Sebebi (Opsiyonel)</label>
                    <textarea
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '15px', minHeight: '80px' }}
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
