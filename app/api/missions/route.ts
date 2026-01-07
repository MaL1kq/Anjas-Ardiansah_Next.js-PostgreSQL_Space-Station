import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua misi
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missions = await prisma.mission.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        userMissions: {
          where: { userId: session.user.id },
        },
      },
    });

    // Transform data untuk frontend
    const transformedMissions = missions.map((mission) => {
      const userMission = mission.userMissions[0];
      let status = "available";
      
      if (userMission) {
        status = userMission.status.toLowerCase().replace("_", "-");
      }

      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        planet: mission.planet,
        duration: mission.duration,
        difficulty: mission.difficulty,
        xp: mission.xpReward,
        minLevel: mission.minLevel,
        status,
        userMissionId: userMission?.id,
        xpEarned: userMission?.xpEarned || 0,
      };
    });

    return NextResponse.json(transformedMissions);
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Buat misi baru (Admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, planet, duration, difficulty, xpReward, minLevel } = body;

    if (!title || !description || !planet || !duration) {
      return NextResponse.json({ error: "Field wajib harus diisi" }, { status: 400 });
    }

    const mission = await prisma.mission.create({
      data: {
        title,
        description,
        planet,
        duration,
        difficulty: difficulty || "MEDIUM",
        xpReward: xpReward || 100,
        minLevel: minLevel || 1,
      },
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error("Error creating mission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
