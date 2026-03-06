'use client';

<<<<<<< HEAD
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, RolePermissions } from '@/types';
import { loginWithEmail } from '@/actions/auth';

const defaultUser: User = {
  id: 'loading',
  name: 'Yükleniyor...',
  email: '',
  role: 'TeamMember',
  createdAt: new Date(),
};

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  permissions: RolePermissions;
  isAdmin: boolean;
  isTeamLeader: boolean;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const getPermissions = (role: UserRole): RolePermissions => {
  const basePermissions: RolePermissions = {
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
    canManageRoles: false,
  };

  switch (role) {
    case 'TeamMember':
      return {
        ...basePermissions,
        canViewDeals: false,
        canViewRevenue: false,
      };

    case 'TeamLeader':
      return {
        ...basePermissions,
        canEditCompany: true,
        canViewAllActivities: true,
        canEditAllActivities: true,
        canViewDeals: true,
        canViewTeamStats: true,
        canFilterByTeam: true,
        canManageRoles: false, // TLs just manage their members' activities, not their roles.
      };

    case 'LCP':
    case 'LCVP':
      return {
        ...basePermissions,
=======
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
>>>>>>> ortak-repo/main
        canEditCompany: true,
        canDeleteContact: true,
        canViewAllActivities: true,
        canEditAllActivities: true,
        canViewDeals: true,
        canViewRevenue: true,
        canViewTeamStats: true,
        canViewGlobalStats: true,
        canFilterByTeam: true,
<<<<<<< HEAD
        canManageRoles: true, // LCVP and LCP can manage roles
      };

    case 'MCP':
    case 'MCVP':
      return {
        ...basePermissions,
=======
        isNational: false,
      };
    case 'MCVP':
    case 'MCP':
      return {
        canCreateCompany: true,
>>>>>>> ortak-repo/main
        canEditCompany: true,
        canDeleteContact: true,
        canViewAllActivities: true,
        canEditAllActivities: true,
        canViewDeals: true,
        canViewRevenue: true,
        canViewTeamStats: true,
        canViewGlobalStats: true,
        canFilterByTeam: true,
<<<<<<< HEAD
        canManageRoles: true,
      };

    default:
      return basePermissions;
=======
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
>>>>>>> ortak-repo/main
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
<<<<<<< HEAD
  const [user, setUser] = useState<User>(defaultUser);

  React.useEffect(() => {
    // Attempt to log in as Ahmet automatically on boot
    const initUser = async () => {
      const realUser = await loginWithEmail('ahmet@aiesec.org');
      if (realUser) {
        setUser(realUser);
      }
    };
    initUser();
  }, []);

  const permissions = getPermissions(user.role);

  const isAdmin = ['MCP', 'MCVP', 'LCP', 'LCVP'].includes(user.role);
  const isTeamLeader = user.role === 'TeamLeader' || isAdmin;

  const switchRole = (role: UserRole) => {
    setUser({ ...user, role });
  };

  const logout = () => {
    // In a real app, this would clear tokens, call logout API, etc.
    // For demo, we just show an alert
    alert('Çıkış yapıldı! (Demo modunda yeniden yönlendirme yapılmıyor)');
  };
=======
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
>>>>>>> ortak-repo/main

  return (
    <AuthContext.Provider value={{
      user,
<<<<<<< HEAD
      setUser,
      permissions,
      isAdmin,
      isTeamLeader,
      switchRole,
      logout
=======
      permissions,
      isAdmin,
      isTeamLeader,
      isNational,
      status,
>>>>>>> ortak-repo/main
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
<<<<<<< HEAD
}
=======
}
>>>>>>> ortak-repo/main
