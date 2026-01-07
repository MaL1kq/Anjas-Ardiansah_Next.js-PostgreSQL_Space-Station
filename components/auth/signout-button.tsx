"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-slate-400 hover:text-white"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Keluar
    </Button>
  );
}
