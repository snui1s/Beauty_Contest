"use client";

import React from "react";
import { useGameSocket } from "@/hooks/useGameSocket";
import { LobbyScreen } from "@/components/LobbyScreen";
import { GameScreen } from "@/components/GameScreen";
import { SummaryScreen } from "@/components/SummaryScreen";
import { GameOverScreen } from "@/components/GameOverScreen";
import { Leaderboard } from "@/components/Leaderboard";
import { RulesGuide } from "@/components/RulesGuide";
import { RuleIntroModal } from "@/components/RuleIntroModal";
import { Wifi, WifiOff, AlertTriangle, Scale } from "lucide-react";

export default function Home() {
  const {
    socketId,
    isConnected,
    roomCode,
    players,
    gameState,
    round,
    timer,
    lastRoundResults,
    submittedPlayerIds,
    error,
    activeRuleIntro,
    acknowledgedPlayerIds,
    settings,
    createRoom,
    joinRoom,
    startGame,
    submitNumber,
    nextRound,
    restartGame,
    clearError,
    acknowledgeRule,
    leaveRoom,
    updateSettings,
  } = useGameSocket();

  // Check if any player's health points are critically low (for red warning vignetting)
  const isAnyPlayerCritical = players.some((p) => !p.isEliminated && p.points <= 2);

  return (
    <div className="relative min-h-screen flex flex-col justify-between py-6 px-4 md:px-8">
      {/* Dynamic Crimson Danger Vignette for high stress alert */}
      {gameState !== "LOBBY" && isAnyPlayerCritical && (
        <div className="fixed inset-0 red-alert-vignette z-50 pointer-events-none" />
      )}

      {/* TOP HEADER: Cyberpunk HUD bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <button
          onClick={leaveRoom}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0 focus:outline-none"
          title="Return to Lobby"
        >
          <div className="p-2 bg-neonCyan/10 border border-neonCyan/20 rounded-lg">
            <Scale className="size-6 text-neonCyan text-glow-cyan" />
          </div>
          <div>
            <h1 className="font-orbitron font-black tracking-widest text-lg text-white">
              BALANCE <span className="text-neonCyan text-glow-cyan">SCALE</span>
            </h1>
            <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase block">King of Diamonds ⬥ Beauty Contest</span>
          </div>
        </button>

        {/* Real-time sync connection hud */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono tracking-wider transition-all duration-300 ${
            isConnected 
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
              : "bg-neonCrimson/5 border-neonCrimson/20 text-neonCrimson animate-pulse"
          }`}>
            {isConnected ? (
              <>
                <Wifi className="size-3.5" /> SECURE CONNECT
              </>
            ) : (
              <>
                <WifiOff className="size-3.5" /> SERVER DISCONNECTED
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER: Screen Dispatcher & Leaderboard */}
      <main className="max-w-6xl w-full mx-auto flex-grow flex flex-col justify-center py-4">
        
        {/* Real-time sliding error toaster */}
        {error && (
          <div className="max-w-xl mx-auto w-full mb-6 glass-pane border-neon-crimson p-4 rounded-lg flex items-center gap-3 text-neonCrimson font-mono text-xs animate-bounce shadow-[0_0_15px_rgba(255,0,60,0.1)] relative">
            <AlertTriangle className="size-4 animate-pulse flex-shrink-0" />
            <div className="flex-grow">
              <span className="font-bold uppercase mr-1">ERROR:</span> {error}
            </div>
            <button 
              onClick={clearError}
              className="text-zinc-500 hover:text-zinc-300 ml-2 text-[10px] uppercase font-bold"
            >
              [CLOSE]
            </button>
          </div>
        )}

        {/* Dispatch Screen Layout states */}
        {gameState === "LOBBY" ? (
          /* Lobby creation / join options */
          <LobbyScreen
            roomCode={roomCode}
            players={players}
            socketId={socketId}
            createRoom={createRoom}
            joinRoom={joinRoom}
            startGame={startGame}
            settings={settings}
            updateSettings={updateSettings}
          />
        ) : (
          /* Main active gameplay layout containing split content and Leaderboard sidebar */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left 2 Cols: Active screen state */}
            <div className="lg:col-span-2 space-y-6">
              {gameState === "PLAYING" && (
                <GameScreen
                  round={round}
                  timer={timer}
                  players={players}
                  socketId={socketId}
                  submittedPlayerIds={submittedPlayerIds}
                  submitNumber={submitNumber}
                />
              )}

              {gameState === "ROUND_SUMMARY" && (
                <SummaryScreen
                  results={lastRoundResults}
                  players={players}
                  socketId={socketId}
                  nextRound={nextRound}
                />
              )}

              {gameState === "GAME_OVER" && (
                <GameOverScreen
                  results={lastRoundResults}
                  players={players}
                  socketId={socketId}
                  restartGame={restartGame}
                />
              )}
            </div>

            {/* Right 1 Col: Standings & Life status dashboard */}
            <div className="lg:col-span-1 space-y-6">
              <Leaderboard
                players={players}
                socketId={socketId}
                submittedPlayerIds={submittedPlayerIds}
                gameState={gameState}
                settings={settings}
              />
              <RulesGuide players={players} settings={settings} />
            </div>
          </div>
        )}
      </main>

      {/* FOOTER: HUD copyright signature */}
      <footer className="max-w-6xl w-full mx-auto border-t border-zinc-900 pt-4 mt-8 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-zinc-650 tracking-wider">
        <span>© 2026 BORDERLAND TERMINAL. ALL HUMAN LIFELINES VERIFIED.</span>
        <span className="mt-1 md:mt-0 uppercase">King of Diamonds</span>
      </footer>

      {/* Dynamic Rule Intro Modal Overlay */}
      {activeRuleIntro !== null && (
        <RuleIntroModal
          milestone={activeRuleIntro}
          players={players}
          socketId={socketId}
          acknowledgedPlayerIds={acknowledgedPlayerIds}
          acknowledgeRule={acknowledgeRule}
          settings={settings}
        />
      )}
    </div>
  );
}
