import { PrismaClient } from '@prisma/client';
// Evita múltiplas instâncias do Prisma Client durante hot-reload em dev
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
//# sourceMappingURL=prisma.js.map