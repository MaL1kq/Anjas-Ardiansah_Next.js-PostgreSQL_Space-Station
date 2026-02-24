import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Ambil cart user saat ini
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        item: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const total = cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
    const totalItems = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

    return NextResponse.json({
      items: cartItems,
      total,
      totalItems,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Tambah item ke cart
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, quantity = 1 } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID wajib" }, { status: 400 });
    }

    // Cek item ada dan tersedia
    const shopItem = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!shopItem || !shopItem.isAvailable) {
      return NextResponse.json({ error: "Item tidak tersedia" }, { status: 404 });
    }

    // Cek stok
    if (shopItem.stock < quantity) {
      return NextResponse.json({ error: "Stok tidak cukup" }, { status: 400 });
    }

    // Upsert - jika sudah ada di cart, tambah quantity
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: session.user.id,
        itemId,
        quantity,
      },
      include: { item: true },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Kosongkan cart
export async function DELETE() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ message: "Cart dikosongkan" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
