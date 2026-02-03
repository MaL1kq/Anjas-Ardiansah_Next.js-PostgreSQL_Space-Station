import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";
import SpaceBackground from "@/components/space-background";
import {
  Rocket,
  User,
  Shield,
  Star,
  Zap,
  Globe,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  // Middleware sudah memastikan user login
  const session = (await auth())!;

  const stats = [
    { label: "Misi Selesai", value: "24", icon: Rocket, color: "text-purple-400" },
    { label: "Jarak Tempuh", value: "1.2M km", icon: Globe, color: "text-blue-400" },
    { label: "Waktu di Orbit", value: "142 jam", icon: Calendar, color: "text-green-400" },
    { label: "Rank", value: getRankLabel(session.user.role), icon: Star, color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen">
      <SpaceBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Space Station</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-white font-medium">
              Dashboard
            </Link>
            <Link href="/dashboard/missions" className="text-slate-400 hover:text-white transition">
              Misi
            </Link>
            <Link href="/dashboard/crew" className="text-slate-400 hover:text-white transition">
              Kru
            </Link>
            <Link href="/dashboard/messages" className="text-slate-400 hover:text-white transition">
              Pesan
            </Link>
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="text-purple-400 hover:text-purple-300 transition">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-slate-400">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Selamat Datang, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-400">
            Berikut adalah ringkasan aktivitas luar angkasa Anda
          </p>
        </div>

        {/* Role Badge */}
        <div className="mb-8">
          <RoleBadge role={session.user.role} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-white mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/missions">
            <Card className="p-6 hover:border-purple-500/50 transition-colors cursor-pointer group h-full">
              <Rocket className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Mulai Misi Baru</h3>
              <p className="text-slate-400 text-sm">
                Jelajahi galaksi dan selesaikan misi untuk mendapatkan XP
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/profile">
            <Card className="p-6 hover:border-blue-500/50 transition-colors cursor-pointer group h-full">
              <User className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Profil Astronaut</h3>
              <p className="text-slate-400 text-sm">
                Lihat dan edit informasi profil Anda
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/crew">
            <Card className="p-6 hover:border-green-500/50 transition-colors cursor-pointer group h-full">
              <Zap className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Lihat Kru</h3>
              <p className="text-slate-400 text-sm">
                Lihat anggota kru dan statistik mereka
              </p>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}

function getRankLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "Commander";
    case "ASTRONAUT":
      return "Pilot";
    default:
      return "Cadet";
  }
}

function RoleBadge({ role }: { role: string }) {
  const roleConfig = {
    ADMIN: {
      label: "Commander",
      icon: Shield,
      gradient: "from-yellow-500 to-orange-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
    },
    ASTRONAUT: {
      label: "Pilot",
      icon: Rocket,
      gradient: "from-purple-500 to-blue-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
    },
    USER: {
      label: "Space Cadet",
      icon: Star,
      gradient: "from-slate-400 to-slate-500",
      bg: "bg-slate-500/10",
      border: "border-slate-500/30",
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} border ${config.border}`}
    >
      <Icon className={`w-4 h-4 bg-gradient-to-r ${config.gradient} bg-clip-text`} />
      <span
        className={`text-sm font-medium bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
      >
        {config.label}
      </span>
    </div>
  );
}
