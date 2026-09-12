import { PrismaClient } from './generated/prisma';

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.usuario.findMany({ include: { progreso: true } });
    console.log(JSON.stringify(users, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
