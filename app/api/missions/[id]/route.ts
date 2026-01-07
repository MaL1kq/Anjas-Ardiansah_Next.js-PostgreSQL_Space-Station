import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET single mission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mission = await prisma.mission.findUnique({
      where: { id },
      include: {
        _count: { select: { userMissions: true } },
      },
    });

    if (!mission) {
      return NextResponse.json({ error: "Misi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(mission);
  } catch (error) {
    console.error("Get mission error:", error);
    return NextResponse.json({ error: "Gagal mengambil misi" }, { status: 500 });
  }
}

// UPDATE mission (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, planet, duration, difficulty, xpReward, minLevel } = body;

    const mission = await prisma.mission.update({
      where: { id },
      data: {
        title,
        description,
        planet,
        duration,
        difficulty,
        xpReward: parseInt(xpReward),
        minLevel: parseInt(minLevel),
      },
    });

    return NextResponse.json(mission);
  } catch (error) {
    console.error("Update mission error:", error);
    return NextResponse.json({ error: "Gagal mengupdate misi" }, { status: 500 });
  }
}

// DELETE mission (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete related user missions first
    await prisma.userMission.deleteMany({
      where: { missionId: id },
    });

    // Delete mission
    await prisma.mission.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Misi berhasil dihapus" });
  } catch (error) {
    console.error("Delete mission error:", error);
    return NextResponse.json({ error: "Gagal menghapus misi" }, { status: 500 });
  }
}
