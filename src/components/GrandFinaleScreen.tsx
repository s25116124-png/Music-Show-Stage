/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { CharacterSprite } from './CharacterSprite';
import { audioService } from '../services/audioService';

interface GrandFinaleScreenProps {
  onRestart: () => void;
  onHome: () => void;
}

export const GrandFinaleScreen: React.FC<GrandFinaleScreenProps> = ({
  onRestart,
  onHome,
}) => {
  const [danceBeat, setDanceBeat] = useState<number>(0);

  useEffect(() => {
    audioService.playVictoryFanfare();
    audioService.playCrowdCheer();

    const interval = setInterval(() => {
      setDanceBeat((b) => b + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between items-center bg-gradient-to-b from-[#19043b] via-[#2c084f] to-[#090217] text-white p-4 select-none overflow-x-hidden">
      {/* Animated Fireworks & Confetti Burst */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 text-5xl animate-bounce">🎆</div>
        <div className="absolute top-16 right-1/4 text-6xl animate-pulse">✨</div>
        <div className="absolute top-24 left-1/6 text-4xl animate-bounce">🎇</div>
        <div className="absolute top-28 right-1/6 text-5xl animate-pulse">🎉</div>
        <div className="absolute top-44 left-1/2 -translate-x-1/2 text-5xl animate-spin" style={{ animationDuration: '6s' }}>
          ⭐
        </div>
      </div>

      {/* Top Victory Header */}
      <div className="relative z-10 w-full max-w-4xl text-center pt-4 md:pt-6">
        <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 text-slate-950 text-sm md:text-base font-black tracking-widest mb-3 shadow-[0_0_25px_rgba(255,215,0,0.8)] animate-pulse">
          👑 宇宙最強偶像選拔總決賽 · 冠軍頒獎典禮 👑
        </div>

        <h1
          className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-300 to-cyan-200 tracking-tight"
          style={{ fontFamily: "'Fredoka', 'Noto Sans TC', sans-serif" }}
        >
          全宇宙最強打歌偶像誕生！
        </h1>
        <p className="text-xs sm:text-sm text-pink-200/90 font-medium mt-1">
          三位偶像克服了失控麥克風、巨大香蕉皮與舞台大斷電，成功征服了銀河系！
        </p>
      </div>

      {/* Center Grand Stage: All Three Idols Group Dance */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center my-auto">
        {/* Trophy with Angel Wings */}
        <div className="text-5xl md:text-6xl mb-2 filter drop-shadow(0 0 20px rgba(255,215,0,0.9)) animate-bounce">
          🏆
        </div>

        {/* Victory Stage Floor */}
        <div className="relative w-full max-w-2xl h-56 md:h-64 flex items-end justify-center">
          <div className="absolute bottom-0 w-full h-32 rounded-[50%] bg-gradient-to-t from-fuchsia-900/90 via-purple-700/50 to-pink-500/30 border-3 border-yellow-400 shadow-[0_0_60px_rgba(255,215,0,0.6)]" />

          {/* Cheering crowd with lightsticks */}
          <div className="absolute -bottom-8 w-full flex justify-around px-8 opacity-60 pointer-events-none">
            <span className="text-pink-400 text-2xl animate-bounce">🪄 🪄</span>
            <span className="text-yellow-300 text-2xl animate-pulse">🪄 🪄</span>
            <span className="text-cyan-400 text-2xl animate-bounce">🪄 🪄</span>
            <span className="text-purple-400 text-2xl animate-pulse">🪄 🪄</span>
          </div>

          {/* Three Idols Dancing Synchronized */}
          <div className="relative z-20 flex items-end justify-center gap-4 sm:gap-8 md:gap-14 pb-4">
            {/* 閃亮小星 */}
            <div className="flex flex-col items-center">
              <div className="bg-white text-slate-900 text-[11px] font-bold px-3 py-1 rounded-2xl border-2 border-pink-400 shadow-lg -mb-2 z-30 animate-bounce">
                「今天的舞台是我的！✨」
              </div>
              <CharacterSprite
                id="STAR"
                variant="full"
                size="md"
                action={danceBeat % 2 === 0 ? 'jump' : 'idle'}
              />
            </div>

            {/* 暴走小丸 (Center) */}
            <div className="flex flex-col items-center -translate-y-3 scale-110">
              <div className="bg-white text-slate-900 text-[11px] font-bold px-3 py-1 rounded-2xl border-2 border-amber-400 shadow-lg -mb-2 z-30 animate-bounce">
                「舞台被我跳塌啦！🔥」
              </div>
              <CharacterSprite
                id="MARU"
                variant="full"
                size="lg"
                action={danceBeat % 2 === 0 ? 'special' : 'idle'}
              />
            </div>

            {/* 冷面阿冰 */}
            <div className="flex flex-col items-center">
              <div className="bg-white text-slate-900 text-[11px] font-bold px-3 py-1 rounded-2xl border-2 border-cyan-400 shadow-lg -mb-2 z-30 animate-bounce">
                「恭喜奪冠，我可以下班了嗎？🕶️」
              </div>
              <CharacterSprite
                id="ICE"
                variant="full"
                size="md"
                action={danceBeat % 2 === 0 ? 'left' : 'right'}
              />
            </div>
          </div>
        </div>

        {/* Philosophical Motto Box from GDD */}
        <div className="mt-6 max-w-xl bg-black/40 border border-pink-400/40 rounded-2xl p-4 text-center">
          <p className="text-sm md:text-base font-black text-yellow-300">
            ★ 企劃核心理念 ★
          </p>
          <p className="text-xs md:text-sm text-pink-100 mt-1 leading-relaxed">
            「就算舞跳得不好，也要有偶像的自信！舞台可以失控，但偶像絕對不能失去表情管理！」
          </p>
        </div>
      </div>

      {/* Bottom Control Buttons */}
      <div className="relative z-10 w-full max-w-md pb-6 md:pb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => {
            audioService.playClick();
            onRestart();
          }}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-full font-black text-base text-white tracking-wider shadow-[0_0_25px_rgba(255,20,147,0.7)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 border-2 border-white/60"
        >
          再次挑戰巡迴 ↻
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            onHome();
          }}
          className="w-full sm:w-40 py-3.5 px-6 rounded-full font-bold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-md"
        >
          返回主畫面
        </button>
      </div>
    </div>
  );
};
