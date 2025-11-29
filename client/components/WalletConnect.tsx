import { useState } from "react";
import { motion } from "framer-motion";
import { connectWallet, disconnectWallet, formatAddress } from "@/utils/wallet";
import { cn } from "@/lib/utils";
import {
  fadeInUpVariants,
  scaleInVariants,
  containerVariants,
  itemVariants,
  spinnerVariants,
  checkVariants,
} from "@/lib/animations";

export interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function WalletConnect({
  onConnect,
  onDisconnect,
  className,
  size = "md",
}: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const wallet = await connectWallet();
      setIsConnected(wallet.isConnected);
      setAddress(wallet.address);
      setBalance(wallet.balance);
      if (wallet.address) {
        onConnect?.(wallet.address);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Wallet connection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    const wallet = disconnectWallet();
    setIsConnected(wallet.isConnected);
    setAddress(wallet.address);
    setBalance(wallet.balance);
    onDisconnect?.();
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  if (isConnected && address) {
    return (
      <motion.div
        className={cn(
          "flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 p-4",
          className
        )}
        variants={scaleInVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(139, 92, 246, 0.2)" }}
      >
        <motion.div className="flex-1" variants={containerVariants}>
          <motion.p
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide"
            variants={itemVariants}
          >
            Connected
          </motion.p>
          <motion.p
            className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100"
            variants={itemVariants}
            animate={{ color: ["#000", "#8b5cf6", "#000"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {formatAddress(address)}
          </motion.p>
          {balance !== null && (
            <motion.p
              className="text-xs text-slate-600 dark:text-slate-400 mt-1"
              variants={itemVariants}
            >
              Balance: {balance.toFixed(2)} ALGO
            </motion.p>
          )}
        </motion.div>
        <motion.button
          onClick={handleDisconnect}
          className="px-3 py-1 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Disconnect
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("flex flex-col gap-2", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        onClick={handleConnect}
        disabled={isLoading}
        className={cn(
          sizeClasses[size],
          "font-semibold rounded-xl transition-all duration-200",
          "bg-gradient-to-r from-violet-600 to-cyan-600 text-white",
          "hover:shadow-lg hover:shadow-violet-600/50 hover:scale-105",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "active:scale-95"
        )}
        whileHover={!isLoading ? { scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)" } : {}}
        whileTap={!isLoading ? { scale: 0.95 } : {}}
        variants={itemVariants}
      >
        {isLoading ? (
          <motion.span
            className="flex items-center gap-2"
            variants={containerVariants}
          >
            <motion.svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              variants={spinnerVariants}
              animate="rotate"
            >
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
            </motion.svg>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Connecting...
            </motion.span>
          </motion.span>
        ) : (
          "Connect Wallet"
        )}
      </motion.button>
      {error && (
        <motion.p
          className="text-xs text-red-600 dark:text-red-400 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}
      <motion.p
        className="text-xs text-slate-500 dark:text-slate-400 text-center"
        variants={itemVariants}
      >
        Pera Wallet or MyAlgoConnect
      </motion.p>
    </motion.div>
  );
}
