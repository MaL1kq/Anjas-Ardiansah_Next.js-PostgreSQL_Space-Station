import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const status = body?.status as string;
    const adminNote = typeof body?.adminNote === "string" ? body.adminNote.trim() : "";

    if (!["SUCCESS", "FAILED"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            credits: true,
          },
        },
        items: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json({ error: "Transaksi sudah diproses" }, { status: 400 });
    }

    if (status === "FAILED") {
      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          status: "FAILED",
          processedBy: session.user.id,
          processedAt: new Date(),
          adminNote: adminNote.length > 0 ? adminNote : "Ditolak admin",
        },
      });

      return NextResponse.json({
        message: "Transaksi ditandai gagal",
        transaction: updated,
      });
    }

    if (transaction.user.credits < transaction.totalAmount) {
      const failNote = adminNote.length > 0
        ? adminNote
        : "Gagal: saldo credits user tidak cukup saat verifikasi admin";

      const failed = await prisma.transaction.update({
        where: { id },
        data: {
          status: "FAILED",
          processedBy: session.user.id,
          processedAt: new Date(),
          adminNote: failNote,
        },
      });

      return NextResponse.json(
        {
          error: "Saldo user tidak cukup, transaksi otomatis ditandai gagal",
          transaction: failed,
        },
        { status: 400 }
      );
    }

    const itemIds = transaction.items
      .map((item) => item.shopItemId)
      .filter((itemId): itemId is string => !!itemId);

    const stockRows = await prisma.shopItem.findMany({
      where: { id: { in: itemIds } },
      select: {
        id: true,
        name: true,
        stock: true,
        isAvailable: true,
      },
    });

    const stockMap = new Map(stockRows.map((row) => [row.id, row]));

    for (const txItem of transaction.items) {
      if (!txItem.shopItemId) {
        const failed = await prisma.transaction.update({
          where: { id },
          data: {
            status: "FAILED",
            processedBy: session.user.id,
            processedAt: new Date(),
            adminNote: `Gagal: item ${txItem.itemName} sudah tidak tersedia di katalog`,
          },
        });

        return NextResponse.json(
          {
            error: `Item ${txItem.itemName} sudah tidak tersedia di katalog`,
            transaction: failed,
          },
          { status: 400 }
        );
      }

      const row = stockMap.get(txItem.shopItemId);
      if (!row || !row.isAvailable || row.stock < txItem.quantity) {
        const failed = await prisma.transaction.update({
          where: { id },
          data: {
            status: "FAILED",
            processedBy: session.user.id,
            processedAt: new Date(),
            adminNote: `Gagal: stok ${txItem.itemName} tidak mencukupi saat verifikasi admin`,
          },
        });

        return NextResponse.json(
          {
            error: `Stok ${txItem.itemName} tidak mencukupi`,
            transaction: failed,
          },
          { status: 400 }
        );
      }
    }

    const approved = await prisma.$transaction(async (tx) => {
      for (const txItem of transaction.items) {
        if (!txItem.shopItemId) {
          throw new Error(`Item ${txItem.itemName} tidak valid`);
        }

        const updatedStock = await tx.shopItem.updateMany({
          where: {
            id: txItem.shopItemId,
            stock: { gte: txItem.quantity },
            isAvailable: true,
          },
          data: {
            stock: { decrement: txItem.quantity },
          },
        });

        if (updatedStock.count === 0) {
          throw new Error(`Stok ${txItem.itemName} tidak mencukupi`);
        }
      }

      await tx.user.update({
        where: { id: transaction.user.id },
        data: {
          credits: { decrement: transaction.totalAmount },
        },
      });

      return tx.transaction.update({
        where: { id },
        data: {
          status: "SUCCESS",
          processedBy: session.user.id,
          processedAt: new Date(),
          adminNote: adminNote.length > 0 ? adminNote : "Disetujui admin",
        },
      });
    });

    return NextResponse.json({
      message: "Transaksi disetujui",
      transaction: approved,
    });
  } catch (error) {
    console.error("Update transaction status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
