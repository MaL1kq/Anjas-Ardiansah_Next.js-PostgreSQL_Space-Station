import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET single shop item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.shopItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Get shop item error:", error);
    return NextResponse.json({ error: "Gagal mengambil item" }, { status: 500 });
  }
}

// UPDATE shop item (admin only)
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
    const { name, description, image, price, category, stock } = body;

    const item = await prisma.shopItem.update({
      where: { id },
      data: {
        name,
        description,
        image: image || null,
        price: parseInt(price) || 0,
        category: category || "TOOL",
        stock: parseInt(stock) || 99,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Update shop item error:", error);
    return NextResponse.json({ error: "Gagal mengupdate item" }, { status: 500 });
  }
}

// DELETE shop item (admin only)
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

    // Hapus cart items terkait dulu
    await prisma.cartItem.deleteMany({
      where: { itemId: id },
    });

    // Hapus item
    await prisma.shopItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item berhasil dihapus" });
  } catch (error) {
    console.error("Delete shop item error:", error);
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 });
  }
}
