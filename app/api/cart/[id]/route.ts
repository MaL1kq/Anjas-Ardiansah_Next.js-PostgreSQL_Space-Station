import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT - Update quantity cart item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantity minimal 1" }, { status: 400 });
    }

    // Cek ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { item: true },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    // Cek stok
    if (cartItem.item.stock < quantity) {
      return NextResponse.json({ error: "Stok tidak cukup" }, { status: 400 });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { item: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update cart item error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Hapus item dari cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Cek ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item dihapus dari cart" });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
