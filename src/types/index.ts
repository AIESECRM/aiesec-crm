// User Role Types
export type UserRole = 'MCP' | 'MCVP' | 'LCP' | 'LCVP' | 'TL' | 'TM' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  branchId?: string; // e.g. "istanbul", "ankara" (şube)
  chapter?: string;
  status?: string;
  teamId?: string;   // For TLs and Members
  image?: string | null;
  createdAt: Date;
}

// Company Types
export type CompanyStatus = 'POSITIVE' | 'NEGATIVE' | 'NO_ANSWER' | 'CALL_AGAIN' | 'MEETING_PLANNED' | 'ACTIVE' | 'PASSIVE';

export interface Company {
  id: string;
  name: string;
  category?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  domain?: string | null;
  taxId?: string | null;
  logoUrl?: string;
  chapter?: string;
  status: CompanyStatus;
  activeProposals: number;
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
  assignedManagerIds: string[];
  managers?: User[];
  notes?: string;
  _count?: { contacts: number; activities: number; offers?: number };
}

// Contact Types
export interface Contact {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  isPrimary: boolean;
  createdAt: Date;
  company?: { id: string; name: string; chapter?: string };
}

// Activity Types
export type ActivityType = 'COLD_CALL' | 'MEETING' | 'EMAIL' | 'TASK' | 'PROPOSAL' | 'POSTPONED' | 'FOLLOW_UP';
export type ActivityStatus = 'completed' | 'pending' | 'overdue' | 'cancelled';

export interface ActivityComment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  companyId: string;
  contactId?: string;
  userId: string;
  userName: string;
  type: ActivityType;
  status: ActivityStatus;
  notes?: string;
  comments?: ActivityComment[];
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  user?: { id: string; name: string; role: string; image?: string | null };
  company?: { id: string; name: string; chapter?: string };
}

// Offer/Proposal Types
export type OfferProduct = 'GTA' | 'GV' | 'GTE';
export type OfferDuration = 'SHORT' | 'MEDIUM' | 'LONG';
export type OfferOpenStatus = 'NEW_OPEN' | 'RE_OPEN';
export type DealStage = 'new_lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Offer {
  id: string;
  title: string;
  product: OfferProduct;
  duration: OfferDuration;
  openStatus: OfferOpenStatus;
  value?: number;
  fileUrl?: string;
  companyId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  company?: { id: string; name: string; chapter?: string };
  createdBy?: { id: string; name: string; role: string };
}

export interface Proposal {
  id: string;
  companyId: string;
  contactId?: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  ownerId: string;
  ownerName: string;
  nextAction?: string;
  nextActionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalProposals: number;
  totalValue: number;
  conversionRate: number;
  activitiesCompleted: number;
  activitiesPending: number;
  totalActivities: number;
  totalOffers: number;
  coldCallsToday: number;
  meetingsBooked: number;
  newCompaniesThisWeek: number;
}

// Filter Types
export interface CompanyFilter {
  category?: string;
  status?: CompanyStatus;
  hasProposal?: boolean;
  contactCount?: 'none' | 'some' | 'many';
  assignedTo?: string;
  chapter?: string;
}

export interface ActivityFilter {
  type?: ActivityType;
  status?: ActivityStatus;
  userId?: string;
  companyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Permission Helper Type
export interface RolePermissions {
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
  canManageRoles: boolean;
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
  createdAt: Date;
}
