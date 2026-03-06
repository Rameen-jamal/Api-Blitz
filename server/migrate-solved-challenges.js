/**
 * One-time migration: converts solvedChallenges from [ObjectId] → [{ challengeId, solvedAt }]
 * Run once with: node migrate-solved-challenges.js
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

async function migrate() {
  await mongoose.connect(MONGO_URI, { family: 4, serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const teams = await db.collection('teams').find({}).toArray();

  let migrated = 0;
  let skipped = 0;

  for (const team of teams) {
    const solved = team.solvedChallenges || [];

    // Check if already in new format
    const alreadyMigrated = solved.every(
      (sc) => sc !== null && typeof sc === 'object' && sc.challengeId !== undefined
    );

    if (alreadyMigrated) {
      skipped++;
      continue;
    }

    // Convert plain ObjectIds to { challengeId, solvedAt: createdAt fallback }
    const newSolved = solved.map((sc) => ({
      challengeId: sc,
      solvedAt: team.createdAt || new Date()
    }));

    await db.collection('teams').updateOne(
      { _id: team._id },
      { $set: { solvedChallenges: newSolved } }
    );

    console.log(`Migrated team: ${team.teamName} (${solved.length} solves)`);
    migrated++;
  }

  console.log(`\nDone. Migrated: ${migrated}, Already up-to-date: ${skipped}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
