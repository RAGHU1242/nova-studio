import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGameSocket, MatchCompletedData, MatchRoomState } from '@/hooks/useGameSocket';
import { generateCommit, verifyReveal } from '@/lib/gameHashing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Swords, Loader, Clock } from 'lucide-react';
import {
  fadeInUpVariants,
  containerVariants,
  itemVariants,
  gridContainerVariants,
  gridItemVariants,
  scaleInVariants,
  bounceInVariants,
  checkVariants,
} from '@/lib/animations';

const stakeSchema = z.object({
  stake: z
    .number()
    .min(1, 'Minimum stake is 1 ALGO')
    .max(1000, 'Maximum stake is 1000 ALGO'),
});

type StakeFormData = z.infer<typeof stakeSchema>;

const CHOICES = [
  { id: 'rock', emoji: '🪨', name: 'Rock' },
  { id: 'paper', emoji: '📄', name: 'Paper' },
  { id: 'scissors', emoji: '✂️', name: 'Scissors' },
] as const;

type GamePhase = 'lobby' | 'queue' | 'commit' | 'reveal' | 'result';

export default function BattleArena() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    joinQueue,
    leaveQueue,
    commitChoice,
    revealChoice,
    getMatchRoom,
    currentMatch,
    matchId,
    commitTimeout,
    revealTimeout,
  } = useGameSocket();

  // Game state
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [stake, setStake] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [salt, setSalt] = useState<string | null>(null);
  const [commitHash, setCommitHash] = useState<string | null>(null);
  const [matchRoom, setMatchRoom] = useState<MatchRoomState | null>(null);
  const [result, setResult] = useState<MatchCompletedData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [opponentName, setOpponentName] = useState<string | null>(null);

  const form = useForm<StakeFormData>({
    resolver: zodResolver(stakeSchema),
    defaultValues: { stake: 10 },
  });

  // Handle match found
  useEffect(() => {
    if (currentMatch) {
      setPhase('commit');
      setStake(currentMatch.stake);
      setOpponentName(currentMatch.opponent.name);
      setTimeRemaining(currentMatch.timeout);
      toast({
        title: '🎮 Match Found!',
        description: `You\'ve been paired with ${currentMatch.opponent.name}`,
      });
    }
  }, [currentMatch, toast]);

  // Countdown timer for commit phase
  useEffect(() => {
    if (phase === 'commit' && commitTimeout > 0) {
      setTimeRemaining(commitTimeout);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, commitTimeout]);

  // Countdown timer for reveal phase
  useEffect(() => {
    if (phase === 'reveal' && revealTimeout > 0) {
      setTimeRemaining(revealTimeout);
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, revealTimeout]);

  // Handle joining queue
  const handleJoinQueue = async (data: StakeFormData) => {
    setIsLoading(true);
    try {
      await joinQueue(data.stake);
      setPhase('queue');
      setStake(data.stake);
      toast({
        title: '⏳ Waiting for opponent...',
        description: 'You\'ll be matched soon. Closing this window may remove you from the queue.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join queue';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle leaving queue
  const handleLeaveQueue = async () => {
    setIsLoading(true);
    try {
      await leaveQueue();
      setPhase('lobby');
      form.reset();
      toast({
        title: 'Left queue',
        description: 'You\'ve been removed from the matchmaking queue.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to leave queue';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle choice selection in commit phase
  const handleSelectChoice = async (choice: string) => {
    setIsLoading(true);
    try {
      // Generate commit (hash + salt)
      const { commitHash: hash, salt: s } = await generateCommit(choice);
      setSelectedChoice(choice);
      setSalt(s);
      setCommitHash(hash);

      if (!matchId) {
        throw new Error('Match ID not found');
      }

      // Send commitment to server
      await commitChoice(matchId, hash);
      toast({
        title: '✅ Choice committed',
        description: 'Waiting for opponent...',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to commit choice';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setSelectedChoice(null);
      setSalt(null);
      setCommitHash(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reveal phase - show actual choice
  const handleRevealChoice = async () => {
    if (!selectedChoice || !salt || !matchId) {
      toast({
        title: 'Error',
        description: 'Missing choice or salt',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify the commitment matches
      const verified = await verifyReveal(selectedChoice, salt, commitHash!);
      if (!verified) {
        throw new Error('Commitment verification failed');
      }

      // Send reveal to server
      await revealChoice(matchId, selectedChoice, salt);
      toast({
        title: '🎯 Choice revealed!',
        description: 'Waiting for results...',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reveal choice';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for phase changes
  useEffect(() => {
    if (!matchId) return;

    const checkPhaseInterval = setInterval(async () => {
      try {
        const room = await getMatchRoom(matchId);
        setMatchRoom(room);

        if (room.status === 'reveal' && phase !== 'reveal') {
          setPhase('reveal');
          toast({
            title: '🔍 Reveal phase started!',
            description: 'Time to reveal your choice.',
          });
        } else if (room.status === 'completed' && phase !== 'result') {
          setPhase('result');
          setResult({
            playerAChoice: room.playerAChoice!,
            playerBChoice: room.playerBChoice!,
            result: room.result!,
            winner: room.winner!,
            winnerReward: room.winnerReward!,
            daoFee: room.daoFee!,
          });
          
          const resultText =
            room.winner === user?.id ? '🏆 Victory!' : room.winner === 'draw' ? '🤝 Draw' : '💔 Defeat';
          toast({
            title: resultText,
            description: `You earned ${room.winner === user?.id ? room.winnerReward : 0} ALGO`,
          });
        }
      } catch (error) {
        console.error('Error checking match phase:', error);
      }
    }, 2000);

    return () => clearInterval(checkPhaseInterval);
  }, [matchId, phase, user?.id, toast, getMatchRoom]);

  // Handle play again
  const handlePlayAgain = () => {
    setPhase('lobby');
    setSelectedChoice(null);
    setSalt(null);
    setCommitHash(null);
    setMatchRoom(null);
    setResult(null);
    setTimeRemaining(0);
    setOpponentName(null);
    form.reset();
  };

  if (!user) {
    return null;
  }

  const potentialReward = stake * 0.9;
  const daoFee = stake * 0.1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Swords className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Battle Arena
            </h1>
          </motion.div>
          <motion.p
            className="text-slate-400"
            variants={fadeInUpVariants}
          >
            Challenge opponents and earn ALGO rewards
          </motion.p>
        </motion.div>

        {/* Queue State */}
        {phase === 'queue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 mb-8 text-center"
          >
            <motion.div
              className="flex justify-center mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Loader className="w-12 h-12 text-cyan-400 animate-spin" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold mb-2"
              variants={bounceInVariants}
            >
              Searching for Opponent...
            </motion.h2>
            <motion.p
              className="text-slate-400 mb-6"
              variants={fadeInUpVariants}
            >
              Stake: <span className="text-cyan-400 font-semibold">{stake} ALGO</span>
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleLeaveQueue}
                variant="outline"
                disabled={isLoading}
                className="border-red-500/30 text-red-400 hover:bg-red-600/10"
              >
                {isLoading ? 'Leaving...' : 'Leave Queue'}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Commit Phase */}
        {phase === 'commit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 mb-8"
          >
            {/* Timer */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-6 text-cyan-400"
              animate={{ scale: timeRemaining <= 5 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 1, repeat: timeRemaining <= 5 ? Infinity : 0 }}
            >
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{timeRemaining}s remaining</span>
            </motion.div>

            {/* Opponent info */}
            <motion.div
              className="text-center mb-8 pb-6 border-b border-slate-700"
              variants={scaleInVariants}
            >
              <p className="text-slate-400 mb-2">Opponent</p>
              <motion.p
                className="text-xl font-bold text-cyan-400"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {opponentName || 'Loading...'}
              </motion.p>
              <p className="text-sm text-slate-500 mt-1">Stake: {stake} ALGO</p>
            </motion.div>

            {/* Choice selection */}
            <motion.h2
              className="text-2xl font-bold text-center mb-8"
              variants={fadeInUpVariants}
            >
              Make Your Choice
            </motion.h2>
            <motion.div
              className="grid grid-cols-3 gap-4 mb-8"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {CHOICES.map((choice) => (
                <motion.button
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice.id)}
                  disabled={selectedChoice !== null || isLoading}
                  variants={gridItemVariants}
                  whileHover={selectedChoice === null ? { scale: 1.05, y: -5 } : {}}
                  whileTap={selectedChoice === null ? { scale: 0.95 } : {}}
                  animate={selectedChoice === choice.id ? { scale: 1.1 } : {}}
                  className={`p-6 rounded-lg transition ${
                    selectedChoice === choice.id
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 border-2 border-cyan-300 ring-2 ring-cyan-400'
                      : 'bg-slate-700/50 border border-slate-600 hover:border-cyan-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <motion.div
                    className="text-5xl mb-2"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    {choice.emoji}
                  </motion.div>
                  <div className="font-semibold">{choice.name}</div>
                </motion.button>
              ))}
            </motion.div>

            {selectedChoice && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader className="w-6 h-6 animate-spin inline-block mr-2" />
                <span className="text-slate-400">Waiting for opponent to commit...</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Reveal Phase */}
        {phase === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 mb-8"
          >
            {/* Timer */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-6 text-cyan-400"
              animate={{ scale: timeRemaining <= 5 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 1, repeat: timeRemaining <= 5 ? Infinity : 0 }}
            >
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{timeRemaining}s remaining</span>
            </motion.div>

            {/* Your committed choice */}
            <motion.div
              className="text-center mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.p className="text-slate-400 mb-3" variants={itemVariants}>
                Your Committed Choice
              </motion.p>
              <motion.div
                className="text-7xl mb-3"
                variants={scaleInVariants}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {CHOICES.find((c) => c.id === selectedChoice)?.emoji}
              </motion.div>
              <motion.p className="text-lg font-bold text-violet-400" variants={itemVariants}>
                {selectedChoice}
              </motion.p>
            </motion.div>

            {/* Reveal button */}
            <motion.div className="text-center" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Button
                  onClick={handleRevealChoice}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 px-8 py-3 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Revealing...
                    </>
                  ) : (
                    'Reveal Choice'
                  )}
                </Button>
              </motion.div>
              <motion.p className="text-slate-400 mt-4 text-sm" variants={itemVariants}>
                Both players must reveal to see the result
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* Result Screen */}
        {phase === 'result' && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 mb-8 text-center"
          >
            <motion.h2
              className="text-4xl font-bold mb-8"
              variants={bounceInVariants}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {result.winner === user?.id ? '🏆 Victory!' : result.winner === 'draw' ? '🤝 Draw' : '💔 Defeat'}
            </motion.h2>

            <motion.div
              className="grid grid-cols-2 gap-8 mb-8"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={gridItemVariants}>
                <p className="text-slate-400 mb-3">Your Choice</p>
                <motion.div
                  className="text-6xl mb-3"
                  variants={scaleInVariants}
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {CHOICES.find((c) => c.id === result.playerAChoice)?.emoji || '?'}
                </motion.div>
                <p className="text-sm text-slate-400">{result.playerAChoice}</p>
              </motion.div>
              <motion.div variants={gridItemVariants}>
                <p className="text-slate-400 mb-3">Opponent's Choice</p>
                <motion.div
                  className="text-6xl mb-3"
                  variants={scaleInVariants}
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {CHOICES.find((c) => c.id === result.playerBChoice)?.emoji || '?'}
                </motion.div>
                <p className="text-sm text-slate-400">{result.playerBChoice}</p>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-slate-900/50 rounded-lg p-6 mb-8"
              variants={scaleInVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
            >
              <motion.p className="text-slate-400 mb-2" variants={fadeInUpVariants}>
                Earnings
              </motion.p>
              <motion.p
                className="text-3xl font-bold text-cyan-400"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                {result.winner === user?.id ? result.winnerReward : 0} ALGO
              </motion.p>
              <p className="text-xs text-slate-500 mt-2">DAO Fee: {result.daoFee} ALGO</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handlePlayAgain}
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
              >
                Play Again
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Join Form */}
        {phase === 'lobby' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 max-w-lg mx-auto"
          >
            <motion.h2
              className="text-2xl font-bold mb-6"
              variants={fadeInUpVariants}
            >
              Join a Battle
            </motion.h2>

            <Form {...form}>
              <motion.form
                onSubmit={form.handleSubmit(handleJoinQueue)}
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
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
                            disabled={isLoading}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 transition-all focus:scale-105"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  className="bg-slate-900/50 rounded-lg p-4"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm text-slate-400 mb-2">Potential Rewards</p>
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    variants={gridContainerVariants}
                  >
                    <motion.div variants={gridItemVariants}>
                      <p className="text-xs text-slate-500">If Win</p>
                      <motion.p
                        className="text-lg font-bold text-violet-400"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {potentialReward.toFixed(2)} ALGO
                      </motion.p>
                    </motion.div>
                    <motion.div variants={gridItemVariants}>
                      <p className="text-xs text-slate-500">DAO Fee</p>
                      <p className="text-lg font-bold text-cyan-400">{daoFee.toFixed(2)} ALGO</p>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
                  >
                    {isLoading ? 'Joining...' : 'Join Queue'}
                  </Button>
                </motion.div>
              </motion.form>
            </Form>

            <motion.p
              className="text-xs text-slate-500 text-center mt-4"
              variants={fadeInUpVariants}
            >
              Min: 1 ALGO | Max: 1000 ALGO
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
