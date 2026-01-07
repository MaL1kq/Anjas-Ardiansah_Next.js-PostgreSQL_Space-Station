"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export function MessageInput({ 
  onSend, 
  replyTo, 
  onCancelReply,
  disabled = false 
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const emojis = [
    "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
    "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗",
    "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭",
    "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏",
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤙", "👋",
    "🚀", "🌟", "⭐", "💫", "✨", "🔥", "💯", "❤️",
  ];

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl p-4">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-3 p-3 bg-slate-800/50 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-purple-400 font-medium">
              Membalas {replyTo.senderName}
            </span>
            <button
              onClick={onCancelReply}
              className="text-slate-500 hover:text-white text-xs"
            >
              Batal
            </button>
          </div>
          <p className="text-sm text-slate-400 truncate">{replyTo.content}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Attachment Button (placeholder) */}
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji Picker */}
        <div className="relative" ref={emojiRef}>
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showEmoji && (
            <div className="absolute bottom-12 left-0 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl z-50 w-72">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-1 hover:bg-slate-700 rounded text-xl transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ketik pesan..."
          disabled={disabled}
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full transition"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
