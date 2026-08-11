import { seedInitialDataIfNeeded } from '../services/seedService.js';

async function run() {
  console.log('Running seed runner...');
  await seedInitialDataIfNeeded(true);
  console.log('Seed completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed runner failed:', err);
  process.exit(1);
});
