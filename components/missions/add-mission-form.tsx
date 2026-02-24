"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { X, Rocket, ImageIcon } from "lucide-react";

interface AddMissionFormProps {
  onClose: () => void;
}

export function AddMissionForm({ onClose }: AddMissionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    planet: "",
    duration: "",
    difficulty: "MEDIUM",
    xpReward: 100,
    minLevel: 1,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        setError(data.error || "Gagal upload gambar");
      }
    } catch {
      setError("Gagal upload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imageUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        alert("Misi berhasil dibuat!");
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
          aria-label="Tutup form"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tambah Misi Baru</h2>
            <p className="text-sm text-slate-400">Buat misi untuk para astronaut</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Gambar Misi</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2">
                  <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                  <p className="text-slate-400 text-sm">Klik untuk upload gambar misi</p>
                  <p className="text-slate-500 text-xs mt-1">JPG, PNG, WEBP (maks 5MB)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              aria-label="Upload gambar misi"
            />
          </div>

          <Input
            id="title"
            label="Judul Misi"
            placeholder="Eksplorasi Mars"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Deskripsi
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 min-h-[80px]"
              placeholder="Jelajahi permukaan Mars..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="planet"
              label="Planet/Lokasi"
              placeholder="Mars"
              value={formData.planet}
              onChange={(e) => setFormData({ ...formData, planet: e.target.value })}
              required
            />

            <Input
              id="duration"
              label="Durasi"
              placeholder="3 jam"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="difficulty" className="block text-sm font-medium text-slate-300">
                Kesulitan
              </label>
              <select
                id="difficulty"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
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
              placeholder="100"
              value={formData.xpReward}
              onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
              required
            />

            <Input
              id="minLevel"
              label="Min Level"
              type="number"
              placeholder="1"
              value={formData.minLevel}
              onChange={(e) => setFormData({ ...formData, minLevel: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading} disabled={isUploading}>
              {isLoading ? "Membuat..." : "Buat Misi"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
