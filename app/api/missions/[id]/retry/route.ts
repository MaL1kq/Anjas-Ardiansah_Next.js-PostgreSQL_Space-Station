import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST - Ulangi misi yang gagal
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Cari user mission
    const userMission = await prisma.userMission.findUnique({
      where: {
        userId_missionId: {
          userId: session.user.id,
          missionId: id,
        },
      },
    });

    if (!userMission) {
      return NextResponse.json({ error: "Misi tidak ditemukan" }, { status: 404 });
    }

    // Reset status menjadi in-progress
    const updatedMission = await prisma.userMission.update({
      where: { id: userMission.id },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
        completedAt: null,
        xpEarned: 0,
      },
    });

    return NextResponse.json({
      message: "Misi dimulai ulang! Semangat! 💪",
      userMission: updatedMission,
    });
  } catch (error) {
    console.error("Error retrying mission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
