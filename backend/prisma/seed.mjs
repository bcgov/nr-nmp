import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import regions from './data.mjs';

const prisma = new PrismaClient();

dotenv.config();

// const environment = process.env.NODE_ENV || 'production';

/**
 * @summary Seeds all the necessary base data in both dev and prod.
 * Checks for any changes to existing tables and updates accordingly
 */
async function seedBase() {
  const seedingPromises = [];

  seedingPromises.push(
    ...regions.map((range) => prisma.salaryRange.upsert({
      where: { id: range.id },
      create: range,
      update: range,
    })),
  );

  await Promise.all(seedingPromises);
}

(async () => {
  try {
    await seedBase();
    // if (environment === 'development') {
    //   await seedUsers();
    //   await seedInquiries();
    // }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
