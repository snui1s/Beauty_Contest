"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Define TypeScript interfaces for our real-time game states
export interface Player {
  id: string;
  username: string;
  points: number;
  currentSubmit: number | null;
  isHost: boolean;
  isEliminated: boolean;
}

export interface RoundResults {
  submissions: Array<{ username: string; number: number }>;
  average: number;
  targetResult: number;
  winners: string[];
  winnerIds: string[];
  eliminatedThisRound: string[];
  isGameOver: boolean;
  ultimateWinner: { id: string; username: string; points: number } | null;
  ruleApplied?: string;
  deductions?: Array<{ username: string; pointsDeducted: number }>;
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

/**
 * Custom React hook managing the real-time Socket.io state machine and actions
 * for the Alice in Borderland Beauty Contest game.
 */
export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<"LOBBY" | "PLAYING" | "ROUND_SUMMARY" | "GAME_OVER">("LOBBY");
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(60);
  const [lastRoundResults, setLastRoundResults] = useState<RoundResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedPlayerIds, setSubmittedPlayerIds] = useState<string[]>([]);
  const [activeRuleIntro, setActiveRuleIntro] = useState<number | null>(null);
  const [acknowledgedPlayerIds, setAcknowledgedPlayerIds] = useState<string[]>([]);

  // Connect to socket server
  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      console.log("Connected to game server:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    // Room creation acknowledgment
    socket.on("room_created", ({ roomCode, players, gameState }: { roomCode: string; players: Player[]; gameState: "LOBBY" | "PLAYING" | "ROUND_SUMMARY" | "GAME_OVER" }) => {
      setRoomCode(roomCode);
      setPlayers(players);
      setGameState(gameState);
      setError(null);
    });

    // Room join acknowledgment
    socket.on("room_joined", ({ roomCode, players, gameState }: { roomCode: string; players: Player[]; gameState: "LOBBY" | "PLAYING" | "ROUND_SUMMARY" | "GAME_OVER" }) => {
      setRoomCode(roomCode);
      setPlayers(players);
      setGameState(gameState);
      setError(null);
    });

    // Dynamic players broadcast updates
    socket.on("player_joined", ({ players }: { players: Player[] }) => {
      setPlayers(players);
    });

    socket.on("player_left", ({ players, leftPlayer, newHostId }: { players: Player[]; leftPlayer: Player; newHostId: string | null }) => {
      setPlayers(players);
      // If we are now the host
      if (newHostId && socketRef.current && newHostId === socketRef.current.id) {
        setPlayers((prev) =>
          prev.map((p) => (p.id === newHostId ? { ...p, isHost: true } : p))
        );
      }
    });

    // Game lifecycle listeners
    socket.on("round_started", ({ round, gameState, timer, players }: { round: number; gameState: "LOBBY" | "PLAYING" | "ROUND_SUMMARY" | "GAME_OVER"; timer: number; players: Player[] }) => {
      setRound(round);
      setGameState(gameState);
      setTimer(timer);
      setPlayers(players);
      setSubmittedPlayerIds([]);
      setLastRoundResults(null);
      setActiveRuleIntro(null);
      setAcknowledgedPlayerIds([]);
    });

    socket.on("rule_introduced", ({ round, gameState, timer, players, milestone, acknowledgedPlayerIds }: { round: number; gameState: "LOBBY" | "PLAYING" | "ROUND_SUMMARY" | "GAME_OVER"; timer: number; players: Player[]; milestone: number; acknowledgedPlayerIds: string[] }) => {
      setRound(round);
      setGameState(gameState);
      setTimer(timer);
      setPlayers(players);
      setSubmittedPlayerIds([]);
      setLastRoundResults(null);
      setActiveRuleIntro(milestone);
      setAcknowledgedPlayerIds(acknowledgedPlayerIds);
    });

    socket.on("rule_ack_update", ({ acknowledgedPlayerIds }: { acknowledgedPlayerIds: string[] }) => {
      setAcknowledgedPlayerIds(acknowledgedPlayerIds);
    });

    socket.on("rule_intro_ended", () => {
      setActiveRuleIntro(null);
    });

    // Update real-time submitted status checks
    socket.on("player_submitted", ({ playerId }: { playerId: string }) => {
      setSubmittedPlayerIds((prev) => [...prev, playerId]);
    });

    // Server-wide synchronized clock tick
    socket.on("timer_tick", ({ timer }: { timer: number }) => {
      setTimer(timer);
    });

    // Handle round calculation summary
    socket.on("round_ended", ({ gameState, results, players }: { gameState: "LOBBY" | "PLAYING" | "ROUND_SUMMARY" | "GAME_OVER"; results: RoundResults; players: Player[] }) => {
      setGameState(gameState);
      setLastRoundResults(results);
      setPlayers(players);
    });

    // Host restarted the game back to Lobby
    socket.on("game_restarted", ({ players, gameState }: { players: Player[]; gameState: "LOBBY" | "PLAYING" | "ROUND_SUMMARY" | "GAME_OVER" }) => {
      setGameState(gameState);
      setPlayers(players);
      setRound(0);
      setTimer(60);
      setLastRoundResults(null);
      setSubmittedPlayerIds([]);
      setError(null);
      setActiveRuleIntro(null);
      setAcknowledgedPlayerIds([]);
    });

    // Universal error dispatcher
    socket.on("error_message", (msg: string) => {
      setError(msg);
      // Auto clear error banner after 4 seconds
      setTimeout(() => {
        setError(null);
      }, 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Client Actions
  const createRoom = useCallback((username: string) => {
    socketRef.current?.emit("create_room", { username });
  }, []);

  const joinRoom = useCallback((roomCode: string, username: string) => {
    socketRef.current?.emit("join_room", { roomCode, username });
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit("start_game");
  }, []);

  const submitNumber = useCallback((number: number) => {
    socketRef.current?.emit("submit_number", { number });
  }, []);

  const nextRound = useCallback(() => {
    socketRef.current?.emit("next_round");
  }, []);

  const restartGame = useCallback(() => {
    socketRef.current?.emit("restart_game");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const acknowledgeRule = useCallback(() => {
    socketRef.current?.emit("acknowledge_rule");
  }, []);

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
    setRoomCode(null);
    setPlayers([]);
    setGameState("LOBBY");
    setRound(0);
    setTimer(60);
    setLastRoundResults(null);
    setSubmittedPlayerIds([]);
    setError(null);
    setActiveRuleIntro(null);
    setAcknowledgedPlayerIds([]);
  }, []);

  const socketId = socketRef.current?.id || null;

  return {
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
    createRoom,
    joinRoom,
    startGame,
    submitNumber,
    nextRound,
    restartGame,
    clearError,
    acknowledgeRule,
    leaveRoom,
  };
}
