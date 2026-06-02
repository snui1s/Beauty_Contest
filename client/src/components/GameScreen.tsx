"use client";

import React, { useState, useEffect } from "react";
import { Player } from "@/hooks/useGameSocket";
import { Clock, CheckCircle2, Lock, PlusCircle, MinusCircle, Skull } from "lucide-react";

interface GameScreenProps {
  round: number;
  timer: number;
  players: Player[];
  socketId: string | null;
  submittedPlayerIds: string[];
  submitNumber: (number: number) => void;
}

export function GameScreen({
  round,
  timer,
  players,
  socketId,
  submittedPlayerIds,
  submitNumber,
}: GameScreenProps) {
  const [selectedNum, setSelectedNum] = useState<number>(50);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const localPlayer = players.find((p) => p.id === socketId);
  const isEliminated = localPlayer?.isEliminated || false;

  // Auto reset submission locking states when round increments
  useEffect(() => {
    setHasSubmitted(false);
  }, [round]);

  const increment = () => {
    if (selectedNum < 100) setSelectedNum((prev) => prev + 1);
  };

  const decrement = () => {
    if (selectedNum > 0) setSelectedNum((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasSubmitted || isEliminated) return;
    submitNumber(selectedNum);
    setHasSubmitted(true);
  };

  // Determine low-timer alert warnings
  const isLowTime = timer <= 10;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 animate-fade-in-up">
      {/* 1. Gameplay Input Form Panel */}
      <div className="md:col-span-3 glass-pane border-neon-cyan p-8 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[450px]">
        {/* Dynamic header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="space-y-0.5">
            <span className="text-[10px] tracking-[0.2em] font-mono text-neonCyan uppercase">GAME ACTIVE STATE</span>
            <h2 className="font-orbitron font-bold uppercase text-2xl text-white">
              ROUND <span className="text-neonCyan text-glow-cyan font-mono">{round}</span>
            </h2>
          </div>

          {/* Synchronized timer container */}
          <div className="flex items-center gap-2">
            <Clock className={`size-5 ${isLowTime ? "text-neonCrimson animate-pulse" : "text-neonCyan"}`} />
            <div className="flex flex-col items-end">
              <span className={`font-mono text-3xl font-extrabold tracking-widest ${
                isLowTime 
                  ? "text-neonCrimson text-glow-crimson animate-ping duration-1000" 
                  : "text-neonCyan text-glow-cyan"
              }`}>
                {timer}s
              </span>
            </div>
          </div>
        </div>

        {/* Core user control section */}
        {isEliminated ? (
          /* Elimination Spectator Mode */
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 py-8">
            <div className="w-16 h-16 rounded-full bg-neonCrimson/10 border border-neonCrimson/30 flex items-center justify-center animate-pulse">
              <Skull className="size-8 text-neonCrimson text-glow-crimson" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold uppercase font-orbitron text-neonCrimson text-glow-crimson">YOU HAVE BEEN ELIMINATED</h3>
              <p className="text-xs text-zinc-500 font-mono max-w-xs mx-auto">
                Your lifeline has been cut. You are spectating the remaining players in Spectator Mode.
              </p>
            </div>
          </div>
        ) : hasSubmitted ? (
          /* Locked State waiting indicator */
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6 py-8">
            <div className="w-16 h-16 rounded-full bg-neonCyan/10 border border-neonCyan/30 flex items-center justify-center">
              <Lock className="size-6 text-neonCyan text-glow-cyan" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-orbitron uppercase text-white tracking-wide">
                NUMBER LOCKED
              </h3>
              <div className="inline-block py-2 px-6 bg-zinc-950/80 border border-neonCyan/20 rounded-lg">
                <span className="text-xs font-mono text-zinc-400 mr-2">YOUR CHOICE:</span>
                <span className="font-orbitron font-extrabold text-2xl text-neonCyan text-glow-cyan">{selectedNum}</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono animate-pulse mt-2">
                Waiting for all other players to submit their selections...
              </p>
            </div>
          </div>
        ) : (
          /* Number input controller button grid form */
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
                SELECT YOUR NUMBER
              </span>
              
              {/* Giant retro LCD-style Cyan display */}
              <div className="w-full max-w-xl mx-auto h-24 bg-gradient-to-b from-cyan-100 to-cyan-300 border-2 border-cyan-400 rounded-xl flex flex-col justify-center items-center shadow-[0_0_20px_rgba(6,182,212,0.4)] relative overflow-hidden select-none">
                {/* Scanline mesh */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                <span className="font-orbitron text-6xl font-black text-zinc-950 leading-none">
                  {selectedNum}
                </span>
              </div>

              {/* Number Grid Layout */}
              <div className="py-2">
                {(() => {
                  const gridItems = [];
                  
                  // Row 0: 9 empty spaces + number 0
                  for (let i = 0; i < 9; i++) {
                    gridItems.push(
                      <div key={`empty-${i}`} className="bg-zinc-950/20 border border-zinc-900/30" />
                    );
                  }
                  
                  gridItems.push(
                    <button
                      key="num-0"
                      type="button"
                      onClick={() => setSelectedNum(0)}
                      className={`aspect-square flex items-center justify-center font-mono text-[10px] sm:text-xs border transition-all duration-100 ${
                        selectedNum === 0
                          ? "bg-zinc-950 text-neonCyan font-bold border-neonCyan shadow-[0_0_8px_#00f0ff]"
                          : "bg-cyan-200/90 hover:bg-cyan-300 text-zinc-950 border-cyan-300/40"
                      }`}
                    >
                      0
                    </button>
                  );

                  // Row 1 to 10: numbers 1 to 100
                  for (let num = 1; num <= 100; num++) {
                    gridItems.push(
                      <button
                        key={`num-${num}`}
                        type="button"
                        onClick={() => setSelectedNum(num)}
                        className={`aspect-square flex items-center justify-center font-mono text-[10px] sm:text-xs border transition-all duration-100 ${
                          selectedNum === num
                            ? "bg-zinc-950 text-neonCyan font-bold border-neonCyan shadow-[0_0_8px_#00f0ff]"
                            : "bg-cyan-200/90 hover:bg-cyan-300 text-zinc-950 border-cyan-300/40"
                      }`}
                      >
                        {num}
                      </button>
                    );
                  }

                  return (
                    <div className="grid grid-cols-10 gap-[2px] bg-zinc-900 p-[2px] border border-zinc-800 rounded-lg overflow-hidden max-w-lg mx-auto shadow-2xl">
                      {gridItems}
                    </div>
                  );
                })()}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 font-orbitron font-bold uppercase rounded-lg text-sm bg-neonCyan text-zinc-950 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,240,255,0.45)]"
            >
              <Lock className="size-4" /> Lock Submission
            </button>
          </form>
        )}
      </div>

      {/* 2. Side Panel Player Status Monitor */}
      <div className="md:col-span-2 glass-pane border-neon-cyan p-6 rounded-xl relative overflow-hidden flex flex-col gap-4">
        {/* Decorative corner lines */}
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neonCyan"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neonCyan"></div>

        <div className="border-b border-zinc-800 pb-2">
          <h3 className="font-orbitron font-bold text-sm tracking-wider uppercase text-neonCyan">
            SUBMISSION MONITOR
          </h3>
        </div>

        <div className="space-y-3 flex-grow overflow-y-auto max-h-[350px]">
          {players.map((p) => {
            const hasSent = submittedPlayerIds.includes(p.id) || p.currentSubmit !== null;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-lg border text-sm font-mono transition-all duration-300 ${
                  p.isEliminated 
                    ? "bg-zinc-950 border-zinc-950 opacity-40 text-zinc-650"
                    : hasSent 
                      ? "bg-neonCyan/5 border-neonCyan/20 text-neonCyan" 
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`size-1.5 rounded-full ${
                    p.isEliminated 
                      ? "bg-zinc-700" 
                      : hasSent 
                        ? "bg-neonCyan animate-pulse shadow-[0_0_5px_#00f0ff]" 
                        : "bg-zinc-650"
                  }`} />
                  <span className="truncate">{p.username}</span>
                  {p.id === socketId && <span className="text-[9px] font-sans px-1 rounded bg-zinc-800 text-zinc-400">YOU</span>}
                </div>

                <div>
                  {p.isEliminated ? (
                    <span className="text-[10px] text-neonCrimson uppercase tracking-wider font-bold">ELIMINATED</span>
                  ) : hasSent ? (
                    <span className="text-xs flex items-center gap-1 font-bold">
                      <CheckCircle2 className="size-3.5" /> SUBMITTED
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500 animate-pulse">THINKING...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
