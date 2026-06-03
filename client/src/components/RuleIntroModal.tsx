"use client";

import React, { useState } from "react";
import { Player, RoomSettings } from "@/hooks/useGameSocket";
import {
  Scale,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface RuleIntroModalProps {
  milestone: number;
  players: Player[];
  socketId: string | null;
  acknowledgedPlayerIds: string[];
  acknowledgeRule: () => void;
  settings?: RoomSettings;
}

// ---------------------------------------------------------------------------
// All rule slides defined in order (highest milestone first = intro first)
// ---------------------------------------------------------------------------
const ALL_SLIDES = [
  {
    id: 5,
    badge: "GAME BRIEFING — ALICE IN BORDERLAND",
    subtitle: "Read carefully before the game begins",
    title: "How to Play",
    desc:
      "Each round, every player submits a number between 0 and 100.\n\n" +
      "The target is calculated as:\n  Target = Average of all submitted numbers × 0.8\n\n" +
      "The player whose number is closest to the target WINS the round.\n" +
      "All other players lose 1 point.\n\n" +
      "A player is eliminated when their score reaches 0.\n" +
      "The last surviving player wins the game.\n\n" +
      "Additional rules activate automatically as the player count drops — you will be notified before each new rule takes effect.",
    example:
      "4 players submit: 20, 35, 50, 80.\n" +
      "Average = (20+35+50+80) / 4 = 46.25\n" +
      "Target  = 46.25 × 0.8 = 37\n\n" +
      "Player who submitted 35 is closest to 37 → wins the round.\n" +
      "Players who submitted 20, 50, and 80 each lose -1 point.",
  },
  {
    id: 4,
    badge: "NEW SURVIVAL PROTOCOL — 4 PLAYERS",
    subtitle: "Milestone: 4 Active Survivors Remaining",
    title: "Duplicate Invalidation Protocol",
    desc:
      "If two or more players choose the exact same number, that number becomes invalid and is excluded from the average calculation. Those players lose 1 point.",
    example:
      "Player A & B both pick 15. Player C picks 20, D picks 50.\n\n" +
      "A & B's duplicate picks are invalidated and excluded.\n" +
      "Valid picks: 20, 50  →  Average = 35  →  Target = 35 × 0.8 = 28\n\n" +
      "Player C (20) is closest to 28 → wins.\n" +
      "Players A and B lose 1 point each for duplicate selection. Player D loses 1 point for not being closest.",
  },
  {
    id: 3,
    badge: "NEW SURVIVAL PROTOCOL — 3 PLAYERS",
    subtitle: "Milestone: 3 Active Survivors Remaining",
    title: "Exact Target Penalty Protocol",
    desc:
      "If any player chooses the exact winning number (matching average × 0.8), all other players lose 2 points instead of 1.",
    example:
      "3 players submit: 10, 40, 50.\n" +
      "Average = 100 / 3 = 33.33.\n" +
      "Target = 33.33 × 0.8 = 26.66 (closest integer is 27).\n\n" +
      "If average was 50, Target is exactly 40.\n" +
      "Player B submitted exactly 40 (the target) → wins.\n" +
      "Players A and C each lose -2 points instead of -1.",
  },
  {
    id: 2,
    badge: "NEW SURVIVAL PROTOCOL — 2 PLAYERS",
    subtitle: "Milestone: Final Duel — 2 Survivors Remaining",
    title: "1v1 Duel Protocol",
    desc:
      "All previously activated rules remain in effect in the final duel (duplicate invalidation and exact target penalty).\n\n" +
      "If one player chooses 0 and another player chooses 100, the 100 automatically wins the round immediately.",
    example:
      "Example 1 (0 vs 100):\n" +
      "Player A picks 0, Player B picks 100.\n" +
      "Player B wins immediately.\n\n" +
      "Example 2 (Duplicate):\n" +
      "Player A & B both pick 50.\n" +
      "Both picks are invalidated — both lose -1 pt.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RuleIntroModal({
  milestone,
  players,
  socketId,
  acknowledgedPlayerIds,
  acknowledgeRule,
  settings,
}: RuleIntroModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const activePlayers = players.filter((p) => !p.isEliminated);
  const isSelfAcknowledged = socketId
    ? acknowledgedPlayerIds.includes(socketId)
    : false;

  // Show all slides with id >= milestone (cumulative, intro always included)
  const slides = ALL_SLIDES.filter((s) => {
    if (s.id === 4 && settings && !settings.rule4Enabled) return false;
    if (s.id === 3 && settings && !settings.rule3Enabled) return false;
    if (s.id === 2 && settings && !settings.rule2Enabled) return false;

    // If milestone is 5 (Game Onboarding), include rules that are already active for this player count
    if (milestone === 5) {
      if (s.id === 4) return activePlayers.length <= 4;
      if (s.id === 3) return activePlayers.length <= 3;
      if (s.id === 2) return activePlayers.length <= 2;
    }

    return s.id >= milestone;
  });
  const totalSlides = slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;
  const slide = slides[currentSlide];

  const goNext = () => setCurrentSlide((p) => Math.min(p + 1, totalSlides - 1));
  const goPrev = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/80 animate-fade-in">
      <div className="max-w-xl w-full glass-pane border-neon-cyan p-8 rounded-xl relative overflow-hidden flex flex-col gap-5 shadow-[0_0_50px_rgba(0,240,255,0.15)] animate-scale-up">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neonCyan" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neonCyan" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neonCyan" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neonCyan" />

        {/* ── Header ── */}
        <div className="text-center space-y-1.5 border-b border-zinc-800 pb-4">
          <span className="text-[10px] tracking-[0.3em] text-neonCrimson uppercase font-orbitron font-bold animate-pulse flex items-center justify-center gap-1.5">
            <ShieldAlert className="size-3.5" />
            {slide.badge}
            <ShieldAlert className="size-3.5" />
          </span>
          <h2 className="font-orbitron font-black text-xl text-white uppercase tracking-tight">
            {slide.title}
          </h2>
          <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase block">
            {slide.subtitle}
          </span>
        </div>

        {/* ── Slide indicator dots ── */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "bg-neonCyan w-5 shadow-[0_0_6px_rgba(0,240,255,0.6)]"
                    : "bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Slide body ── */}
        <div className="space-y-4 font-mono text-xs max-h-[280px] overflow-y-auto pr-1">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-neonCyan uppercase tracking-widest block">
              ▲ Rule Description:
            </span>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/50 p-3 rounded-lg border border-zinc-900">
              {slide.desc}
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-neonCyan uppercase tracking-widest block">
              ▲ Concrete Example:
            </span>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-line bg-zinc-950/80 p-3 rounded-lg border border-zinc-900 italic">
              {slide.example}
            </p>
          </div>
        </div>

        {/* ── Prev / Next navigation ── */}
        {totalSlides > 1 && (
          <div className="flex gap-3">
            <button
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="flex-1 py-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 text-zinc-400 font-orbitron text-[10px] uppercase font-bold hover:border-zinc-500 hover:text-zinc-200 transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-3.5" /> Prev
            </button>
            <button
              onClick={goNext}
              disabled={isLastSlide}
              className="flex-1 py-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 text-zinc-400 font-orbitron text-[10px] uppercase font-bold hover:border-neonCyan hover:text-neonCyan transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}

        {/* ── Acknowledgement status list ── */}
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
                    <Loader2 className="size-3.5 text-zinc-600 animate-spin flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Confirm button (last slide only) ── */}
        <div className="pt-1">
          {!isLastSlide ? (
            <div className="w-full py-3.5 bg-zinc-950/60 border border-zinc-800 text-zinc-600 rounded-lg font-orbitron font-bold text-[10px] uppercase text-center flex items-center justify-center gap-2">
              <BookOpen className="size-3.5" />
              Read all {totalSlides} slides to confirm ({currentSlide + 1} / {totalSlides})
            </div>
          ) : isSelfAcknowledged ? (
            <div className="w-full py-3.5 bg-zinc-950 border border-emerald-500/30 text-emerald-400 rounded-lg font-orbitron font-bold text-xs uppercase text-center flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Waiting for other players...
            </div>
          ) : (
            <button
              onClick={acknowledgeRule}
              className="w-full py-4 font-orbitron font-bold uppercase rounded-lg text-xs bg-neonCyan text-cyan-950 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,240,255,0.45)]"
            >
              <Scale className="size-4" />
              {milestone === 5 ? "I Understand — Begin Game" : "Confirm & Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
