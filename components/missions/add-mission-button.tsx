"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddMissionForm } from "./add-mission-form";

export function AddMissionButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Tambah Misi
      </Button>
      
      {showForm && <AddMissionForm onClose={() => setShowForm(false)} />}
    </>
  );
}
