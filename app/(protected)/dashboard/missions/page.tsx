import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";
import SpaceBackground from "@/components/space-background";
import { prisma } from "@/lib/prisma";
import { MissionActions } from "@/components/missions/mission-actions";
import { MissionAdminActions } from "@/components/missions/mission-admin-actions";
import { AddMissionButton } from "@/components/missions/add-mission-button";
import {
  Rocket,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Trophy,
  Target,
  Zap,
  Globe,
} from "lucide-react";
import Link from "next/link";

const statusConfig = {
  completed: {
    label: "Selesai",
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/30",
  },
  "in-progress": {
    label: "Berlangsung",
    icon: Play,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
  },
  available: {
    label: "Tersedia",
    icon: Rocket,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/30",
  },
  locked: {
    label: "Terkunci",
    icon: Target,
    color: "text-slate-400",
    bg: "bg-slate-500/20",
    border: "border-slate-500/30",
  },
  failed: {
    label: "Gagal",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
  },
};

const difficultyConfig = {
  EASY: { label: "Easy", color: "text-green-400" },
  MEDIUM: { label: "Medium", color: "text-yellow-400" },
  HARD: { label: "Hard", color: "text-orange-400" },
  EXTREME: { label: "Extreme", color: "text-red-400" },
};

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MissionsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Ambil semua misi dari database
  const missions = await prisma.mission.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      userMissions: {
        where: { userId: session.user.id },
      },
    },
  });

  // Transform untuk UI - gunakan status global isCompleted
  const transformedMissions = missions.map((mission) => {
    const userMission = mission.userMissions[0];
    let status = "available";

    // Prioritaskan status global isCompleted
    if (mission.isCompleted) {
      status = "completed";
    } else if (userMission) {
      if (userMission.status === "FAILED") status = "failed";
      else if (userMission.status === "IN_PROGRESS") status = "in-progress";
    }

    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      planet: mission.planet,
      duration: mission.duration,
      difficulty: mission.difficulty,
      xp: mission.xpReward,
      minLevel: mission.minLevel,
      status,
      xpEarned: userMission?.xpEarned || 0,
      completedBy: mission.completedBy,
      isGloballyCompleted: mission.isCompleted,
    };
  });

  const completedMissions = transformedMissions.filter((m) => m.status === "completed").length;
  const totalXP = transformedMissions
    .filter((m) => m.status === "completed")
    .reduce((acc, m) => acc + m.xp, 0);

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
            <Link href="/dashboard/missions" className="text-white font-medium">
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-purple-400" />
              Pusat Misi
            </h1>
            <p className="text-slate-400">
              Pilih dan selesaikan misi untuk mendapatkan XP dan rewards
            </p>
          </div>
          {session.user.role === "ADMIN" && <AddMissionButton />}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Misi Selesai</p>
              <p className="text-2xl font-bold text-white">{completedMissions}/{transformedMissions.length}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total XP</p>
              <p className="text-2xl font-bold text-white">{totalXP.toLocaleString()}</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Rank</p>
              <p className="text-2xl font-bold text-white">Space Ranger</p>
            </div>
          </Card>
        </div>

        {/* Mission List */}
        <h2 className="text-xl font-bold text-white mb-4">Daftar Misi</h2>
        
        {transformedMissions.length === 0 ? (
          <Card className="p-12 text-center">
            <Rocket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Misi</h3>
            <p className="text-slate-400">
              {session.user.role === "ADMIN" 
                ? "Buat misi baru di Admin Panel untuk memulai petualangan!"
                : "Tunggu Commander menambahkan misi baru."}
            </p>
            {session.user.role === "ADMIN" && (
              <Link href="/admin/missions" className="inline-block mt-4">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  Tambah Misi
                </button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transformedMissions.map((mission) => {
              const status = statusConfig[mission.status as keyof typeof statusConfig] || statusConfig.available;
              const StatusIcon = status.icon;
              const difficulty = difficultyConfig[mission.difficulty as keyof typeof difficultyConfig] || difficultyConfig.MEDIUM;

              return (
                <Card
                  key={mission.id}
                  className={`p-5 hover:border-purple-500/50 transition-all duration-300 ${
                    mission.status === "locked" ? "opacity-60" : ""
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2 py-1 rounded-full text-xs ${status.bg} ${status.border} border ${status.color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </div>
                    <span className={`text-xs font-medium ${difficulty.color}`}>
                      {difficulty.label}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-white mb-2">{mission.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{mission.description}</p>

                  {/* Info */}
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {mission.planet}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {mission.duration}
                    </div>
                  </div>

                  {/* XP & Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{mission.xp} XP</span>
                    </div>

                    {mission.status === "completed" ? (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Selesai
                      </span>
                    ) : mission.status === "locked" ? (
                      <span className="text-slate-500 text-sm">🔒 Level {mission.minLevel}</span>
                    ) : (
                      <MissionActions missionId={mission.id} status={mission.status} />
                    )}
                  </div>

                  {/* Admin Actions */}
                  {session.user.role === "ADMIN" && (
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs text-slate-500">ID: {mission.id.slice(0, 8)}...</span>
                      <MissionAdminActions
                        mission={{
                          id: mission.id,
                          title: mission.title,
                          description: mission.description,
                          planet: mission.planet,
                          duration: mission.duration,
                          difficulty: mission.difficulty as "EASY" | "MEDIUM" | "HARD" | "EXTREME",
                          xpReward: mission.xp,
                          minLevel: mission.minLevel,
                        }}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
