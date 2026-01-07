import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Rocket } from "lucide-react";
import SpaceBackground from "@/components/space-background";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SpaceBackground />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Space Station</h1>
          <p className="text-slate-400 mt-1">Bergabunglah dengan Misi Kami</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Astronaut Baru</CardTitle>
            <CardDescription>
              Buat akun untuk memulai petualangan luar angkasa
            </CardDescription>
          </CardHeader>

          <CardContent>
            <RegisterForm />
          </CardContent>

          <CardFooter>
            <p className="text-sm text-slate-400 text-center w-full">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-slate-600 mt-8">
          © 2026 Space Station. All rights reserved.
        </p>
      </div>
    </div>
  );
}
