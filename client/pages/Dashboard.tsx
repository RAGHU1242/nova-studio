import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { 
  Swords, 
  Trophy, 
  TrendingUp, 
  Wallet, 
  History,
  LogOut 
} from "lucide-react";

const mockChartData = [
  { name: "Mon", wins: 4, losses: 2 },
  { name: "Tue", wins: 3, losses: 1 },
  { name: "Wed", wins: 5, losses: 0 },
  { name: "Thu", wins: 2, losses: 2 },
  { name: "Fri", wins: 6, losses: 1 },
  { name: "Sat", wins: 4, losses: 3 },
  { name: "Sun", wins: 3, losses: 1 },
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Mock user stats from leaderboard
  const { data: userRank } = useQuery({
    queryKey: ["userRank", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/leaderboard/${user.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
  });

  const stats = [
    {
      label: "Total Wins",
      value: userRank?.wins || 0,
      icon: Trophy,
      color: "from-violet-600 to-violet-400",
    },
    {
      label: "Win Rate",
      value: userRank ? `${(userRank.winRate * 100).toFixed(1)}%` : "0%",
      icon: TrendingUp,
      color: "from-cyan-600 to-cyan-400",
    },
    {
      label: "Total Earnings",
      value: `${userRank?.totalEarnings || 0} ALGO`,
      icon: Wallet,
      color: "from-yellow-600 to-yellow-400",
    },
    {
      label: "Current Rank",
      value: userRank?.rank ? `#${userRank.rank}` : "-",
      icon: History,
      color: "from-pink-600 to-pink-400",
    },
  ];

  const quickActions = [
    {
      title: "Join Battle",
      description: "Challenge an opponent",
      href: "/battle",
      icon: Swords,
      color: "from-violet-600 to-cyan-600",
    },
    {
      title: "Leaderboard",
      description: "View global rankings",
      href: "/leaderboard",
      icon: Trophy,
      color: "from-yellow-600 to-orange-600",
    },
    {
      title: "My Profile",
      description: "Manage your profile",
      href: "/profile",
      icon: Wallet,
      color: "from-cyan-600 to-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-slate-400">Ready to battle? Check your stats and join the arena!</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} opacity-20`}>
                    <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-4 hover:border-slate-600 transition group">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} opacity-20 group-hover:opacity-30 transition`}>
                        <Icon className={`w-5 h-5 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} />
                      </div>
                      <div>
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-sm text-slate-400">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
              <h2 className="text-xl font-bold mb-6">This Week's Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1e293b", 
                      border: "1px solid #475569",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="wins" fill="#a78bfa" name="Wins" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="losses" fill="#06b6d4" name="Losses" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Matches Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Recent Matches</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div>
                  <p className="font-semibold">vs Player_abc123</p>
                  <p className="text-sm text-slate-400">2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${i % 2 === 0 ? "text-violet-400" : "text-cyan-400"}`}>
                    {i % 2 === 0 ? "Won" : "Lost"}
                  </p>
                  <p className="text-sm text-slate-400">10 ALGO</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/leaderboard">
            <Button variant="ghost" className="w-full mt-4 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800">
              View All Matches
            </Button>
          </Link>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => {
              logout();
            }}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-600/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
