import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Veritabanı temizleniyor...')
    await prisma.auditLog.deleteMany()
    await prisma.activityComment.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.offer.deleteMany()
    await prisma.proposal.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.contact.deleteMany()
    await prisma.company.deleteMany()
    await prisma.handoverHistory.deleteMany()
    await prisma.user.deleteMany()

    console.log('İlk Admin kullanıcısı oluşturuluyor...')

    const hashedPassword = await bcrypt.hash('admin123', 12)

    await prisma.user.create({
        data: {
            name: 'AIESEC Admin',
            email: 'admin@aiesec.net',
            password: hashedPassword,
            role: 'ADMIN',
            chapter: 'Türkiye',
            status: 'ACTIVE'
        }
    })

    console.log('-----------------------------------------')
    console.log('Seed Başarıyla Tamamlandı!')
    console.log('Giriş Bilgileri:')
    console.log('Email: admin@aiesec.net')
    console.log('Şifre: admin123')
    console.log('-----------------------------------------')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
