import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { item: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart masih kosong" }, { status: 400 });
    }

    const unavailableItem = cartItems.find((ci) => !ci.item.isAvailable);
    if (unavailableItem) {
      return NextResponse.json({ error: `Item ${unavailableItem.item.name} tidak tersedia` }, { status: 400 });
    }

    const outOfStockItem = cartItems.find((ci) => ci.item.stock < ci.quantity);
    if (outOfStockItem) {
      return NextResponse.json({ error: `Stok ${outOfStockItem.item.name} tidak cukup` }, { status: 400 });
    }

    const total = cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);

    if (user.credits < total) {
      return NextResponse.json(
        {
          error: "Credits tidak cukup",
          required: total,
          balance: user.credits,
          shortage: total - user.credits,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const cartItem of cartItems) {
        const updated = await tx.shopItem.updateMany({
          where: {
            id: cartItem.itemId,
            stock: { gte: cartItem.quantity },
          },
          data: {
            stock: { decrement: cartItem.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(`Stok ${cartItem.item.name} tidak cukup`);
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: total },
        },
      });

      await tx.cartItem.deleteMany({
        where: { userId },
      });
    });

    return NextResponse.json({
      message: "Checkout berhasil",
      totalSpent: total,
      purchasedItems: cartItems.length,
      remainingCredits: user.credits - total,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
