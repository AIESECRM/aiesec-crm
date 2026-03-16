import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Prisma veritabanı bağlantımız

// Arama sonuçları için tip tanımlaması (Frontend'deki ile aynı)
type SearchResult = {
    id: string;
    type: 'company' | 'contact' | 'deal' | 'activity';
    title: string;
    subtitle: string;
    href: string;
};

export async function GET(request: Request) {
    try {
        // 1. URL'den arama kelimesini (q) alıyoruz
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        // Eğer arama kelimesi yoksa veya 2 karakterden kısaysa boş dizi dön
        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        // Arama yaparken büyük/küçük harf duyarlılığını kaldırmak için
        const searchFilter = {
            contains: query,
            mode: 'insensitive' as const, // Prisma'da büyük/küçük harf göz ardı et
        };

        // 2. Veritabanı Sorguları (Aynı anda (paralel) çalıştırarak hızı artırıyoruz)
        const [companies, contacts] = await Promise.all([
            // Şirketlerde arama (Şirket adına göre)
            prisma.company.findMany({
                where: { name: searchFilter },
                take: 5, // Sadece en iyi 5 sonucu getir
            }),
            // Kişilerde arama (Kişi adı veya e-postasına göre)
            prisma.contact.findMany({
                where: {
                    OR: [
                        { name: searchFilter },
                        { email: searchFilter }
                    ]
                },
                include: { company: true }, // Bağlı olduğu şirket bilgisini de getir
                take: 5,
            }),
            // İstersen buraya teklifler (offers/deals) için de sorgu ekleyebilirsin
        ]);

        // 3. Gelen verileri Frontend'in beklediği SearchResult formatına çeviriyoruz
        const results: SearchResult[] = [];

        // Şirketleri listeye ekle
        companies.forEach((company) => {
            results.push({
                id: `company-${company.id}`,
                type: 'company',
                title: company.name,
                subtitle: company.category || company.email || 'Şirket',
                href: `/sirketler/${company.id}`, // Tıklanınca şirketin detay sayfasına gitsin
            });
        });

        // Kişileri listeye ekle
        contacts.forEach((contact) => {
            results.push({
                id: `contact-${contact.id}`,
                type: 'contact',
                title: contact.name,
                subtitle: contact.company?.name ? `${contact.company.name} - Kişi` : 'Kişi',
                href: `/kisiler`, // Veya varsa `/kisiler/${contact.id}` yapılabilir
            });
        });

        // 4. Sonuçları JSON olarak frontend'e gönder
        return NextResponse.json({ results });

    } catch (error) {
        console.error('Arama sırasında hata oluştu:', error);
        return NextResponse.json(
            { error: 'Arama yapılırken bir hata oluştu.' },
            { status: 500 }
        );
    }
}