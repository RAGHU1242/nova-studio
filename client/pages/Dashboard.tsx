import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import WalletConnect from "@/components/WalletConnect";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DemoResponse } from "@shared/api";

async function fetchDemoData(): Promise<DemoResponse> {
  const response = await fetch("/api/demo");
  if (!response.ok) {
    throw new Error("Failed to fetch demo data");
  }
  return response.json();
}

export default function Dashboard() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Fetch demo data using TanStack Query
  const { data: demoData, isLoading: isDemoLoading, error: demoError } = useQuery({
    queryKey: ["demo"],
    queryFn: fetchDemoData,
  });

  const handleConnect = async (address: string) => {
    setWalletAddress(address);
    try {
      // Mock fetch player profile
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPlayerProfile({
        wins: 12,
        losses: 3,
        totalStaked: "500",
        averageStake: "41.67",
        nftBadges: ["warrior", "champion", "streak_10"],
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setPlayerProfile(null);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
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
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome, {user?.name}! Manage your account and jump into battle
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-600/10"
          >
            Logout
          </Button>
        </div>

        {/* Demo Data Section */}
        {isDemoLoading && (
          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-violet-600 mx-auto mb-2" viewBox="0 0 24 24">
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
                <p className="text-slate-400 text-sm">Loading demo data...</p>
              </div>
            </div>
          </div>
        )}

        {demoError && (
          <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-200">
            Failed to load demo data. Please refresh the page.
          </div>
        )}

        {demoData && (
          <div className="mb-8 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-600/10 to-violet-600/10 p-6">
            <h2 className="text-lg font-semibold mb-2 text-cyan-400">Server Response</h2>
            <p className="text-slate-300 font-mono">{demoData.message}</p>
          </div>
        )}

        {!walletAddress ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wallet Connection Card */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-12">
                <div className="text-center space-y-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-violet-600/50">
                    🔑
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Link your Pera Wallet or MyAlgoConnect to access your dashboard, view stats, and start battling.
                    </p>
                  </div>
                  <WalletConnect
                    onConnect={handleConnect}
                    size="lg"
                    className="!flex-col w-full"
                  />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                <h3 className="font-bold mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      to="/leaderboard"
                      className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition"
                    >
                      <span>🏆</span> View Leaderboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition"
                    >
                      <span>📚</span> Learn More
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-violet-600/10 to-cyan-600/10 p-6 border-violet-500/30">
                <h3 className="font-bold mb-3">Getting Started</h3>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
                  <li>Connect your wallet</li>
                  <li>Fund your account with ALGO</li>
                  <li>Join a battle in the arena</li>
                  <li>Claim your rewards!</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Wallet Info */}
            <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Connected Wallet
                  </h2>
                  <p className="text-2xl font-mono font-bold text-white break-all">
                    {walletAddress}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold transition"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {playerProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-400">Total Wins</h3>
                    <span className="text-2xl">🏆</span>
                  </div>
                  <p className="text-3xl font-bold">{playerProfile.wins}</p>
                  <p className="text-xs text-slate-500 mt-2">{playerProfile.losses} losses</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-400">Win Rate</h3>
                    <span className="text-2xl">📈</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {((playerProfile.wins / (playerProfile.wins + playerProfile.losses)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Last updated today</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-400">Total Staked</h3>
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-3xl font-bold">{playerProfile.totalStaked}</p>
                  <p className="text-xs text-slate-500 mt-2">ALGO Tokens</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-400">Avg Stake</h3>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-3xl font-bold">{playerProfile.averageStake}</p>
                  <p className="text-xs text-slate-500 mt-2">ALGO per battle</p>
                </div>
              </div>
            ) : null}

            {/* Badges Section */}
            {playerProfile && playerProfile.nftBadges.length > 0 && (
              <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8">
                <h2 className="text-2xl font-bold mb-6">Your Badges</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {playerProfile.nftBadges.map((badge: string, index: number) => (
                    <div
                      key={index}
                      className="rounded-xl border border-violet-500/50 bg-gradient-to-br from-violet-600/20 to-cyan-600/20 p-6 text-center hover:border-violet-400 hover:shadow-lg hover:shadow-violet-600/30 transition"
                    >
                      <div className="text-4xl mb-2">🎖️</div>
                      <p className="text-sm font-semibold capitalize text-slate-300">{badge}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/battle"
                className="rounded-xl border border-violet-500/50 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 p-6 text-center font-bold transition hover:shadow-lg hover:shadow-violet-600/50 hover:scale-105"
              >
                <div className="text-3xl mb-2">⚔️</div>
                <div>Join Battle</div>
                <div className="text-xs text-violet-200 mt-1">Challenge an opponent</div>
              </Link>

              <Link
                to="/leaderboard"
                className="rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700 p-6 text-center font-bold transition hover:border-cyan-500/50"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div>View Leaderboard</div>
                <div className="text-xs text-slate-400 mt-1">See top players</div>
              </Link>

              <button className="rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700 p-6 text-center font-bold transition hover:border-cyan-500/50">
                <div className="text-3xl mb-2">💳</div>
                <div>Withdraw Rewards</div>
                <div className="text-xs text-slate-400 mt-1">Claim your earnings</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
