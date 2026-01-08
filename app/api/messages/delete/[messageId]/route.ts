import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ messageId: string }>;
}

// DELETE - Soft delete a message (mark as deleted)
export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;

    // Get the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only the sender can delete their own message
    if (message.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own messages" },
        { status: 403 }
      );
    }

    // Soft delete - mark as deleted instead of actually deleting
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
