import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const school = await prisma.school.findFirst();
    console.log('SCHOOL_ID:', school?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
