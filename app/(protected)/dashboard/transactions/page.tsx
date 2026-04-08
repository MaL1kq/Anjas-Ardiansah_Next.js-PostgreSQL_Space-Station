import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";
import SpaceBackground from "@/components/space-background";
import { prisma } from "@/lib/prisma";
import { Rocket, Receipt, Clock3, CheckCircle2, XCircle, Coins } from "lucide-react";
import Link from "next/link";

const statusStyle = {
  PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  SUCCESS: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  FAILED: "bg-red-500/20 text-red-300 border-red-500/40",
} as const;

const statusLabel = {
  PENDING: "Pending",
  SUCCESS: "Sukses",
  FAILED: "Gagal",
} as const;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TransactionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: {
      processor: {
        select: {
          name: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === "PENDING").length,
    success: transactions.filter((t) => t.status === "SUCCESS").length,
    failed: transactions.filter((t) => t.status === "FAILED").length,
  };

  return (
    <div className="min-h-screen">
      <SpaceBackground />

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Space Station</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">Dashboard</Link>
            <Link href="/dashboard/missions" className="text-slate-400 hover:text-white transition">Misi</Link>
            <Link href="/dashboard/crew" className="text-slate-400 hover:text-white transition">Kru</Link>
            <Link href="/dashboard/messages" className="text-slate-400 hover:text-white transition">Pesan</Link>
            <Link href="/dashboard/shop" className="text-slate-400 hover:text-white transition">Toko</Link>
            <Link href="/dashboard/transactions" className="text-white font-medium">Transaksi</Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="text-purple-400 hover:text-purple-300 transition">Admin Panel</Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-slate-400">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Receipt className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Riwayat Transaksi</h1>
            <p className="text-slate-400">Pantau status pembelianmu: pending, sukses, atau gagal.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-slate-400 text-sm">Total Transaksi</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-amber-300 text-sm">Pending</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-emerald-300 text-sm">Sukses</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.success}</p>
          </Card>
          <Card className="p-4">
            <p className="text-red-300 text-sm">Gagal</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.failed}</p>
          </Card>
        </div>

        {transactions.length === 0 ? (
          <Card className="p-10 text-center">
            <Receipt className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">Belum ada transaksi</h2>
            <p className="text-slate-400 mt-2">Ayo checkout barang dari toko untuk membuat transaksi pertamamu.</p>
            <Link href="/dashboard/shop" className="inline-block mt-5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition">
              Ke Toko
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <Card key={tx.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs border ${statusStyle[tx.status]}`}>
                        {statusLabel[tx.status]}
                      </span>
                      <span className="text-slate-500 text-xs">{tx.code}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="inline-flex items-center gap-1"><Clock3 className="w-4 h-4" />{new Date(tx.createdAt).toLocaleString("id-ID")}</span>
                      <span className="inline-flex items-center gap-1"><Coins className="w-4 h-4" />{tx.totalAmount.toLocaleString()} Credits</span>
                      <span>{tx.itemCount} item</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {tx.status === "SUCCESS" && (
                      <span className="inline-flex items-center gap-1 text-emerald-300 text-sm"><CheckCircle2 className="w-4 h-4" />Disetujui Admin</span>
                    )}
                    {tx.status === "FAILED" && (
                      <span className="inline-flex items-center gap-1 text-red-300 text-sm"><XCircle className="w-4 h-4" />Ditolak/Gagal</span>
                    )}
                    {tx.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 text-amber-300 text-sm"><Clock3 className="w-4 h-4" />Menunggu Verifikasi</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {tx.items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-white text-sm font-medium">{item.itemName}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{item.quantity} x {item.unitPrice.toLocaleString()} Credits</p>
                          {item.requestNote && (
                            <p className="text-cyan-300 text-xs mt-1">Request: {item.requestNote}</p>
                          )}
                        </div>
                        <p className="text-emerald-300 text-sm font-medium">{item.subtotal.toLocaleString()} Cr</p>
                      </div>
                    </div>
                  ))}
                </div>

                {(tx.customerNote || tx.adminNote) && (
                  <div className="mt-3 text-xs space-y-1">
                    {tx.customerNote && <p className="text-slate-300">Catatan pembeli: {tx.customerNote}</p>}
                    {tx.adminNote && <p className="text-amber-300">Catatan admin: {tx.adminNote}</p>}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
