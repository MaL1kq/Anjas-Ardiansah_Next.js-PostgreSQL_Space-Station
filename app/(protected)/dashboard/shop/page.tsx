import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";
import SpaceBackground from "@/components/space-background";
import { prisma } from "@/lib/prisma";
import { AddShopItemButton } from "@/components/shop/add-shop-item-button";
import { ShopAdminActions } from "@/components/shop/shop-admin-actions";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { CartPanel } from "@/components/shop/cart-panel";
import {
  Rocket,
  Package,
  Star,
  Shield,
  Wrench,
  Utensils,
  Car,
  Boxes,
  Sword,
  Zap,
} from "lucide-react";
import Link from "next/link";

const categoryConfig: Record<string, { label: string; icon: typeof Package; color: string; bg: string }> = {
  WEAPON: { label: "Senjata", icon: Sword, color: "text-red-400", bg: "bg-red-500/20" },
  ARMOR: { label: "Armor", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/20" },
  TOOL: { label: "Alat", icon: Wrench, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  FOOD: { label: "Makanan", icon: Utensils, color: "text-green-400", bg: "bg-green-500/20" },
  VEHICLE: { label: "Kendaraan", icon: Car, color: "text-purple-400", bg: "bg-purple-500/20" },
  MATERIAL: { label: "Material", icon: Boxes, color: "text-orange-400", bg: "bg-orange-500/20" },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const items = await prisma.shopItem.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
  });

  const totalItems = items.length;
  const categories = [...new Set(items.map((i) => i.category))].length;

  return (
    <div className="min-h-screen">
      <SpaceBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Space Station</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/dashboard/missions" className="text-slate-400 hover:text-white transition">
              Misi
            </Link>
            <Link href="/dashboard/crew" className="text-slate-400 hover:text-white transition">
              Kru
            </Link>
            <Link href="/dashboard/messages" className="text-slate-400 hover:text-white transition">
              Pesan
            </Link>
            <Link href="/dashboard/shop" className="text-white font-medium">
              Toko
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="text-purple-400 hover:text-purple-300 transition">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-slate-400">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-emerald-400" />
              Toko Angkasa
            </h1>
            <p className="text-slate-400">
              Beli perlengkapan untuk misi-misi luar angkasa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CartPanel />
            {session.user.role === "ADMIN" && <AddShopItemButton />}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Item</p>
              <p className="text-2xl font-bold text-white">{totalItems}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Kategori</p>
              <p className="text-2xl font-bold text-white">{categories}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Status</p>
              <p className="text-2xl font-bold text-white">Aktif</p>
            </div>
          </Card>
        </div>

        {/* Item Grid */}
        <h2 className="text-xl font-bold text-white mb-4">Daftar Perlengkapan</h2>

        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Toko Masih Kosong</h3>
            <p className="text-slate-400">
              {session.user.role === "ADMIN"
                ? "Tambah item baru untuk memulai toko angkasa!"
                : "Tunggu Commander menambahkan perlengkapan baru."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const cat = categoryConfig[item.category] || categoryConfig.TOOL;
              const CatIcon = cat.icon;

              return (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:border-purple-500/50 transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-slate-800/50 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-slate-700" />
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs ${cat.bg} ${cat.color} flex items-center gap-1 border border-slate-700/50 backdrop-blur-sm`}>
                      <CatIcon className="w-3 h-3" />
                      {cat.label}
                    </div>
                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs bg-slate-900/80 text-slate-300 backdrop-blur-sm border border-slate-700/50">
                      Stok: {item.stock}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">{item.name}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{item.description}</p>

                    {/* Price & Cart */}
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-lg">
                        {item.price.toLocaleString()} <span className="text-xs text-emerald-500">Credits</span>
                      </span>
                    </div>

                    <div className="mt-3">
                      <AddToCartButton itemId={item.id} stock={item.stock} />
                    </div>

                    {/* Admin Actions */}
                    {session.user.role === "ADMIN" && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-500">ID: {item.id.slice(0, 8)}...</span>
                        <ShopAdminActions
                          item={{
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            image: item.image,
                            price: item.price,
                            category: item.category,
                            stock: item.stock,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
