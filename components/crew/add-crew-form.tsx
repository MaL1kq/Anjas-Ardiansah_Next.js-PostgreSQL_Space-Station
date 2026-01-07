"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { X, UserPlus } from "lucide-react";

interface AddCrewFormProps {
  onClose: () => void;
}

export function AddCrewForm({ onClose }: AddCrewFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/crew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        alert("Kru berhasil ditambahkan!");
        onClose();
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tambah Kru Baru</h2>
            <p className="text-sm text-slate-400">Rekrut anggota baru untuk tim</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            id="name"
            label="Nama Lengkap"
            placeholder="Astronaut John"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="john@space.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Role
            </label>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="USER">Space Cadet</option>
              <option value="ASTRONAUT">Pilot</option>
              <option value="ADMIN">Commander</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              {isLoading ? "Menambahkan..." : "Tambah Kru"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
