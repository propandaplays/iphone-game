/**
 * Turn Manager Types
 *
 * Interfaces for turn order management, phases, and round tracking.
 */

/**
 * A named phase within a turn.
 * Games define their own phases (e.g., Monopoly: "roll" → "action" → "buy").
 */
export interface TurnPhase {
  /** Unique phase identifier */
  id: string;
  /** If true, automatically advance to next phase after update */
  autoAdvance?: boolean;
}

/**
 * Configuration for the turn manager.
 */
export interface TurnConfig {
  /** Ordered phases within each turn */
  phases: TurnPhase[];

  /** Called when a player's turn begins */
  onTurnStart?: (playerId: string, round: number) => void;
  /** Called when a player's turn ends */
  onTurnEnd?: (playerId: string) => void;
  /** Called when the phase changes within a turn */
  onPhaseChange?: (phaseId: string, playerId: string) => void;
  /** Called when a new round begins (all players have taken a turn) */
  onRoundStart?: (round: number) => void;
  /** Called when a round ends */
  onRoundEnd?: (round: number) => void;
}

/**
 * Internal turn state tracking.
 */
export interface TurnState {
  /** Index into the player order array */
  currentPlayerIndex: number;
  /** Index into the phases array */
  currentPhaseIndex: number;
  /** Current round number (1-based) */
  round: number;
  /** Players marked to be skipped on their next turn */
  skippedPlayers: Set<string>;
  /** Whether the game has started */
  started: boolean;
}
