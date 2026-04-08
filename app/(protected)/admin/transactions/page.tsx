import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { TransactionAdminActions } from "@/components/shop/transaction-admin-actions";
import { ArrowLeft, Receipt, Clock3, CheckCircle2, XCircle, Coins, User } from "lucide-react";
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

export default async function AdminTransactionsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const transactions = await prisma.transaction.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
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
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Receipt className="w-8 h-8 text-cyan-400" />
                Kendali Transaksi
              </h1>
              <p className="text-slate-400 mt-1">Review pembelian user, lalu setujui atau tandai gagal.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-300">{stats.pending}</div>
            <div className="text-sm text-slate-400">Pending</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-300">{stats.success}</div>
            <div className="text-sm text-slate-400">Sukses</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-300">{stats.failed}</div>
            <div className="text-sm text-slate-400">Gagal</div>
          </Card>
        </div>

        {transactions.length === 0 ? (
          <Card className="p-10 text-center">
            <Receipt className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">Belum ada transaksi masuk</h2>
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
                    <div className="text-sm text-slate-400 space-y-1">
                      <p className="inline-flex items-center gap-1"><User className="w-4 h-4" />{tx.user.name || "Unknown"} ({tx.user.email})</p>
                      <p className="inline-flex items-center gap-1"><Clock3 className="w-4 h-4" />{new Date(tx.createdAt).toLocaleString("id-ID")}</p>
                      <p className="inline-flex items-center gap-1"><Coins className="w-4 h-4" />{tx.totalAmount.toLocaleString()} Credits • {tx.itemCount} item</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-right">
                    <TransactionAdminActions transactionId={tx.id} status={tx.status} />
                    {tx.status === "SUCCESS" && (
                      <p className="text-emerald-300 text-xs inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Disetujui</p>
                    )}
                    {tx.status === "FAILED" && (
                      <p className="text-red-300 text-xs inline-flex items-center gap-1"><XCircle className="w-4 h-4" />Ditandai gagal</p>
                    )}
                    {tx.processor?.name && (
                      <p className="text-slate-500 text-xs">Diproses: {tx.processor.name}</p>
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
      </div>
    </div>
  );
}
