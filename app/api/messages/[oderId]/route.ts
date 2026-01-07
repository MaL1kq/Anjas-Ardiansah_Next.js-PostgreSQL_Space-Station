import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ oderId: string }>;
}

// GET - Get messages with a specific user (conversation)
export async function GET(
  request: Request,
  { params }: Props
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oderId } = await params;
    const userId = session.user.id;

    // Verify the other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: oderId },
      select: { id: true, name: true, email: true, image: true, role: true },
    });

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get messages between current user and the other user
    // This ensures privacy - only participants can see their messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: oderId },
          { senderId: oderId, receiverId: userId },
        ],
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
      orderBy: {
        createdAt: "asc",
      },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: oderId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ messages, otherUser });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
