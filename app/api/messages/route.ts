import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Get all conversations for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all unique conversations (users who have exchanged messages with current user)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by conversation partner
    const conversationsMap = new Map();
    
    for (const message of messages) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;
      
      if (!conversationsMap.has(partnerId)) {
        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            senderId: partnerId,
            receiverId: userId,
            isRead: false,
          },
        });

        conversationsMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: message,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content, replyToId } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver and content are required" },
        { status: 400 }
      );
    }

    // Cannot send message to yourself
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot send message to yourself" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        replyToId: replyToId || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, image: true },
        },
        replyTo: {
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
