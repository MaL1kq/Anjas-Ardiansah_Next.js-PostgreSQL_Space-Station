"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, X, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItemData {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    description: string;
    image: string | null;
    price: number;
    category: string;
    stock: number;
  };
}

interface CartData {
  items: CartItemData[];
  total: number;
  totalItems: number;
}

export function CartPanel() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCart();
    // Poll setiap 10 detik
    const interval = setInterval(fetchCart, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    setUpdatingId(cartItemId);
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (res.ok) {
        await fetchCart();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal update quantity");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (cartItemId: string) => {
    setUpdatingId(cartItemId);
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCart();
        router.refresh();
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
    }
  };

  const clearCart = async () => {
    if (!confirm("Kosongkan semua item di cart?")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCart();
        router.refresh();
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = cart?.totalItems || 0;

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => { setIsOpen(true); fetchCart(); }}
        title="Buka Cart"
        className="relative p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:border-purple-500/50 transition"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-800 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Cart ({itemCount})</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup Cart"
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!cart || cart.items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">Cart kosong</p>
                  <p className="text-slate-500 text-sm mt-1">Tambah item dari toko!</p>
                </div>
              ) : (
                cart.items.map((cartItem) => (
                  <Card key={cartItem.id} className="p-3">
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                        {cartItem.item.image ? (
                          <img
                            src={cartItem.item.image}
                            alt={cartItem.item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-600" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{cartItem.item.name}</h4>
                        <p className="text-emerald-400 text-sm font-medium">{cartItem.item.price.toLocaleString()} Credits</p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-slate-800/60 rounded border border-slate-700">
                            <button
                              onClick={() => {
                                if (cartItem.quantity <= 1) {
                                  removeItem(cartItem.id);
                                } else {
                                  updateQuantity(cartItem.id, cartItem.quantity - 1);
                                }
                              }}
                              disabled={updatingId === cartItem.id}
                              className="p-1 text-slate-400 hover:text-white transition disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-xs w-6 text-center">
                              {updatingId === cartItem.id ? "..." : cartItem.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                              disabled={updatingId === cartItem.id || cartItem.quantity >= cartItem.item.stock}
                              className="p-1 text-slate-400 hover:text-white transition disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(cartItem.id)}
                            disabled={updatingId === cartItem.id}
                            className="p-1 text-red-400 hover:text-red-300 transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="p-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {cart.total.toLocaleString()} Credits
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={clearCart}
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Kosongkan
                  </Button>
                  <Button size="sm" className="flex-1">
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
