import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://anjas:jmbwdpro1@localhost:5432/spacestation",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetMissions() {
  console.log("🔄 Resetting mission data...\n");

  // Hapus semua UserMission
  const deletedUserMissions = await prisma.userMission.deleteMany({});
  console.log(`✅ Deleted ${deletedUserMissions.count} user missions`);

  // Reset status isCompleted di semua Mission
  const updatedMissions = await prisma.mission.updateMany({
    data: {
      isCompleted: false,
      completedAt: null,
      completedBy: null,
    },
  });
  console.log(`✅ Reset ${updatedMissions.count} missions to available`);

  // Reset XP semua user ke 0
  const updatedUsers = await prisma.user.updateMany({
    data: {
      xp: 0,
      level: 1,
    },
  });
  console.log(`✅ Reset XP for ${updatedUsers.count} users`);

  console.log("\n🎉 Mission data reset complete!");
}

resetMissions()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
