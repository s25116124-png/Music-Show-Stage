/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenState =
  | 'TITLE'
  | 'CHARACTER_SELECT'
  | 'STAGE_SELECT'
  | 'PLAYING'
  | 'STAGE_CLEAR'
  | 'GAME_OVER'
  | 'GRAND_FINALE';

export type CharacterId = 'STAR' | 'MARU' | 'ICE';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  title: string;
  personality: string;
  quote: string;
  color: string;
  secondaryColor: string;
  themeGradient: string;
  borderClass: string;
  badge: string;
  funTrait: string;
  specialMove: string;
  stats: {
    idolBurden: number; // 偶像包袱 %
    wildEnergy: number; // 暴走指數 %
    chillPoker: number; // 冷靜值 %
  };
  dialogues: {
    select: string;
    perfectHit: string[];
    miss: string[];
    slipBanana: string;
    dodgeMic: string;
    victoryS: string;
    victoryA: string;
    victoryB: string;
    fail: string;
  };
}

export type DirectionKey = 'LEFT' | 'DOWN' | 'UP' | 'RIGHT' | 'SPACE';

export type Judgment = 'PERFECT' | 'GREAT' | 'MISS' | null;

export interface RhythmNote {
  id: number;
  direction: DirectionKey;
  timeMs: number;
  hit: boolean;
  judgment?: Judgment;
  special?: boolean;
}

export type StageId = 1 | 2 | 3;

export type SuddenEventType = 'NONE' | 'BANANA' | 'FLYING_MIC' | 'SPEED_UP' | 'BLACKOUT';

export interface StageConfig {
  id: StageId;
  name: string;
  subtitle: string;
  description: string;
  bgGradient: string;
  stageColor: string;
  bpm: number;
  durationSec: number;
  targetScore: number;
  events: SuddenEventType[];
  noteSpeed: number; // pixels per second
  unlocked: boolean;
}

export interface GameStats {
  score: number;
  popularity: number; // 0 to 100
  combo: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  missCount: number;
  specialCount: number;
  eventsAvoided: number;
}
