"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddShopItemForm } from "./add-shop-item-form";

export function AddShopItemButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Tambah Item
      </Button>

      {showForm && <AddShopItemForm onClose={() => setShowForm(false)} />}
    </>
  );
}
