"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, X, Package, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItemData {
  id: string;
  quantity: number;
  isSelected: boolean;
  requestNote: string | null;
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
  selectedTotal: number;
  selectedCount: number;
  credits: number;
}

export function CartPanel() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [dirtyNoteMap, setDirtyNoteMap] = useState<Record<string, boolean>>({});
  const [savingNoteMap, setSavingNoteMap] = useState<Record<string, boolean>>({});

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        setNoteDrafts((prev) => {
          const drafts: Record<string, string> = {};
          for (const ci of data.items ?? []) {
            const serverNote = ci.requestNote || "";
            // Jangan timpa draft yang sedang diketik, belum tersimpan, atau sedang proses simpan.
            const shouldKeepLocal =
              activeNoteId === ci.id ||
              dirtyNoteMap[ci.id] === true ||
              savingNoteMap[ci.id] === true;
            drafts[ci.id] = shouldKeepLocal ? (prev[ci.id] ?? serverNote) : serverNote;
          }
          return drafts;
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCart();
    // Poll setiap 10 detik, tapi pause saat user sedang mengetik catatan.
    const interval = setInterval(() => {
      if (!activeNoteId) {
        fetchCart();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeNoteId]);

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

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Transaksi ${data.transactionCode} berhasil diajukan dan menunggu verifikasi admin.`);
        await fetchCart();
        router.refresh();
      } else {
        alert(data.error || "Checkout gagal");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const updateSelection = async (cartItemId: string, isSelected: boolean) => {
    setUpdatingId(cartItemId);
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSelected }),
      });

      if (res.ok) {
        await fetchCart();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal update pilihan checkout");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNote = async (cartItemId: string, currentNote: string | null) => {
    const draft = noteDrafts[cartItemId] ?? "";
    const normalizedCurrent = currentNote || "";

    if (draft === normalizedCurrent) {
      setDirtyNoteMap((prev) => ({
        ...prev,
        [cartItemId]: false,
      }));
      return;
    }

    setUpdatingId(cartItemId);
    setSavingNoteMap((prev) => ({
      ...prev,
      [cartItemId]: true,
    }));

    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestNote: draft }),
      });

      if (res.ok) {
        setDirtyNoteMap((prev) => ({
          ...prev,
          [cartItemId]: false,
        }));
        setCart((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.id === cartItemId
                ? { ...item, requestNote: draft.trim().length > 0 ? draft.trim() : null }
                : item
            ),
          };
        });
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan catatan");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
      setSavingNoteMap((prev) => ({
        ...prev,
        [cartItemId]: false,
      }));
    }
  };

  const itemCount = cart?.totalItems || 0;
  const selectedCount = cart?.selectedCount || 0;
  const itemCountLabel = itemCount > 99 ? "99+" : String(itemCount);
  const selectedCountLabel = selectedCount > 99 ? "99+" : String(selectedCount);

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
            {itemCountLabel}
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
                <h2 className="text-lg font-bold text-white">Cart ({itemCountLabel})</h2>
              </div>
              {cart && (
                <div className="text-right mr-2">
                  <p className="text-[11px] text-slate-500">Saldo</p>
                  <p className="text-sm font-semibold text-emerald-400">{cart.credits.toLocaleString()} Cr</p>
                </div>
              )}
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
                <>
                  {cart.items.map((cartItem) => {
                    const isMaxStockReached = cartItem.quantity >= cartItem.item.stock;

                    return (
                      <div key={cartItem.id} className="space-y-2">
                        {isMaxStockReached && (
                          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5" />
                              <p className="text-amber-300 text-xs font-bold">Batas stok untuk {cartItem.item.name} sudah tercapai.</p>
                            </div>
                          </div>
                        )}

                        <Card className="p-3">
                          <div className="flex gap-3">
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={cartItem.isSelected}
                            disabled={updatingId === cartItem.id}
                            onChange={(e) => updateSelection(cartItem.id, e.target.checked)}
                            aria-label={`Pilih ${cartItem.item.name} untuk checkout`}
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-purple-500 focus:ring-purple-500/40"
                          />
                        </div>

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

                          <div className="mt-2">
                            <textarea
                              value={noteDrafts[cartItem.id] ?? ""}
                              onChange={(e) => {
                                setNoteDrafts((prev) => ({
                                  ...prev,
                                  [cartItem.id]: e.target.value,
                                }));
                                setDirtyNoteMap((prev) => ({
                                  ...prev,
                                  [cartItem.id]: true,
                                }));
                              }}
                              onFocus={() => setActiveNoteId(cartItem.id)}
                              onBlur={() => {
                                setActiveNoteId(null);
                                saveNote(cartItem.id, cartItem.requestNote);
                              }}
                              placeholder="Catatan request produk (opsional)"
                              aria-label={`Catatan untuk ${cartItem.item.name}`}
                              className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                              rows={2}
                              disabled={updatingId === cartItem.id}
                            />
                          </div>

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
                                aria-label="Kurangi jumlah"
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
                                aria-label="Tambah jumlah"
                                title={cartItem.quantity >= cartItem.item.stock ? "Jumlah maksimum sesuai stok" : "Tambah jumlah"}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(cartItem.id)}
                              disabled={updatingId === cartItem.id}
                              className="p-1 text-red-400 hover:text-red-300 transition disabled:opacity-50"
                              aria-label="Hapus item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="p-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {cart.selectedTotal.toLocaleString()} Credits
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Sisa setelah checkout</span>
                  <span className={`${cart.credits - cart.selectedTotal >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {(cart.credits - cart.selectedTotal).toLocaleString()} Cr
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Item dipilih: {selectedCountLabel}</p>
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
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleCheckout}
                    isLoading={isCheckingOut}
                    disabled={isLoading || isCheckingOut || selectedCount === 0}
                  >
                    Ajukan Transaksi
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
