import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const customerNote = typeof body.customerNote === "string" ? body.customerNote.trim() : "";

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
        isSelected: true,
      },
      include: { item: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Pilih minimal 1 item untuk checkout" }, { status: 400 });
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
    const itemCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
    const code = `TRX-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = await prisma.$transaction(async (tx) => {
      const createdTransaction = await tx.transaction.create({
        data: {
          code,
          userId,
          totalAmount: total,
          itemCount,
          status: "PENDING",
          customerNote: customerNote.length > 0 ? customerNote : null,
          items: {
            create: cartItems.map((cartItem) => ({
              shopItemId: cartItem.itemId,
              itemName: cartItem.item.name,
              itemImage: cartItem.item.image,
              unitPrice: cartItem.item.price,
              quantity: cartItem.quantity,
              subtotal: cartItem.item.price * cartItem.quantity,
              requestNote: cartItem.requestNote,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          userId,
          isSelected: true,
        },
      });

      return createdTransaction;
    });

    return NextResponse.json({
      message: "Transaksi dikirim dan menunggu verifikasi admin",
      transactionId: transaction.id,
      transactionCode: transaction.code,
      status: transaction.status,
      totalSpent: total,
      purchasedItems: itemCount,
      currentCredits: user.credits,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
