/**
 * Turn Manager
 *
 * Orchestrates turn order, named phases within a turn, and round tracking.
 * Supports round-robin player order with skip and reorder capabilities.
 */

import type { TurnConfig, TurnState } from './turn-types';

/**
 * TurnManager - Manages turn cycling for multiplayer games.
 *
 * Example:
 *   const turns = new TurnManager(['p1', 'p2', 'p3'], {
 *     phases: [{ id: 'roll' }, { id: 'action' }, { id: 'buy' }],
 *     onTurnStart: (id, round) => console.log(`${id}'s turn, round ${round}`),
 *   });
 *   turns.startGame();
 *   turns.nextPhase();  // roll → action
 *   turns.endTurn();    // advance to next player
 */
export class TurnManager {
  private playerOrder: string[];
  private config: TurnConfig;
  private state: TurnState;

  constructor(playerIds: string[], config: TurnConfig) {
    if (playerIds.length === 0) {
      throw new Error('TurnManager requires at least one player');
    }
    if (config.phases.length === 0) {
      throw new Error('TurnManager requires at least one phase');
    }

    this.playerOrder = [...playerIds];
    this.config = config;
    this.state = {
      currentPlayerIndex: 0,
      currentPhaseIndex: 0,
      round: 1,
      skippedPlayers: new Set(),
      started: false,
    };
  }

  /**
   * Begin the game. Fires onRoundStart and onTurnStart for the first player.
   */
  startGame(): void {
    this.state.started = true;
    this.state.currentPlayerIndex = 0;
    this.state.currentPhaseIndex = 0;
    this.state.round = 1;

    this.config.onRoundStart?.(this.state.round);
    this.config.onTurnStart?.(this.getCurrentPlayerId(), this.state.round);
    this.config.onPhaseChange?.(this.getCurrentPhase(), this.getCurrentPlayerId());
  }

  /**
   * End the current player's turn and advance to the next player.
   * Skips players marked for skipping. Increments round when wrapping.
   */
  endTurn(): void {
    const currentPlayer = this.getCurrentPlayerId();
    this.config.onTurnEnd?.(currentPlayer);

    // Advance to next player
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.playerOrder.length;

    // Check for round boundary
    if (nextIndex === 0) {
      this.config.onRoundEnd?.(this.state.round);
      this.state.round++;
      this.config.onRoundStart?.(this.state.round);
    }

    // Skip players if needed
    let attempts = 0;
    while (attempts < this.playerOrder.length) {
      const nextPlayer = this.playerOrder[nextIndex];
      if (this.state.skippedPlayers.has(nextPlayer)) {
        this.state.skippedPlayers.delete(nextPlayer);
        nextIndex = (nextIndex + 1) % this.playerOrder.length;

        // Check for another round boundary
        if (nextIndex === 0) {
          this.config.onRoundEnd?.(this.state.round);
          this.state.round++;
          this.config.onRoundStart?.(this.state.round);
        }

        attempts++;
      } else {
        break;
      }
    }

    this.state.currentPlayerIndex = nextIndex;
    this.state.currentPhaseIndex = 0;

    this.config.onTurnStart?.(this.getCurrentPlayerId(), this.state.round);
    this.config.onPhaseChange?.(this.getCurrentPhase(), this.getCurrentPlayerId());
  }

  /**
   * Get the current player's ID.
   */
  getCurrentPlayerId(): string {
    return this.playerOrder[this.state.currentPlayerIndex];
  }

  /**
   * Get the current phase ID.
   */
  getCurrentPhase(): string {
    return this.config.phases[this.state.currentPhaseIndex].id;
  }

  /**
   * Advance to the next phase within the current turn.
   * Does nothing if already at the last phase.
   */
  nextPhase(): void {
    if (this.state.currentPhaseIndex < this.config.phases.length - 1) {
      this.state.currentPhaseIndex++;
      this.config.onPhaseChange?.(this.getCurrentPhase(), this.getCurrentPlayerId());
    }
  }

  /**
   * Jump to a specific phase by ID.
   */
  setPhase(phaseId: string): void {
    const index = this.config.phases.findIndex((p) => p.id === phaseId);
    if (index === -1) {
      throw new Error(`Phase "${phaseId}" not found`);
    }
    this.state.currentPhaseIndex = index;
    this.config.onPhaseChange?.(this.getCurrentPhase(), this.getCurrentPlayerId());
  }

  /**
   * Get the current round number (1-based).
   */
  getRound(): number {
    return this.state.round;
  }

  /**
   * Replace the player order. Current player index resets to 0.
   */
  setTurnOrder(playerIds: string[]): void {
    if (playerIds.length === 0) {
      throw new Error('Player order must have at least one player');
    }
    this.playerOrder = [...playerIds];
    this.state.currentPlayerIndex = 0;
  }

  /**
   * Mark a player to be skipped on their next turn (one-time skip).
   */
  skipNextTurn(playerId: string): void {
    this.state.skippedPlayers.add(playerId);
  }

  /**
   * Check if the current phase matches the given ID.
   */
  isPhase(phaseId: string): boolean {
    return this.getCurrentPhase() === phaseId;
  }

  /**
   * Preview who the next player will be (without advancing).
   */
  getNextPlayerId(): string {
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.playerOrder.length;

    // Account for skipped players
    let attempts = 0;
    while (attempts < this.playerOrder.length) {
      const nextPlayer = this.playerOrder[nextIndex];
      if (this.state.skippedPlayers.has(nextPlayer)) {
        nextIndex = (nextIndex + 1) % this.playerOrder.length;
        attempts++;
      } else {
        break;
      }
    }

    return this.playerOrder[nextIndex];
  }

  /**
   * Get the list of all player IDs in turn order.
   */
  getPlayerOrder(): readonly string[] {
    return this.playerOrder;
  }

  /**
   * Check if the game has started.
   */
  isStarted(): boolean {
    return this.state.started;
  }
}
