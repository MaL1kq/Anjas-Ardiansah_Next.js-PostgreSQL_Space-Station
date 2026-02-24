"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus } from "lucide-react";

interface AddToCartButtonProps {
  itemId: string;
  stock: number;
}

export function AddToCartButton({ itemId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });

      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menambahkan ke cart");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setIsAdding(false);
    }
  };

  if (stock === 0) {
    return (
      <span className="text-red-400 text-sm font-medium">Habis</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg border border-slate-700">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          title="Kurangi"
          className="p-1.5 text-slate-400 hover:text-white transition"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-white text-sm w-6 text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
          title="Tambah"
          className="p-1.5 text-slate-400 hover:text-white transition"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <button
        onClick={handleAdd}
        disabled={isAdding}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          added
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
        } disabled:opacity-50`}
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        {added ? "Ditambahkan!" : isAdding ? "..." : "Tambah"}
      </button>
    </div>
  );
}
