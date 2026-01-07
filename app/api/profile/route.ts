import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    // Build update data
    const updateData: { name?: string; password?: string } = {};

    if (name) {
      updateData.name = name;
    }

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Password saat ini diperlukan" },
          { status: 400 }
        );
      }

      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user || !user.password) {
        return NextResponse.json(
          { error: "User tidak ditemukan" },
          { status: 404 }
        );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Password saat ini salah" },
          { status: 400 }
        );
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        level: true,
      },
    });

    return NextResponse.json({
      message: "Profil berhasil diupdate",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
