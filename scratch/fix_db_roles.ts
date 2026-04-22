import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DB Fix: Updating Roles ---');
    try {
        // 1. Add MASTER to the enum type if it doesn't exist
        // Note: PostgreSQL ALTER TYPE ADD VALUE cannot be run inside a transaction
        await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MASTER'`);
        console.log('1. Value MASTER added to UserRole enum.');

        // 2. Update users using raw SQL to bypass Prisma type checking
        const count = await prisma.$executeRawUnsafe(`UPDATE "User" SET "role" = 'MASTER' WHERE "role" = 'SUPER_ADMIN'`);
        console.log(`2. Updated ${count} users from SUPER_ADMIN to MASTER.`);

        console.log('DB Update complete. Now you can run db push to remove SUPER_ADMIN.');
    } catch (error) {
        console.error('Error during DB Fix:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
