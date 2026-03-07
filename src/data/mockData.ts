import { User, Company, Contact, Activity, Proposal, Notification } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Arda Bozan',
    email: 'arda@aiesec.org',
    role: 'TM',
    branchId: 'istanbul',
    teamId: 'team1',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    name: 'Mehmet Yıldırım',
    email: 'mehmet@aiesec.org',
    role: 'TL',
    branchId: 'istanbul',
    teamId: 'team1',
    createdAt: new Date('2024-09-01'),
  },
  {
    id: '3',
    name: 'Zehra Gümüşçü',
    email: 'zehra@aiesec.org',
    role: 'LCVP',
    branchId: 'istanbul',
    createdAt: new Date('2024-06-01'),
  },
  {
    id: '4',
    name: 'Ali Zekioğlu',
    email: 'ali@aiesec.org',
    role: 'LCP',
    branchId: 'istanbul',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '5',
    name: 'Aziz Şanverdi',
    email: 'aziz@aiesec.org',
    role: 'TM',
    branchId: 'istanbul',
    teamId: 'team1',
    createdAt: new Date('2025-02-01'),
  },
];

// Current User (for demo purposes)
export const currentUser: User = mockUsers[0];

// Mock Companies
export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Global Teknoloji',
    category: 'Teknoloji',
    location: 'İstanbul, Özer Mahalle',
    phone: '+90 533 943 12 52',
    email: 'global@teknoloji.com',
    website: 'globalteknoloji.com',
    status: 'POSITIVE',
    activeProposals: 8,
    contactCount: 5,
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2026-02-20'),
    assignedManagerIds: ['1'],
  },
  {
    id: '2',
    name: 'Savunma Bakanlığı',
    category: 'Kamu',
    location: 'İstanbul, Özer Mahalle',
    phone: '+90 533 123 45 67',
    email: 'info@savunma.gov.tr',
    status: 'NO_ANSWER',
    activeProposals: 3,
    contactCount: 2,
    createdAt: new Date('2025-05-15'),
    updatedAt: new Date('2026-02-18'),
    assignedManagerIds: ['2', '4'],
  },
  {
    id: '3',
    name: 'Aselsan',
    category: 'Teknoloji',
    location: 'İstanbul, Özer Mahalle',
    phone: '+90 533 987 65 43',
    email: 'info@aselsan.com.tr',
    website: 'aselsan.com.tr',
    status: 'POSITIVE',
    activeProposals: 0,
    contactCount: 0,
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2026-02-15'),
    assignedManagerIds: ['1', '5'],
  },
];

// Mock Contacts
export const mockContacts: Contact[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Mehmet Yıldırım',
    email: 'mehmet@globalteknoloji.com',
    phone: '+90 533 111 22 33',
    position: 'CEO',
    isPrimary: true,
    createdAt: new Date('2025-06-01'),
  },
  {
    id: '2',
    companyId: '1',
    name: 'Aziz Şanverdi',
    email: 'aziz@globalteknoloji.com',
    phone: '+90 533 222 33 44',
    position: 'CTO',
    isPrimary: false,
    createdAt: new Date('2025-06-05'),
  },
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: '1',
    companyId: '1',
    userId: '1',
    userName: 'Arda Bozan',
    type: 'COLD_CALL',
    status: 'completed',
    notes: 'İlk arama yapıldı',
    completedAt: new Date('2026-02-21'),
    createdAt: new Date('2026-02-21'),
  },
  {
    id: '2',
    companyId: '1',
    userId: '2',
    userName: 'Mehmet Yıldırım',
    type: 'MEETING',
    status: 'completed',
    notes: 'Toplantı tamamlandı',
    completedAt: new Date('2026-02-18'),
    createdAt: new Date('2026-02-18'),
  },
];

// Mock Proposals
export const mockProposals: Proposal[] = [
  {
    id: '1',
    companyId: '1',
    title: 'Yazılım Geliştirme Projesi',
    value: 76753,
    currency: 'TL',
    stage: 'proposal',
    probability: 60,
    ownerId: '1',
    ownerName: 'Arda Bozan',
    nextAction: 'Follow up call',
    nextActionDate: new Date('2026-02-25'),
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-20'),
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Yeni Aktivite',
    message: 'Global Teknoloji için yeni bir toplantı planlandı',
    type: 'info',
    read: false,
    createdAt: new Date('2026-02-23'),
  },
];

// Helper functions
export const getCompanyById = (id: string): Company | undefined => {
  return mockCompanies.find(c => c.id === id);
};

export const getContactsByCompanyId = (companyId: string): Contact[] => {
  return mockContacts.filter(c => c.companyId === companyId);
};

export const getActivitiesByCompanyId = (companyId: string): Activity[] => {
  return mockActivities.filter(a => a.companyId === companyId);
};

export const getProposalsByCompanyId = (companyId: string): Proposal[] => {
  return mockProposals.filter(p => p.companyId === companyId);
};
