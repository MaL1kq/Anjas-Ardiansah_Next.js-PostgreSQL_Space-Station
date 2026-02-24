import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua item shop
export async function GET() {
  try {
    const items = await prisma.shopItem.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching shop items:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Tambah item baru (Admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, image, price, category, stock } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Nama dan deskripsi wajib diisi" }, { status: 400 });
    }

    const item = await prisma.shopItem.create({
      data: {
        name,
        description,
        image: image || null,
        price: parseInt(price) || 0,
        category: category || "TOOL",
        stock: parseInt(stock) || 99,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating shop item:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
