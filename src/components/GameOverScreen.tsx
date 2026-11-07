/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameStats, StageId, CharacterId } from '../types/game';
import { CHARACTERS, STAGES } from '../data/characters';
import { CharacterSprite } from './CharacterSprite';
import { audioService } from '../services/audioService';

interface GameOverScreenProps {
  stageId: StageId;
  characterId: CharacterId;
  stats: GameStats;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stageId,
  characterId,
  stats,
  onRetry,
  onHome,
}) => {
  const char = CHARACTERS[characterId];
  const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between items-center bg-gradient-to-b from-[#240615] via-[#1f0724] to-[#0d020d] text-white p-4 select-none overflow-x-hidden">
      {/* Background Broken Stage Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-1/4 text-4xl opacity-50 animate-bounce">🍌</div>
        <div className="absolute top-20 right-1/4 text-4xl opacity-50 -rotate-45">🎤</div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-950/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-4xl pt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs md:text-sm font-bold tracking-wider mb-2">
          💥 舞台突發意外 💥
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
          舞台失控大災難！
        </h2>
        <p className="text-xs text-red-200/80 mt-1">
          人氣值歸零！偶像在失控的舞台上被香蕉與麥克風淹沒了！
        </p>
      </div>

      {/* Card Content */}
      <div className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-slate-900/90 to-red-950/80 border-3 border-red-500/60 rounded-3xl p-6 shadow-[0_0_35px_rgba(239,68,68,0.3)] my-auto flex flex-col items-center">
        {/* Comedic Speech */}
        <div className="relative mb-3 bg-white text-slate-900 px-5 py-2.5 rounded-3xl shadow-xl border-2 border-red-400 max-w-xs text-center font-black text-sm animate-bounce">
          「{char.dialogues.fail}」
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-8 border-t-white" />
        </div>

        {/* Character Crying / Comical Stumble */}
        <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30">
          <CharacterSprite id={characterId} variant="card" size="xl" action="slip" />
        </div>

        {/* Stats Summary */}
        <div className="mt-4 w-full max-w-sm bg-black/40 rounded-2xl p-4 border border-white/10 space-y-2 text-xs md:text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">當前關卡</span>
            <span className="font-bold text-white">{stage.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">最終獲得分數</span>
            <span className="font-mono font-bold text-yellow-400">{stats.score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">命中次數</span>
            <span className="font-mono text-emerald-400">
              {stats.perfectCount + stats.greatCount} 次
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">失誤次數</span>
            <span className="font-mono text-rose-400">{stats.missCount} 次</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-amber-200/90 font-medium text-center">
          💡 小秘訣：出現香蕉時按 <strong className="text-emerald-400">↑ (跳躍)</strong>，失控麥克風按 <strong className="text-cyan-400">↓ (蹲下)</strong> 即可維持人氣值！
        </p>
      </div>

      {/* Buttons */}
      <div className="relative z-10 w-full max-w-md pb-6 md:pb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => {
            audioService.playClick();
            onRetry();
          }}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-full font-black text-base text-white tracking-wider shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-red-500 via-rose-500 to-amber-600 border-2 border-white/60"
        >
          重新挑戰此關 ↻
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            onHome();
          }}
          className="w-full sm:w-36 py-3.5 px-6 rounded-full font-bold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-md"
        >
          返回首頁
        </button>
      </div>
    </div>
  );
};
