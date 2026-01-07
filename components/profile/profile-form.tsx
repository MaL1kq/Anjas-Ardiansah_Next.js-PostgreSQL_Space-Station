"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string;
}

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate passwords
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Password baru tidak cocok" });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter" });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Gagal update profil" });
      } else {
        setMessage({ type: "success", text: "Profil berhasil diupdate" });
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nama Lengkap
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Nama lengkap Anda"
        />
      </div>

      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email
        </label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 cursor-not-allowed"
        />
        <p className="text-xs text-slate-500 mt-1">Email tidak dapat diubah</p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800 pt-6">
        <h4 className="text-white font-medium mb-4">Ubah Password</h4>
        <p className="text-sm text-slate-400 mb-4">
          Kosongkan jika tidak ingin mengubah password
        </p>

        {/* Current Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password Saat Ini
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Masukkan password saat ini"
          />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password Baru
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Masukkan password baru"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Konfirmasi password baru"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
