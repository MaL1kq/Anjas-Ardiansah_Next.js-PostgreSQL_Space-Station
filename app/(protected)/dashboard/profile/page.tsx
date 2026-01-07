import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";
import SpaceBackground from "@/components/space-background";
import { ProfileForm } from "@/components/profile/profile-form";
import {
  Rocket,
  User,
  Shield,
  Star,
  Trophy,
  Target,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get user data with missions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userMissions: {
        include: {
          mission: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const completedMissions = user.userMissions.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const inProgressMissions = user.userMissions.filter(
    (m) => m.status === "IN_PROGRESS"
  ).length;

  const stats = [
    { label: "Level", value: user.level, icon: Trophy, color: "text-yellow-400" },
    { label: "Total XP", value: user.xp, icon: Zap, color: "text-purple-400" },
    { label: "Misi Selesai", value: completedMissions, icon: Target, color: "text-green-400" },
    { label: "Misi Aktif", value: inProgressMissions, icon: Clock, color: "text-blue-400" },
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
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
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
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profil Astronaut</h1>
          <p className="text-slate-400">Kelola informasi dan lihat statistik Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-slate-400 text-sm">{user.email}</p>
                
                {/* Role Badge */}
                <div className="mt-3">
                  <RoleBadge role={user.role} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-slate-800/50 text-center"
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Member Since */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-sm text-slate-400 text-center">
                  Bergabung sejak{" "}
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </Card>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Edit Profil</h3>
              <ProfileForm user={user} />
            </Card>

            {/* Recent Missions */}
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Misi Terbaru</h3>
                <Link
                  href="/dashboard/missions"
                  className="text-purple-400 text-sm hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>

              {user.userMissions.length === 0 ? (
                <p className="text-slate-400 text-center py-4">
                  Belum ada misi yang dimulai
                </p>
              ) : (
                <div className="space-y-3">
                  {user.userMissions.slice(0, 5).map((userMission) => (
                    <div
                      key={userMission.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {userMission.mission.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {userMission.mission.xpReward} XP
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          userMission.status === "COMPLETED"
                            ? "bg-green-500/20 text-green-400"
                            : userMission.status === "IN_PROGRESS"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {userMission.status === "COMPLETED"
                          ? "Selesai"
                          : userMission.status === "IN_PROGRESS"
                          ? "Berlangsung"
                          : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
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
