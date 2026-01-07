import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const pool = new Pool({
    connectionString: "postgresql://anjas:jmbwdpro1@localhost:5432/spacestation?schema=public",
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Hash password
  const hashedPassword = await bcrypt.hash("admin123", 12);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@space.com" },
    update: {},
    create: {
      name: "Commander Admin",
      email: "admin@space.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Create User biasa
  const user = await prisma.user.upsert({
    where: { email: "user@space.com" },
    update: {},
    create: {
      name: "Space Cadet",
      email: "user@space.com",
      password: await bcrypt.hash("user123", 12),
      role: "USER",
    },
  });

  // Create Astronaut
  const astronaut = await prisma.user.upsert({
    where: { email: "pilot@space.com" },
    update: {},
    create: {
      name: "Pilot Nova",
      email: "pilot@space.com",
      password: await bcrypt.hash("pilot123", 12),
      role: "ASTRONAUT",
    },
  });

  console.log("✅ Akun berhasil dibuat:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔴 ADMIN");
  console.log("   Email: admin@space.com");
  console.log("   Password: admin123");
  console.log("");
  console.log("🟢 USER");
  console.log("   Email: user@space.com");
  console.log("   Password: user123");
  console.log("");
  console.log("🟣 ASTRONAUT");
  console.log("   Email: pilot@space.com");
  console.log("   Password: pilot123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
