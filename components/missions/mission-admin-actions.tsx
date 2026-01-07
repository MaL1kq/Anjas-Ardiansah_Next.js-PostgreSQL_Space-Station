"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Mission {
  id: string;
  title: string;
  description: string;
  planet: string;
  duration: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXTREME";
  xpReward: number;
  minLevel: number;
}

interface MissionAdminActionsProps {
  mission: Mission;
}

export function MissionAdminActions({ mission }: MissionAdminActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: mission.title,
    description: mission.description,
    planet: mission.planet,
    duration: mission.duration,
    difficulty: mission.difficulty,
    xpReward: mission.xpReward,
    minLevel: mission.minLevel,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    if (!confirm(`Hapus misi "${mission.title}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Misi berhasil dihapus!");
        router.refresh();
      } else {
        alert("Gagal menghapus misi");
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
      const res = await fetch(`/api/missions/${mission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Misi berhasil diupdate!");
        setShowEdit(false);
        router.refresh();
      } else {
        alert("Gagal mengupdate misi");
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
          disabled={isDeleting}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Modal - menggunakan Portal agar muncul di atas semua elemen */}
      {mounted && showEdit && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowEdit(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Edit Misi</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                id="title"
                label="Judul Misi"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Deskripsi
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="planet"
                  label="Planet"
                  value={formData.planet}
                  onChange={(e) => setFormData({ ...formData, planet: e.target.value })}
                  required
                />
                <Input
                  id="duration"
                  label="Durasi"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Kesulitan
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-purple-500"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Mission["difficulty"] })}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXTREME">Extreme</option>
                  </select>
                </div>
                <Input
                  id="xpReward"
                  label="XP Reward"
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                  required
                />
                <Input
                  id="minLevel"
                  label="Min Level"
                  type="number"
                  value={formData.minLevel}
                  onChange={(e) => setFormData({ ...formData, minLevel: parseInt(e.target.value) || 1 })}
                />
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
