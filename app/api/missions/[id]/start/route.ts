import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST - Mulai misi
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

    // Cek apakah misi ada
    const mission = await prisma.mission.findUnique({
      where: { id },
    });

    if (!mission) {
      return NextResponse.json({ error: "Misi tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah misi sudah selesai secara global
    if (mission.isCompleted) {
      return NextResponse.json({ error: "Misi ini sudah diselesaikan" }, { status: 400 });
    }

    // Cek apakah user sudah punya misi ini
    const existingUserMission = await prisma.userMission.findUnique({
      where: {
        userId_missionId: {
          userId: session.user.id,
          missionId: id,
        },
      },
    });

    if (existingUserMission) {
      // Jika sudah ada tapi status IN_PROGRESS, kembalikan info untuk lanjut
      if (existingUserMission.status === "IN_PROGRESS") {
        return NextResponse.json({ 
          message: "Misi sedang berlangsung. Klik Selesaikan untuk menyelesaikan!",
          userMission: existingUserMission,
          alreadyStarted: true,
        });
      }
      // Jika sudah COMPLETED
      if (existingUserMission.status === "COMPLETED") {
        return NextResponse.json({ error: "Misi sudah diselesaikan" }, { status: 400 });
      }
    }

    // Buat user mission baru
    const userMission = await prisma.userMission.create({
      data: {
        userId: session.user.id,
        missionId: id,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({
      message: "Misi dimulai! Selamat berpetualang!",
      userMission,
    });
  } catch (error) {
    console.error("Error starting mission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
