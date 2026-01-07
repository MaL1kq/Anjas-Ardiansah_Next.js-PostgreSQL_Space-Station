"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface MissionActionsProps {
  missionId: string;
  status: string;
}

export function MissionActions({ missionId, status: initialStatus }: MissionActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const handleAction = async (action: "start" | "complete" | "retry") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/missions/${missionId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Cek apakah response adalah JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Jika bukan JSON (mungkin redirect ke login), refresh halaman
        alert("Session expired. Silakan login ulang.");
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Terjadi kesalahan");
      } else {
        alert(data.message);
        
        // Update status lokal berdasarkan action
        if (action === "start") {
          setCurrentStatus("in-progress");
        } else if (action === "complete") {
          setCurrentStatus("completed");
        } else if (action === "retry") {
          setCurrentStatus("in-progress");
        }
        
        // Jika sudah dimulai sebelumnya, update status
        if (data.alreadyStarted) {
          setCurrentStatus("in-progress");
        }
        
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan. Coba refresh halaman.");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === "available") {
    return (
      <Button size="sm" onClick={() => handleAction("start")} disabled={isLoading}>
        {isLoading ? "Loading..." : "Mulai Misi"}
      </Button>
    );
  }

  if (currentStatus === "in-progress") {
    return (
      <Button size="sm" variant="secondary" onClick={() => handleAction("complete")} disabled={isLoading}>
        {isLoading ? "Loading..." : "Selesaikan"}
      </Button>
    );
  }

  if (currentStatus === "failed") {
    return (
      <Button size="sm" variant="danger" onClick={() => handleAction("retry")} disabled={isLoading}>
        {isLoading ? "Loading..." : "Ulangi"}
      </Button>
    );
  }

  return null;
}
