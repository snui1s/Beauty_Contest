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
function calculateRoundResult(players, settings) {
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

  // Extract enabled rules from settings (default to true if undefined)
  const rule4Enabled = settings ? settings.rule4Enabled !== false : true;
  const rule3Enabled = settings ? settings.rule3Enabled !== false : true;
  const rule2Enabled = settings ? settings.rule2Enabled !== false : true;

  // 3. Dynamic Rule Dispatcher based on active count and settings
  const isDuplicateRuleActive = activeCount <= 4 && rule4Enabled;
  const isExactWinningNumberRuleActive = activeCount <= 3 && rule3Enabled;
  const isZeroVsOneHundredActive = activeCount <= 2 && rule2Enabled;

  let hasExactWinner = false;

  const evaluateNormalOrDuel = () => {
    if (isZeroVsOneHundredActive &&
        submissions.some(s => s.number === 0) &&
        submissions.some(s => s.number === 100)) {
      
      ruleApplied = "0 vs 100 Duel Clash";
      winners = submissions.filter(sub => sub.number === 100).map(sub => sub.id);

      const sum = submissions.reduce((acc, sub) => acc + sub.number, 0);
      average = sum / submissions.length;
      targetResult = Number((average * 0.8).toFixed(2));
    } else {
      // Normal formula
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

      // Check if any winner has the exact winning number
      if (isExactWinningNumberRuleActive) {
        hasExactWinner = submissions.some(sub => sub.number === targetResult && winners.includes(sub.id));
      }
    }
  };

  if (isDuplicateRuleActive) {
    // Rule: Duplicate numbers are invalidated
    const counts = {};
    submissions.forEach(sub => {
      counts[sub.number] = (counts[sub.number] || 0) + 1;
    });

    const validSubmissions = submissions.filter(sub => counts[sub.number] === 1);
    const hasDuplicates = submissions.some(sub => counts[sub.number] >= 2);

    if (hasDuplicates) {
      ruleApplied = "Duplicate Numbers Invalidated";

      // Duplicate pickers get penalized (1 point)
      submissions.forEach(sub => {
        if (counts[sub.number] >= 2) {
          pointDeductions[sub.id] = 1;
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

        // Check if any winner has the exact winning number
        if (isExactWinningNumberRuleActive) {
          hasExactWinner = validSubmissions.some(sub => sub.number === targetResult && winners.includes(sub.id));
        }
      } else {
        // All submissions duplicated, everyone loses
        average = 0;
        targetResult = 0;
        winners = [];
      }
    } else {
      // No duplicates, proceed to check 0 vs 100 or normal math
      evaluateNormalOrDuel();
    }
  } else {
    // Duplicate rule not active, evaluate using all submissions
    evaluateNormalOrDuel();
  }

  // Apply penalty doubler if exact target is hit
  if (hasExactWinner) {
    ruleApplied = "Exact Target Hit! Penalty Doubled (-2 Pts)";
    activePlayers.forEach(p => {
      pointDeductions[p.id] = 2; // Double penalty for all who didn't win
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
      // Check for elimination
      if (p.points <= 0) {
        p.points = 0;
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
