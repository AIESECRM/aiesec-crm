import { z } from 'zod';

export const companySchema = z.object({
    name: z.string().min(2, "Şirket adı en az 2 karakter olmalıdır"),
    taxId: z.string().optional().nullable(),
    taxOffice: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    domain: z.string().optional().nullable(),
});

export const activitySchema = z.object({
    companyId: z.string().uuid(),
    userId: z.string().uuid(),
    userName: z.string(),
    type: z.enum(['cold_call', 'postponed', 'meeting', 'proposal', 'task']),
    status: z.enum(['pending', 'completed', 'canceled']).optional(),
    notes: z.string().optional().nullable(),
    scheduledAt: z.union([z.date(), z.string()]).optional().nullable(),
    completedAt: z.union([z.date(), z.string()]).optional().nullable(),
    contactId: z.string().uuid().optional().nullable(),
});

export const proposalSchema = z.object({
    companyId: z.string().uuid(),
    title: z.string().min(1, "Teklif başlığı zorunludur"),
    value: z.number().min(0, "Değer 0 veya daha büyük olmalıdır"),
    currency: z.string(),
    stage: z.enum(['new_lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
    probability: z.number().min(0).max(100),
    ownerId: z.string().uuid(),
    ownerName: z.string(),
    nextAction: z.string().optional().nullable(),
    contactId: z.string().uuid().optional().nullable(),
});

export const contactSchema = z.object({
    companyId: z.string().uuid(),
    name: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi girin").optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    isPrimary: z.boolean().optional(),
});
