import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST - Selesaikan misi (XP bertambah untuk SEMUA kru, misi selesai untuk SEMUA user)
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

    // Cek apakah misi sudah diselesaikan secara global
    const mission = await prisma.mission.findUnique({
      where: { id },
    });

    if (!mission) {
      return NextResponse.json({ error: "Misi tidak ditemukan" }, { status: 404 });
    }

    if (mission.isCompleted) {
      return NextResponse.json({ error: "Misi sudah diselesaikan oleh kru lain" }, { status: 400 });
    }

    // Cari user mission (jika belum ada, buat dulu)
    let userMission = await prisma.userMission.findUnique({
      where: {
        userId_missionId: {
          userId: session.user.id,
          missionId: id,
        },
      },
    });

    if (!userMission) {
      // Buat user mission jika belum ada
      userMission = await prisma.userMission.create({
        data: {
          userId: session.user.id,
          missionId: id,
          status: "IN_PROGRESS",
        },
      });
    }

    const xpReward = mission.xpReward;

    // Update user mission menjadi completed
    await prisma.userMission.update({
      where: { id: userMission.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        xpEarned: xpReward,
      },
    });

    // TANDAI MISI SELESAI SECARA GLOBAL
    await prisma.mission.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        completedBy: session.user.id,
      },
    });

    // TAMBAHKAN XP KE SEMUA KRU (semua user)
    await prisma.user.updateMany({
      data: {
        xp: { increment: xpReward },
      },
    });

    // Recalculate levels for all users based on their new XP
    const updatedUsers = await prisma.user.findMany();
    await Promise.all(
      updatedUsers.map((user) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            level: Math.floor(user.xp / 500) + 1,
          },
        })
      )
    );

    return NextResponse.json({
      message: `Misi "${mission.title}" selesai! Semua kru mendapatkan +${xpReward} XP! 🎉`,
      xpEarned: xpReward,
      completedBy: session.user.name,
      allCrewRewarded: true,
    });
  } catch (error) {
    console.error("Error completing mission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
