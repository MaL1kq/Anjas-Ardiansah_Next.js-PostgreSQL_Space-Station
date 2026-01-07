import Link from "next/link";
import { Button } from "@/components/ui/button";
import SpaceBackground from "@/components/space-background";
import { Rocket, Star, Users, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SpaceBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Space Station</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              Multi-User Authentication System
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Selamat Datang di{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Space Station
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Portal autentikasi modern dengan tema luar angkasa. Dibangun dengan
            Next.js 16, NextAuth v5, Prisma, dan PostgreSQL.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Mulai Petualangan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sudah Punya Akun
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Fitur Utama
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Multi-User System
              </h3>
              <p className="text-slate-400">
                Sistem autentikasi lengkap dengan registrasi, login, dan
                manajemen sesi pengguna.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Role-Based Access
              </h3>
              <p className="text-slate-400">
                Kontrol akses berdasarkan role: User, Astronaut, dan Admin
                dengan izin berbeda.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Modern Stack
              </h3>
              <p className="text-slate-400">
                Dibangun dengan Next.js 16, NextAuth v5, Prisma ORM, dan
                PostgreSQL database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-slate-500 text-sm">
            © 2026 Space Station. Built with Next.js & NextAuth
          </p>
        </div>
      </footer>
    </div>
  );
}
