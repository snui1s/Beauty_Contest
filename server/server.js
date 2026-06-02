const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { calculateRoundResult } = require('./utils/gameLogic');

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'ok', timestamp: new Date() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow any origin for easy local testing
    methods: ['GET', 'POST']
  }
});

// Memory storage for game rooms
// Key: Room Code (e.g. "AB12CD")
const rooms = {};

// Helper to generate a random 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Guarantee uniqueness
  return rooms[result] ? generateRoomCode() : result;
}

// Helper to clean up room intervals
function clearIntervalForRoom(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
}

// Function to end a round, calculate results, and push updates to players
function endRound(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearIntervalForRoom(room);

  // Calculate results using game logic utility
  const resultData = calculateRoundResult(room.players);

  // Transition state
  room.gameState = resultData.isGameOver ? 'GAME_OVER' : 'ROUND_SUMMARY';
  room.lastRoundResults = resultData;

  // Emit round results to all players in the room
  io.to(roomCode).emit('round_ended', {
    gameState: room.gameState,
    results: resultData,
    players: room.players // Contains updated points & elimination flags
  });
}

// Helper to start the active round countdown ticks
function startCountdownTicks(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearIntervalForRoom(room);

  room.timerInterval = setInterval(() => {
    room.timer -= 1;
    io.to(roomCode).emit('timer_tick', { timer: room.timer });

    if (room.timer <= 0) {
      clearIntervalForRoom(room);
      endRound(roomCode);
    }
  }, 1000);
}

