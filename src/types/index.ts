// User Role Types
export type UserRole = 'MCP' | 'MCVP' | 'LCP' | 'LCVP' | 'TL' | 'TM' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  chapter?: string;
  status?: string;
  createdAt?: number;
}

// Company Types
export type CompanyStatus = 'POSITIVE' | 'NEGATIVE' | 'NO_ANSWER' | 'CALL_AGAIN' | 'MEETING_PLANNED';

export interface Company {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  status: CompanyStatus;
  notes?: string;
  logoUrl?: string;
  chapter?: string;
  createdAt: number;
  updatedAt: number;
  createdById: number;
  createdBy?: { id: number; name: string };
  _count?: { contacts: number; activities: number; offers: number };
}

// Contact Types
export interface Contact {
  id: number;
  companyId: number;
  name: string;
  email?: string;
  phone?: string;
  createdAt: number;
  company?: { id: number; name: string; chapter?: string };
}

// Activity Types
export type ActivityType = 'COLD_CALL' | 'MEETING' | 'EMAIL' | 'FOLLOW_UP';

export interface Activity {
  id: number;
  companyId: number;
  userId: number;
  type: ActivityType;
  note?: string;
  date: number;
  createdAt: number;
  user?: { id: number; name: string; role: string };
  company?: { id: number; name: string; chapter?: string };
}

// Offer Types
export type OfferProduct = 'GTA' | 'GV' | 'GTE';
export type OfferDuration = 'SHORT' | 'MEDIUM' | 'LONG';
export type OfferOpenStatus = 'NEW_OPEN' | 'RE_OPEN';

export interface Offer {
  id: number;
  title: string;
  product: OfferProduct;
  duration: OfferDuration;
  openStatus: OfferOpenStatus;
  value?: number;
  fileUrl?: string;
  companyId: number;
  createdById: number;
  createdAt: number;
  updatedAt: number;
  company?: { id: number; name: string; chapter?: string };
  createdBy?: { id: number; name: string; role: string };
}

// Dashboard Stats
export interface DashboardStats {
  totalCompanies: number;
  totalActivities: number;
  totalOffers: number;
  coldCallsToday: number;
  meetingsBooked: number;
  newCompaniesThisWeek: number;
}

// Filter Types
export interface CompanyFilter {
  status?: CompanyStatus;
  chapter?: string;
}

export interface ActivityFilter {
  type?: ActivityType;
  userId?: number;
  companyId?: number;
}

// Permission Helper Type
export interface RolePermissions {
  canCreateCompany: boolean;
  canEditCompany: boolean;
  canDeleteContact: boolean;
  canViewAllActivities: boolean;
  canEditAllActivities: boolean;
  canViewOffers: boolean;
  canCreateOffer: boolean;
  canViewAllChapters: boolean;
  canApproveUsers: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: number;
}