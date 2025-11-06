import { useEffect, useState } from "react";
import { fetchLeaderboard, LeaderboardEntry } from "@/utils/firebase";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard(20);
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏆";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-slate-400">Top battle arena champions ranked by wins and earnings</p>
        </div>

        {/* Leaderboard Card */}
        <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-violet-600 mx-auto mb-4" viewBox="0 0 24 24">
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
                <p className="text-slate-400 mt-4">Loading leaderboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Top 3 Spotlight */}
              {leaderboard.slice(0, 3).length > 0 && (
                <div className="px-6 py-8 md:py-12 border-b border-slate-700 bg-gradient-to-r from-violet-600/10 to-cyan-600/10">
                  <p className="text-sm text-slate-400 uppercase tracking-wider mb-6">Top Champions</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {leaderboard.slice(0, 3).map((player, index) => (
                      <div
                        key={player.rank}
                        className={`rounded-xl border p-6 text-center transition ${
                          index === 0
                            ? "border-yellow-500/50 bg-gradient-to-br from-yellow-600/20 to-yellow-700/10"
                            : index === 1
                            ? "border-gray-400/50 bg-gradient-to-br from-gray-400/20 to-gray-500/10"
                            : "border-orange-700/50 bg-gradient-to-br from-orange-600/20 to-orange-700/10"
                        }`}
                      >
                        <div className="text-5xl mb-2">{getMedalEmoji(player.rank)}</div>
                        <h3 className="text-lg font-bold mb-1">{player.username}</h3>
                        <p className="text-xs font-mono text-slate-400 mb-4 break-all">{player.address.slice(0, 12)}...</p>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <p className="text-2xl font-bold text-violet-400">{player.wins}</p>
                            <p className="text-xs text-slate-500">Wins</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-cyan-400">
                              {(player.winRate * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-slate-500">Win Rate</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <p className="text-yellow-400 font-bold">${player.totalEarnings.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">Total Earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Rankings Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Wins
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Total Earned
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player) => (
                      <tr
                        key={player.rank}
                        className="border-b border-slate-700/50 hover:bg-slate-800/30 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getMedalEmoji(player.rank)}</span>
                            <span className="font-bold text-lg w-8">#{player.rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-white">{player.username}</p>
                            <p className="text-xs font-mono text-slate-500">{player.address.slice(0, 12)}...</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full bg-violet-600/20 text-violet-400 font-semibold">
                            {player.wins}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full bg-cyan-600/20 text-cyan-400 font-semibold">
                            {(player.winRate * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-yellow-400">
                            ${player.totalEarnings.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400">No players on the leaderboard yet. Be the first!</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="font-bold mb-4">How Rankings Work</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Ranked by total wins in the arena</li>
              <li>✓ Win rate calculated from match history</li>
              <li>✓ Earnings tracked from all rewards</li>
              <li>✓ Updated in real-time</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="font-bold mb-4">Rewards & Incentives</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ 90% of stakes go to match winners</li>
              <li>✓ 10% to the DAO community pool</li>
              <li>✓ Weekly leaderboard prizes</li>
              <li>✓ Special badges for top 100 players</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
