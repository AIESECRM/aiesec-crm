import 'dotenv/config'
import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Clearing existing data...')
    await prisma.activityComment.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.proposal.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.contact.deleteMany()
    await prisma.company.deleteMany()
    await prisma.user.deleteMany()

    console.log('Seeding mock users...')

    // Create test Users matching our mockData.ts roles
    const currentUser = await prisma.user.create({
        data: {
            id: '1',
            name: 'Ahmet Yılmaz',
            email: 'ahmet@aiesec.org',
            role: 'LCVP',
            avatar: 'https://i.pravatar.cc/150?u=1'
        }
    })

    // Managers
    const authUser = await prisma.user.create({
        data: {
            id: '2',
            name: 'Ayşe Demir',
            email: 'ayse@aiesec.org',
            role: 'TeamLeader', // or Menajer depending on how the frontend tracks
            avatar: 'https://i.pravatar.cc/150?u=2'
        }
    })

    const thirdUser = await prisma.user.create({
        data: {
            id: '3',
            name: 'Mehmet Kaya',
            email: 'mehmet@aiesec.org',
            role: 'TeamMember',
            avatar: 'https://i.pravatar.cc/150?u=3'
        }
    })

    const lcpUser = await prisma.user.create({
        data: {
            id: '4',
            name: 'Canan Öz',
            email: 'canan@aiesec.org',
            role: 'LCP',
            avatar: 'https://i.pravatar.cc/150?u=4'
        }
    })

    console.log('Seeding mock companies...')

    // Create test Companies
    await prisma.company.create({
        data: {
            id: '1',
            name: 'TechFlow Solutions',
            category: 'Yazılım',
            location: 'İstanbul, Türkiye',
            phone: '+90 555 123 4567',
            email: 'info@techflow.com',
            website: 'www.techflow.com',
            status: 'aktif',
            activeProposals: 2,
            contactCount: 3,
            managers: {
                connect: [{ id: currentUser.id }, { id: authUser.id }] // Ahmet and Ayşe
            }
        }
    })

    await prisma.company.create({
        data: {
            id: '2',
            name: 'Global Lojistik A.Ş.',
            category: 'Lojistik',
            location: 'Kocaeli, Türkiye',
            phone: '+90 555 987 6543',
            email: 'contact@globallojistik.com',
            status: 'toplanti_planlandi',
            activeProposals: 1,
            contactCount: 2,
            managers: {
                connect: [{ id: thirdUser.id }] // Mehmet
            }
        }
    })

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
