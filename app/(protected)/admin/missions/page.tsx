import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AddMissionButton } from "@/components/missions/add-mission-button";
import { MissionAdminActions } from "@/components/missions/mission-admin-actions";
import { 
  Rocket, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Zap,
  Users,
  Target
} from "lucide-react";
import Link from "next/link";

const difficultyColors = {
  EASY: "bg-green-500/20 text-green-400 border-green-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  HARD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  EXTREME: "bg-red-500/20 text-red-400 border-red-500/30",
};

const difficultyLabels = {
  EASY: "Mudah",
  MEDIUM: "Sedang",
  HARD: "Sulit",
  EXTREME: "Ekstrem",
};

export default async function AdminMissionsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const missions = await prisma.mission.findMany({
    include: {
      _count: {
        select: { userMissions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: missions.length,
    easy: missions.filter((m) => m.difficulty === "EASY").length,
    medium: missions.filter((m) => m.difficulty === "MEDIUM").length,
    hard: missions.filter((m) => m.difficulty === "HARD").length,
    extreme: missions.filter((m) => m.difficulty === "EXTREME").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Rocket className="w-8 h-8 text-purple-400" />
                Kelola Misi
              </h1>
              <p className="text-slate-400 mt-1">
                Tambah, edit, dan kelola misi untuk para astronaut
              </p>
            </div>
          </div>
          <AddMissionButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Misi</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="w-6 h-6 rounded-full bg-green-500/20 mx-auto mb-2 flex items-center justify-center">
              <span className="text-xs text-green-400 font-bold">E</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.easy}</div>
            <div className="text-sm text-slate-400">Mudah</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 mx-auto mb-2 flex items-center justify-center">
              <span className="text-xs text-yellow-400 font-bold">M</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.medium}</div>
            <div className="text-sm text-slate-400">Sedang</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 mx-auto mb-2 flex items-center justify-center">
              <span className="text-xs text-orange-400 font-bold">H</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.hard}</div>
            <div className="text-sm text-slate-400">Sulit</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="w-6 h-6 rounded-full bg-red-500/20 mx-auto mb-2 flex items-center justify-center">
              <span className="text-xs text-red-400 font-bold">X</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.extreme}</div>
            <div className="text-sm text-slate-400">Ekstrem</div>
          </Card>
        </div>

        {/* Missions List */}
        {missions.length === 0 ? (
          <Card className="p-12 text-center">
            <Rocket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Belum Ada Misi
            </h2>
            <p className="text-slate-400 mb-6">
              Mulai buat misi pertama untuk para astronaut!
            </p>
            <AddMissionButton />
          </Card>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => (
              <Card key={mission.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {mission.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          difficultyColors[mission.difficulty]
                        }`}
                      >
                        {difficultyLabels[mission.difficulty]}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                      {mission.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{mission.planet}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{mission.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-purple-400">
                        <Zap className="w-4 h-4" />
                        <span>+{mission.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{mission._count.userMissions} peserta</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <MissionAdminActions mission={mission} />
                    <div className="text-sm text-slate-500">
                      Level min: {mission.minLevel}
                    </div>
                    <div className="text-xs text-slate-600">
                      ID: {mission.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
