/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { GameStats, StageId, CharacterId } from '../types/game';
import { CHARACTERS, STAGES } from '../data/characters';
import { CHARACTER_IMAGES } from './CharacterSprite';
import { audioService } from '../services/audioService';

interface ResultScreenProps {
  stageId: StageId;
  characterId: CharacterId;
  stats: GameStats;
  grade: 'S' | 'A' | 'B' | 'C';
  onNextStage: () => void;
  onRetry: () => void;
  onHome: () => void;
  onGrandFinale?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stageId,
  characterId,
  stats,
  grade,
  onNextStage,
  onRetry,
  onHome,
  onGrandFinale,
}) => {
  const char = CHARACTERS[characterId];
  const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];
  const isFinalStage = stageId === 3;
  const isCGrade = grade === 'C';
  const isSGrade = grade === 'S';
  const isABGrade = grade === 'A' || grade === 'B';

  // Sound stinger according to grade tier
  useEffect(() => {
    if (isSGrade) {
      audioService.playVictoryFanfare();
    } else if (isABGrade) {
      audioService.playCheeryFanfare();
    } else {
      audioService.playFailSound();
    }
  }, [grade, isSGrade, isABGrade]);

  // Speech bubble text
  const speechText = isSGrade
    ? '太棒了！我是最棒的！'
    : isABGrade
    ? '演出大成功！謝謝大家！'
    : '嗚嗚...踩到香蕉皮翻車了！';

  // Tier title tag
  const tierTitle = isSGrade
    ? '★ 宇宙超級頂級偶像 ★'
    : isABGrade
    ? '✨ 熱情爆棚！精彩舞台 ✨'
    : '🍌 舞台爆笑翻車現場 💨';

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-center items-center bg-[#0d041e] text-white p-2 md:p-6 select-none overflow-hidden">
      {/* Top Left Badge matching Image 7 */}
      <div className="absolute top-4 left-4 z-30">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 border border-pink-300 text-white font-black text-xs md:text-sm shadow-md">
          <span>★</span>
          <span>關卡結算</span>
        </div>
      </div>

      {/* Main Container mimicking Image 7 */}
      <div
        className={`relative w-full max-w-4xl aspect-[16/10] max-h-[88vh] rounded-3xl overflow-hidden border-3 ${
          isSGrade
            ? 'border-yellow-400 shadow-[0_0_55px_rgba(255,215,0,0.6)] bg-gradient-to-b from-[#2e0e56] via-[#3a0d66] to-[#140228]'
            : isABGrade
            ? 'border-pink-400/80 shadow-[0_0_50px_rgba(255,105,180,0.5)] bg-gradient-to-b from-[#230948] via-[#320c5c] to-[#120325]'
            : 'border-amber-600/70 shadow-[0_0_40px_rgba(200,80,40,0.4)] bg-gradient-to-b from-[#220a2e] via-[#2c131a] to-[#11050a]'
        } flex flex-col justify-between items-center p-4 md:p-6`}
      >
        {/* ========================================================= */}
        {/* TIER 1 (S-GRADE) SPECIAL BACKGROUND: ROTATING SUNBURST & GOLD RAIN */}
        {/* ========================================================= */}
        {isSGrade && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-pink-600/15 to-transparent pointer-events-none" />
            <div className="absolute -inset-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,215,0,0.12)_0deg,transparent_60deg,rgba(255,105,180,0.15)_120deg,transparent_180deg,rgba(255,215,0,0.12)_240deg,transparent_300deg,rgba(255,215,0,0.12)_360deg)] animate-ray-rotate pointer-events-none" />
            {/* Falling Gold Star sparkles */}
            <div className="absolute top-6 left-1/4 text-yellow-300 text-3xl animate-bounce pointer-events-none">
              ★
            </div>
            <div className="absolute top-10 right-1/4 text-pink-300 text-3xl animate-pulse pointer-events-none">
              ✧
            </div>
            <div className="absolute top-20 left-12 text-yellow-200 text-2xl animate-spin pointer-events-none">
              ✨
            </div>
            <div className="absolute top-16 right-16 text-yellow-300 text-2xl animate-bounce pointer-events-none">
              👑
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TIER 2 (A/B-GRADE) SPECIAL BACKGROUND: PARTY STREAMERS & HEARTS */}
        {/* ========================================================= */}
        {isABGrade && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-700/30 via-transparent to-black/40 pointer-events-none" />
            <div className="absolute top-8 left-1/3 text-pink-300 text-2xl animate-bounce pointer-events-none">
              💖
            </div>
            <div className="absolute top-12 right-1/3 text-cyan-300 text-2xl animate-pulse pointer-events-none">
              🎵
            </div>
            <div className="absolute top-10 left-1/4 text-yellow-300 text-4xl animate-bounce pointer-events-none">
              ★
            </div>
            <div className="absolute top-14 right-1/4 text-pink-300 text-3xl animate-pulse pointer-events-none">
              ✧
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TIER 3 (C-GRADE) SPECIAL BACKGROUND: COMEDY SMOKE & BROKEN PROPS */}
        {/* ========================================================= */}
        {isCGrade && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/25 via-transparent to-black/60 pointer-events-none" />
            <div className="absolute top-12 left-1/4 text-3xl opacity-75 animate-smoke pointer-events-none">
              💨
            </div>
            <div className="absolute top-16 right-1/4 text-3xl opacity-75 animate-smoke pointer-events-none">
              💨
            </div>
            <div className="absolute bottom-16 left-16 text-3xl rotate-45 pointer-events-none animate-bounce">
              🍌
            </div>
            <div className="absolute bottom-20 right-20 text-3xl -rotate-12 pointer-events-none">
              🎤
            </div>
          </>
        )}

        {/* Center Content Row: Left Stats & Right Celebrating Character (Matching Image 7) */}
        <div className="relative z-10 w-full flex-1 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 px-2 sm:px-6 my-auto">
          {/* Left Column: Winged Grade Emblem & White Stats Box */}
          <div className="flex-1 w-full max-w-sm flex flex-col items-center md:items-start space-y-3">
            {/* Grade Tier Title Tag */}
            <div
              className={`text-xs sm:text-sm font-black px-3.5 py-1 rounded-full border shadow-md self-center md:self-start ${
                isSGrade
                  ? 'bg-yellow-400/20 border-yellow-300 text-yellow-300 animate-pulse'
                  : isABGrade
                  ? 'bg-pink-500/20 border-pink-300 text-pink-200'
                  : 'bg-amber-500/20 border-amber-400 text-amber-300'
              }`}
            >
              {tierTitle}
            </div>

            {/* Winged Emblem with Crown matching Image 7 */}
            <div className="flex items-center gap-2 self-center md:self-start">
              {isSGrade ? (
                <>
                  <span className="text-3xl md:text-4xl text-yellow-300 scale-x-[-1] animate-bounce">
                    🪽
                  </span>
                  <div className="relative flex items-center justify-center">
                    <span className="text-3xl md:text-4xl -mt-7 -mr-4 absolute z-20 animate-bounce">
                      👑
                    </span>
                    <span
                      className="text-6xl md:text-7xl font-black text-yellow-300 tracking-tighter"
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        textShadow:
                          '3px 3px 0 #7A3500, -2px -2px 0 #FFFFFF, 0 0 25px #FFD700',
                      }}
                    >
                      S
                    </span>
                    <span
                      className="text-2xl md:text-3xl font-black text-white ml-2 self-end mb-1"
                      style={{ textShadow: '2px 2px 0 #FF1493' }}
                    >
                      等級
                    </span>
                  </div>
                  <span className="text-3xl md:text-4xl text-yellow-300 animate-bounce">
                    🪽
                  </span>
                </>
              ) : isABGrade ? (
                <>
                  <span className="text-3xl md:text-4xl text-pink-300 scale-x-[-1] animate-pulse">
                    🪽
                  </span>
                  <div className="relative flex items-center justify-center">
                    <span className="text-2xl md:text-3xl -mt-6 -mr-4 absolute z-20">
                      ⭐
                    </span>
                    <span
                      className="text-6xl md:text-7xl font-black text-pink-300 tracking-tighter"
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        textShadow:
                          '3px 3px 0 #4A148C, -2px -2px 0 #FFFFFF, 0 0 20px #FF4081',
                      }}
                    >
                      {grade}
                    </span>
                    <span
                      className="text-2xl md:text-3xl font-black text-white ml-2 self-end mb-1"
                      style={{ textShadow: '2px 2px 0 #7B1FA2' }}
                    >
                      等級
                    </span>
                  </div>
                  <span className="text-3xl md:text-4xl text-pink-300 animate-pulse">
                    🪽
                  </span>
                </>
              ) : (
                /* Grade C: Comic Tilted/Bandaged Sign */
                <div className="flex items-center gap-2 transform -rotate-3">
                  <span className="text-2xl md:text-3xl">🩹</span>
                  <div className="relative flex items-center justify-center bg-amber-900/40 px-4 py-1 rounded-2xl border-2 border-dashed border-amber-400">
                    <span className="text-2xl -mt-5 -mr-4 absolute z-20">💥</span>
                    <span
                      className="text-5xl md:text-6xl font-black text-amber-400 tracking-tighter"
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        textShadow: '2px 2px 0 #3E2723, 0 0 10px #FF6F00',
                      }}
                    >
                      C
                    </span>
                    <span
                      className="text-xl md:text-2xl font-black text-amber-200 ml-2 self-end mb-1"
                      style={{ textShadow: '1px 1px 0 #000' }}
                    >
                      等級
                    </span>
                  </div>
                  <span className="text-2xl md:text-3xl">💦</span>
                </div>
              )}
            </div>

            {/* White Stats Card matching Image 7 */}
            <div className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-purple-200 text-slate-800 space-y-2">
              <div className="flex justify-between items-center text-sm sm:text-base font-black">
                <span className="text-[#3F2B76] tracking-wider">PERFECT</span>
                <span className="font-mono text-[#3F2B76] text-lg sm:text-xl">
                  {stats.perfectCount || 0}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm sm:text-base font-black">
                <span className="text-[#F57C00] tracking-wider">GREAT</span>
                <span className="font-mono text-[#F57C00] text-lg sm:text-xl">
                  {stats.greatCount || 0}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm sm:text-base font-black">
                <span className="text-[#303F9F] tracking-wider">MISS</span>
                <span className="font-mono text-[#303F9F] text-lg sm:text-xl">
                  {stats.missCount || 0}
                </span>
              </div>

              <div className="pt-2 border-t-2 border-purple-100 flex justify-between items-center">
                <span className="font-black text-[#8D4700] text-base sm:text-lg">總分</span>
                <span className="font-mono font-black text-2xl sm:text-3xl text-[#E65100]">
                  {stats.score.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Celebrating Idol + Speech Bubble (Matching Image 7) */}
          <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center relative">
            {/* Speech Bubble: 太棒了！我是最棒的！ matching Image 7 */}
            <div
              className={`relative mb-3 bg-white text-slate-900 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-xl border-2 ${
                isSGrade
                  ? 'border-yellow-400 text-pink-600 animate-bounce'
                  : isABGrade
                  ? 'border-pink-400 animate-bounce'
                  : 'border-amber-500 text-amber-900'
              } font-black text-sm sm:text-base text-center`}
            >
              {speechText}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-8 border-t-white" />
            </div>

            {/* Comic Dizzy Stars Circling Character Head in Grade C */}
            {isCGrade && (
              <div className="absolute top-12 z-20 flex items-center gap-2 text-2xl animate-dizzy pointer-events-none">
                <span>💫</span>
                <span>⭐</span>
                <span>💫</span>
              </div>
            )}

            {/* Idol Illustration */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center relative">
              <img
                src={CHARACTER_IMAGES[characterId] || CHARACTER_IMAGES.STAR}
                alt={char.name}
                className={`w-full h-full object-contain pointer-events-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] select-none ${
                  isSGrade
                    ? 'animate-beat filter drop-shadow-[0_0_20px_rgba(255,215,0,0.7)]'
                    : isABGrade
                    ? 'animate-beat'
                    : 'transform -rotate-6'
                }`}
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Bottom Buttons: 下一關 (Pink) & 返回首頁 (Blue) matching Image 7 */}
        <div className="relative z-20 w-full max-w-md flex items-center justify-center gap-4 sm:gap-6 pb-2">
          {/* Left Button: 下一關 / 重新挑戰 */}
          {!isCGrade ? (
            isFinalStage ? (
              <button
                onClick={() => {
                  audioService.playClick();
                  if (onGrandFinale) onGrandFinale();
                  else onHome();
                }}
                className="flex-1 py-3 px-6 rounded-full font-black text-base sm:text-lg text-white tracking-wider border-3 border-white shadow-[0_0_20px_rgba(255,20,147,0.8)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-[#FF4081] via-[#FF69B4] to-[#FF85C0]"
              >
                宇宙慶典 👑
              </button>
            ) : (
              <button
                onClick={() => {
                  audioService.playClick();
                  onNextStage();
                }}
                className="flex-1 py-3 px-6 rounded-full font-black text-base sm:text-lg text-white tracking-wider border-3 border-white shadow-[0_0_20px_rgba(255,20,147,0.8)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-[#FF4081] via-[#FF69B4] to-[#FF85C0]"
              >
                下一關
              </button>
            )
          ) : (
            <button
              onClick={() => {
                audioService.playClick();
                onRetry();
              }}
              className="flex-1 py-3 px-6 rounded-full font-black text-base sm:text-lg text-white tracking-wider border-3 border-white shadow-[0_0_20px_rgba(255,140,0,0.8)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 animate-pulse"
            >
              重新挑戰 ↻
            </button>
          )}

          {/* Right Blue Button: 返回首頁 matching Image 7 */}
          <button
            onClick={() => {
              audioService.playClick();
              onHome();
            }}
            className="flex-1 py-3 px-6 rounded-full font-black text-base sm:text-lg text-white tracking-wider border-3 border-white shadow-[0_0_20px_rgba(41,182,246,0.8)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-[#29B6F6] via-[#0288D1] to-[#01579B]"
          >
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
};
