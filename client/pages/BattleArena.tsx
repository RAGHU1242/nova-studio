import { Link } from "react-router-dom";

export default function BattleArena() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen flex items-center">
        <div className="w-full">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Battle Arena
          </h1>

          <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-12 max-w-2xl">
            <div className="text-center space-y-6">
              <div className="text-5xl">⚔️</div>
              <h2 className="text-2xl font-bold">Coming Soon!</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                The Battle Arena is being developed. This feature will allow you to challenge other players in real-time Rock-Paper-Scissors matches with stake rewards.
              </p>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-left my-6">
                <h3 className="font-bold mb-3 text-sm text-slate-300">Expected Features:</h3>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>✓ Real-time PvP matches</li>
                  <li>✓ Rock-Paper-Scissors gameplay</li>
                  <li>✓ Adjustable stake amounts</li>
                  <li>✓ Instant reward distribution</li>
                  <li>✓ Match history tracking</li>
                </ul>
              </div>

              <p className="text-slate-400 text-sm">
                Continue exploring the app or come back later to join your first battle!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-semibold transition"
                >
                  Back to Dashboard
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 font-semibold transition hover:shadow-lg hover:shadow-violet-600/50"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
