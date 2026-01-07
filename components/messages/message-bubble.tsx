"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Reply, Check, User } from "lucide-react";

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

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply: (message: Message) => void;
}

export function MessageBubble({ message, isOwn, onReply }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleReply = () => {
    onReply(message);
    setShowMenu(false);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 group`}
    >
      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
        )}

        <div className="relative" ref={menuRef}>
          {/* Message Content */}
          <div
            onClick={() => setShowMenu(!showMenu)}
            className={`cursor-pointer rounded-2xl px-4 py-2 ${
              isOwn
                ? "bg-purple-600 text-white rounded-br-sm"
                : "bg-slate-800 text-white rounded-bl-sm"
            }`}
          >
            {/* Reply Preview */}
            {message.replyTo && (
              <div
                className={`mb-2 p-2 rounded-lg border-l-2 ${
                  isOwn
                    ? "bg-purple-700/50 border-purple-400"
                    : "bg-slate-700/50 border-slate-500"
                }`}
              >
                <p className="text-xs font-medium opacity-75">
                  {message.replyTo.sender.name || "User"}
                </p>
                <p className="text-sm opacity-75 truncate">
                  {message.replyTo.content}
                </p>
              </div>
            )}

            <p className="break-words">{message.content}</p>
            
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
              <span className="text-xs opacity-60">{formatTime(message.createdAt)}</span>
              {isOwn && message.isRead && (
                <Check className="w-3 h-3 text-blue-300" />
              )}
            </div>
          </div>

          {/* Context Menu */}
          {showMenu && (
            <div
              className={`absolute bottom-full mb-2 ${
                isOwn ? "right-0" : "left-0"
              } bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden`}
            >
              <button
                onClick={handleReply}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
              >
                <Reply className="w-4 h-4" />
                Balas
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Salin
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
