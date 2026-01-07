"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
}

export function AdminPasswordForm({ userId, userName }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter" });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Password tidak cocok" });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Gagal mengubah password" });
      } else {
        setMessage({ type: "success", text: `Password ${userName} berhasil diubah` });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Password Baru
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Masukkan password baru"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Konfirmasi Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Konfirmasi password baru"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full gap-2">
        <Key className="w-4 h-4" />
        {isLoading ? "Mengubah..." : "Ubah Password"}
      </Button>
    </form>
  );
}
