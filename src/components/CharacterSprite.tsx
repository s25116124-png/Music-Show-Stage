/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterId } from '../types/game';

interface CharacterSpriteProps {
  id: CharacterId;
  variant?: 'full' | 'bust' | 'card' | 'avatar';
  action?: 'idle' | 'jump' | 'crouch' | 'left' | 'right' | 'slip' | 'miss' | 'special';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeech?: string | null;
  position?: 'left' | 'center' | 'right';
}

export const CHARACTER_IMAGES: Record<CharacterId, string> = {
  STAR: '/assets/aistudio/__1_743100ac.png',
  MARU: '/assets/aistudio/__2_02acf423.png',
  ICE: '/assets/aistudio/__3_b727fcd0.png',
};

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  id,
  variant = 'full',
  action = 'idle',
  className = '',
  size = 'md',
  showSpeech = null,
  position = 'center',
}) => {
  const imageUrl = CHARACTER_IMAGES[id] || CHARACTER_IMAGES.STAR;

  // Size configurations
  const sizeClasses = {
    sm: 'w-14 h-16',
    md: 'w-24 h-28 md:w-28 md:h-32',
    lg: 'w-36 h-40 md:w-44 md:h-48',
    xl: 'w-48 h-56 md:w-56 md:h-64',
  }[size];

  // Action transform animations
  let actionStyle: React.CSSProperties = {};
  if (action === 'jump') {
    actionStyle = {
      transform: 'translateY(-30px) scale(1.08)',
      transition: 'transform 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    };
  } else if (action === 'crouch') {
    actionStyle = {
      transform: 'translateY(22px) scale(0.9, 0.75)',
      transition: 'transform 0.1s ease-out',
    };
  } else if (action === 'left') {
    actionStyle = {
      transform: 'translateX(-22px) rotate(-8deg)',
      transition: 'transform 0.12s ease-out',
    };
  } else if (action === 'right') {
    actionStyle = {
      transform: 'translateX(22px) rotate(8deg)',
      transition: 'transform 0.12s ease-out',
    };
  } else if (action === 'slip') {
    actionStyle = {
      transform: 'translateY(18px) rotate(-35deg) scale(0.95)',
      transition: 'transform 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    };
  } else if (action === 'special') {
    actionStyle = {
      transform: 'scale(1.15) rotate(5deg)',
      filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.85))',
      transition: 'transform 0.2s ease-in-out',
    };
  } else if (action === 'miss') {
    actionStyle = {
      transform: 'translateY(6px) scale(0.95)',
      filter: 'brightness(0.9)',
      transition: 'transform 0.1s ease-out',
    };
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Comedic Speech Bubble */}
      {showSpeech && (
        <div className="absolute -top-12 z-30 px-3.5 py-1.5 bg-white text-slate-900 text-xs md:text-sm font-black rounded-2xl shadow-xl border-2 border-pink-400 whitespace-nowrap animate-bounce pointer-events-none">
          {showSpeech}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-white" />
        </div>
      )}

      {/* Comic Action FX Overlay */}
      {action === 'slip' && (
        <div className="absolute -top-6 -right-2 z-20 text-yellow-300 font-black text-xl animate-ping">
          💥 哎呀！
        </div>
      )}
      {action === 'special' && (
        <div className="absolute -top-8 z-20 text-yellow-300 font-black text-lg animate-pulse flex items-center gap-1">
          ✨ FEVER! ✨
        </div>
      )}
      {action === 'jump' && (
        <div className="absolute -bottom-2 z-20 text-pink-300 font-bold text-xs tracking-wider">
          💨 JUMP!
        </div>
      )}
      {action === 'miss' && (
        <div className="absolute -top-3 right-0 z-20 text-cyan-300 text-lg animate-bounce">
          💧
        </div>
      )}

      {/* Main Character Image Container */}
      <div
        className={`${sizeClasses} relative rounded-2xl overflow-hidden transition-all duration-150 flex items-end justify-center ${
          action === 'idle'
            ? position === 'left'
              ? 'animate-dance-l'
              : position === 'right'
              ? 'animate-dance-r'
              : 'animate-dance-c'
            : ''
        }`}
        style={actionStyle}
      >
        <img
          src={imageUrl}
          alt={id}
          className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] select-none"
          draggable={false}
          loading="eager"
        />
      </div>

      {/* Stage Shadow */}
      <div
        className={`mt-1 rounded-full bg-black/45 blur-xs transition-all duration-150 ${
          action === 'jump'
            ? 'w-10 h-2 opacity-20'
            : action === 'crouch'
            ? 'w-24 h-4 opacity-75'
            : 'w-20 h-3 opacity-55'
        }`}
      />
    </div>
  );
};
