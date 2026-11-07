/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { audioService } from '../services/audioService';

interface TitleScreenProps {
  onStart: () => void;
  onOpenIntro: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenIntro,
  onOpenHelp,
  onOpenSettings,
}) => {
  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-center items-center bg-[#0d041e] text-white p-2 md:p-6 select-none overflow-hidden">
      {/* Top Left Badge matching Image 4 */}
      <div className="absolute top-4 left-4 z-30">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 border border-pink-300 text-white font-black text-xs md:text-sm shadow-md">
          <span>★</span>
          <span>開始畫面</span>
        </div>
      </div>

      {/* Main Container mimicking Image 4 */}
      <div className="relative w-full max-w-4xl aspect-[16/10] max-h-[88vh] rounded-3xl overflow-hidden border-3 border-pink-400/80 shadow-[0_0_50px_rgba(255,105,180,0.5)] flex flex-col justify-between items-center bg-gradient-to-b from-[#1c0840] via-[#2d0b54] to-[#120325]">
        {/* Authentic Background Image Art from Image 4 */}
        <img
          src="/assets/aistudio/__4_ec7c36d2.png"
          alt="打歌舞台大亂鬥 開始畫面"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Ambient Stage Lights Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Floating Sparks Animation */}
        <div className="absolute top-1/4 left-1/4 text-yellow-300 text-3xl animate-pulse pointer-events-none">
          ★
        </div>
        <div className="absolute top-1/3 right-1/4 text-pink-300 text-4xl animate-bounce pointer-events-none">
          ★
        </div>

        {/* Empty space for top logo area in Image 4 */}
        <div className="w-full h-1/2 pointer-events-none" />

        {/* Interactive Clickable Controls Aligned with Image 4 Buttons */}
        <div className="relative z-20 w-full flex flex-col items-center pb-4 md:pb-6 gap-2 md:gap-3 px-4">
          {/* Main Primary Button: 開始遊戲 (Matching pink pill button in Image 4) */}
          <button
            onClick={() => {
              audioService.playClick();
              onStart();
            }}
            className="group relative w-72 sm:w-80 md:w-96 py-3 md:py-4 px-8 rounded-full font-black text-xl md:text-2xl text-white tracking-widest border-3 border-white shadow-[0_0_25px_rgba(255,20,147,0.8)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-[#FF4081] via-[#FF69B4] to-[#FF85C0] flex items-center justify-center gap-3"
          >
            <span className="text-xl md:text-2xl transition-transform group-hover:translate-x-1">
              ▶
            </span>
            <span style={{ fontFamily: "'Fredoka', 'Noto Sans TC', sans-serif" }}>開始遊戲</span>
          </button>

          {/* Three Sub Buttons Row matching Image 4: 角色介紹, 遊戲說明, 設定 */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-lg">
            <button
              onClick={() => {
                audioService.playClick();
                onOpenIntro();
              }}
              className="flex-1 py-2 sm:py-2.5 px-3 rounded-2xl bg-[#4A72E8] hover:bg-[#5B83F9] border-2 border-white/80 text-white text-xs sm:text-sm font-black tracking-wide shadow-md transition-all hover:scale-103 active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <span>★</span>
              <span>角色介紹</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                onOpenHelp();
              }}
              className="flex-1 py-2 sm:py-2.5 px-3 rounded-2xl bg-[#4A72E8] hover:bg-[#5B83F9] border-2 border-white/80 text-white text-xs sm:text-sm font-black tracking-wide shadow-md transition-all hover:scale-103 active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <span>★</span>
              <span>遊戲說明</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                onOpenSettings();
              }}
              className="flex-1 py-2 sm:py-2.5 px-3 rounded-2xl bg-[#4A72E8] hover:bg-[#5B83F9] border-2 border-white/80 text-white text-xs sm:text-sm font-black tracking-wide shadow-md transition-all hover:scale-103 active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <span>⚙</span>
              <span>設定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
