/**
 * Core Math & Game Logic for "Beauty Contest" (Alice in Borderland)
 */

/**
 * Calculates the results for a single round of Beauty Contest.
 * 
 * @param {Array} players - Array of player objects: 
 *   [{ id, username, points, currentSubmit, isEliminated, isHost }]
 * @returns {Object} Result details:
 *   {
 *     submissions: Array of { username, number },
 *     average: Number,
 *     targetResult: Number,
 *     winners: Array of Player IDs,
 *     eliminatedThisRound: Array of Player IDs,
 *     isGameOver: Boolean,
 *     ultimateWinner: Object or null
 *   }
 */
function calculateRoundResult(players) {
  // 1. Filter out already eliminated players
  const activePlayers = players.filter(p => !p.isEliminated);

  // If we have no active players, just return early (safety check)
  if (activePlayers.length === 0) {
    return {
      submissions: [],
      average: 0,
      targetResult: 0,
      winners: [],
      winnerIds: [],
      eliminatedThisRound: [],
      isGameOver: true,
      ultimateWinner: null,
      ruleApplied: "None",
      deductions: []
    };
  }

  // 2. Gather submissions. If a player hasn't submitted (e.g. timeout), default to 0.
  const submissions = activePlayers.map(p => {
    const number = p.currentSubmit !== null && p.currentSubmit !== undefined
      ? Number(p.currentSubmit)
      : 0; // Default to 0 if timed out or failed to select
    return {
      id: p.id,
      username: p.username,
      number: number
    };
  });

  const activeCount = activePlayers.length;
  let average = 0;
  let targetResult = 0;
  let winners = [];
  let ruleApplied = "None";

  // Track point deductions (default: 1 point)
  const pointDeductions = {};
  activePlayers.forEach(p => {
    pointDeductions[p.id] = 1;
  });

  // 3. Dynamic Rule Dispatcher based on active count (Cumulative)
  const isDuplicateRuleActive = activeCount <= 4;
  const isZeroVsOneHundredActive = activeCount <= 3;

  if (isDuplicateRuleActive) {
    // Rule: Duplicate numbers are invalidated
    const counts = {};
    submissions.forEach(sub => {
      counts[sub.number] = (counts[sub.number] || 0) + 1;
    });

    const validSubmissions = submissions.filter(sub => counts[sub.number] === 1);
    const hasDuplicates = submissions.some(sub => counts[sub.number] >= 2);

    if (hasDuplicates) {
      if (activeCount === 4) {
        ruleApplied = "Duplicate Numbers Invalidated";
      } else {
        ruleApplied = "Duplicate Penalty (-2 Pts)";
      }

      // Duplicate pickers get penalized (-2 pts if activeCount <= 3, otherwise -1 pt)
      const duplicatePenalty = activeCount <= 3 ? 2 : 1;
      submissions.forEach(sub => {
        if (counts[sub.number] >= 2) {
          pointDeductions[sub.id] = duplicatePenalty;
        }
      });

      if (validSubmissions.length > 0) {
        const sum = validSubmissions.reduce((acc, sub) => acc + sub.number, 0);
        average = sum / validSubmissions.length;
        targetResult = Number((average * 0.8).toFixed(2));

        // Winner is closest valid unique submission
        let minDiff = Infinity;
        validSubmissions.forEach(sub => {
          const diff = Math.abs(sub.number - targetResult);
          if (diff < minDiff) {
            minDiff = diff;
            winners = [sub.id];
          } else if (Math.abs(diff - minDiff) < 1e-9) {
            winners.push(sub.id);
          }
        });
      } else {
        // All submissions duplicated, everyone loses
        average = 0;
        targetResult = 0;
        winners = [];
      }
    } else {
      // No duplicates, check 0 vs 100
      if (isZeroVsOneHundredActive &&
          submissions.some(s => s.number === 0) &&
          submissions.some(s => s.number === 100)) {
        
        ruleApplied = activeCount === 3 ? "0 vs 100 (Three-Way)" : "0 vs 100 (Duel)";
        winners = submissions.filter(sub => sub.number === 100).map(sub => sub.id);

        const sum = submissions.reduce((acc, sub) => acc + sub.number, 0);
        average = sum / submissions.length;
        targetResult = Number((average * 0.8).toFixed(2));
      } else {
        // Normal formula
        const sum = submissions.reduce((acc, sub) => acc + sub.number, 0);
        average = sum / submissions.length;
        targetResult = Number((average * 0.8).toFixed(2));

        let minDiff = Infinity;
        submissions.forEach(sub => {
          const diff = Math.abs(sub.number - targetResult);
          if (diff < minDiff) {
            minDiff = diff;
            winners = [sub.id];
          } else if (Math.abs(diff - minDiff) < 1e-9) {
            winners.push(sub.id);
          }
        });
      }
    }
  } else {
    // Normal Average * 0.8 formula (for 5 players)
    const sum = submissions.reduce((acc, sub) => acc + sub.number, 0);
    average = submissions.length > 0 ? sum / submissions.length : 0;
    targetResult = Number((average * 0.8).toFixed(2));

    let minDiff = Infinity;
    submissions.forEach(sub => {
      const diff = Math.abs(sub.number - targetResult);
      if (diff < minDiff) {
        minDiff = diff;
        winners = [sub.id];
      } else if (Math.abs(diff - minDiff) < 1e-9) {
        winners.push(sub.id);
      }
    });
  }

  // 6. Update points (deduct custom or default points from non-winners)
  const deductions = [];
  const eliminatedThisRound = [];
  players.forEach(p => {
    // Only process active players for point deductions
    if (!p.isEliminated) {
      if (!winners.includes(p.id)) {
        const penalty = pointDeductions[p.id] || 1;
        p.points -= penalty;
        
        deductions.push({
          username: p.username,
          pointsDeducted: penalty
        });
      }
      // Check for elimination (point limit is -10)
      if (p.points <= -10) {
        p.isEliminated = true;
        eliminatedThisRound.push(p.id);
      }
    }
  });

  // 7. Check if game is over (only 1 or 0 non-eliminated players left)
  const remainingActivePlayers = players.filter(p => !p.isEliminated);
  let isGameOver = false;
  let ultimateWinner = null;

  if (remainingActivePlayers.length === 1) {
    isGameOver = true;
    ultimateWinner = remainingActivePlayers[0];
  } else if (remainingActivePlayers.length === 0) {
    isGameOver = true;
    
    // Find the player(s) with the maximum points in this round
    let maxPoints = -Infinity;
    let candidates = [];
    players.forEach(p => {
      if (p.points > maxPoints) {
        maxPoints = p.points;
        candidates = [p];
      } else if (p.points === maxPoints) {
        candidates.push(p);
      }
    });

    if (candidates.length === 1) {
      ultimateWinner = candidates[0];
    } else {
      ultimateWinner = candidates[0]; 
    }
  }

  return {
    submissions: submissions.map(s => ({ username: s.username, number: s.number })),
    average: Number(average.toFixed(2)),
    targetResult: targetResult,
    winners: winners.map(wid => players.find(p => p.id === wid)?.username || "Unknown"),
    winnerIds: winners,
    eliminatedThisRound: eliminatedThisRound.map(eid => players.find(p => p.id === eid)?.username || "Unknown"),
    isGameOver: isGameOver,
    ultimateWinner: ultimateWinner ? { id: ultimateWinner.id, username: ultimateWinner.username, points: ultimateWinner.points } : null,
    ruleApplied: ruleApplied,
    deductions: deductions
  };
}

module.exports = {
  calculateRoundResult
};
