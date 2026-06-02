"use client";

import React from "react";
import { Player } from "@/hooks/useGameSocket";
import { Scale, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

interface RuleIntroModalProps {
  milestone: number;
  players: Player[];
  socketId: string | null;
  acknowledgedPlayerIds: string[];
  acknowledgeRule: () => void;
}

export function RuleIntroModal({
  milestone,
  players,
  socketId,
  acknowledgedPlayerIds,
  acknowledgeRule,
}: RuleIntroModalProps) {
  const activePlayers = players.filter((p) => !p.isEliminated);
  const isSelfAcknowledged = socketId ? acknowledgedPlayerIds.includes(socketId) : false;

  // Generate description and examples based on milestone
  let ruleTitle = "";
  let ruleDesc = "";
  let exampleText = "";

  if (milestone === 4) {
    ruleTitle = "Duplicate Invalidation Protocol";
    ruleDesc = "Duplicate picks are invalidated! If 2 or more players select the exact same number, their choices are discarded, excluded from the average calculation, and they are penalized immediately.";
    exampleText = "Player A & B pick 15. Player C picks 20, D picks 50. A & B's picks are invalidated. Only 20 and 50 are valid. Average = (20+50)/2 = 35. Target = 35 × 0.8 = 28. Player C (20) wins because 20 is closest to 28. Players A, B, and D lose points.";
  } else if (milestone === 3) {
    ruleTitle = "Duplicate Penalty -2 Pts & 0 vs 100 Three-Way";
    ruleDesc = "1. Duplicate picks remain invalidated, but the penalty for duplicate pickers increases to -2 points instead of -1.\n2. 0 vs 100 Three-Way Clash: If one player picks 0 and another picks 100, the 100 picker wins the round immediately, bypassing average calculation.";
    exampleText = "Example 1 (Duplicates): Player A & B pick 25, C picks 30. A & B lose -2 pts each; Player C wins.\n\nExample 2 (0 vs 100): Player A picks 0, Player B picks 100, Player C picks 50. Since both 0 and 100 are chosen, Player B wins immediately. Player A & C lose points.";
  } else if (milestone === 2) {
    ruleTitle = "1v1 Duel 0 vs 100 Protocol";
    ruleDesc = "In a 1v1 duel, the 0 vs 100 Clash rule remains active. If one picks 0 and the other picks 100, the 100 picker wins immediately. Duplicate picks are still invalidated and penalized with -2 points.";
    exampleText = "Example 1 (0 vs 100): Player A picks 0, Player B picks 100. Player B wins immediately.\n\nExample 2 (Duplicate): Player A & B both pick 50. Since they match, they are invalidated and both lose -2 pts.";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/80 animate-fade-in">
      {/* Cinematic border wrapper */}
      <div className="max-w-xl w-full glass-pane border-neon-cyan p-8 rounded-xl relative overflow-hidden flex flex-col gap-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] animate-scale-up">
        {/* Neon decorative highlights */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neonCyan"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neonCyan"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neonCyan"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neonCyan"></div>

        {/* Header flashing warning */}
        <div className="text-center space-y-1.5 border-b border-zinc-800 pb-4">
          <span className="text-[10px] tracking-[0.3em] text-neonCrimson uppercase font-orbitron font-bold animate-pulse flex items-center justify-center gap-1.5">
            <ShieldAlert className="size-3.5" /> NEW SURVIVAL PROTOCOL AUTHORIZED <ShieldAlert className="size-3.5" />
          </span>
          <h2 className="font-orbitron font-black text-xl text-white uppercase tracking-tight">
            {ruleTitle}
          </h2>
          <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase block">
            Milestone: {milestone} Active Survivors Remaining
          </span>
        </div>

        {/* Scrollable rule body */}
        <div className="space-y-4 font-mono text-xs max-h-[300px] overflow-y-auto pr-1">
          {/* Explanation box */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-neonCyan uppercase tracking-widest block">
              ▲ Rule Description:
            </span>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/50 p-3 rounded-lg border border-zinc-900">
              {ruleDesc}
            </p>
          </div>

          {/* Example Box */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-neonCyan uppercase tracking-widest block">
              ▲ Concrete Example:
            </span>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-line bg-zinc-950/80 p-3 rounded-lg border border-zinc-900 italic">
              {exampleText}
            </p>
          </div>
        </div>

        {/* Acknowledgment monitor list */}
        <div className="border-t border-zinc-900 pt-4 space-y-2">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
            Acknowledge status ({acknowledgedPlayerIds.length}/{activePlayers.length} ready):
          </span>
          <div className="grid grid-cols-2 gap-2">
            {activePlayers.map((p) => {
              const isReady = acknowledgedPlayerIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`p-2 rounded border text-[11px] font-mono flex items-center justify-between transition-all duration-300 ${
                    isReady
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-500"
                  }`}
                >
                  <span className="truncate">{p.username}</span>
                  {isReady ? (
                    <CheckCircle2 className="size-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Loader2 className="size-3.5 text-zinc-650 animate-spin flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isSelfAcknowledged ? (
            <div className="w-full py-3.5 bg-zinc-950 border border-emerald-500/30 text-emerald-400 rounded-lg font-orbitron font-bold text-xs uppercase text-center flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Waiting for other players...
            </div>
          ) : (
            <button
              onClick={acknowledgeRule}
              className="w-full py-4 font-orbitron font-bold uppercase rounded-lg text-xs bg-neonCyan text-zinc-950 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,240,255,0.45)]"
            >
              <Scale className="size-4" /> Confirm Lifeline Interface
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
