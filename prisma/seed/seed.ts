import { PrismaClient, UserRole, UserStatus, Chapter, CompanyStatus, ActivityType, OfferProduct, OfferDuration, OfferOpenStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.companyDocument.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.handoverHistory.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const now = Math.floor(Date.now() / 1000);
  const defaultPassword = await bcrypt.hash('12345678', 12);

  await clearDatabase();

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Kullanici',
      email: 'admin@aiesec.org',
      password: defaultPassword,
      role: UserRole.ADMIN,
      chapter: Chapter.GENEL_MERKEZ,
      status: UserStatus.ACTIVE,
      createdAt: now,
    },
  });

  const lcvp = await prisma.user.create({
    data: {
      name: 'Istanbul LCVP',
      email: 'lcvp@aiesec.org',
      password: defaultPassword,
      role: UserRole.LCVP,
      chapter: Chapter.ISTANBUL,
      status: UserStatus.ACTIVE,
      createdAt: now,
    },
  });

  const tm = await prisma.user.create({
    data: {
      name: 'Team Member',
      email: 'tm@aiesec.org',
      password: defaultPassword,
      role: UserRole.TM,
      chapter: Chapter.ISTANBUL,
      status: UserStatus.ACTIVE,
      createdAt: now,
    },
  });

  const pendingUser = await prisma.user.create({
    data: {
      name: 'Onay Bekleyen Uye',
      email: 'pending@aiesec.org',
      password: defaultPassword,
      role: UserRole.TM,
      chapter: Chapter.ANKARA,
      status: UserStatus.PENDING,
      createdAt: now,
    },
  });

  const companyOne = await prisma.company.create({
    data: {
      name: 'Global Teknoloji AS',
      category: 'Teknoloji',
      location: 'Istanbul',
      domain: 'globalteknoloji.com',
      taxId: 'TAX-0001',
      phone: '+90 212 000 00 01',
      email: 'hello@globalteknoloji.com',
      website: 'https://globalteknoloji.com',
      notes: 'Ilk gorusme yapildi, olumlu sinyal var.',
      chapter: Chapter.ISTANBUL,
      status: CompanyStatus.POSITIVE,
      createdAt: now,
      updatedAt: now,
      createdById: lcvp.id,
      managers: {
        connect: [{ id: lcvp.id }, { id: tm.id }],
      },
    },
  });

  const companyTwo = await prisma.company.create({
    data: {
      name: 'Anadolu Lojistik',
      category: 'Lojistik',
      location: 'Istanbul',
      domain: 'anadolulojistik.com',
      taxId: 'TAX-0002',
      phone: '+90 212 000 00 02',
      email: 'contact@anadolulojistik.com',
      website: 'https://anadolulojistik.com',
      notes: 'Yeniden aranacak.',
      chapter: Chapter.ISTANBUL,
      status: CompanyStatus.CALL_AGAIN,
      createdAt: now,
      updatedAt: now,
      createdById: lcvp.id,
      managers: {
        connect: [{ id: lcvp.id }],
      },
    },
  });

  await prisma.contact.createMany({
    data: [
      {
        name: 'Ayse Kara',
        email: 'ayse.kara@globalteknoloji.com',
        phone: '+90 555 100 10 10',
        position: 'IK Direktoru',
        companyId: companyOne.id,
        createdAt: now,
      },
      {
        name: 'Mert Demir',
        email: 'mert.demir@anadolulojistik.com',
        phone: '+90 555 200 20 20',
        position: 'Operasyon Muduru',
        companyId: companyTwo.id,
        createdAt: now,
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      {
        type: ActivityType.COLD_CALL,
        note: 'Ilk tanitim aramasi yapildi.',
        date: now - 86400,
        companyId: companyOne.id,
        userId: tm.id,
        createdAt: now - 86400,
      },
      {
        type: ActivityType.MEETING,
        note: 'IK ekibi ile online toplanti gerceklesti.',
        date: now,
        companyId: companyOne.id,
        userId: lcvp.id,
        createdAt: now,
      },
    ],
  });

  await prisma.offer.create({
    data: {
      title: 'GIP Yaz Donemi Partnerligi',
      product: OfferProduct.GTE,
      duration: OfferDuration.MEDIUM,
      openStatus: OfferOpenStatus.NEW_OPEN,
      value: 125000,
      companyId: companyOne.id,
      createdById: lcvp.id,
      createdAt: now,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: lcvp.id,
        type: 'COMPANY_UPDATED',
        title: 'Yeni Sirket Eklendi',
        message: 'Global Teknoloji AS sisteme eklendi.',
        read: false,
        createdAt: now,
      },
      {
        userId: admin.id,
        type: 'NEW_USER',
        title: 'Onay Bekleyen Kullanici',
        message: `${pendingUser.name} kayit oldu ve onay bekliyor.`,
        read: false,
        createdAt: now,
      },
    ],
  });

  console.log('Seed tamamlandi. Demo hesaplar:');
  console.log('admin@aiesec.org / 12345678');
  console.log('lcvp@aiesec.org / 12345678');
  console.log('tm@aiesec.org / 12345678');
}

main()
  .catch((error) => {
    console.error('Seed hatasi:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
