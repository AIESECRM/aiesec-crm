'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
<<<<<<< HEAD
import {
  Home,
  Building2,
  Users,
=======
import { signOut } from 'next-auth/react';
import { 
  Home, 
  Building2, 
  Users, 
>>>>>>> ortak-repo/main
  DollarSign,
  ListTodo,
  Menu,
  X,
<<<<<<< HEAD
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import './Sidebar.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiresPermission?: keyof typeof permissionMap;
  requiresAdmin?: boolean;
}

const permissionMap = {
  viewDeals: 'canViewDeals',
} as const;

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Anasayfa',
    icon: <Home className="sidebar__nav-icon" />,
  },
  {
    href: '/sirketler',
    label: 'Şirketler',
    icon: <Building2 className="sidebar__nav-icon" />,
  },
  {
    href: '/kisiler',
    label: 'Kişiler',
    icon: <Users className="sidebar__nav-icon" />,
  },
  {
    href: '/teklifler',
    label: 'Teklifler',
    icon: <DollarSign className="sidebar__nav-icon" />,
    requiresPermission: 'viewDeals',
  },
  {
    href: '/aktiviteler',
    label: 'Aktiviteler',
    icon: <ListTodo className="sidebar__nav-icon" />,
  },
  {
    href: '/yonetim',
    label: 'Yönetim Paneli',
    icon: <Settings className="sidebar__nav-icon" />,
    requiresAdmin: true,
  },
];

const roleLabels: Record<UserRole, string> = {
  MCP: 'MCP',
  MCVP: 'MCVP',
  LCP: 'LCP',
  LCVP: 'LCVP',
  TeamLeader: 'Team Leader',
  TeamMember: 'Takım Üyesi',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, permissions, isAdmin, switchRole } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
=======
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, permissions, status } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

>>>>>>> ortak-repo/main
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

<<<<<<< HEAD
  // Close mobile menu on escape key
=======
>>>>>>> ortak-repo/main
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

<<<<<<< HEAD
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.requiresPermission === 'viewDeals') {
      return permissions.canViewDeals;
    }
    if (item.requiresAdmin) {
      return isAdmin;
    }
    return true;
  });
=======
  if (status === 'loading' || !user) return null;

  const navItems = [
    {
      href: '/',
      label: 'Anasayfa',
      icon: <Home className="sidebar__nav-icon" />,
      show: true,
    },
    {
      href: '/sirketler',
      label: 'Şirketler',
      icon: <Building2 className="sidebar__nav-icon" />,
      show: true,
    },
    {
      href: '/kisiler',
      label: 'Kişiler',
      icon: <Users className="sidebar__nav-icon" />,
      show: true,
    },
    {
      href: '/teklifler',
      label: 'Teklifler',
      icon: <DollarSign className="sidebar__nav-icon" />,
      show: permissions.canViewDeals,
    },
    {
      href: '/aktiviteler',
      label: 'Aktiviteler',
      icon: <ListTodo className="sidebar__nav-icon" />,
      show: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const ROLE_LABELS: Record<string, string> = {
    TM: 'Takım Üyesi',
    TL: 'Team Leader',
    LCVP: 'LCVP',
    LCP: 'LCP',
    MCVP: 'MCVP',
    MCP: 'MCP',
  };
>>>>>>> ortak-repo/main

  return (
    <>
      <button
        className={`sidebar__mobile-toggle ${isMobileOpen ? 'sidebar__mobile-toggle--hidden' : ''}`}
        onClick={() => setIsMobileOpen(true)}
        aria-label="Menüyü Aç"
      >
        <Menu className="sidebar__mobile-toggle-icon" />
      </button>

      <aside className={`sidebar ${isMobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo">
          <button
            className="sidebar__close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Menüyü Kapat"
          >
            <X />
          </button>
          <img src="/logo/primary.svg" alt="AIESEC Logo" className="sidebar__logo-full" />
          <img src="/logo/fav.svg" alt="AIESEC" className="sidebar__logo-icon" />
        </div>
        <div className="sidebar__subtitle">Yönetim Paneli</div>

        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
<<<<<<< HEAD
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar__nav-item ${isActive(item.href) ? 'sidebar__nav-item--active' : ''
                    }`}
=======
            {navItems.filter(item => item.show).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar__nav-item ${isActive(item.href) ? 'sidebar__nav-item--active' : ''}`}
>>>>>>> ortak-repo/main
                >
                  {item.icon}
                  <span className="sidebar__nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

<<<<<<< HEAD
        {/* Role Switcher for Demo */}
        <div className="sidebar__footer">
          <div className="sidebar__role-switcher">
            <div className="sidebar__role-label">Rol Değiştir</div>
            <select
              className="sidebar__role-select"
              value={user.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
            >
              {Object.entries(roleLabels).map(([role, label]) => (
                <option key={role} value={role}>
                  {label}
                </option>
              ))}
            </select>
          </div>
=======
        <div className="sidebar__footer">
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user.name}</div>
            <div className="sidebar__user-role">{ROLE_LABELS[user.role] || user.role}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="sidebar__logout-btn"
          >
            <LogOut size={16} />
            <span>Çıkış Yap</span>
          </button>
>>>>>>> ortak-repo/main
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="sidebar__overlay"
          style={{ display: 'block' }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> ortak-repo/main
