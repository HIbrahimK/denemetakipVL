import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const school = await prisma.school.upsert({
        where: { id: 'clxxxx' },
        update: {},
        create: {
            id: 'clxxxx',
            name: 'Varsayılan Okul',
            code: 'DEFAULT',
        },
    });
    console.log('SCHOOL_CREATED:', school.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
