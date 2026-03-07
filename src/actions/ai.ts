'use server';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
});

export async function generateEmailContent(
    companyName: string,
    contactName: string,
    context: string,
    tone: 'formal' | 'friendly' | 'persuasive' = 'formal',
    language: 'tr' | 'en' = 'tr'
): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return { success: false, error: 'API anahtarı bulunamadı. Lütfen sistem yöneticisine başvurun.' };
        }

        const prompt = `
            Bir B2B Satış Temsilcisi olarak ${companyName} şirketindeki ${contactName || 'Yetkili Kişi'}'ye bir e-posta taslağı oluşturman gerekiyor.
            
            E-posta Bağlamı ve Notlar: ${context}
            Dil: ${language === 'tr' ? 'Türkçe' : 'İngilizce'}
            Ton / Üslup: ${tone === 'formal' ? 'Resmi ve Profesyonel' : tone === 'friendly' ? 'Samimi ve İşbirlikçi' : 'İkna Edici ve Sonuç Odaklı'}
            
            Lütfen e-posta konusu (Subject) ve gövdesini oluştur. Sadece e-postanın metnini ver, herhangi bir ek yorum yapma.
            AIESEC Türkiye bağlamına uygun olarak, liderlik gelişimi ve yetenek sağlama (B2B stajyer / proje yetenekleri) odaklı yaklaşım sergileyebilirsin.
            Formatı:
            Konu: [Konu Başlığı]
            
            Sayın [İsim],
            [İçerik]
            
            Saygılarımla,
            [İsminiz] (Bunu boş bırak, kullanıcı kendisi dolduracak)
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text || '';
        return { success: true, content: text };
    } catch (error: any) {
        console.error('AI Email Gen Error:', error);
        return { success: false, error: 'Yapay zeka asistanı şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.' };
    }
}

export async function summarizeMeetingNotes(
    companyName: string,
    rawNotes: string,
    language: 'tr' | 'en' = 'tr'
): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return { success: false, error: 'API anahtarı bulunamadı. Lütfen sistem yöneticisine başvurun.' };
        }

        const prompt = `
            Aşağıda B2B Satış Temsilcisi tarafından ${companyName} şirketi ile yapılan bir toplantıda alınmış ham ve düzensiz notlar bulunmaktadır.
            Bu notları analiz ederek profesyonel, temiz ve CRM'e girilebilecek şekilde özetle. Lütfen önemli noktaları, ihtiyaçları ve bir sonraki adımları (Next Steps) vurgula.
            
            Ham Notlar:
            "${rawNotes}"
            
            Dil: ${language === 'tr' ? 'Türkçe' : 'İngilizce'}
            
            Lütfen çıktıyı Markdown formatında şu başlıklarla ver:
            📌 **Toplantı Özeti:** (Kısa özet)
            🎯 **Ana İhtiyaçlar ve Sorunlar:** (Maddeler halinde)
            🚀 **Sonraki Adımlar (Next Action):** (Maddeler halinde ne yapılacağı)
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text || '';
        return { success: true, content: text };
    } catch (error: any) {
        console.error('AI Meeting Summary Error:', error);
        return { success: false, error: 'Yapay zeka asistanı şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.' };
    }
}
