"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, X } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "ASTRONAUT";
}

interface CrewAdminActionsProps {
  user: User;
  currentUserId: string;
}

export function CrewAdminActions({ user, currentUserId }: CrewAdminActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    password: "",
    role: user.role,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSelf = user.id === currentUserId;

  const handleDelete = async () => {
    if (isSelf) {
      alert("Tidak bisa menghapus akun sendiri!");
      return;
    }

    if (!confirm(`Hapus kru "${user.name}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/crew/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Kru berhasil dihapus!");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus kru");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const updateData: Record<string, string> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Only include password if changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      const res = await fetch(`/api/crew/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        alert("Kru berhasil diupdate!");
        setShowEdit(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengupdate kru");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowEdit(true)}
          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting || isSelf}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus kru"}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Modal - menggunakan Portal */}
      {mounted && showEdit && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowEdit(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Edit Kru</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                id="name"
                label="Nama Lengkap"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                id="password"
                label="Password Baru (kosongkan jika tidak ingin mengubah)"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Role
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-purple-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User["role"] })}
                >
                  <option value="USER">Space Cadet</option>
                  <option value="ASTRONAUT">Pilot</option>
                  <option value="ADMIN">Commander</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowEdit(false)} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" className="flex-1" isLoading={isUpdating}>
                  {isUpdating ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Card>
        </div>,
        document.body
      )}
    </>
  );
}
