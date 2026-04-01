import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, TrendingUp, TrendingDown, Minus, Shield, Gift } from "lucide-react";
import GameCard from "@/components/GameCard";
import { useLeaderboard, useUserLeague, useEnsureLeague, useLeagueRewards, useMarkRewardSeen, LEAGUE_CONFIG, LEAGUE_ORDER } from "@/hooks/useLeague";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const Ranks = () => {
  useEnsureLeague();
  const { user } = useAuth();
  const { data: leaderboard = [], isLoading } = useLeaderboard();
  const { data: userLeague } = useUserLeague();
  const { data: rewards = [] } = useLeagueRewards();
  const markSeen = useMarkRewardSeen();
  const { toast } = useToast();
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  // Show promotion reward toasts
  useEffect(() => {
    if (!rewards || rewards.length === 0) return;
    rewards.forEach((reward, i) => {
      const toConfig = LEAGUE_CONFIG[reward.to_league];
      setTimeout(() => {
        toast({
          title: `${toConfig?.icon ?? "🏆"} Promoção de Liga!`,
          description: `Você subiu para ${toConfig?.label ?? reward.to_league}! +${reward.bonus_xp} XP bônus${reward.title_earned ? ` • Título: ${reward.title_earned}` : ""}`,
        });
        markSeen.mutate(reward.id);
      }, i * 2000);
    });
  }, [rewards]);

  const currentLeague = userLeague?.league_name ?? "bronze";
  const leagueConfig = LEAGUE_CONFIG[currentLeague] ?? LEAGUE_CONFIG.bronze;
  const currentLeagueIdx = LEAGUE_ORDER.indexOf(currentLeague);

  // Filter leaderboard by current user's league
  const leagueLeaderboard = leaderboard.filter(u => u.league_name === currentLeague);
  const userPosition = leagueLeaderboard.findIndex(u => u.user_id === user?.id) + 1;

  // Days left in week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysLeft = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-glow-purple text-primary flex items-center gap-3">
          <Trophy className="text-neon-gold" /> RANKING
        </h1>
        <p className="text-muted-foreground font-body text-lg mt-1">Compete com outros Hunters</p>
      </motion.div>

      {/* Current League Banner */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <GameCard glowColor="purple" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 text-8xl opacity-10 -mr-4 -mt-4">
            {leagueConfig.icon}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{leagueConfig.icon}</div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Liga Atual</p>
              <h2 className={`text-2xl font-display font-bold ${leagueConfig.color}`}>
                {leagueConfig.label}
              </h2>
              <p className="text-sm text-muted-foreground font-body mt-1">
                {daysLeft > 0 ? `${daysLeft} dias restantes` : "Última chance hoje!"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-body">Posição</p>
              <p className="text-3xl font-display font-bold text-primary">
                #{userPosition || "—"}
              </p>
            </div>
          </div>
        </GameCard>
      </motion.div>

      {/* League Tiers */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display text-lg font-bold mb-3 text-foreground flex items-center gap-2">
          <Shield size={20} /> LIGAS
        </h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {LEAGUE_ORDER.map((league, idx) => {
            const config = LEAGUE_CONFIG[league];
            const isCurrent = league === currentLeague;
            const isLocked = idx > currentLeagueIdx;
            return (
              <motion.button
                key={league}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLeague(selectedLeague === league ? null : league)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all border
                  ${isCurrent ? "border-primary bg-primary/10 ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/30"}
                  ${isLocked ? "opacity-40" : ""}`}
              >
                <span className="text-2xl">{config.icon}</span>
                <span className={`text-[10px] font-display font-bold ${isCurrent ? config.color : "text-muted-foreground"}`}>
                  {config.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Promotion Rewards Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
        <h2 className="font-display text-lg font-bold mb-3 text-foreground flex items-center gap-2">
          <Gift size={20} className="text-neon-gold" /> RECOMPENSAS POR PROMOÇÃO
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {LEAGUE_ORDER.slice(1).map((league) => {
            const config = LEAGUE_CONFIG[league];
            return (
              <GameCard key={league} className="text-center py-3">
                <span className="text-xl block">{config.icon}</span>
                <p className={`text-xs font-display font-bold mt-1 ${config.color}`}>{config.label}</p>
                <p className="text-sm font-display font-bold text-neon-green mt-1">+{config.bonusXp} XP</p>
                <p className="text-[10px] text-muted-foreground font-body">+ Título exclusivo</p>
              </GameCard>
            );
          })}
        </div>
      </motion.div>

      {/* Promotion/Demotion Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <GameCard className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-green/10">
            <TrendingUp className="text-neon-green" size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body">Promoção</p>
            <p className="text-sm font-display font-bold text-neon-green">Top 3 sobem + recompensas</p>
          </div>
        </GameCard>
        <GameCard className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Minus className="text-muted-foreground" size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body">Manutenção</p>
            <p className="text-sm font-display font-bold text-foreground">Meio permanece</p>
          </div>
        </GameCard>
        <GameCard className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <TrendingDown className="text-destructive" size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-body">Rebaixamento</p>
            <p className="text-sm font-display font-bold text-destructive">Últimos 3 descem</p>
          </div>
        </GameCard>
      </motion.div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="font-display text-lg font-bold mb-3 text-foreground flex items-center gap-2">
          <Crown size={20} className="text-neon-gold" /> CLASSIFICAÇÃO — {leagueConfig.label.toUpperCase()}
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {leagueLeaderboard.length} hunters
          </span>
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : leagueLeaderboard.length === 0 ? (
          <GameCard className="text-center py-8">
            <p className="text-4xl mb-2">🏜️</p>
            <p className="text-muted-foreground font-body">Nenhum Hunter nesta liga ainda.</p>
            <p className="text-sm text-muted-foreground font-body mt-1">Complete missões para ganhar XP semanal!</p>
          </GameCard>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {leagueLeaderboard.map((entry, idx) => {
                const isMe = entry.user_id === user?.id;
                const position = idx + 1;
                const isTop3 = position <= 3;
                const isBottom3 = leagueLeaderboard.length > 6 && position > leagueLeaderboard.length - 3;

                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <GameCard
                      className={`flex items-center gap-3 py-3 transition-all
                        ${isMe ? "ring-2 ring-primary/50 bg-primary/5" : ""}
                        ${isTop3 ? "border-neon-green/20" : ""}
                        ${isBottom3 ? "border-destructive/20" : ""}`}
                    >
                      {/* Position */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg
                        ${position === 1 ? "bg-yellow-500/20 text-yellow-400" : ""}
                        ${position === 2 ? "bg-gray-400/20 text-gray-300" : ""}
                        ${position === 3 ? "bg-amber-600/20 text-amber-500" : ""}
                        ${position > 3 ? "bg-muted text-muted-foreground" : ""}`}
                      >
                        {position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : `${position}`}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10 border-2 border-border">
                        <AvatarImage src={entry.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-display text-sm">
                          {entry.hunter_name?.charAt(0) ?? "H"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-display font-bold text-sm truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                          {entry.hunter_name}
                          {isMe && <span className="text-xs text-primary ml-2">(Você)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">Nível {entry.level}</p>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <p className={`font-display font-bold text-sm ${isTop3 ? "text-neon-green" : "text-foreground"}`}>
                          {entry.xp_earned.toLocaleString()} XP
                        </p>
                        {isTop3 && (
                          <p className="text-[10px] text-neon-green font-body flex items-center gap-1">
                            <TrendingUp size={10} /> Promoção
                          </p>
                        )}
                        {isBottom3 && (
                          <p className="text-[10px] text-destructive font-body flex items-center gap-1">
                            <TrendingDown size={10} /> Risco
                          </p>
                        )}
                      </div>
                    </GameCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Your Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <GameCard className="text-center">
          <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-2">Seu XP Semanal</p>
          <p className="text-4xl font-display font-bold text-primary">
            {(userLeague?.xp_earned ?? 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground font-body mt-2">
            Complete missões para subir no ranking!
          </p>
        </GameCard>
      </motion.div>
    </div>
  );
};

export default Ranks;
