import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'admin@inkflow.com' },
    data: { 
      password: hashedPassword,
      role: 'SUPER_ADMIN' 
    }
  });
  console.log('Password reset successfully to: admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
