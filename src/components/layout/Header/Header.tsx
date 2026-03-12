'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Bell, User, ChevronDown, Building2, DollarSign,
  X, UserPlus, CheckCircle2, RefreshCw, Sun, Moon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { useTheme } from 'next-themes';
import ProfileModal from '@/components/common/ProfileModal/ProfileModal';
import './Header.css';

const roleLabels: Record<string, string> = {
  MCP: 'MCP', MCVP: 'MCVP', LCP: 'LCP', LCVP: 'LCVP',
  TL: 'Team Leader', TM: 'Takım Üyesi', ADMIN: 'Admin',
};

const typeIcons: Record<string, React.ReactNode> = {
  company: <Building2 className="header__result-icon header__result-icon--company" />,
  contact: <User className="header__result-icon header__result-icon--contact" />,
  deal: <DollarSign className="header__result-icon header__result-icon--deal" />,
  activity: <Bell className="header__result-icon header__result-icon--activity" />,
};

const typeLabels: Record<string, string> = {
  company: 'Şirket', contact: 'Kişi', deal: 'Teklif', activity: 'Aktivite',
};

const notifIcons: Record<string, React.ReactNode> = {
  NEW_OFFER: <DollarSign size={16} />,
  COMPANY_UPDATED: <Building2 size={16} />,
  NEW_USER: <UserPlus size={16} />,
  USER_APPROVED: <CheckCircle2 size={16} />,
  USER_REJECTED: <X size={16} />,
};

const notifColors: Record<string, string> = {
  NEW_OFFER: '#8B5CF6',
  COMPANY_UPDATED: '#3B82F6',
  NEW_USER: '#F59E0B',
  USER_APPROVED: '#22C55E',
  USER_REJECTED: '#EF4444',
};

export default function Header() {
  const { user, status } = useAuth();
  const { query, setQuery, results, placeholder, clearSearch, navigateToResult } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30 saniyede bir
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowResults(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) setShowResults(true);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setShowResults(false); inputRef.current?.blur(); }
    if (e.key === 'Enter' && results.length > 0) { navigateToResult(results[0]); setShowResults(false); }
  };

  const markAsRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id })
    });
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true })
    });
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
  };

  if (status === 'loading') return null;

  return (
    <header className="header">
      <div className="header__search" ref={searchRef}>
        <div className="header__search-wrapper">
          <Search className="header__search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="header__search-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="header__search-clear" onClick={() => { clearSearch(); setShowResults(false); }}>
              <X />
            </button>
          )}
        </div>

        {showResults && query.length >= 2 && (
          <div className="header__search-results">
            {results.length > 0 ? (
              <>
                <div className="header__results-header"><span>{results.length} sonuç bulundu</span></div>
                <div className="header__results-list">
                  {results.map((result) => (
                    <button key={`${result.type}-${result.id}`} className="header__result-item"
                      onClick={() => { navigateToResult(result); setShowResults(false); }}>
                      {typeIcons[result.type]}
                      <div className="header__result-content">
                        <span className="header__result-title">{result.title}</span>
                        <span className="header__result-subtitle">{result.subtitle}</span>
                      </div>
                      <span className="header__result-type">{typeLabels[result.type]}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="header__results-empty">
                <Search className="header__results-empty-icon" />
                <span>Sonuç bulunamadı</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header__actions">
        {mounted && (
          <button 
            className="header__theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Temayı Değiştir"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        <div className="header__notification-wrapper" ref={notificationRef}>
          <button className="header__notification" onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}>
            <Bell className="header__notification-icon" />
            {unreadCount > 0 && <span className="header__notification-badge">{unreadCount}</span>}
            <span className="header__notification-text">{unreadCount > 0 ? `${unreadCount} Yeni Bildirim` : 'Bildirimler'}</span>
          </button>

          {showNotifications && (
            <div className="header__notifications-dropdown">
              <div className="header__notifications-header">
                <div className="header__notifications-title">
                  <Bell className="header__notifications-title-icon" />
                  <span>Bildirimler</span>
                  {unreadCount > 0 && <span className="header__notifications-count">{unreadCount}</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={fetchNotifications} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    <RefreshCw size={14} />
                  </button>
                  {unreadCount > 0 && (
                    <button className="header__notifications-mark-all" onClick={markAllAsRead}>
                      <CheckCircle2 size={14} /> Tümünü Okundu
                    </button>
                  )}
                </div>
              </div>

              <div className="header__notifications-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                    Henüz bildirim yok.
                  </div>
                ) : notifications.map((n: any) => (
                  <div key={n.id}
                    className={`header__notification-item ${!n.read ? 'header__notification-item--unread' : ''}`}
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    <div className="header__notification-item-icon"
                      style={{ backgroundColor: `${notifColors[n.type]}20`, color: notifColors[n.type] }}>
                      {notifIcons[n.type] || <Bell size={16} />}
                    </div>
                    <div className="header__notification-item-content">
                      <div className="header__notification-item-header">
                        <span className="header__notification-item-title">{n.title}</span>
                        {!n.read && <span className="header__notification-item-dot" />}
                      </div>
                      <p className="header__notification-item-message">{n.message}</p>
                      <span className="header__notification-item-time">{formatTime(n.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="header__notifications-footer">
                <button className="header__notifications-view-all">Tüm Bildirimleri Gör</button>
              </div>
            </div>
          )}
        </div>

        <div className="header__divider" />

        {user && (
          <div className="header__user" onClick={() => setShowProfileModal(true)}>
            <div className="header__user-info">
              <span className="header__user-greeting">
                Merhaba, <span className="header__user-name">{user.name}</span>
              </span>
              <span className="header__user-role">{roleLabels[user.role] || user.role}</span>
            </div>
            <div className="header__user-avatar"><User className="header__user-avatar-icon" /></div>
            <ChevronDown className="header__dropdown-icon" />
          </div>
        )}
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </header>
  );
}