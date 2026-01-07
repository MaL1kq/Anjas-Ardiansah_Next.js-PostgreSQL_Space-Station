import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";
import SpaceBackground from "@/components/space-background";
import {
  Rocket,
  MessageCircle,
  User,
  Clock,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Get all messages where user is sender or receiver
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
      conversationsMap.set(partnerId, {
        partnerId,
        partner,
        lastMessage: message,
        unreadCount: 0,
      });
    }
  }

  // Count unread messages for each conversation
  for (const [partnerId, conversation] of conversationsMap) {
    const unreadCount = await prisma.message.count({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
    });
    conversation.unreadCount = unreadCount;
  }

  const conversations = Array.from(conversationsMap.values());

  // Get all users for new conversation
  const allUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return new Date(date).toLocaleTimeString("id-ID", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } else if (hours < 48) {
      return "Kemarin";
    } else {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    }
  };

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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pesan</h1>
          <p className="text-slate-400">Kirim pesan ke astronot lain</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-800">
              <div className="p-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  Percakapan
                </h2>
              </div>

              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Belum ada percakapan</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Pilih astronot dari daftar untuk memulai percakapan
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {conversations.map((conv) => (
                    <Link
                      key={conv.partnerId}
                      href={`/dashboard/messages/${conv.partnerId}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-white truncate">
                            {conv.partner.name || conv.partner.email}
                          </h3>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-400 truncate">
                            {conv.lastMessage.senderId === userId ? "Anda: " : ""}
                            {conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* All Users - New Conversation */}
          <div>
            <Card className="bg-slate-900/50 border-slate-800">
              <div className="p-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  Astronot
                </h2>
              </div>

              <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
                {allUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/dashboard/messages/${user.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-slate-800/50 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate text-sm">
                        {user.name || user.email}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {user.role === "ADMIN" ? "Commander" : user.role === "ASTRONAUT" ? "Astronaut" : "Crew"}
                      </p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-slate-500" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
