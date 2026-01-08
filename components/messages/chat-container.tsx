"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";

interface ReplyInfo {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string | null;
  };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead: boolean;
  isDeleted?: boolean;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  replyTo?: ReplyInfo | null;
}

interface OtherUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface ChatContainerProps {
  initialMessages: Message[];
  otherUser: OtherUser;
  currentUserId: string;
}

export function ChatContainer({
  initialMessages,
  otherUser,
  currentUserId,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    content: string;
    senderName: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${otherUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    };

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [otherUser.id]);

  const handleSend = async (content: string) => {
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUser.id,
          content,
          replyToId: replyTo?.id,
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
        setReplyTo(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/delete/${messageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Update the message in state to show as deleted
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isDeleted: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      senderName: message.sender.name || message.sender.email,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <Link
          href="/dashboard/messages"
          className="p-2 hover:bg-slate-800 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>

        <div>
          <h2 className="font-semibold text-white">
            {otherUser.name || otherUser.email}
          </h2>
          <p className="text-xs text-slate-400">
            {otherUser.role === "ADMIN"
              ? "Commander"
              : otherUser.role === "ASTRONAUT"
              ? "Astronaut"
              : "Crew"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">Belum ada pesan</p>
              <p className="text-slate-500 text-sm mt-1">
                Kirim pesan untuk memulai percakapan
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const messageDate = new Date(message.createdAt);
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
              
              // Check if we need to show date separator
              const showDateSeparator = !prevDate || 
                messageDate.toDateString() !== prevDate.toDateString();

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <DateSeparator date={messageDate} />
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={message.senderId === currentUserId}
                    onReply={handleReply}
                    onDelete={handleDelete}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        disabled={sending}
      />
    </div>
  );
}

// Date Separator Component
function DateSeparator({ date }: { date: Date }) {
  const formatDateLabel = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Hari ini
    if (messageDay.getTime() === today.getTime()) {
      return "Hari ini";
    }
    
    // Kemarin
    if (messageDay.getTime() === yesterday.getTime()) {
      return "Kemarin";
    }
    
    // Dalam 7 hari terakhir - tampilkan nama hari
    const diffDays = Math.floor((today.getTime() - messageDay.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      return days[date.getDay()];
    }
    
    // Lebih dari 7 hari - tampilkan tanggal lengkap
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="flex justify-center my-4">
      <span className="px-4 py-1 bg-slate-800/80 text-slate-300 text-xs rounded-full">
        {formatDateLabel(date)}
      </span>
    </div>
  );
}
