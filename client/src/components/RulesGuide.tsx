"use client";

import React from "react";
import { Player } from "@/hooks/useGameSocket";
import { Scale } from "lucide-react";

interface RulesGuideProps {
  players: Player[];
}

export function RulesGuide({ players }: RulesGuideProps) {
  // Determine active survivors (players not eliminated and currently connected)
  const activePlayers = players.filter((p) => !p.isEliminated);
  const activeCount = activePlayers.length;

  const getCardStyle = (isActive: boolean) => {
    return `p-3 rounded-lg border transition-all duration-300 relative overflow-hidden ${
      isActive
        ? "pl-4 pr-3 py-3 border-neonCyan bg-gradient-to-r from-neonCyan/10 via-neonCyan/5 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.25)] text-white"
        : "bg-zinc-950/20 border-zinc-900/60 text-zinc-500"
    }`;
  };

  return (
    <div className="glass-pane border-zinc-800 p-6 rounded-xl relative overflow-hidden space-y-4">
      {/* Decorative corner highlights */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700"></div>

      <div className="border-b border-zinc-800 pb-2">
        <h3 className="font-orbitron font-bold text-xs tracking-wider uppercase text-neonCyan flex items-center gap-2">
          <Scale className="size-4 text-neonCyan" /> DYNAMIC GAME PROTOCOLS
        </h3>
        <p className="text-[10px] font-mono text-zinc-500 mt-1">
          Rules shift dynamically based on remaining survivors.
        </p>
      </div>

      <div className="space-y-3 font-mono text-[11px] leading-relaxed">
        {/* Core Base Rule */}
        <div className={getCardStyle(activeCount >= 2)}>
          {activeCount >= 2 && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_8px_#00f0ff]" />
          )}
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold uppercase ${activeCount >= 2 ? "text-neonCyan text-glow-cyan" : ""}`}>
              5 Players: Standard Base (Core Fallback)
            </span>
            {activeCount >= 2 && (
              <span className="text-[9px] uppercase font-bold bg-neonCyan/10 px-1.5 py-0.5 rounded text-neonCyan animate-pulse">
                Active
              </span>
            )}
          </div>
          <p className={activeCount >= 2 ? "text-zinc-200" : "text-zinc-650"}>
            All picks from 0 to 100 are averaged. Target = Average &times; 0.8. Closest survival, losers penalized -1 pt.
          </p>
        </div>

        {/* 4 Players Rule */}
        <div className={getCardStyle(activeCount <= 4)}>
          {activeCount <= 4 && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_8px_#00f0ff]" />
          )}
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold uppercase ${activeCount <= 4 ? "text-neonCyan text-glow-cyan" : ""}`}>
              4 Players: Duplicate Invalidation
            </span>
            {activeCount <= 4 && (
              <span className="text-[9px] uppercase font-bold bg-neonCyan/10 px-1.5 py-0.5 rounded text-neonCyan animate-pulse">
                Active
              </span>
            )}
          </div>
          <p className={activeCount <= 4 ? "text-zinc-200" : "text-zinc-650"}>
            Repeated numbers are invalidated, excluded from average, and duplicate pickers are penalized -1 pt immediately.
          </p>
        </div>

        {/* 3 Players Rule */}
        <div className={getCardStyle(activeCount <= 3)}>
          {activeCount <= 3 && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_8px_#00f0ff]" />
          )}
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold uppercase ${activeCount <= 3 ? "text-neonCyan text-glow-cyan" : ""}`}>
              3 Players: Duplicate -2 Pts & 0 vs 100
            </span>
            {activeCount <= 3 && (
              <span className="text-[9px] uppercase font-bold bg-neonCyan/10 px-1.5 py-0.5 rounded text-neonCyan animate-pulse">
                Active
              </span>
            )}
          </div>
          <p className={activeCount <= 3 ? "text-zinc-200" : "text-zinc-650"}>
            Duplicate picks are invalidated, and duplicate pickers lose -2 pts. If no duplicates, and someone picks 0 while another picks 100, the 100 picker wins immediately.
          </p>
        </div>

        {/* 2 Players Rule */}
        <div className={getCardStyle(activeCount <= 2)}>
          {activeCount <= 2 && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_8px_#00f0ff]" />
          )}
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold uppercase ${activeCount <= 2 ? "text-neonCyan text-glow-cyan" : ""}`}>
              2 Players: 1v1 Duel 0 vs 100
            </span>
            {activeCount <= 2 && (
              <span className="text-[9px] uppercase font-bold bg-neonCyan/10 px-1.5 py-0.5 rounded text-neonCyan animate-pulse">
                Active
              </span>
            )}
          </div>
          <p className={activeCount <= 2 ? "text-zinc-200" : "text-zinc-650"}>
            If one player picks 0 and the other picks 100, the 100 picker wins the duel immediately. Otherwise, normal rules apply.
          </p>
        </div>
      </div>
    </div>
  );
}
