"use client";

import React from "react";
import { RoundResults, Player } from "@/hooks/useGameSocket";
import { Skull, RotateCcw, Home, Award } from "lucide-react";

interface GameOverScreenProps {
  results: RoundResults | null;
  players: Player[];
  socketId: string | null;
  restartGame: () => void;
}

export function GameOverScreen({
  results,
  players,
  socketId,
  restartGame,
}: GameOverScreenProps) {
  if (!results) return null;

  const isHost = players.find((p) => p.id === socketId)?.isHost || false;
  const champion = results.ultimateWinner;

  return (
    <div className="max-w-xl mx-auto glass-pane border-neon-crimson p-8 rounded-xl relative overflow-hidden text-center space-y-8 animate-fade-in-up">
      {/* Absolute red death vignette background */}
      <div className="absolute inset-0 bg-gradient-to-t from-neonCrimson/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 p-3 text-[9px] font-mono text-neonCrimson/40 uppercase">
        TERMINAL TERMINATED
      </div>

      <div className="space-y-4">
        {/* Glowing death emblem */}
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-neonCrimson/10 border border-neonCrimson/25 animate-pulse">
          <Skull className="size-12 text-neonCrimson text-glow-crimson" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] tracking-[0.25em] font-mono text-neonCrimson font-bold uppercase">GAME OVER</span>
          <h2 className="text-3xl font-orbitron font-black uppercase text-white tracking-wider">
            ARENA TERMINATED
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            All other lifelines severed. One final survivor remains.
          </p>
        </div>
      </div>

      {/* Showcase Ultimate Champion */}
      {champion ? (
        <div className="bg-zinc-950/80 border border-neonCyan/30 p-6 rounded-xl space-y-3 relative overflow-hidden">
          {/* Cyan glow overlay */}
          <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-neonCyan/30 uppercase">
            CHAMPION VERIFIED
          </div>
          
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-neonCyan/10 border border-neonCyan/20">
            <Award className="size-6 text-neonCyan text-glow-cyan" />
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] tracking-[0.2em] font-mono text-zinc-500 uppercase">ULTIMATE SURVIVOR</span>
            <div className="text-2xl font-orbitron font-extrabold text-neonCyan text-glow-cyan truncate">
              {champion.username}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Final points remaining: <span className="text-white font-bold">{champion.points} pts</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl">
          <span className="text-sm font-mono text-zinc-500">No clear survivor found. Mutual elimination.</span>
        </div>
      )}

      {/* Host controller controls */}
      <div className="border-t border-zinc-800 pt-6">
        {isHost ? (
          <div className="space-y-4">
            <button
              onClick={restartGame}
              className="w-full py-4 font-orbitron font-bold uppercase rounded-lg text-sm bg-neonCyan text-zinc-950 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,240,255,0.45)]"
            >
              <RotateCcw className="size-4" /> Play Again
            </button>
            <p className="text-[10px] text-zinc-500 font-mono">
              *Restarting will reset all points to 0 and return everyone to the lobby.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-3 text-sm text-zinc-400 font-mono animate-pulse">
            <div className="size-2 bg-neonCrimson rounded-full animate-ping"></div>
            <span>Waiting for Host to restart the game...</span>
          </div>
        )}
      </div>
    </div>
  );
}
