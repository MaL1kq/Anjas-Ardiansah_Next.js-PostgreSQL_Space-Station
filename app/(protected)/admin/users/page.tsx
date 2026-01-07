import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AddCrewButton } from "@/components/crew/add-crew-button";
import { CrewAdminActions } from "@/components/crew/crew-admin-actions";
import {
  Users,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Rocket,
  Star,
} from "lucide-react";
import Link from "next/link";

const roleConfig = {
  ADMIN: {
    label: "Commander",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  ASTRONAUT: {
    label: "Pilot",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  USER: {
    label: "Space Cadet",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
};

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      xp: true,
      level: true,
      createdAt: true,
      _count: {
        select: { userMissions: true },
      },
    },
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    pilots: users.filter((u) => u.role === "ASTRONAUT").length,
    cadets: users.filter((u) => u.role === "USER").length,
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
                <Users className="w-8 h-8 text-blue-400" />
                Kelola Kru
              </h1>
              <p className="text-slate-400 mt-1">
                Tambah, edit, dan kelola anggota kru
              </p>
            </div>
          </div>
          <AddCrewButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Kru</div>
          </Card>
          <Card className="p-4 text-center">
            <Shield className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.admins}</div>
            <div className="text-sm text-slate-400">Commander</div>
          </Card>
          <Card className="p-4 text-center">
            <Rocket className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.pilots}</div>
            <div className="text-sm text-slate-400">Pilot</div>
          </Card>
          <Card className="p-4 text-center">
            <Star className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.cadets}</div>
            <div className="text-sm text-slate-400">Space Cadet</div>
          </Card>
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Belum Ada Kru
            </h2>
            <p className="text-slate-400 mb-6">
              Mulai rekrut anggota kru baru!
            </p>
            <AddCrewButton />
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const role = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.USER;
              const joinDate = new Date(user.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <Card key={user.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {user.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${role.color}`}>
                            {role.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {joinDate}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{user.xp}</div>
                        <div className="text-xs text-slate-400">XP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">Lv.{user.level}</div>
                        <div className="text-xs text-slate-400">Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{user._count.userMissions}</div>
                        <div className="text-xs text-slate-400">Misi</div>
                      </div>
                      <CrewAdminActions user={user} currentUserId={session.user.id} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
