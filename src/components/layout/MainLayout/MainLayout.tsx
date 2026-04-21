'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../Sidebar';
import Header from '../Header';
import ChatWidget from '@/components/chat/ChatWidget';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

// Bu sayfalarda sidebar ve header gösterilmeyecek
const AUTH_PAGES = ['/login', '/login/register', '/onay-bekleniyor'];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.some(page => pathname === page || pathname.startsWith('/login'));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <Header />
      <main className="main-layout__content">
        <div className="main-layout__page">
          {children}
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}
