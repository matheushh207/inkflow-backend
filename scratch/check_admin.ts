import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@inkflow.com' }
  });
  console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
