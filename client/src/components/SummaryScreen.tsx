"use client";

import React from "react";
import { RoundResults, Player } from "@/hooks/useGameSocket";
import { Award, ArrowRight, Skull, Calculator, TrendingDown } from "lucide-react";

interface SummaryScreenProps {
  results: RoundResults | null;
  players: Player[];
  socketId: string | null;
  nextRound: () => void;
}

export function SummaryScreen({
  results,
  players,
  socketId,
  nextRound,
}: SummaryScreenProps) {
  if (!results) return null;

  const isHost = players.find((p) => p.id === socketId)?.isHost || false;

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      {/* Cinematic Round Winner Card */}
      <div className="glass-pane border-neon-cyan p-8 rounded-xl relative overflow-hidden text-center space-y-4">
        {/* Dynamic decorative backdrop grids */}
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase text-zinc-400 font-mono tracking-wider">
            Round Winners
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-orbitron font-extrabold text-white">
            {results.winners.length > 0 ? (
              results.winners.map((winner, idx) => {
                const winSub = results.submissions.find(s => s.username === winner);
                const winNum = winSub ? winSub.number : "?";
                return (
                  <span key={idx} className="text-neonCyan text-glow-cyan">
                    {winner} <span className="text-2xl font-mono">({winNum})</span>
                    {idx < results.winners.length - 1 ? "," : ""}
                  </span>
                );
              })
            ) : (
              <span className="text-zinc-500">No Winners</span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <span>Target Result: <span className="text-neonCyan font-bold text-glow-cyan">{results.targetResult}</span></span>
            <span className="text-zinc-700">|</span>
            <span>Closest Pick survives</span>
          </div>
        </div>
      </div>

      {/* Special Dynamic Rule Alert Banner */}
      {results.ruleApplied && results.ruleApplied !== "None" && (
        <div className="glass-pane border-neonCrimson/45 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono text-center md:text-left relative overflow-hidden bg-gradient-to-r from-neonCrimson/5 to-transparent">
          {/* Decorative neon warning left line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-neonCrimson shadow-[0_0_8px_#ff003c]" />
          
          <div className="space-y-1 pl-2">
            <span className="text-[10px] tracking-wider text-neonCrimson uppercase font-bold">
              ⚡ ACTIVE DYNAMIC RULE PROTOCOL
            </span>
            <div className="text-zinc-200">
              {results.ruleApplied === "Duplicate Numbers Invalidated" && (
                <span>Duplicate picks detected and invalidated! Repeated numbers were excluded from the average calculation, and duplicate pickers were penalized (-1).</span>
              )}
              {results.ruleApplied === "Exact Target Hit! Penalty Doubled (-2 Pts)" && (
                <span>Exact target matched! A player chose the exact winning number (average × 0.8). All other players lose -2 points instead of -1.</span>
              )}
              {results.ruleApplied === "0 vs 100 Duel Clash" && (
                <span>1v1 Duel 0 vs 100 clash! One player chose 0 and the other chose 100. Calculation bypassed; the player choosing 100 wins the duel immediately.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Math Calculations vs Player Choices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Step-by-Step Math Calculations */}
        <div className="glass-pane border-zinc-800 p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-orbitron font-bold text-sm tracking-wider uppercase text-neonCyan flex items-center gap-2 border-b border-zinc-800 pb-2">
              The Math
            </h3>

            {/* Calculations layout */}
            <div className="space-y-4 font-mono text-sm text-zinc-400">
              <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-850 flex items-center justify-between">
                <span>1. Calculate Average:</span>
                <span className="text-white font-bold">{results.average}</span>
              </div>

              <div className="flex justify-center my-1">
                <ArrowRight className="size-4 text-zinc-650 rotate-90 md:rotate-90" />
              </div>

              <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-850 flex items-center justify-between">
                <span>2. Multiply by Scale (0.8):</span>
                <span className="text-zinc-500 font-bold">{results.average} &times; 0.8</span>
              </div>

              <div className="flex justify-center my-1">
                <ArrowRight className="size-4 text-zinc-650 rotate-90 md:rotate-90" />
              </div>

              {/* Massive neon final Result display */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-neonCyan/30 text-center space-y-1 relative overflow-hidden">
                <span className="text-[9px] uppercase tracking-wider text-neonCyan">Target Result (Average * 0.8)</span>
                <div className="font-orbitron text-4xl font-extrabold text-neonCyan text-glow-cyan font-mono">
                  {results.targetResult}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Player Choices Display List */}
        <div className="glass-pane border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="font-orbitron font-bold text-sm tracking-wider uppercase text-neonCyan flex items-center gap-2 border-b border-zinc-800 pb-2">
              Submitted Numbers
            </h3>

            <div className="space-y-3 mt-4">
              {results.submissions.map((sub, idx) => {
                const isWinner = results.winners.includes(sub.username);
                const diff = Math.abs(sub.number - results.targetResult);

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm font-mono transition-all duration-300 ${
                      isWinner 
                        ? "bg-neonCyan/5 border-neonCyan/30 text-neonCyan shadow-[0_0_5px_rgba(0,240,255,0.05)]" 
                        : "bg-zinc-950/50 border-zinc-900 text-zinc-400"
                    }`}
                  >
                    <span>{sub.username}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-500 text-xs">(&Delta; {diff.toFixed(2)})</span>
                      <span className={`text-lg font-bold font-mono ${isWinner ? "text-neonCyan text-glow-cyan" : "text-zinc-200"}`}>
                        {sub.number}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Point deductions and eliminations notifications card */}
      <div className="glass-pane border-neon-crimson p-6 rounded-xl space-y-4">
        <h3 className="font-orbitron font-bold text-sm tracking-wider uppercase text-neonCrimson flex items-center gap-2 border-b border-zinc-800 pb-2">
          Point Deductions & Eliminations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
          {/* Deductions column */}
          <div className="space-y-2">
            <span className="text-xs uppercase text-zinc-500">Penalized:</span>
            {results.deductions && results.deductions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {results.deductions.map((ded, idx) => (
                  <span key={idx} className="text-xs bg-neonCrimson/10 border border-neonCrimson/25 px-2 py-1 rounded text-neonCrimson font-bold">
                    {ded.username} (-{ded.pointsDeducted})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No point deductions this round.</p>
            )}
          </div>

          {/* Eliminations column */}
          <div className="space-y-2">
            <span className="text-xs uppercase text-zinc-500">Eliminated:</span>
            {results.eliminatedThisRound.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {results.eliminatedThisRound.map((username, idx) => (
                  <span key={idx} className="text-xs bg-neonCrimson border border-neonCrimson/40 px-2.5 py-1 rounded text-zinc-950 font-bold flex items-center gap-1">
                    <Skull className="size-3 text-zinc-950 fill-zinc-950" /> {username} (DEAD)
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No eliminations this round.</p>
            )}
          </div>
        </div>
      </div>

      {/* Host navigation control actions */}
      <div className="flex justify-center pt-4">
        {isHost ? (
          <button
            onClick={nextRound}
            className="w-full max-w-sm py-4 font-orbitron font-bold uppercase rounded-lg text-sm bg-neonCyan text-cyan-950 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,240,255,0.45)]"
          >
            Start Next Round <ArrowRight className="size-4" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3 py-3 text-sm text-zinc-400 font-mono animate-pulse">
            <div className="size-2 bg-neonCyan rounded-full animate-ping"></div>
            <span>Waiting for Host to start the next round...</span>
          </div>
        )}
      </div>
    </div>
  );
}
