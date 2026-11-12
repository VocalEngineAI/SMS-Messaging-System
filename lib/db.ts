import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in dev so `next dev` doesn't
// exhaust MySQL connections by creating a new client on every file save.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
