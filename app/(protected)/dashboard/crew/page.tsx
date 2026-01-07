import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/signout-button";
import SpaceBackground from "@/components/space-background";
import { prisma } from "@/lib/prisma";
import { AddCrewButton } from "@/components/crew/add-crew-button";
import { CrewAdminActions } from "@/components/crew/crew-admin-actions";
import {
  Rocket,
  Users,
  Shield,
  Star,
  Mail,
  Calendar,
  Award,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

const roleConfig = {
  ADMIN: {
    label: "Commander",
    icon: Shield,
    gradient: "from-yellow-500 to-orange-500",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/30",
    color: "text-yellow-400",
  },
  ASTRONAUT: {
    label: "Pilot",
    icon: Rocket,
    gradient: "from-purple-500 to-blue-500",
    bg: "bg-purple-500/20",
    border: "border-purple-500/30",
    color: "text-purple-400",
  },
  USER: {
    label: "Space Cadet",
    icon: Star,
    gradient: "from-slate-400 to-slate-500",
    bg: "bg-slate-500/20",
    border: "border-slate-500/30",
    color: "text-slate-400",
  },
};

// Data statistik kru (dummy)
const crewStats = {
  totalMissions: 156,
  avgSuccessRate: 94,
  totalHoursInSpace: 2847,
};

export default async function CrewPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Ambil semua user dari database
  const crewMembers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

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
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/dashboard/missions" className="text-slate-400 hover:text-white transition">
              Misi
            </Link>
            <Link href="/dashboard/crew" className="text-white font-medium">
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Kru Space Station
            </h1>
            <p className="text-slate-400">
              Kenali anggota tim yang menjelajahi luar angkasa bersama Anda
            </p>
          </div>
          {session.user.role === "ADMIN" && (
            <AddCrewButton />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Kru</p>
              <p className="text-2xl font-bold text-white">{crewMembers.length}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Misi</p>
              <p className="text-2xl font-bold text-white">{crewStats.totalMissions}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">{crewStats.avgSuccessRate}%</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Jam di Orbit</p>
              <p className="text-2xl font-bold text-white">{crewStats.totalHoursInSpace.toLocaleString()}</p>
            </div>
          </Card>
        </div>

        {/* Crew Grid */}
        <h2 className="text-xl font-bold text-white mb-4">Anggota Kru</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crewMembers.map((member) => {
            const role = roleConfig[member.role as keyof typeof roleConfig] || roleConfig.USER;
            const RoleIcon = role.icon;
            const joinDate = new Date(member.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <Card
                key={member.id}
                className="p-5 hover:border-purple-500/50 transition-all duration-300"
              >
                {/* Avatar & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white text-xl font-bold`}>
                    {member.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${role.bg} ${role.border} border ${role.color}`}>
                      <RoleIcon className="w-3 h-3" />
                      {role.label}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Bergabung {joinDate}</span>
                  </div>
                </div>

                {/* Stats (dummy) */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-white">{Math.floor(Math.random() * 50) + 10}</p>
                    <p className="text-xs text-slate-400">Misi</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-white">{Math.floor(Math.random() * 500) + 100}h</p>
                    <p className="text-xs text-slate-400">Di Orbit</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-white">{Math.floor(Math.random() * 30) + 70}%</p>
                    <p className="text-xs text-slate-400">Sukses</p>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-4 flex gap-2">
                  {/* Tombol Pesan hanya muncul jika bukan akun sendiri */}
                  {member.id !== session.user.id && (
                    <Link href={`/dashboard/messages/${member.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Pesan
                      </Button>
                    </Link>
                  )}
                  <Link href={`/dashboard/crew/${member.id}`} className={member.id !== session.user.id ? "flex-1" : "w-full"}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Lihat Profil
                    </Button>
                  </Link>
                </div>

                {/* Admin Actions - hanya muncul jika admin dan bukan akun sendiri */}
                {session.user.role === "ADMIN" && member.id !== session.user.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                    <CrewAdminActions user={member} currentUserId={session.user.id} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {crewMembers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Kru</h3>
            <p className="text-slate-400 mb-4">
              Space Station masih kosong. Undang astronaut untuk bergabung!
            </p>
            <Button>Undang Kru</Button>
          </Card>
        )}
      </main>
    </div>
  );
}