// Function to start a new round
function startRound(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  clearIntervalForRoom(room);

  // Increment round count
  room.round += 1;
  room.gameState = 'PLAYING';
  room.timer = 60; // 60-second timer limit

  // Reset player submissions for the new round
  room.players.forEach(p => {
    p.currentSubmit = null;
  });

  const activePlayers = room.players.filter(p => !p.isEliminated);
  const activeCount = activePlayers.length;

  // Initialize shownRules array if it does not exist
  if (!room.shownRules) {
    room.shownRules = [];
  }

  // Check if a new rule milestone is triggered (4, 3, or 2 players)
  let triggerRule = null;
  if ((activeCount === 4 || activeCount === 3 || activeCount === 2) && !room.shownRules.includes(activeCount)) {
    triggerRule = activeCount;
    room.shownRules.push(activeCount);
  }

  if (triggerRule !== null) {
    // A new rule is triggered! Initialize acknowledgements
    room.activeRuleIntro = triggerRule;
    room.ruleAcknowledgements = {};
    activePlayers.forEach(p => {
      room.ruleAcknowledgements[p.id] = false;
    });

    // Notify clients that a new rule is being introduced and the timer is paused
    io.to(roomCode).emit('rule_introduced', {
      round: room.round,
      gameState: room.gameState,
      timer: room.timer,
      players: room.players,
      milestone: triggerRule,
      acknowledgedPlayerIds: []
    });
  } else {
    room.activeRuleIntro = null;
    room.ruleAcknowledgements = null;

    // Notify everyone the round has started normally
    io.to(roomCode).emit('round_started', {
      round: room.round,
      gameState: room.gameState,
      timer: room.timer,
      players: room.players
    });

    startCountdownTicks(roomCode);
  }
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. Create Room Event
  socket.on('create_room', ({ username }) => {
    if (!username || username.trim() === '') {
      return socket.emit('error_message', 'Please enter a valid username.');
    }

    const roomCode = generateRoomCode();
    const newPlayer = {
      id: socket.id,
      username: username.trim(),
      points: 0,
      currentSubmit: null,
      isHost: true,
      isEliminated: false
    };

    rooms[roomCode] = {
      code: roomCode,
      gameState: 'LOBBY', // LOBBY, PLAYING, ROUND_SUMMARY, GAME_OVER
      players: [newPlayer],
      round: 0,
      timer: 60,
      timerInterval: null,
      lastRoundResults: null,
      shownRules: [],
      activeRuleIntro: null,
      ruleAcknowledgements: null
    };

    socket.join(roomCode);
    socket.emit('room_created', {
      roomCode,
      players: rooms[roomCode].players,
      gameState: rooms[roomCode].gameState
    });
    console.log(`[Room Created] Code: ${roomCode} by ${username}`);
  });

  // 2. Join Room Event
  socket.on('join_room', ({ roomCode, username }) => {
    if (!roomCode || !username) {
      return socket.emit('error_message', 'Incomplete details provided.');
    }

    const code = roomCode.toUpperCase().trim();
    const room = rooms[code];

    if (!room) {
      return socket.emit('error_message', 'Room not found. Please verify the code.');
    }

    if (room.gameState !== 'LOBBY') {
      return socket.emit('error_message', 'Cannot join. Game already in progress.');
    }

    if (room.players.length >= 5) {
      return socket.emit('error_message', 'Room is full (limit is 2-5 players).');
    }

    // Check duplicate username in room
    const isDuplicate = room.players.some(p => p.username.toLowerCase() === username.trim().toLowerCase());
    if (isDuplicate) {
      return socket.emit('error_message', 'Username is already taken in this room.');
    }

    const newPlayer = {
      id: socket.id,
      username: username.trim(),
      points: 0,
      currentSubmit: null,
      isHost: false,
      isEliminated: false
    };

    room.players.push(newPlayer);
    socket.join(code);

    // Notify the player they joined successfully
    socket.emit('room_joined', {
      roomCode: code,
      players: room.players,
      gameState: room.gameState
    });

    // Broadcast to other players in the room
    socket.to(code).emit('player_joined', {
      players: room.players
    });

    console.log(`[Player Joined] ${username} joined Room: ${code}`);
  });

  // 3. Start Game Event
  socket.on('start_game', () => {
    // Find room where socket is the host
    let targetRoomCode = null;
    for (const code in rooms) {
      const host = rooms[code].players.find(p => p.id === socket.id && p.isHost);
      if (host) {
        targetRoomCode = code;
        break;
      }
    }

    if (!targetRoomCode) {
      return socket.emit('error_message', 'Only the host can start the game.');
    }

    const room = rooms[targetRoomCode];
    if (room.players.length < 2) {
      return socket.emit('error_message', 'At least 2 players are required to start.');
    }

    console.log(`[Game Started] Room: ${targetRoomCode}`);
    room.round = 0;
    startRound(targetRoomCode);
  });

  // 4. Submit Number Event
  socket.on('submit_number', ({ number }) => {
    const parsedNumber = parseInt(number, 10);
    if (isNaN(parsedNumber) || parsedNumber < 0 || parsedNumber > 100) {
      return socket.emit('error_message', 'Please submit a number between 0 and 100.');
    }

    // Find the player's room
    let targetRoomCode = null;
    let player = null;

    for (const code in rooms) {
      const foundPlayer = rooms[code].players.find(p => p.id === socket.id);
      if (foundPlayer) {
        targetRoomCode = code;
        player = foundPlayer;
        break;
      }
    }

    if (!targetRoomCode || !player) {
      return socket.emit('error_message', 'You are not in an active game room.');
    }

    const room = rooms[targetRoomCode];

    if (room.gameState !== 'PLAYING') {
      return socket.emit('error_message', 'Submissions are not open at this time.');
    }

    if (player.isEliminated) {
      return socket.emit('error_message', 'You are eliminated and cannot play.');
    }

    // Lock submission
    player.currentSubmit = parsedNumber;
    console.log(`[Submission] ${player.username} submitted ${parsedNumber} in Room: ${targetRoomCode}`);

    // Notify all clients in the room that this player has submitted (for status flags)
    io.to(targetRoomCode).emit('player_submitted', {
      playerId: player.id,
      username: player.username
    });

    // Check if ALL active (non-eliminated) players have submitted
    const activePlayers = room.players.filter(p => !p.isEliminated);
    const allSubmitted = activePlayers.every(p => p.currentSubmit !== null);

    if (allSubmitted) {
      endRound(targetRoomCode);
    }
  });

  // 5. Next Round Event
  socket.on('next_round', () => {
    let targetRoomCode = null;
    for (const code in rooms) {
      const host = rooms[code].players.find(p => p.id === socket.id && p.isHost);
      if (host) {
        targetRoomCode = code;
        break;
      }
    }

    if (!targetRoomCode) {
      return socket.emit('error_message', 'Only the host can proceed to the next round.');
    }

    const room = rooms[targetRoomCode];
    if (room.gameState !== 'ROUND_SUMMARY') {
      return socket.emit('error_message', 'Game is not in summary phase.');
    }

    startRound(targetRoomCode);
  });

  // 4b. Acknowledge Rule Event
  socket.on('acknowledge_rule', () => {
    let targetRoomCode = null;
    let player = null;

    for (const code in rooms) {
      const foundPlayer = rooms[code].players.find(p => p.id === socket.id);
      if (foundPlayer) {
        targetRoomCode = code;
        player = foundPlayer;
        break;
      }
    }

    if (!targetRoomCode || !player) return;

    const room = rooms[targetRoomCode];
    if (room.activeRuleIntro === null || !room.ruleAcknowledgements) return;

    // Set acknowledgement
    room.ruleAcknowledgements[socket.id] = true;
    console.log(`[Rule Acknowledged] Player: ${player.username} in Room: ${targetRoomCode}`);

    const activePlayers = room.players.filter(p => !p.isEliminated);
    const acknowledgedIds = Object.keys(room.ruleAcknowledgements).filter(id => room.ruleAcknowledgements[id]);

    // Broadcast update to all players
    io.to(targetRoomCode).emit('rule_ack_update', {
      acknowledgedPlayerIds: acknowledgedIds
    });

    // Check if ALL active players have acknowledged
    const allAcknowledged = activePlayers.every(p => room.ruleAcknowledgements[p.id] === true);

    if (allAcknowledged) {
      room.activeRuleIntro = null;
      room.ruleAcknowledgements = null;

      // Start the ticking server countdown and notify clients
      io.to(targetRoomCode).emit('rule_intro_ended');
      startCountdownTicks(targetRoomCode);
    }
  });

  // 6. Restart Game Event
  socket.on('restart_game', () => {
    let targetRoomCode = null;
    for (const code in rooms) {
      const host = rooms[code].players.find(p => p.id === socket.id && p.isHost);
      if (host) {
        targetRoomCode = code;
        break;
      }
    }

    if (!targetRoomCode) {
      return socket.emit('error_message', 'Only the host can restart the game.');
    }

    const room = rooms[targetRoomCode];
    clearIntervalForRoom(room);

    // Reset scores & elimination flags for all current players
    room.players.forEach(p => {
      p.points = 0;
      p.currentSubmit = null;
      p.isEliminated = false;
    });

    room.round = 0;
    room.gameState = 'LOBBY';
    room.lastRoundResults = null;
    room.shownRules = [];
    room.activeRuleIntro = null;
    room.ruleAcknowledgements = null;

    // Send reset details to all players
    io.to(targetRoomCode).emit('game_restarted', {
      players: room.players,
      gameState: room.gameState
    });
    
    console.log(`[Game Restarted] Room: ${targetRoomCode}`);
  });

  // 7. Disconnect Handler
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);

    for (const code in rooms) {
      const room = rooms[code];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex];
        // Remove player
        room.players.splice(playerIndex, 1);

        console.log(`[Player Left] ${disconnectedPlayer.username} left Room: ${code}`);

        // If room is empty, clear intervals and delete room
        if (room.players.length === 0) {
          clearIntervalForRoom(room);
          delete rooms[code];
          console.log(`[Room Deleted] Room: ${code} became empty.`);
          continue;
        }

        // If the disconnected player was the host, assign a new host
        let newHostAssigned = false;
        let newHostId = null;
        if (disconnectedPlayer.isHost) {
          room.players[0].isHost = true;
          newHostId = room.players[0].id;
          newHostAssigned = true;
          console.log(`[New Host Assigned] Room: ${code}, Player: ${room.players[0].username}`);
        }

        // Notify remaining players
        io.to(code).emit('player_left', {
          players: room.players,
          leftPlayer: disconnectedPlayer,
          newHostId
        });

        // Check if game is in progress and players fall below threshold
        if (room.gameState === 'PLAYING' || room.gameState === 'ROUND_SUMMARY') {
          const activePlayers = room.players.filter(p => !p.isEliminated);

          // If only 1 player remains active, the game ends
          if (activePlayers.length <= 1) {
            clearIntervalForRoom(room);
            room.gameState = 'GAME_OVER';

            const ultimateWinner = activePlayers[0] || null;
            const results = {
              isGameOver: true,
              ultimateWinner: ultimateWinner ? { id: ultimateWinner.id, username: ultimateWinner.username, points: ultimateWinner.points } : null,
              winners: ultimateWinner ? [ultimateWinner.username] : [],
              submissions: [],
              average: 0,
              targetResult: 0,
              eliminatedThisRound: []
            };

            room.lastRoundResults = results;
            io.to(code).emit('round_ended', {
              gameState: room.gameState,
              results,
              players: room.players
            });
          } else {
            // Check if we were waiting for rule acknowledgements
            if (room.activeRuleIntro !== null && room.ruleAcknowledgements) {
              delete room.ruleAcknowledgements[socket.id];
              const acknowledgedIds = Object.keys(room.ruleAcknowledgements).filter(id => room.ruleAcknowledgements[id]);

              io.to(code).emit('rule_ack_update', {
                acknowledgedPlayerIds: acknowledgedIds
              });

              const allAcknowledged = activePlayers.every(p => room.ruleAcknowledgements[p.id] === true);
              if (allAcknowledged) {
                room.activeRuleIntro = null;
                room.ruleAcknowledgements = null;
                io.to(code).emit('rule_intro_ended');
                startCountdownTicks(code);
              }
            } else if (room.gameState === 'PLAYING') {
              // Check if all players in round have now submitted after someone left
              const allSubmitted = activePlayers.every(p => p.currentSubmit !== null);
              if (allSubmitted) {
                endRound(code);
              }
            }
          }
        }
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Beauty Contest Game Server running on port ${PORT}`);
  console.log(`===================================================`);
});
