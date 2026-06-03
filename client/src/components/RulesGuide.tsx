"use client";

import React from "react";
import { Player, RoomSettings } from "@/hooks/useGameSocket";
import { Scale } from "lucide-react";

interface RulesGuideProps {
  players: Player[];
  settings?: RoomSettings;
}

export function RulesGuide({ players, settings }: RulesGuideProps) {
  // Determine active survivors (players not eliminated and currently connected)
  const activePlayers = players.filter((p) => !p.isEliminated);
  const activeCount = activePlayers.length;

  const rule4Enabled = settings ? settings.rule4Enabled !== false : true;
  const rule3Enabled = settings ? settings.rule3Enabled !== false : true;
  const rule2Enabled = settings ? settings.rule2Enabled !== false : true;

  const isRule4Active = activeCount <= 4 && rule4Enabled;
  const isRule3Active = activeCount <= 3 && rule3Enabled;
  const isRule2Active = activeCount <= 2 && rule2Enabled;

  const getCardStyle = (isActive: boolean, isEnabled: boolean = true) => {
    if (!isEnabled) {
      return "p-3 rounded-lg border border-zinc-950/20 bg-zinc-950/40 text-zinc-650 opacity-40 relative overflow-hidden transition-all duration-300";
    }
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
        <div className={getCardStyle(activeCount >= 1, true)}>
          {activeCount >= 1 && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_8px_#00f0ff]" />
          )}
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold uppercase ${activeCount >= 1 ? "text-neonCyan text-glow-cyan" : ""}`}>
              5 Players: Standard Base (Core Fallback)
            </span>
            {activeCount >= 1 && (
              <span className="text-[9px] uppercase font-bold bg-neonCyan/10 px-1.5 py-0.5 rounded text-neonCyan animate-pulse">
                Active
              </span>
            )}
          </div>
          <p className={activeCount >= 1 ? "text-zinc-200" : "text-zinc-650"}>
            All picks from 0 to 100 are averaged. Target = Average &times; 0.8. Closest survival, losers penalized -1 pt.
          </p>
        </div>

        {/* 4 Players Rule */}
        <div className={getCardStyle(isRule4Active, rule4Enabled)}>
          {isRule4Active && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_8px_#00f0ff]" />
          )}
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold uppercase ${isRule4Active ? "text-neonCyan text-glow-cyan" : ""}`}>
              4 Players: Duplicate Invalidation
            </span>
            {!rule4Enabled ? (
              <span className="text-[9px] uppercase font-bold bg-zinc-900/60 px-1.5 py-0.5 rounded text-zinc-600 border border-zinc-800/80">
                Disabled
              </span>
            ) : isRule4Active ? (
              <span className="text-[9px] uppercase font-bold bg-neonCyan/10 px-1.5 py-0.5 rounded text-neonCyan animate-pulse">
                Active
              </span>
            ) : null}
          </div>
          <p className={isRule4Active ? "text-zinc-200" : "text-zinc-650"}>
            If two or more players choose the exact same number, that number becomes invalid (excluded from average) and those players lose 1 point.
          </p>
        </div>

        {/* 3 Players Rule */}
        <div className={getCardStyle(isRule3Active, rule3Enabled)}>
          {isRule3Active && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_8px_#00f0ff]" />
          )}
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold uppercase ${isRule3Active ? "text-neonCyan text-glow-cyan" : ""}`}>
              3 Players: Exact Target Penalty
            </span>
            {!rule3Enabled ? (
              <span className="text-[9px] uppercase font-bold bg-zinc-900/60 px-1.5 py-0.5 rounded text-zinc-600 border border-zinc-800/80">
                Disabled
              </span>
            ) : isRule3Active ? (
              <span className="text-[9px] uppercase font-bold bg-neonCyan/10 px-1.5 py-0.5 rounded text-neonCyan animate-pulse">
                Active
              </span>
            ) : null}
          </div>
          <p className={isRule3Active ? "text-zinc-200" : "text-zinc-650"}>
            If any player chooses the exact winning number (matching average &times; 0.8), all other players lose 2 points instead of 1.
          </p>
        </div>

        {/* 2 Players Rule */}
        <div className={getCardStyle(isRule2Active, rule2Enabled)}>
          {isRule2Active && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCyan shadow-[0_0_8px_#00f0ff]" />
          )}
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold uppercase ${isRule2Active ? "text-neonCyan text-glow-cyan" : ""}`}>
              2 Players: Duel 0 vs 100
            </span>
            {!rule2Enabled ? (
              <span className="text-[9px] uppercase font-bold bg-zinc-900/60 px-1.5 py-0.5 rounded text-zinc-600 border border-zinc-800/80">
                Disabled
              </span>
            ) : isRule2Active ? (
              <span className="text-[9px] uppercase font-bold bg-neonCyan/10 px-1.5 py-0.5 rounded text-neonCyan animate-pulse">
                Active
              </span>
            ) : null}
          </div>
          <p className={isRule2Active ? "text-zinc-200" : "text-zinc-650"}>
            If one player chooses 0 and another player chooses 100, the 100 automatically wins the round immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
