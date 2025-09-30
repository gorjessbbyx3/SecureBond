
import { seedDatabase } from './seedData';

async function runSeed() {
  try {
    await seedDatabase();
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
