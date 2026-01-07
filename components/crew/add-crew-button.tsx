"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { AddCrewForm } from "./add-crew-form";

export function AddCrewButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)} className="gap-2">
        <UserPlus className="w-4 h-4" />
        Tambah Kru
      </Button>
      
      {showForm && <AddCrewForm onClose={() => setShowForm(false)} />}
    </>
  );
}
