import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create SUPER_ADMIN
    const hashedPassword = await bcrypt.hash('15975369', 10);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@inkflow.com' },
        update: {
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
        create: {
            email: 'admin@inkflow.com',
            name: 'InkFlow Master Admin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            // Create a default system tenant for the super admin
            tenant: {
                create: {
                    name: 'System Admin',
                    slug: 'system-admin',
                }
            }
        }
    });
    console.log('Super Admin created:', superAdmin.name);

    // 2. Create Plans
    const plans = [
        {
            name: 'Solo',
            description: 'Perfeito para tatuadores independentes',
            price: 50.00,
            maxArtists: 1,
            interval: 'month'
        },
        {
            name: 'Professional',
            description: 'Para pequenos estúdios (até 3 artistas)',
            price: 80.00,
            maxArtists: 3,
            interval: 'month'
        },
        {
            name: 'Elite',
            description: 'Para grandes estúdios (até 10 artistas)',
            price: 120.00,
            maxArtists: 10,
            interval: 'month'
        }
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { id: plan.name.toLowerCase() }, // Using name as ID for seed consistency
            update: plan,
            create: {
                ...plan,
                id: plan.name.toLowerCase()
            }
        });
    }
    console.log('Plans seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
