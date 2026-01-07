import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://anjas:jmbwdpro1@localhost:5432/spacestation",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedMissions() {
  console.log("Seeding missions...\n");

  const missions = [
    {
      title: "Eksplorasi Permukaan Mars",
      description: "Jelajahi dataran merah Mars dan kumpulkan sampel tanah untuk analisis. Misi ini akan membawa Anda ke lembah Valles Marineris.",
      planet: "Mars",
      duration: "3 jam",
      difficulty: "EASY" as const,
      xpReward: 100,
      minLevel: 1,
    },
    {
      title: "Orbit Bulan Europa",
      description: "Lakukan survei orbital di sekitar Europa, bulan Jupiter yang misterius. Cari tanda-tanda kehidupan di bawah lapisan es.",
      planet: "Europa",
      duration: "6 jam",
      difficulty: "MEDIUM" as const,
      xpReward: 250,
      minLevel: 3,
    },
    {
      title: "Perbaikan Stasiun Luar Angkasa",
      description: "Spacewalk untuk memperbaiki panel surya yang rusak di stasiun. Diperlukan keahlian teknis tinggi.",
      planet: "ISS Orbit",
      duration: "4 jam",
      difficulty: "MEDIUM" as const,
      xpReward: 200,
      minLevel: 2,
    },
    {
      title: "Pendaratan di Titan",
      description: "Mendaratlah di Titan, bulan terbesar Saturnus. Eksplorasi danau metana dan atmosfer yang unik.",
      planet: "Titan",
      duration: "12 jam",
      difficulty: "HARD" as const,
      xpReward: 500,
      minLevel: 5,
    },
    {
      title: "Misi ke Sabuk Asteroid",
      description: "Navigasi melalui sabuk asteroid dan temukan asteroid yang kaya mineral untuk pertambangan masa depan.",
      planet: "Asteroid Belt",
      duration: "8 jam",
      difficulty: "HARD" as const,
      xpReward: 400,
      minLevel: 4,
    },
    {
      title: "Flyby Neptunus",
      description: "Lakukan flyby dekat Neptunus dan dokumentasikan badai raksasa serta bulan-bulannya yang misterius.",
      planet: "Neptunus",
      duration: "24 jam",
      difficulty: "EXTREME" as const,
      xpReward: 1000,
      minLevel: 8,
    },
    {
      title: "Pengiriman ke Koloni Lunar",
      description: "Kirim pasokan vital ke koloni lunar di Kawah Shackleton. Misi pengiriman rutin.",
      planet: "Bulan",
      duration: "2 jam",
      difficulty: "EASY" as const,
      xpReward: 75,
      minLevel: 1,
    },
    {
      title: "Misi Penyelamatan Callisto",
      description: "Tim peneliti terjebak di Callisto. Lakukan misi penyelamatan darurat sebelum terlambat!",
      planet: "Callisto",
      duration: "10 jam",
      difficulty: "EXTREME" as const,
      xpReward: 1200,
      minLevel: 10,
    },
  ];

  for (const mission of missions) {
    const existing = await prisma.mission.findFirst({
      where: { title: mission.title },
    });

    if (!existing) {
      await prisma.mission.create({
        data: mission,
      });
      console.log(`✅ Created mission: ${mission.title}`);
    } else {
      console.log(`⏭️  Mission already exists: ${mission.title}`);
    }
  }

  console.log("\n🎉 Missions seeding complete!");
}

seedMissions()
  .catch((e) => {
    console.error("Error seeding missions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
