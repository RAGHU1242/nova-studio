import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import WalletConnect from "@/components/WalletConnect";
import { APP_NAME, APP_DESCRIPTION } from "@/utils/constants";
import {
  fadeInUpVariants,
  fadeInDownVariants,
  scaleInVariants,
  containerVariants,
  itemVariants,
  gridContainerVariants,
  gridItemVariants,
} from "@/lib/animations";

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
        <motion.div
          className="text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Logo and Title */}
          <motion.div
            className="inline-flex items-center justify-center gap-3 mb-6"
            variants={scaleInVariants}
          >
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-2xl shadow-2xl shadow-violet-600/50"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              ⚔️
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black bg-gradient-to-r from-violet-400 via-white to-cyan-400 bg-clip-text text-transparent leading-tight"
            variants={fadeInUpVariants}
          >
            {APP_NAME}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            variants={fadeInUpVariants}
          >
            {APP_DESCRIPTION}. Battle. Stake. Earn. Rise to glory on the Algorand blockchain.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            variants={fadeInUpVariants}
          >
            <WalletConnect
              onConnect={setWalletAddress}
              size="lg"
            />
            {walletAddress && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to="/dashboard"
                  className="px-8 py-3 text-lg font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/50 text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-600/50 hover:scale-105 inline-block"
                >
                  Go to Dashboard →
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-4 md:gap-8 pt-12 max-w-3xl mx-auto"
            variants={gridContainerVariants}
          >
            <motion.div className="text-center" variants={gridItemVariants}>
              <motion.div
                className="text-2xl md:text-4xl font-bold text-violet-400"
                whileInView={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                10K+
              </motion.div>
              <div className="text-xs md:text-sm text-slate-400 mt-2">Active Players</div>
            </motion.div>
            <motion.div className="text-center" variants={gridItemVariants}>
              <motion.div
                className="text-2xl md:text-4xl font-bold text-cyan-400"
                whileInView={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                $5M+
              </motion.div>
              <div className="text-xs md:text-sm text-slate-400 mt-2">Total Staked</div>
            </motion.div>
            <motion.div className="text-center" variants={gridItemVariants}>
              <motion.div
                className="text-2xl md:text-4xl font-bold text-violet-400"
                whileInView={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                99.9%
              </motion.div>
              <div className="text-xs md:text-sm text-slate-400 mt-2">Uptime SLA</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center mb-16"
          variants={fadeInDownVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Battle Here?</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Experience the ultimate PvP gaming platform on blockchain
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative p-6 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 transition-all duration-300 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/20"
              variants={gridItemVariants}
              whileHover={{ y: -5 }}
            >
              <motion.div
                className="text-4xl mb-4"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/0 to-cyan-600/0 group-hover:from-violet-600/10 group-hover:to-cyan-600/10 transition-all" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center mb-16"
          variants={fadeInDownVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Get started in just 4 simple steps
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div key={index} className="relative" variants={itemVariants}>
              <motion.div
                className="p-6 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900"
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center text-xl font-bold text-white mb-4 shadow-lg shadow-violet-600/50"
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {step.number}
                </motion.div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </motion.div>
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute -right-3 top-8 w-6 h-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="rounded-2xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/50 p-12 md:p-16 text-center backdrop-blur-sm"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ boxShadow: "0 0 40px rgba(139, 92, 246, 0.3)" }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={fadeInDownVariants}
          >
            Ready to Battle?
          </motion.h2>
          <motion.p
            className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto"
            variants={fadeInDownVariants}
          >
            Join thousands of players competing for glory and rewards. Your first battle awaits.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={containerVariants}
          >
            <WalletConnect
              onConnect={setWalletAddress}
              size="lg"
            />
            {walletAddress && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to="/battle"
                  className="px-8 py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white transition-all duration-200 hover:shadow-lg hover:shadow-violet-600/50 hover:scale-105 inline-block"
                >
                  Enter Battle Arena →
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="relative border-t border-slate-800 mt-20 py-12"
        variants={fadeInDownVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>How It Works</motion.a></li>
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Features</motion.a></li>
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Pricing</motion.a></li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Discord</motion.a></li>
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Twitter</motion.a></li>
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Telegram</motion.a></li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-white mb-4">Developers</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Docs</motion.a></li>
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>API</motion.a></li>
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>GitHub</motion.a></li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Privacy</motion.a></li>
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Terms</motion.a></li>
                <li><motion.a href="#" className="hover:text-white transition" whileHover={{ x: 5 }}>Security</motion.a></li>
              </ul>
            </motion.div>
          </motion.div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 {APP_NAME}. Built on Algorand. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
