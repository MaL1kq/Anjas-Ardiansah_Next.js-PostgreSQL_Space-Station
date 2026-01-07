import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SpaceBackground from "@/components/space-background";
import { ChatContainer } from "@/components/messages/chat-container";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/signout-button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ oderId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { oderId } = await params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Cannot chat with yourself
  if (oderId === session.user.id) {
    redirect("/dashboard/messages");
  }

  // Get the other user
  const otherUser = await prisma.user.findUnique({
    where: { id: oderId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!otherUser) {
    notFound();
  }

  // Get messages between current user and the other user
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: oderId },
        { senderId: oderId, receiverId: session.user.id },
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
      receiverId: session.user.id,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  // Format messages for client
  const formattedMessages = messages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen">
      <SpaceBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Space Station</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/dashboard/missions" className="text-slate-400 hover:text-white transition">
              Misi
            </Link>
            <Link href="/dashboard/crew" className="text-slate-400 hover:text-white transition">
              Kru
            </Link>
            <Link href="/dashboard/messages" className="text-white font-medium">
              Pesan
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="text-purple-400 hover:text-purple-300 transition">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-slate-400">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <ChatContainer
        initialMessages={formattedMessages}
        otherUser={otherUser}
        currentUserId={session.user.id}
      />
    </div>
  );
}
