/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { CHARACTER_IMAGES } from './CharacterSprite';
import { audioService } from '../services/audioService';

interface CharacterSelectScreenProps {
  selectedId: CharacterId;
  onSelect: (id: CharacterId) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  selectedId,
  onSelect,
  onConfirm,
  onBack,
}) => {
  const [speech, setSpeech] = useState<string | null>(CHARACTERS[selectedId].dialogues.select);
  const characterList: CharacterId[] = ['STAR', 'MARU', 'ICE'];

  const handleChoose = (id: CharacterId) => {
    onSelect(id);
    audioService.playGreatHit();
    setSpeech(CHARACTERS[id].dialogues.select);
  };

  const currentIdx = characterList.indexOf(selectedId);
  const handlePrev = () => {
    const prevIdx = (currentIdx - 1 + characterList.length) % characterList.length;
    handleChoose(characterList[prevIdx]);
  };
  const handleNext = () => {
    const nextIdx = (currentIdx + 1) % characterList.length;
    handleChoose(characterList[nextIdx]);
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-center items-center bg-[#0d041e] text-white p-2 md:p-6 select-none overflow-hidden">
      {/* Top Left Badge matching Image 5 */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 border border-pink-300 text-white font-black text-xs md:text-sm shadow-md">
          <span>★</span>
          <span>角色選擇</span>
        </div>
        <button
          onClick={() => {
            audioService.playClick();
            onBack();
          }}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
        >
          ← 返回首頁
        </button>
      </div>

      {/* Main Container mimicking Image 5 */}
      <div className="relative w-full max-w-4xl aspect-[16/10] max-h-[88vh] rounded-3xl overflow-hidden border-3 border-pink-400/80 shadow-[0_0_50px_rgba(255,105,180,0.5)] flex flex-col justify-between items-center bg-gradient-to-b from-[#1c0840] via-[#2d0b54] to-[#120325] p-3 md:p-6">
        {/* Background stage image */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-800/40 via-[#180838] to-[#0d021b] pointer-events-none" />

        {/* Ambient Stage Lights */}
        <div className="absolute top-0 left-1/4 w-72 h-96 bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-72 h-96 bg-cyan-400/15 blur-3xl pointer-events-none" />

        {/* Top Header: 選擇你的偶像！ (Matching Image 5) */}
        <div className="relative z-10 text-center pt-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-yellow-300 text-xl md:text-2xl animate-pulse">★</span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-cyan-200"
              style={{
                fontFamily: "'Fredoka', 'Noto Sans TC', sans-serif",
                textShadow: '0 0 15px rgba(255,105,180,0.8), 2px 2px 0 #4A0E4E',
              }}
            >
              選擇你的偶像！
            </h2>
            <span className="text-yellow-300 text-xl md:text-2xl animate-pulse">★</span>
          </div>
        </div>

        {/* Center: 3 Character Cards + Left/Right Arrow Buttons (Matching Image 5) */}
        <div className="relative z-10 w-full flex items-center justify-center gap-2 sm:gap-4 my-auto px-2">
          {/* Left Arrow Button matching Image 5 */}
          <button
            onClick={handlePrev}
            className="shrink-0 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-pink-500/40 hover:bg-pink-500/70 border-2 border-pink-300 flex items-center justify-center text-white font-black text-lg sm:text-xl transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            title="上一個偶像"
          >
            ❮
          </button>

          {/* Cards Grid matching Image 5 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 max-w-2xl">
            {characterList.map((id) => {
              const char = CHARACTERS[id];
              const isSelected = selectedId === id;

              let cardBg = 'bg-white border-pink-400';
              let ribbonBg = 'bg-gradient-to-r from-pink-500 to-rose-400 text-white';
              let shadowStyle = 'shadow-pink-500/40';

              if (id === 'MARU') {
                cardBg = 'bg-white border-amber-400';
                ribbonBg = 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-black';
                shadowStyle = 'shadow-amber-500/40';
              } else if (id === 'ICE') {
                cardBg = 'bg-white border-blue-400';
                ribbonBg = 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-black';
                shadowStyle = 'shadow-blue-500/40';
              }

              return (
                <div
                  key={id}
                  onClick={() => handleChoose(id)}
                  className={`relative flex flex-col items-center justify-between rounded-2xl sm:rounded-3xl p-2 sm:p-3 border-3 sm:border-4 transition-all duration-200 cursor-pointer ${cardBg} ${
                    isSelected
                      ? `scale-105 shadow-[0_0_25px] ${shadowStyle} ring-4 ring-yellow-300`
                      : 'opacity-85 hover:opacity-100 hover:scale-102'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[10px] sm:text-xs shadow-md animate-bounce z-20">
                      已選擇
                    </div>
                  )}

                  {/* Character Avatar Image from user upload */}
                  <div className="w-full h-24 sm:h-32 md:h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-purple-100/50 to-pink-50/50 p-1">
                    <img
                      src={CHARACTER_IMAGES[id]}
                      alt={char.name}
                      className="w-full h-full object-contain pointer-events-none drop-shadow-md select-none transition-transform hover:scale-105"
                      draggable={false}
                    />
                  </div>

                  {/* Ribbon Name Banner matching Image 5 */}
                  <div className="w-full -mt-2 z-10">
                    <div
                      className={`w-full py-1 px-1 rounded-xl text-center text-xs sm:text-sm font-black tracking-wider shadow-sm border border-white/60 ${ribbonBg}`}
                      style={{ fontFamily: "'Fredoka', 'Noto Sans TC', sans-serif" }}
                    >
                      {char.name}
                    </div>
                  </div>

                  {/* Quote matching Image 5 */}
                  <div className="w-full mt-1.5 min-h-[38px] sm:min-h-[46px] flex items-center justify-center text-center px-1">
                    <p className="text-[10px] sm:text-xs text-slate-700 font-bold leading-tight">
                      {char.quote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow Button matching Image 5 */}
          <button
            onClick={handleNext}
            className="shrink-0 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-pink-500/40 hover:bg-pink-500/70 border-2 border-pink-300 flex items-center justify-center text-white font-black text-lg sm:text-xl transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
            title="下一個偶像"
          >
            ❯
          </button>
        </div>

        {/* Bottom: 確定 (Confirm) Button matching Image 5 */}
        <div className="relative z-10 w-full flex flex-col items-center pb-2">
          <button
            onClick={() => {
              audioService.playClick();
              onConfirm();
            }}
            className="w-48 sm:w-60 md:w-72 py-2.5 sm:py-3.5 px-6 rounded-full font-black text-lg sm:text-xl text-white tracking-widest border-3 border-white shadow-[0_0_20px_rgba(255,20,147,0.7)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-r from-[#FF4081] via-[#FF69B4] to-[#FF85C0] flex items-center justify-center"
            style={{ fontFamily: "'Fredoka', 'Noto Sans TC', sans-serif" }}
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
};
