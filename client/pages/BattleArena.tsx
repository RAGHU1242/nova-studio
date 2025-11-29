import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Swords, Loader } from "lucide-react";

const stakeSchema = z.object({
  stake: z
    .number()
    .min(1, "Minimum stake is 1 ALGO")
    .max(1000, "Maximum stake is 1000 ALGO"),
});

type StakeFormData = z.infer<typeof stakeSchema>;

const CHOICES = [
  { id: "rock", emoji: "🪨", name: "Rock" },
  { id: "paper", emoji: "📄", name: "Paper" },
  { id: "scissors", emoji: "✂️", name: "Scissors" },
] as const;

export default function BattleArena() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isJoiningQueue, setIsJoiningQueue] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const [inMatch, setInMatch] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<any>(null);

  const form = useForm<StakeFormData>({
    resolver: zodResolver(stakeSchema),
    defaultValues: {
      stake: 10,
    },
  });

  const joinQueue = async (data: StakeFormData) => {
    if (!token) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      return;
    }

    setIsJoiningQueue(true);
    try {
      const response = await fetch("/api/match/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stake: data.stake }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const result = await response.json();

      if (result.matched) {
        setInMatch(true);
        setMatchResult(null);
        setPlayerChoice(null);
        toast({
          title: "Match Found!",
          description: "You've been paired with an opponent. Make your choice!",
        });
      } else {
        setInQueue(true);
        toast({
          title: "Added to Queue",
          description: `You're in position ${result.queuePosition}. Waiting for opponent...`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to join queue";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsJoiningQueue(false);
    }
  };

  const leaveQueue = async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/match/leave", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setInQueue(false);
        toast({ title: "Left queue", description: "You've left the matchmaking queue." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to leave queue", variant: "destructive" });
    }
  };

  const submitChoice = async (choice: string) => {
    // Mock match completion - in real implementation, would use WebSocket
    setPlayerChoice(choice);
    
    // Simulate opponent choice and result
    setTimeout(() => {
      const opponentChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
      const result = calculateResult(choice, opponentChoice);
      
      setMatchResult({
        playerChoice: choice,
        opponentChoice,
        result,
        reward: result === "win" ? 18 : result === "loss" ? 0 : 10,
      });

      toast({
        title: result === "win" ? "Victory!" : result === "loss" ? "Defeat" : "Draw",
        description: `You chose ${choice}, opponent chose ${opponentChoice}`,
      });
    }, 2000);
  };

  const calculateResult = (player: string, opponent: string): "win" | "loss" | "draw" => {
    if (player === opponent) return "draw";
    if (player === "rock" && opponent === "scissors") return "win";
    if (player === "paper" && opponent === "rock") return "win";
    if (player === "scissors" && opponent === "paper") return "win";
    return "loss";
  };

  const resetMatch = () => {
    setInMatch(false);
    setMatchResult(null);
    setPlayerChoice(null);
    form.reset();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Swords className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Battle Arena
            </h1>
          </div>
          <p className="text-slate-400">Challenge opponents and earn ALGO rewards</p>
        </div>

        {/* Queue State */}
        {inQueue && !inMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 mb-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <Loader className="w-12 h-12 text-cyan-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Searching for Opponent...</h2>
            <p className="text-slate-400 mb-6">You'll be matched with a player soon</p>
            <Button
              onClick={leaveQueue}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-600/10"
            >
              Leave Queue
            </Button>
          </motion.div>
        )}

        {/* Match State */}
        {inMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 mb-8"
          >
            {/* Choices */}
            {!matchResult && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-8">Make Your Choice</h2>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {CHOICES.map((choice) => (
                    <motion.button
                      key={choice.id}
                      onClick={() => submitChoice(choice.id)}
                      disabled={playerChoice !== null}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-6 rounded-lg transition ${
                        playerChoice === choice.id
                          ? "bg-gradient-to-r from-violet-600 to-cyan-600 border-2 border-cyan-300"
                          : "bg-slate-700/50 border border-slate-600 hover:border-cyan-500"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="text-5xl mb-2">{choice.emoji}</div>
                      <div className="font-semibold">{choice.name}</div>
                    </motion.button>
                  ))}
                </div>
                {playerChoice && (
                  <div className="text-center text-slate-400">
                    <Loader className="w-6 h-6 animate-spin inline-block mr-2" />
                    Waiting for opponent choice...
                  </div>
                )}
              </div>
            )}

            {/* Result */}
            {matchResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold mb-8">
                  {matchResult.result === "win" ? "🏆 Victory!" : matchResult.result === "loss" ? "💔 Defeat" : "🤝 Draw"}
                </h2>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-slate-400 mb-2">Your Choice</p>
                    <div className="text-6xl">{CHOICES.find(c => c.id === matchResult.playerChoice)?.emoji}</div>
                    <p className="text-sm mt-2 text-slate-400">{matchResult.playerChoice}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-2">Opponent's Choice</p>
                    <div className="text-6xl">{CHOICES.find(c => c.id === matchResult.opponentChoice)?.emoji}</div>
                    <p className="text-sm mt-2 text-slate-400">{matchResult.opponentChoice}</p>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-6 mb-8">
                  <p className="text-slate-400 mb-2">Reward</p>
                  <p className="text-3xl font-bold text-cyan-400">{matchResult.reward} ALGO</p>
                </div>

                <Button
                  onClick={resetMatch}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
                >
                  Play Again
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Join Form */}
        {!inQueue && !inMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 max-w-lg mx-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Join a Battle</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(joinQueue)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="stake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Stake Amount (ALGO)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          step="0.1"
                          min="1"
                          max="1000"
                          disabled={isJoiningQueue}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Potential Rewards</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">If Win</p>
                      <p className="text-lg font-bold text-violet-400">
                        {(form.watch("stake") * 0.9).toFixed(2)} ALGO
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">DAO Fee</p>
                      <p className="text-lg font-bold text-cyan-400">
                        {(form.watch("stake") * 0.1).toFixed(2)} ALGO
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isJoiningQueue}
                  className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
                >
                  {isJoiningQueue ? "Joining..." : "Join Queue"}
                </Button>
              </form>
            </Form>

            <p className="text-xs text-slate-500 text-center mt-4">
              Min: 1 ALGO | Max: 1000 ALGO
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
