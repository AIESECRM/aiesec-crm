'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

type Role = 'TM' | 'TL' | 'LCVP' | 'LCP' | 'MCVP' | 'MCP';

interface RolePermissions {
  canCreateCompany: boolean;
  canEditCompany: boolean;
  canDeleteContact: boolean;
  canViewAllActivities: boolean;
  canEditAllActivities: boolean;
  canViewDeals: boolean;
  canViewRevenue: boolean;
  canViewTeamStats: boolean;
  canViewGlobalStats: boolean;
  canFilterByTeam: boolean;
  isNational: boolean;
}

interface AuthContextType {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    chapter: string | null;
  } | null;
  permissions: RolePermissions;
  isAdmin: boolean;
  isTeamLeader: boolean;
  isNational: boolean;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

const getPermissions = (role: Role): RolePermissions => {
  switch (role) {
    case 'TM':
      return {
        canCreateCompany: true,
        canEditCompany: false,
        canDeleteContact: false,
        canViewAllActivities: false,
        canEditAllActivities: false,
        canViewDeals: false,
        canViewRevenue: false,
        canViewTeamStats: false,
        canViewGlobalStats: false,
        canFilterByTeam: false,
        isNational: false,
      };
    case 'TL':
      return {
        canCreateCompany: true,
        canEditCompany: true,
        canDeleteContact: false,
        canViewAllActivities: true,
        canEditAllActivities: true,
        canViewDeals: false,
        canViewRevenue: false,
        canViewTeamStats: true,
        canViewGlobalStats: false,
        canFilterByTeam: true,
        isNational: false,
      };
    case 'LCVP':
    case 'LCP':
      return {
        canCreateCompany: true,
        canEditCompany: true,
        canDeleteContact: true,
        canViewAllActivities: true,
        canEditAllActivities: true,
        canViewDeals: true,
        canViewRevenue: true,
        canViewTeamStats: true,
        canViewGlobalStats: true,
        canFilterByTeam: true,
        isNational: false,
      };
    case 'MCVP':
    case 'MCP':
      return {
        canCreateCompany: true,
        canEditCompany: true,
        canDeleteContact: true,
        canViewAllActivities: true,
        canEditAllActivities: true,
        canViewDeals: true,
        canViewRevenue: true,
        canViewTeamStats: true,
        canViewGlobalStats: true,
        canFilterByTeam: true,
        isNational: true,
      };
    default:
      return {
        canCreateCompany: false,
        canEditCompany: false,
        canDeleteContact: false,
        canViewAllActivities: false,
        canEditAllActivities: false,
        canViewDeals: false,
        canViewRevenue: false,
        canViewTeamStats: false,
        canViewGlobalStats: false,
        canFilterByTeam: false,
        isNational: false,
      };
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user = session?.user ? {
    id: (session.user as any).id,
    name: session.user.name || '',
    email: session.user.email || '',
    role: (session.user as any).role as Role,
    chapter: (session.user as any).chapter || null,
  } : null;

  const permissions = user ? getPermissions(user.role) : getPermissions('TM');
  const isAdmin = user ? ['MCP', 'MCVP', 'LCP', 'LCVP'].includes(user.role) : false;
  const isTeamLeader = user ? user.role === 'TL' || isAdmin : false;
  const isNational = user ? ['MCP', 'MCVP'].includes(user.role) : false;

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      isAdmin,
      isTeamLeader,
      isNational,
      status,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}