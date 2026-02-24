"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, X, Upload, ImageIcon } from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  image: string | null;
  price: number;
  category: string;
  stock: number;
}

interface ShopAdminActionsProps {
  item: ShopItem;
}

export function ShopAdminActions({ item }: ShopAdminActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(item.image);
  const [imageUrl, setImageUrl] = useState<string>(item.image || "");
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    stock: item.stock,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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
      }
    } catch {
      // ignore
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus item "${item.name}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/shop/${item.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Item berhasil dihapus!");
        router.refresh();
      } else {
        alert("Gagal menghapus item");
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
      const res = await fetch(`/api/shop/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imageUrl || null,
        }),
      });

      if (res.ok) {
        alert("Item berhasil diupdate!");
        setShowEdit(false);
        router.refresh();
      } else {
        alert("Gagal mengupdate item");
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

      {mounted && showEdit && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEdit(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Edit Item</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Gambar Item</label>
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
                      <p className="text-slate-400 text-sm">Klik untuk upload gambar</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <Input
                id="name"
                label="Nama Item"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Deskripsi</label>
                <textarea
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none min-h-[80px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  id="price"
                  label="Harga"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Kategori</label>
                  <select
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white focus:border-purple-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="WEAPON">Senjata</option>
                    <option value="ARMOR">Armor</option>
                    <option value="TOOL">Alat</option>
                    <option value="FOOD">Makanan</option>
                    <option value="VEHICLE">Kendaraan</option>
                    <option value="MATERIAL">Material</option>
                  </select>
                </div>
                <Input
                  id="stock"
                  label="Stok"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowEdit(false)} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" className="flex-1" isLoading={isUpdating} disabled={isUploading}>
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
