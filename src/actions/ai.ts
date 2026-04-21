'use server'

export async function generateEmailContent(companyName?: string, contact?: string, context?: string, tone?: string) {
  return { success: false, content: '', error: 'AI entegrasyonu aktif değil.' };
}

export async function summarizeMeetingNotes(companyName?: string, notes?: string) {
  return { success: false, content: '', error: 'AI entegrasyonu aktif değil.' };
}
