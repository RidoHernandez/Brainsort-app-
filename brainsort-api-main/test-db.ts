import { PrismaClient } from './generated/prisma';

async function main() {
  const prisma = new PrismaClient();
  try {
    const res = await prisma.algoritmo.findMany();
    console.log("Success! Found", res.length, "algorithms.");
  } catch (e) {
    console.error("Error:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
