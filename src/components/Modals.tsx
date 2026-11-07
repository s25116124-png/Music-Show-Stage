/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CHARACTERS } from '../data/characters';
import { CharacterSprite } from './CharacterSprite';
import { audioService } from '../services/audioService';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterIntroModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [selectedId, setSelectedId] = useState<'STAR' | 'MARU' | 'ICE'>('STAR');
  if (!isOpen) return null;

  const current = CHARACTERS[selectedId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-pink-500/80 rounded-3xl p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-500/30 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300">
              偶像角色圖鑑
            </h2>
          </div>
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Character Tabs */}
        <div className="flex gap-2 mb-6">
          {(['STAR', 'MARU', 'ICE'] as const).map((id) => {
            const char = CHARACTERS[id];
            const isActive = selectedId === id;
            return (
              <button
                key={id}
                onClick={() => {
                  audioService.playClick();
                  setSelectedId(id);
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 scale-102 border border-pink-300'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span>{char.badge}</span>
                <span>{char.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Character Bust */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/20">
              <CharacterSprite id={selectedId} variant="card" size="lg" />
            </div>
            <span className="mt-2 text-xs font-semibold text-pink-300">
              {current.title}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-3">
              <span className="text-xs text-pink-300 font-bold block mb-1">名言標語</span>
              <p className="text-lg font-black text-yellow-300">「{current.quote}」</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-0.5">性格設定</span>
              <p className="text-sm text-slate-200">{current.personality}</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <span className="text-xs text-amber-300 font-bold block mb-0.5">🎭 搞笑設定</span>
              <p className="text-xs md:text-sm text-amber-100">{current.funTrait}</p>
            </div>

            <div>
              <span className="text-xs text-cyan-300 font-bold block mb-0.5">🌟 專屬必殺動作</span>
              <p className="text-xs md:text-sm text-cyan-100">{current.specialMove}</p>
            </div>

            {/* Stats bars */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">偶像包袱指數</span>
                <span className="font-bold text-pink-400">{current.stats.idolBurden}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pink-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${current.stats.idolBurden}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">暴走破壞能量</span>
                <span className="font-bold text-amber-400">{current.stats.wildEnergy}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${current.stats.wildEnergy}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">絕對高冷數值</span>
                <span className="font-bold text-cyan-400">{current.stats.chillPoker}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${current.stats.chillPoker}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            關閉圖鑑
          </button>
        </div>
      </div>
    </div>
  );
};

export const GameHelpModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-cyan-500/80 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
              舞台操作與遊玩說明
            </h2>
          </div>
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Controls section */}
          <div>
            <h3 className="text-base font-bold text-yellow-300 mb-2 flex items-center gap-1.5">
              <span>🎵</span> 節拍按鍵操作 (支援鍵盤與觸控按鈕)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="p-2.5 rounded-xl bg-pink-500/20 border border-pink-500/40 text-center">
                <span className="block text-xl font-black text-pink-400">← / A</span>
                <span className="text-xs font-bold text-pink-200">向左移動</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-center">
                <span className="block text-xl font-black text-cyan-400">↓ / S</span>
                <span className="text-xs font-bold text-cyan-200">蹲下閃避</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center">
                <span className="block text-xl font-black text-emerald-400">↑ / W</span>
                <span className="text-xs font-bold text-emerald-200">跳躍躍起</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-center">
                <span className="block text-xl font-black text-amber-400">→ / D</span>
                <span className="text-xs font-bold text-amber-200">向右移動</span>
              </div>
              <div className="col-span-2 md:col-span-1 p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-center">
                <span className="block text-base font-black text-purple-300">Space</span>
                <span className="text-xs font-bold text-purple-200">特殊動作</span>
              </div>
            </div>
          </div>

          {/* Scoring system */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
            <h3 className="text-base font-bold text-pink-300 mb-2">🏆 判定與計分規則</h3>
            <ul className="space-y-1 text-xs text-slate-300">
              <li><strong className="text-yellow-300">PERFECT</strong>：完美命中 (+100分，增加人氣值與連擊數)</li>
              <li><strong className="text-cyan-300">GREAT</strong>：良好命中 (+70分，超寬容判定範圍)</li>
              <li><strong className="text-rose-400">MISS</strong>：失誤未按 (扣除少量人氣值)</li>
              <li><strong className="text-emerald-400">新手友善設計</strong>：第一關為慢速教學，音符間隔寬鬆（約1.3秒一顆），且突發事件時會暫停落音符，讓玩家輕鬆上手！</li>
            </ul>
          </div>

          {/* Comedy Events */}
          <div>
            <h3 className="text-base font-bold text-amber-300 mb-2 flex items-center gap-1.5">
              <span>⚠️</span> 舞台搞笑突發事件
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-yellow-950/40 border border-yellow-500/40 rounded-xl">
                <span className="font-bold text-yellow-300 block mb-0.5">🍌 香蕉滑倒</span>
                <span className="text-slate-300">香蕉皮滑入舞台！必須在接近時按下 <strong className="text-emerald-400">↑ (跳躍)</strong> 跳過去，否則會搞笑滑倒！</span>
              </div>
              <div className="p-2.5 bg-blue-950/40 border border-blue-500/40 rounded-xl">
                <span className="font-bold text-cyan-300 block mb-0.5">🎤 失控麥克風</span>
                <span className="text-slate-300">麥克風高速飛過！必須迅速按下 <strong className="text-cyan-400">↓ (蹲下)</strong> 俯身閃避！</span>
              </div>
              <div className="p-2.5 bg-fuchsia-950/40 border border-fuchsia-500/40 rounded-xl">
                <span className="font-bold text-fuchsia-300 block mb-0.5">⚡ 突然加速</span>
                <span className="text-slate-300">音樂節拍突然暴衝狂飆，考驗你的極限反應！</span>
              </div>
              <div className="p-2.5 bg-purple-950/40 border border-purple-500/40 rounded-xl">
                <span className="font-bold text-purple-300 block mb-0.5">💡 燈光故障大跳電</span>
                <span className="text-slate-300">舞台突然變暗，靠螢光棒與直覺跟上拍子！</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            我明白了，準備上台！
          </button>
        </div>
      </div>
    </div>
  );
};

export const SettingsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [masterVol, setMasterVol] = useState(80);
  const [bgmVol, setBgmVol] = useState(65);
  const [sfxVol, setSfxVol] = useState(85);
  const [isMuted, setIsMuted] = useState(audioService.getIsMuted());

  if (!isOpen) return null;

  const handleApply = (master: number, bgm: number, sfx: number) => {
    audioService.setVolumes(master / 100, bgm / 100, sfx / 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-purple-500/80 rounded-3xl p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-purple-500/30 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              音效與遊戲設定
            </h2>
          </div>
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">主音量 (Master)</span>
              <span className="font-bold text-pink-400">{masterVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={masterVol}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMasterVol(val);
                handleApply(val, bgmVol, sfxVol);
              }}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">音樂音量 (BGM)</span>
              <span className="font-bold text-cyan-400">{bgmVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bgmVol}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBgmVol(val);
                handleApply(masterVol, val, sfxVol);
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">效果音音量 (SFX)</span>
              <span className="font-bold text-amber-400">{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSfxVol(val);
                handleApply(masterVol, bgmVol, val);
                audioService.playGreatHit();
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-300">靜音模式</span>
            <button
              onClick={() => {
                const muted = audioService.toggleMute();
                setIsMuted(muted);
              }}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {isMuted ? '🔇 已靜音' : '🔊 聲音開啟'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};
