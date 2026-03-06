// User Role Types
export type UserRole = 'MCP' | 'MCVP' | 'LCP' | 'LCVP' | 'TeamLeader' | 'TeamMember';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  branchId?: string; // e.g. "istanbul", "ankara" (şube)
  teamId?: string;   // For TLs and Members
  createdAt: Date;
}

// Company Types
export type CompanyStatus = 'aktif' | 'pasif' | 'negatif' | 'pozitif' | 'cevap_yok' | 'tekrar_ara' | 'toplanti_planlandi';

export interface Company {
  id: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  email: string;
  website?: string;
  domain?: string | null;
  taxId?: string | null;
  status: CompanyStatus;
  activeProposals: number;
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
  assignedManagerIds: string[];
  managers?: User[];
  notes?: string;
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
}

// Activity Types
export type ActivityType = 'cold_call' | 'meeting' | 'email' | 'task' | 'proposal' | 'postponed';
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
}

// Proposal/Deal Types
export type DealStage = 'new_lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

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
}

export interface ActivityFilter {
  type?: ActivityType;
  status?: ActivityStatus;
  userId?: string;
  companyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
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
}
