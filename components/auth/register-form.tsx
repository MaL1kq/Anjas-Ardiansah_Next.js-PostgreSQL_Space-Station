"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Input
        id="name"
        type="text"
        label="Nama Lengkap"
        placeholder="Commander John"
        icon={<User className="w-4 h-4" />}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="astronaut@space.com"
        icon={<Mail className="w-4 h-4" />}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        icon={<Lock className="w-4 h-4" />}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <Input
        id="confirmPassword"
        type="password"
        label="Konfirmasi Password"
        placeholder="••••••••"
        icon={<Lock className="w-4 h-4" />}
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData({ ...formData, confirmPassword: e.target.value })
        }
        required
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        {isLoading ? "Mendaftar..." : "Daftar sebagai Astronaut"}
      </Button>
    </form>
  );
}
