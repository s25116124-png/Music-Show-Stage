/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenState, CharacterId, StageId, GameStats } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelectScreen } from './components/CharacterSelectScreen';
import { StageSelectScreen } from './components/StageSelectScreen';
import { RhythmGameView } from './components/RhythmGameView';
import { ResultScreen } from './components/ResultScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GrandFinaleScreen } from './components/GrandFinaleScreen';
import { CharacterIntroModal, GameHelpModal, SettingsModal } from './components/Modals';
import { audioService } from './services/audioService';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('TITLE');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('STAR');
  const [selectedStage, setSelectedStage] = useState<StageId>(1);

  // Unlocked progression and high scores
  const [unlockedStages, setUnlockedStages] = useState<Record<StageId, boolean>>({
    1: true,
    2: false,
    3: false,
  });
  const [highScores, setHighScores] = useState<Record<StageId, number>>({
    1: 0,
    2: 0,
    3: 0,
  });

  // Last stage game stats & grade
  const [lastStats, setLastStats] = useState<GameStats>({
    score: 0,
    popularity: 100,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    greatCount: 0,
    missCount: 0,
    specialCount: 0,
    eventsAvoided: 0,
  });
  const [lastGrade, setLastGrade] = useState<'S' | 'A' | 'B' | 'C'>('B');

  // Modals state
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Play Title BGM when on title screen
  useEffect(() => {
    if (screen === 'TITLE') {
      audioService.startBgm('TITLE');
    }
    return () => {
      if (screen === 'TITLE') {
        audioService.stopBgm();
      }
    };
  }, [screen]);

  // Stage clear handler
  const handleStageClear = (stats: GameStats, grade: 'S' | 'A' | 'B' | 'C') => {
    setLastStats(stats);
    setLastGrade(grade);

    // Save high score
    setHighScores((prev) => ({
      ...prev,
      [selectedStage]: Math.max(prev[selectedStage] || 0, stats.score),
    }));

    // Unlock next stage if passed
    if (grade !== 'C') {
      if (selectedStage === 1) {
        setUnlockedStages((prev) => ({ ...prev, 2: true }));
      } else if (selectedStage === 2) {
        setUnlockedStages((prev) => ({ ...prev, 3: true }));
      }
    }

    setScreen('STAGE_CLEAR');
  };

  // Game over handler
  const handleGameOver = (stats: GameStats) => {
    setLastStats(stats);
    setScreen('GAME_OVER');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#0a0518] text-white flex flex-col font-sans">
      {/* Global Sound Quick Toggle (Floating top-right in non-playing screens) */}
      {screen !== 'PLAYING' && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          <button
            onClick={() => {
              const muted = audioService.toggleMute();
              setIsMuted(muted);
            }}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-pink-400/50 flex items-center justify-center text-pink-300 font-bold transition-all shadow-lg cursor-pointer"
            title={isMuted ? '取消靜音' : '靜音'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      )}

      {/* Screen Routing */}
      {screen === 'TITLE' && (
        <TitleScreen
          onStart={() => setScreen('CHARACTER_SELECT')}
          onOpenIntro={() => setIsIntroOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {screen === 'CHARACTER_SELECT' && (
        <CharacterSelectScreen
          selectedId={selectedCharacter}
          onSelect={(id) => setSelectedCharacter(id)}
          onConfirm={() => setScreen('STAGE_SELECT')}
          onBack={() => setScreen('TITLE')}
        />
      )}

      {screen === 'STAGE_SELECT' && (
        <StageSelectScreen
          selectedStageId={selectedStage}
          selectedCharacterId={selectedCharacter}
          unlockedStages={unlockedStages}
          highScores={highScores}
          onSelectStage={(id) => setSelectedStage(id)}
          onStartStage={() => setScreen('PLAYING')}
          onBack={() => setScreen('CHARACTER_SELECT')}
        />
      )}

      {screen === 'PLAYING' && (
        <RhythmGameView
          stageId={selectedStage}
          characterId={selectedCharacter}
          onFinishStage={handleStageClear}
          onGameOver={handleGameOver}
          onQuit={() => setScreen('STAGE_SELECT')}
        />
      )}

      {screen === 'STAGE_CLEAR' && (
        <ResultScreen
          stageId={selectedStage}
          characterId={selectedCharacter}
          stats={lastStats}
          grade={lastGrade}
          onNextStage={() => {
            if (selectedStage < 3) {
              setSelectedStage((s) => (s + 1) as StageId);
              setScreen('PLAYING');
            } else {
              setScreen('GRAND_FINALE');
            }
          }}
          onRetry={() => setScreen('PLAYING')}
          onHome={() => setScreen('TITLE')}
          onGrandFinale={() => setScreen('GRAND_FINALE')}
        />
      )}

      {screen === 'GAME_OVER' && (
        <GameOverScreen
          stageId={selectedStage}
          characterId={selectedCharacter}
          stats={lastStats}
          onRetry={() => setScreen('PLAYING')}
          onHome={() => setScreen('TITLE')}
        />
      )}

      {screen === 'GRAND_FINALE' && (
        <GrandFinaleScreen
          onRestart={() => {
            setSelectedStage(1);
            setScreen('STAGE_SELECT');
          }}
          onHome={() => setScreen('TITLE')}
        />
      )}

      {/* Global Modals */}
      <CharacterIntroModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
      />
      <GameHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
