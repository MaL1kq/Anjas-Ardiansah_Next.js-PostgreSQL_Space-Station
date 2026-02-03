import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";
import SpaceBackground from "@/components/space-background";
import { prisma } from "@/lib/prisma";
import {
  Rocket,
  Users,
  Shield,
  Activity,
  UserPlus,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  // Middleware sudah memastikan user login dan adalah admin
  const session = (await auth())!;

  // Get stats
  const totalUsers = await prisma.user.count();
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const astronautCount = await prisma.user.count({ where: { role: "ASTRONAUT" } });
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const stats = [
    { label: "Total Astronaut", value: totalUsers, icon: Users, color: "text-blue-400" },
    { label: "Commander", value: adminCount, icon: Shield, color: "text-yellow-400" },
    { label: "Pilot", value: astronautCount, icon: Rocket, color: "text-purple-400" },
    { label: "Aktif Hari Ini", value: Math.floor(totalUsers * 0.7), icon: Activity, color: "text-green-400" },
  ];

  return (
    <div className="min-h-screen">
      <SpaceBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Admin Panel</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/admin" className="text-white font-medium">
              Admin
            </Link>
            <Link href="/admin/missions" className="text-slate-400 hover:text-white transition">
              Misi
            </Link>
            <Link href="/admin/users" className="text-slate-400 hover:text-white transition">
              Users
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{session.user.name}</p>
              <p className="text-xs text-yellow-400">Commander</p>
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
            Command Center
          </h1>
          <p className="text-slate-400">
            Kelola semua astronaut dan aktivitas space station
          </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Astronaut Terbaru</h2>
              <Link href="/admin/users" className="text-purple-400 text-sm hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : user.role === "ASTRONAUT"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Aksi Admin</h2>
            <div className="space-y-3">
              <Link href="/admin/users" className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition text-left">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Tambah Astronaut</p>
                  <p className="text-slate-400 text-sm">Daftarkan anggota kru baru</p>
                </div>
              </Link>
              <Link href="/admin/missions" className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition text-left">
                <Settings className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Kelola Misi</p>
                  <p className="text-slate-400 text-sm">Tambah dan edit misi untuk kru</p>
                </div>
              </Link>
              <Link href="/dashboard/crew" className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition text-left">
                <Activity className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Lihat Kru</p>
                  <p className="text-slate-400 text-sm">Pantau anggota kru aktif</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
