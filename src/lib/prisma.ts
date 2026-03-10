import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prismaGlobal: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
  })
}

export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaGlobal = prisma
}
