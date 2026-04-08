"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TransactionAdminActionsProps {
  transactionId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
}

export function TransactionAdminActions({ transactionId, status }: TransactionAdminActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status !== "PENDING") {
    return null;
  }

  const updateStatus = async (nextStatus: "SUCCESS" | "FAILED") => {
    const note = prompt(
      nextStatus === "SUCCESS"
        ? "Catatan admin (opsional):"
        : "Alasan gagal/ditolak (opsional):"
    ) ?? "";

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          adminNote: note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal mengupdate status transaksi");
        return;
      }

      alert(nextStatus === "SUCCESS" ? "Transaksi disetujui" : "Transaksi ditandai gagal");
      router.refresh();
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="px-3"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        onClick={() => updateStatus("SUCCESS")}
      >
        Setujui
      </Button>
      <Button
        size="sm"
        variant="danger"
        className="px-3"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        onClick={() => updateStatus("FAILED")}
      >
        Gagalkan
      </Button>
    </div>
  );
}
