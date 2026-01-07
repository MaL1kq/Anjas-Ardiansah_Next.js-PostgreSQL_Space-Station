import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET single crew member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Kru tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get crew error:", error);
    return NextResponse.json({ error: "Gagal mengambil data kru" }, { status: 500 });
  }
}

// UPDATE crew member (admin only)
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
    const { name, email, password, role } = body;

    // Check if email is taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email sudah digunakan" },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      role?: "USER" | "ADMIN" | "ASTRONAUT";
    } = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update crew error:", error);
    return NextResponse.json({ error: "Gagal mengupdate kru" }, { status: 500 });
  }
}

// DELETE crew member (admin only)
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

    // Don't allow deleting self
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus akun sendiri" },
        { status: 400 }
      );
    }

    // Delete related data first
    await prisma.userMission.deleteMany({ where: { userId: id } });
    await prisma.session.deleteMany({ where: { userId: id } });
    await prisma.account.deleteMany({ where: { userId: id } });

    // Delete user
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Kru berhasil dihapus" });
  } catch (error) {
    console.error("Delete crew error:", error);
    return NextResponse.json({ error: "Gagal menghapus kru" }, { status: 500 });
  }
}
