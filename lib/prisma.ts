import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function hasRequiredDelegates(client: PrismaClient) {
  // In dev, global singleton can become stale after schema changes.
  const c = client as unknown as {
    transaction?: { findMany?: unknown };
    transactionItem?: { findMany?: unknown };
  };

  return (
    typeof c.transaction?.findMany === "function" &&
    typeof c.transactionItem?.findMany === "function"
  );
}

function getPrismaClient() {
  const existing = globalForPrisma.prisma;

  if (existing && hasRequiredDelegates(existing)) {
    return existing;
  }

  if (existing && !hasRequiredDelegates(existing)) {
    void existing.$disconnect().catch(() => {
      // ignore disconnect errors when replacing stale dev client
    });
  }

  return createPrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
