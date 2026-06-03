"use client";

import React, { useState } from "react";
import { Player, RoomSettings } from "@/hooks/useGameSocket";
import { Users, Copy, Check, Play, LogIn, Plus } from "lucide-react";
import { RulesGuide } from "@/components/RulesGuide";

interface LobbyScreenProps {
  roomCode: string | null;
  players: Player[];
  socketId: string | null;
  createRoom: (username: string) => void;
  joinRoom: (roomCode: string, username: string) => void;
  startGame: () => void;
  settings?: RoomSettings;
  updateSettings?: (settings: Partial<RoomSettings>) => void;
}

export function LobbyScreen({
  roomCode,
  players,
  socketId,
  createRoom,
  joinRoom,
  startGame,
  settings,
  updateSettings,
}: LobbyScreenProps) {
  const [username, setUsername] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);

  const isHost = players.find((p) => p.id === socketId)?.isHost || false;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    createRoom(username);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !inputCode.trim()) return;
    joinRoom(inputCode.toUpperCase(), username);
  };

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Enter username and Room Code (Not in Room yet)
  if (!roomCode) {
    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-8 px-4 animate-fade-in-up">
        {/* Cinematic Game Intro Banner */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <span className="text-xs tracking-[0.25em] text-neonCrimson uppercase font-orbitron font-bold">King of Diamonds ⬥ Brain Battle Arena</span>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase font-orbitron tracking-tight text-white leading-tight">
              BEAUTY <br />
              <span className="text-neonCyan text-glow-cyan">CONTEST</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs leading-relaxed max-w-sm">
              Balance Scale: Everyone chooses a number. The average is multiplied by 0.8. The closest survives. Reaching 0 points means death.
            </p>
          </div>

          {/* Simple Rules Card */}
          <div className="glass-pane border-neon-crimson p-5 rounded-lg text-xs space-y-3 font-mono">
            <span className="text-neonCrimson font-bold block uppercase tracking-wider">▲ SURVIVAL RULES:</span>
            <ul className="list-disc pl-4 space-y-2 text-zinc-400">
              <li>Supports <span className="text-white font-bold">2 - 5 players</span></li>
              <li>Select Number from <span className="text-white font-bold">0 to 100</span> within 60s.</li>
              <li>The average is multiplied by 0.8, the closest one survives. Others lose points.</li>
              <li>Reaching <span className="text-neonCrimson font-bold">0 points</span> triggers instant <span className="text-neonCrimson font-bold uppercase">GAME OVER</span>.</li>
            </ul>
          </div>
        </div>

        {/* Action Panel for Creating / Joining Room */}
        <div className="flex flex-col space-y-6">
          <div className="glass-pane border-neon-cyan p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-neonCyan/30 uppercase">
              Secure Terminal v1.0
            </div>

            {/* Step 1: Input Nickname */}
            <div className="space-y-4 mb-6">
              <label className="text-sm font-semibold uppercase text-zinc-300 font-orbitron tracking-wider block">
                1. Choose your Username
              </label>
              <input
                type="text"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={14}
                className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-mono text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-neonCyan transition-all duration-300 placeholder:text-zinc-600 focus:ring-1 focus:ring-neonCyan/20"
              />
            </div>

            <div className="border-t border-zinc-800 my-6"></div>

            {/* Split Options: Create or Join */}
            <div className="grid grid-cols-1 gap-6">
              {/* Option A: Create Room */}
              <form onSubmit={handleCreate} className="space-y-3">
                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="w-full py-3.5 px-4 font-orbitron font-bold uppercase rounded-lg text-sm bg-neonCyan text-cyan-950 hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(0,240,255,0.45)]"
                >
                  <Plus className="size-4" /> Create Room
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink mx-4 text-zinc-600 font-mono text-xs uppercase">OR</span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              {/* Option B: Join Room */}
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-zinc-400 font-mono tracking-wider block">
                    Room Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. XF93JK"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    maxLength={6}
                    className="w-full bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-mono text-sm px-4 py-3 rounded-lg text-center uppercase tracking-widest focus:outline-none focus:border-neonCyan transition-all duration-300 placeholder:text-zinc-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!username.trim() || inputCode.length < 6}
                  className="w-full py-3.5 px-4 font-orbitron font-bold uppercase rounded-lg text-sm bg-transparent border border-neonCyan text-neonCyan hover:bg-neonCyan/10 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <LogIn className="size-4" /> Join Room
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Waiting in the Lobby
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start animate-fade-in-up">
      {/* Left Column: Room Details & Active Players */}
      <div className="md:col-span-3 glass-pane border-neon-cyan p-8 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-neonCyan/30 uppercase">
          LOBBY SCREEN
        </div>

        <div className="text-center space-y-6">
          <span className="text-xs tracking-[0.2em] text-neonCyan uppercase font-mono">Share Room Code with your friends</span>

          {/* Room Code block display */}
          <div className="flex justify-center items-center gap-2">
            {roomCode.split("").map((char, index) => (
              <div
                key={index}
                className="w-12 h-14 bg-zinc-900 border border-zinc-700 text-neonCyan text-glow-cyan text-2xl font-bold font-mono rounded flex items-center justify-center shadow-lg transform transition hover:scale-105"
              >
                {char}
              </div>
            ))}
            
            <button
              onClick={copyRoomCode}
              className="ml-3 p-3 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-neonCyan rounded-lg hover:border-neonCyan transition-all duration-300"
              title="Copy room code"
            >
              {copied ? <Check className="size-5 text-emerald-400" /> : <Copy className="size-5" />}
            </button>
          </div>

          <div className="border-t border-zinc-800 my-6"></div>

          {/* Waiting player counter */}
          <div className="flex items-center justify-between text-sm text-zinc-400 px-2 font-mono">
            <span className="flex items-center gap-2">
              <Users className="size-4" /> Players in Lobby
            </span>
            <span className="font-bold text-white">
              {players.length} / 5 <span className="text-xs font-normal text-zinc-500">(players)</span>
            </span>
          </div>

          {/* Player nickname chips */}
          <div className="grid grid-cols-2 gap-3 my-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-lg border flex items-center justify-between bg-zinc-950/80 ${
                  player.id === socketId
                    ? "border-neonCyan/60 shadow-[0_0_8px_rgba(0,240,255,0.1)]"
                    : "border-zinc-850"
                }`}
              >
                <span className="text-sm font-mono truncate">{player.username}</span>
                {player.isHost && (
                  <span className="text-[9px] uppercase font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                    HOST
                  </span>
                )}
              </div>
            ))}
            {/* Missing slot indicators */}
            {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="p-3 rounded-lg border border-dashed border-zinc-800 text-zinc-700 font-mono text-xs flex items-center justify-center select-none"
              >
                Waiting for player to join...
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 my-6"></div>

          {/* Room Settings Panel */}
          <div className="text-left space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <span className="text-xs font-bold font-orbitron tracking-wider text-neonCyan uppercase">
                ⬥ ROOM RULE CONFIGURATION
              </span>
              {!isHost && (
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  Read Only
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Starting Points Setting */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border border-zinc-850 transition-all duration-300">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold font-mono text-zinc-355 text-zinc-300">
                    Starting Points
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Initial score for all players. Reaching 0 triggers elimination.
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!isHost || (settings?.startingPoints ?? 10) <= 3}
                    onClick={() => updateSettings?.({ startingPoints: (settings?.startingPoints ?? 10) - 1 })}
                    className={`size-7 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-sm transition-all duration-200 outline-none focus:outline-none ${
                      !isHost || (settings?.startingPoints ?? 10) <= 3
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:border-neonCyan hover:text-neonCyan cursor-pointer'
                    }`}
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold text-neonCyan text-glow-cyan w-10 text-center select-none">
                    {settings?.startingPoints ?? 10}
                  </span>
                  <button
                    type="button"
                    disabled={!isHost || (settings?.startingPoints ?? 10) >= 20}
                    onClick={() => updateSettings?.({ startingPoints: (settings?.startingPoints ?? 10) + 1 })}
                    className={`size-7 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-sm transition-all duration-200 outline-none focus:outline-none ${
                      !isHost || (settings?.startingPoints ?? 10) >= 20
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:border-neonCyan hover:text-neonCyan cursor-pointer'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Core Fallback Rule (5 Players) - Locked to Enabled */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border border-zinc-900 opacity-60">
                <div className="space-y-1 pr-4">
                  <div className="text-xs font-bold font-mono text-zinc-355 text-zinc-300">
                    5 Players: Standard Base (Core Fallback)
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Target = Average &times; 0.8. Deducts 1 point from losers.
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-not-allowed">
                  <div className="w-10 h-6 bg-neonCyan/20 border border-neonCyan/30 rounded-full transition-all duration-300"></div>
                  <div className="absolute left-5 top-1 bg-neonCyan w-4 h-4 rounded-full shadow-[0_0_8px_#00f0ff] transition-all"></div>
                </div>
              </div>

              {/* Rule 4: Duplicate Invalidation */}
              <div className={`flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border transition-all duration-300 ${
                settings?.rule4Enabled ? 'border-zinc-850' : 'border-zinc-900 opacity-60'
              }`}>
                <div className="space-y-1 pr-4">
                  <div className={`text-xs font-bold font-mono transition-colors ${settings?.rule4Enabled ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    4 Players: Duplicate Invalidation
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Duplicate numbers are invalidated and pickers lose 1 pt.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => updateSettings?.({ rule4Enabled: !settings?.rule4Enabled })}
                  className={`relative inline-flex items-center rounded-full h-6 w-10 transition-all duration-300 outline-none focus:outline-none ${
                    !isHost ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                  } ${
                    settings?.rule4Enabled 
                      ? 'bg-neonCyan/20 border border-neonCyan/50' 
                      : 'bg-zinc-850 border border-zinc-800'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full transition-all duration-300 ${
                      settings?.rule4Enabled 
                        ? 'translate-x-5 bg-neonCyan shadow-[0_0_8px_#00f0ff]' 
                        : 'translate-x-1 bg-zinc-500'
                    }`}
                  />
                </button>
              </div>

              {/* Rule 3: Exact Target Penalty */}
              <div className={`flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border transition-all duration-300 ${
                settings?.rule3Enabled ? 'border-zinc-850' : 'border-zinc-900 opacity-60'
              }`}>
                <div className="space-y-1 pr-4">
                  <div className={`text-xs font-bold font-mono transition-colors ${settings?.rule3Enabled ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    3 Players: Exact Target Penalty
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Exact target hit doubles penalty to 2 pts for non-winners.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => updateSettings?.({ rule3Enabled: !settings?.rule3Enabled })}
                  className={`relative inline-flex items-center rounded-full h-6 w-10 transition-all duration-300 outline-none focus:outline-none ${
                    !isHost ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                  } ${
                    settings?.rule3Enabled 
                      ? 'bg-neonCyan/20 border border-neonCyan/50' 
                      : 'bg-zinc-850 border border-zinc-800'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full transition-all duration-300 ${
                      settings?.rule3Enabled 
                        ? 'translate-x-5 bg-neonCyan shadow-[0_0_8px_#00f0ff]' 
                        : 'translate-x-1 bg-zinc-500'
                    }`}
                  />
                </button>
              </div>

              {/* Rule 2: Duel 0 vs 100 */}
              <div className={`flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border transition-all duration-300 ${
                settings?.rule2Enabled ? 'border-zinc-850' : 'border-zinc-900 opacity-60'
              }`}>
                <div className="space-y-1 pr-4">
                  <div className={`text-xs font-bold font-mono transition-colors ${settings?.rule2Enabled ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    2 Players: Duel 0 vs 100
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    Clash of 0 and 100 gives automatic win to 100 picker.
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => updateSettings?.({ rule2Enabled: !settings?.rule2Enabled })}
                  className={`relative inline-flex items-center rounded-full h-6 w-10 transition-all duration-300 outline-none focus:outline-none ${
                    !isHost ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                  } ${
                    settings?.rule2Enabled 
                      ? 'bg-neonCyan/20 border border-neonCyan/50' 
                      : 'bg-zinc-850 border border-zinc-800'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full transition-all duration-300 ${
                      settings?.rule2Enabled 
                        ? 'translate-x-5 bg-neonCyan shadow-[0_0_8px_#00f0ff]' 
                        : 'translate-x-1 bg-zinc-500'
                    }`}
                  />
                </button>
              </div>
            </div>

            {!isHost && (
              <p className="text-[10px] font-mono text-zinc-500 italic mt-1 text-center">
                *Only the host can configure protocol parameters
              </p>
            )}
          </div>

          <div className="border-t border-zinc-800 my-6"></div>

          {/* Host action panel vs. client wait loader */}
          {isHost ? (
            <div className="space-y-3">
              <button
                onClick={startGame}
                disabled={players.length < 2}
                className="w-full py-4 font-orbitron font-bold uppercase rounded-lg text-sm bg-neonCyan text-cyan-950 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none hover:shadow-[0_0_25px_rgba(0,240,255,0.45)]"
              >
                <Play className="size-4 fill-current" /> Start Game
              </button>
              {players.length < 2 && (
                <p className="text-xs text-neonCrimson font-mono tracking-wide">
                  *Requires at least 2 players to start
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 py-3 text-sm text-zinc-400 font-mono animate-pulse">
              <div className="size-2 bg-neonCyan rounded-full animate-ping"></div>
              <span>Waiting for Host to start the game...</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Rules Reference */}
      <div className="md:col-span-2">
        <RulesGuide players={players} />
      </div>
    </div>
  );
}
