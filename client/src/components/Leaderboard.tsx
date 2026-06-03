"use client";

import React from "react";
import { Player, RoomSettings } from "@/hooks/useGameSocket";
import { ShieldAlert, Award, Skull, CheckCircle2 } from "lucide-react";

interface LeaderboardProps {
  players: Player[];
  socketId: string | null;
  submittedPlayerIds?: string[];
  gameState?: "LOBBY" | "PLAYING" | "ROUND_SUMMARY" | "GAME_OVER";
  settings?: RoomSettings;
}

export function Leaderboard({ players, socketId, submittedPlayerIds = [], gameState, settings }: LeaderboardProps) {
  const startingPoints = settings ? settings.startingPoints : 10;
  const isDangerThreshold = 2;
  const eliminationLimit = 0;

  // Sort players: Active first, then by points descending (least negative is higher)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    return b.points - a.points;
  });

  return (
    <div className="glass-pane border-neon-cyan p-6 rounded-xl relative overflow-hidden transition-all duration-300">
      {/* Decorative Corner lines */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neonCyan"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neonCyan"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neonCyan"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neonCyan"></div>

      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
        <h3 className="font-orbitron font-bold uppercase text-lg text-neonCyan tracking-wider flex items-center gap-2">
          LIFELINE INDEX
        </h3>
        <span className="text-xs text-zinc-500 font-mono">STARTING POINTS: {startingPoints}</span>
      </div>

      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const isSelf = player.id === socketId;
          const isSubmitted = submittedPlayerIds.includes(player.id) || player.currentSubmit !== null;
          
          // Determine point hazard alerts
          const isDanger = player.points <= isDangerThreshold;
          const isEliminated = player.isEliminated || player.points <= eliminationLimit;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                isSelf 
                  ? "bg-zinc-900/80 border-neonCyan/40" 
                  : "bg-zinc-950/40 border-zinc-800"
              } ${isEliminated ? "opacity-40 saturate-50 border-zinc-950 bg-zinc-950" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-zinc-500 w-5">#{index + 1}</span>
                
                <div className="flex flex-col">
                  <span className={`font-medium tracking-wide flex items-center gap-1.5 ${
                    isSelf ? "text-neonCyan font-bold" : "text-zinc-100"
                  }`}>
                    {player.username}
                    {isSelf && <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neonCyan/10 text-neonCyan">YOU</span>}
                    {player.isHost && <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Host</span>}
                  </span>
                  
                  {/* Status indicator during PLAYING phase */}
                  {gameState === "PLAYING" && !isEliminated && (
                    <span className="text-xs flex items-center gap-1 mt-0.5 font-mono">
                      {isSubmitted ? (
                        <span className="text-neonCyan flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> SUBMITTED
                        </span>
                      ) : (
                        <span className="text-zinc-500 animate-pulse">THINKING...</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Score badge with warning colors */}
                <div className="flex flex-col items-end">
                  <span className={`font-mono text-lg font-bold ${
                    isEliminated 
                      ? "text-zinc-600 line-through" 
                      : isDanger 
                        ? "text-neonCrimson text-glow-crimson animate-pulse" 
                        : "text-zinc-100"
                  }`}>
                    {player.points} <span className="text-xs text-zinc-500 font-normal">pts</span>
                  </span>
                  
                  {/* Visual health bar */}
                  <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1 relative">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        isEliminated
                          ? "bg-zinc-700 w-0"
                          : isDanger
                            ? "bg-neonCrimson shadow-[0_0_5px_#ff003c]"
                            : "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                      }`}
                      style={{ width: `${Math.max(0, (player.points / startingPoints) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status Icon */}
                <div>
                  {isEliminated ? (
                    <div className="p-1 rounded bg-neonCrimson/10 border border-neonCrimson/20" title="Eliminated">
                      <Skull className="size-5 text-neonCrimson text-glow-crimson" />
                    </div>
                  ) : isDanger ? (
                    <div title="Danger Zone">
                      <ShieldAlert className="size-5 text-neonCrimson animate-pulse" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
