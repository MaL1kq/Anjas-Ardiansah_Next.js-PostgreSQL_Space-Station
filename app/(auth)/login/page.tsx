import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
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

export default function LoginPage() {
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
          <p className="text-slate-400 mt-1">Portal Astronaut</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selamat Datang Kembali</CardTitle>
            <CardDescription>
              Masuk untuk mengakses dashboard luar angkasa
            </CardDescription>
          </CardHeader>

          <CardContent>
            <LoginForm />
          </CardContent>

          <CardFooter>
            <p className="text-sm text-slate-400 text-center w-full">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Daftar sekarang
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
