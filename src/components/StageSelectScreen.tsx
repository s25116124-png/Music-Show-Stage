/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StageId, CharacterId } from '../types/game';
import { STAGES, CHARACTERS } from '../data/characters';
import { CharacterSprite } from './CharacterSprite';
import { audioService } from '../services/audioService';

interface StageSelectScreenProps {
  selectedStageId: StageId;
  selectedCharacterId: CharacterId;
  unlockedStages: Record<StageId, boolean>;
  highScores: Record<StageId, number>;
  onSelectStage: (id: StageId) => void;
  onStartStage: () => void;
  onBack: () => void;
}

export const StageSelectScreen: React.FC<StageSelectScreenProps> = ({
  selectedStageId,
  selectedCharacterId,
  unlockedStages,
  highScores,
  onSelectStage,
  onStartStage,
  onBack,
}) => {
  const char = CHARACTERS[selectedCharacterId];

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between items-center bg-gradient-to-b from-[#150a2e] via-[#220d44] to-[#090317] text-white p-4 select-none overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-pink-400 text-3xl animate-bounce">★</div>
        <div className="absolute top-20 right-10 text-cyan-400 text-3xl animate-pulse">★</div>
        <div className="absolute bottom-20 left-1/4 text-yellow-300 text-2xl animate-pulse">✧</div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-2 md:pt-4">
        <button
          onClick={() => {
            audioService.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs md:text-sm transition-all cursor-pointer"
        >
          <span>←</span>
          <span>重選偶像</span>
        </button>

        <div className="text-center">
          <h2
            className="text-2xl sm:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300"
            style={{ fontFamily: "'Fredoka', 'Noto Sans TC', sans-serif" }}
          >
            ★ 選擇巡迴打歌舞台 ★
          </h2>
          <p className="text-xs text-pink-200/80 mt-1 font-medium">
            依序突破關卡，解鎖宇宙偶像最強殿堂！
          </p>
        </div>

        {/* Selected Idol Mini Preview */}
        <div className="hidden sm:flex items-center gap-2 bg-pink-500/20 border border-pink-400/40 rounded-2xl px-3 py-1.5">
          <CharacterSprite id={selectedCharacterId} variant="avatar" size="sm" />
          <div className="text-left">
            <span className="text-[10px] text-pink-300 block font-semibold">出戰偶像</span>
            <span className="text-xs font-black text-white">{char.name}</span>
          </div>
        </div>
      </div>

      {/* Stage Cards Grid */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 my-auto px-2">
        {STAGES.map((stage) => {
          const isUnlocked = unlockedStages[stage.id];
          const isSelected = selectedStageId === stage.id;
          const bestScore = highScores[stage.id] || 0;

          let badgeColor = 'bg-pink-500/30 text-pink-300 border-pink-400/50';
          let difficulty = '★☆☆ 新手推薦 · BPM 90 慢速';
          if (stage.id === 2) {
            badgeColor = 'bg-purple-500/30 text-purple-300 border-purple-400/50';
            difficulty = '★★☆ 活力進階 · BPM 108';
          } else if (stage.id === 3) {
            badgeColor = 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50';
            difficulty = '★★★ 宇宙巔峰 · BPM 126';
          }

          return (
            <div
              key={stage.id}
              onClick={() => {
                if (isUnlocked) {
                  audioService.playClick();
                  onSelectStage(stage.id);
                } else {
                  audioService.playMiss();
                }
              }}
              className={`relative rounded-3xl p-5 border-3 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[340px] ${
                !isUnlocked
                  ? 'border-slate-800 bg-slate-900/40 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'border-yellow-400 bg-gradient-to-b from-purple-900/80 to-slate-950/90 shadow-[0_0_35px_rgba(255,215,0,0.4)] scale-102'
                  : 'border-slate-700 bg-slate-900/70 hover:border-slate-500 hover:scale-101'
              }`}
            >
              {/* Lock Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs rounded-3xl">
                  <span className="text-4xl mb-2">🔒</span>
                  <span className="text-xs font-bold text-slate-300">尚未解鎖</span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    需通過前一關取得合格評級
                  </span>
                </div>
              )}

              {/* Selected Tag */}
              {isSelected && isUnlocked && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-xs shadow-md animate-bounce">
                  當前選擇
                </div>
              )}

              {/* Stage Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                    {difficulty}
                  </span>
                  <span className="text-xs text-yellow-300 font-bold">
                    目標: {stage.targetScore}分
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mt-1">{stage.name}</h3>
                <p className="text-xs text-pink-300 font-medium">{stage.subtitle}</p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {/* Sudden Events Preview */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <span className="text-[11px] text-slate-400 font-bold block mb-1.5">
                  ⚠️ 舞台突發事件：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {stage.events.map((ev) => (
                    <span
                      key={ev}
                      className="px-2 py-0.5 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-bold"
                    >
                      {ev === 'BANANA' && '🍌 香蕉滑倒'}
                      {ev === 'FLYING_MIC' && '🎤 飛行麥克風'}
                      {ev === 'SPEED_UP' && '⚡ 突然加速'}
                      {ev === 'BLACKOUT' && '💡 燈光故障'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Best Score */}
              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">歷史最佳得分</span>
                <span className="font-black text-yellow-400 font-mono">
                  {bestScore > 0 ? `${bestScore} 分` : '尚未挑戰'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Start Button */}
      <div className="relative z-10 w-full max-w-sm pb-6 md:pb-8 flex flex-col items-center">
        <button
          onClick={() => {
            audioService.playClick();
            onStartStage();
          }}
          className="w-full py-4 px-8 rounded-full font-black text-xl text-white tracking-widest shadow-[0_0_30px_rgba(255,105,180,0.7)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/60 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600"
        >
          登台開演！
        </button>
        <span className="text-xs text-pink-200/80 mt-2 font-medium">
          準備好你的節奏感，偶像即將引爆全場！
        </span>
      </div>
    </div>
  );
};
