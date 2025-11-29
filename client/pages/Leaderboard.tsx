import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeaderboardListResponse } from "@shared/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trophy, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/leaderboard?${params}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json() as Promise<LeaderboardListResponse>;
    },
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-600 to-yellow-500";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-300";
      case 3:
        return "bg-gradient-to-r from-orange-700 to-orange-600";
      default:
        return "bg-gradient-to-r from-violet-600 to-cyan-600";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${rank}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Global Leaderboard
            </h1>
          </div>
          <p className="text-slate-400">Top players ranked by wins and earnings</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by name or player ID..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block">
                <svg className="animate-spin h-12 w-12 text-violet-600" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-slate-400 mt-4">Loading leaderboard...</p>
            </div>
          ) : data?.leaderboard && data.leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Player</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Wins</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Losses</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Win Rate</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboard.map((entry, index) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700 hover:bg-slate-800/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className={`w-10 h-10 rounded-lg ${getRankColor(entry.rank)} flex items-center justify-center font-bold text-sm`}>
                          {getRankIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{entry.name}</span>
                          <span className="text-xs text-slate-500 font-mono">{entry.userId.slice(0, 12)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-violet-400 font-semibold">{entry.wins}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-cyan-400 font-semibold">{entry.losses}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-yellow-400 font-semibold">
                          {(entry.winRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold">{entry.totalEarnings} ALGO</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-slate-400">No players found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.total > pageSize && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.total)} of{" "}
              {data.total} players
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= data.total}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
