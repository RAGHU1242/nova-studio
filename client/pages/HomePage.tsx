import { useState } from "react";
import { Link } from "react-router-dom";
import WalletConnect from "@/components/WalletConnect";
import { APP_NAME, APP_DESCRIPTION } from "@/utils/constants";

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const features = [
    {
      icon: "⚔️",
      title: "PvP Battles",
      description: "Challenge other players in real-time combat using Rock-Paper-Scissors strategy",
    },
    {
      icon: "💰",
      title: "Stake & Earn",
      description: "Put your Algo tokens on the line and earn rewards from winning matches",
    },
    {
      icon: "🏆",
      title: "Competitive Rankings",
      description: "Climb the leaderboard and prove you're the ultimate Battle Arena champion",
    },
    {
      icon: "🎖️",
      title: "NFT Badges",
      description: "Earn exclusive Power Cards and NFT badges as you progress and win matches",
    },
    {
      icon: "🔐",
      title: "Secure Blockchain",
      description: "All transactions secured by the Algorand blockchain for true decentralization",
    },
    {
      icon: "🤝",
      title: "DAO Governance",
      description: "Help govern the arena through our decentralized autonomous organization",
    },
  ];

  const steps = [
    { number: "1", title: "Connect Wallet", description: "Link your Pera Wallet or MyAlgoConnect" },
    { number: "2", title: "Fund Account", description: "Deposit Algo tokens to stake in battles" },
    { number: "3", title: "Join Battle", description: "Challenge opponents and start winning" },
    { number: "4", title: "Claim Rewards", description: "Withdraw your earnings anytime" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute -bottom-8 left-40 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8">
          {/* Logo and Title */}
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-2xl shadow-2xl shadow-violet-600/50">
              ⚔️
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-violet-400 via-white to-cyan-400 bg-clip-text text-transparent leading-tight">
            {APP_NAME}
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {APP_DESCRIPTION}. Battle. Stake. Earn. Rise to glory on the Algorand blockchain.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <WalletConnect
              onConnect={setWalletAddress}
              size="lg"
            />
            {walletAddress && (
              <Link
                to="/dashboard"
                className="px-8 py-3 text-lg font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/50 text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-600/50 hover:scale-105"
              >
                Go to Dashboard →
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-violet-400">10K+</div>
              <div className="text-xs md:text-sm text-slate-400 mt-2">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-cyan-400">$5M+</div>
              <div className="text-xs md:text-sm text-slate-400 mt-2">Total Staked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-violet-400">99.9%</div>
              <div className="text-xs md:text-sm text-slate-400 mt-2">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Battle Here?</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Experience the ultimate PvP gaming platform on blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-300 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/20"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/0 to-cyan-600/0 group-hover:from-violet-600/10 group-hover:to-cyan-600/10 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Get started in just 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="p-6 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-violet-600/50">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-8 w-6 h-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/50 p-12 md:p-16 text-center backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Battle?</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of players competing for glory and rewards. Your first battle awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WalletConnect
              onConnect={setWalletAddress}
              size="lg"
            />
            {walletAddress && (
              <Link
                to="/battle"
                className="px-8 py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/50 hover:scale-105"
              >
                Enter Battle Arena →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Discord</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Telegram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Developers</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Docs</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 {APP_NAME}. Built on Algorand. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
