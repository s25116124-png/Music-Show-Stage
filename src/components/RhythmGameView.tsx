/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CharacterId,
  StageId,
  DirectionKey,
  Judgment,
  RhythmNote,
  GameStats,
  SuddenEventType,
} from '../types/game';
import { CHARACTERS, STAGES } from '../data/characters';
import { CharacterSprite } from './CharacterSprite';
import { audioService } from '../services/audioService';

interface RhythmGameViewProps {
  stageId: StageId;
  characterId: CharacterId;
  onFinishStage: (stats: GameStats, grade: 'S' | 'A' | 'B' | 'C') => void;
  onGameOver: (stats: GameStats) => void;
  onQuit: () => void;
}

interface HitEffectParticle {
  id: number;
  xPercent: number;
  icon: string;
  color: string;
}

interface FloatingHitText {
  id: number;
  text: string;
  xPercent: number;
  color: string;
  scoreBonus: string;
  type: 'PERFECT' | 'GREAT';
}

interface ThrownGlowstick {
  id: number;
  xPercent: number;
  color: string;
  glow: string;
  type: 'l' | 'c' | 'r';
  size: 'sm' | 'md' | 'lg';
}

interface AudienceCheerComment {
  id: number;
  text: string;
  xPercent: number;
  color: string;
}

export const RhythmGameView: React.FC<RhythmGameViewProps> = ({
  stageId,
  characterId,
  onFinishStage,
  onGameOver,
  onQuit,
}) => {
  const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];
  const char = CHARACTERS[characterId];

  // Stage difficulty variables
  const isStage1 = stageId === 1;
  const isStage2 = stageId === 2;

  // Travel time (ms for note to fall from top to target)
  const travelDurationMs = isStage1 ? 2400 : isStage2 ? 2050 : 1850;

  // Judgment windows (generous and accessible)
  const perfectWindow = isStage1 ? 170 : isStage2 ? 150 : 140;
  const greatWindow = isStage1 ? 310 : isStage2 ? 280 : 260;

  // Miss and recovery penalties
  const missPenalty = isStage1 ? 3 : isStage2 ? 4 : 4;
  const perfectRecovery = isStage1 ? 6 : isStage2 ? 5 : 5;

  // Game state
  const [stats, setStats] = useState<GameStats>({
    score: 12850,
    popularity: 90,
    combo: 42,
    maxCombo: 42,
    perfectCount: 28,
    greatCount: 14,
    missCount: 0,
    specialCount: 3,
    eventsAvoided: 0,
  });

  const [notes, setNotes] = useState<RhythmNote[]>([]);
  const [currentJudgment, setCurrentJudgment] = useState<Judgment | null>('PERFECT');
  const [judgmentKey, setJudgmentKey] = useState<number>(0);

  // Group dance action states for all 3 idols
  const [charAction, setCharAction] = useState<
    'idle' | 'jump' | 'crouch' | 'left' | 'right' | 'slip' | 'miss' | 'special'
  >('idle');
  const [leftCharAction, setLeftCharAction] = useState<
    'idle' | 'jump' | 'crouch' | 'left' | 'right' | 'slip' | 'miss' | 'special'
  >('idle');
  const [rightCharAction, setRightCharAction] = useState<
    'idle' | 'jump' | 'crouch' | 'left' | 'right' | 'slip' | 'miss' | 'special'
  >('idle');

  // Ensure all 3 distinct idols are on stage
  const centerCharId = characterId;
  const leftCharId: CharacterId = characterId === 'STAR' ? 'MARU' : 'STAR';
  const rightCharId: CharacterId = characterId === 'ICE' ? 'MARU' : 'ICE';

  const [speech, setSpeech] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSpeedUp, setIsSpeedUp] = useState<boolean>(false);
  const [isBlackout, setIsBlackout] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<SuddenEventType>('BANANA');
  const [eventProgress, setEventProgress] = useState<number>(0.3); // 0 to 1
  const [eventMessage, setEventMessage] = useState<string | null>('突發事件！小心香蕉皮！');
  const [feverGauge, setFeverGauge] = useState<number>(65); // 0 to 100
  const [isFever, setIsFever] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(stage.durationSec);

  // Friendly Stage Intro Countdown (3, 2, 1, 0)
  const [countdown, setCountdown] = useState<number | null>(null);

  // Visual Effects: Particles, Screen Shake & Floating Hit Text!
  const [particles, setParticles] = useState<HitEffectParticle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingHitText[]>([]);
  const [comboBanner, setComboBanner] = useState<string | null>(null);
  const [stageFlash, setStageFlash] = useState<boolean>(false);
  const [shakeType, setShakeType] = useState<'perfect' | 'great' | 'event' | null>(null);

  // Audience Interaction UI: Thrown Glowsticks & Cheering Comments
  const [thrownGlowsticks, setThrownGlowsticks] = useState<ThrownGlowstick[]>([]);
  const [cheerComments, setCheerComments] = useState<AudienceCheerComment[]>([]);

  // Active key presses for visual feedback on receptor buttons
  const [activeKeys, setActiveKeys] = useState<Record<DirectionKey, boolean>>({
    LEFT: false,
    DOWN: false,
    UP: false,
    RIGHT: false,
    SPACE: false,
  });

  // Animation and timing refs
  const gameStartTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number>(0);
  const eventTimerRef = useRef<number | null>(null);
  const statsRef = useRef<GameStats>(stats);
  statsRef.current = stats;

  const notesRef = useRef<RhythmNote[]>([]);
  notesRef.current = notes;

  const lastSpawnBeatRef = useRef<number>(0);
  const currentEventRef = useRef<SuddenEventType>(currentEvent);
  currentEventRef.current = currentEvent;

  const patternStepRef = useRef<number>(0);

  const triggerSpeech = useCallback((text: string, duration = 1200) => {
    setSpeech(text);
    setTimeout(() => {
      setSpeech((prev) => (prev === text ? null : prev));
    }, duration);
  }, []);

  const spawnHitParticles = useCallback((dir: DirectionKey, isPerfect: boolean) => {
    const colIndex =
      dir === 'LEFT' ? 0 : dir === 'DOWN' ? 1 : dir === 'UP' ? 2 : dir === 'RIGHT' ? 3 : 4;
    const xPercent = colIndex * 20 + 10;
    const icons = isPerfect ? ['✨', '⭐', '💖', '🌟', '🎵'] : ['🎵', '✨', '👍'];
    const colors = ['#FF1493', '#00FFFF', '#00FF7F', '#1E90FF', '#DA70D6'];

    const newParticles: HitEffectParticle[] = [
      {
        id: Date.now() + Math.random(),
        xPercent: xPercent + (Math.random() * 4 - 2),
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[colIndex],
      },
      {
        id: Date.now() + Math.random() + 1,
        xPercent: xPercent + (Math.random() * 6 - 3),
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[colIndex],
      },
    ];

    setParticles((prev) => [...prev.slice(-16), ...newParticles]);
    setStageFlash(true);
    setTimeout(() => setStageFlash(false), 120);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 700);
  }, []);

  const triggerScreenShake = useCallback((type: 'perfect' | 'great' | 'event') => {
    setShakeType(type);
    setTimeout(() => {
      setShakeType((curr) => (curr === type ? null : curr));
    }, type === 'event' ? 380 : type === 'perfect' ? 180 : 140);
  }, []);

  const spawnFloatingText = useCallback(
    (dir: DirectionKey, type: 'PERFECT' | 'GREAT', pts: number) => {
      const colIndex =
        dir === 'LEFT' ? 0 : dir === 'DOWN' ? 1 : dir === 'UP' ? 2 : dir === 'RIGHT' ? 3 : 2;
      const xPercent = colIndex * 24 + 14;
      const isPerfect = type === 'PERFECT';
      const textOptions = isPerfect
        ? ['PERFECT! 🌟', 'EXCELLENT! 💖', 'PERFECT!! 👑', 'PERFECT! ✨']
        : ['GREAT! ♪', 'NICE! 👍', 'GREAT! ✨'];
      const text = textOptions[Math.floor(Math.random() * textOptions.length)];

      const newItem: FloatingHitText = {
        id: Date.now() + Math.random(),
        text,
        xPercent,
        color: isPerfect ? '#FFD700' : '#00E5FF',
        scoreBonus: `+${pts}`,
        type,
      };

      setFloatingTexts((prev) => [...prev.slice(-8), newItem]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 650);
    },
    []
  );

  const triggerGlowstickToss = useCallback((count = 4) => {
    audioService.playGlowstickToss();
    const colors = [
      { bg: 'from-pink-400 to-rose-500', glow: 'shadow-[0_0_16px_#ff1493]' },
      { bg: 'from-amber-300 to-yellow-400', glow: 'shadow-[0_0_16px_#ffd700]' },
      { bg: 'from-cyan-300 to-sky-500', glow: 'shadow-[0_0_16px_#00ffff]' },
      { bg: 'from-purple-400 to-fuchsia-500', glow: 'shadow-[0_0_16px_#da70d6]' },
      { bg: 'from-emerald-300 to-green-500', glow: 'shadow-[0_0_16px_#00ff7f]' },
    ];
    const types: ('l' | 'c' | 'r')[] = ['l', 'c', 'r'];
    const newSticks: ThrownGlowstick[] = Array.from({ length: count }).map((_, idx) => {
      const choice = colors[Math.floor(Math.random() * colors.length)];
      return {
        id: Date.now() + Math.random() + idx,
        xPercent: 10 + Math.random() * 80,
        color: choice.bg,
        glow: choice.glow,
        type: types[Math.floor(Math.random() * types.length)],
        size: Math.random() > 0.5 ? 'md' : 'lg',
      };
    });

    setThrownGlowsticks((prev) => [...prev.slice(-20), ...newSticks]);
    setTimeout(() => {
      setThrownGlowsticks((prev) => prev.filter((s) => !newSticks.some((ns) => ns.id === s.id)));
    }, 1450);
  }, []);

  const spawnAudienceCheer = useCallback((currentCombo: number) => {
    let pool = [
      '加油～！✨',
      '太可愛啦！💖',
      '節奏跟上！🎵',
      '好棒好棒！⭐',
    ];
    if (currentCombo === 0) {
      pool = ['不要灰心！繼續加油！💪', '穩住節奏！你可以的！💖', '沒關係，重新再來！✨'];
    } else if (currentCombo >= 10 && currentCombo < 20) {
      pool = [
        '好強的節奏感！🔥',
        '小星／小丸／阿冰最高！🌟',
        '全場動起來！👏',
        '繼續保持！✨',
        '太帥氣了！💖',
      ];
    } else if (currentCombo >= 20 && currentCombo < 35) {
      pool = [
        '🔥 全場瘋狂打 CALL！',
        '👑 宇宙最強打歌！',
        '💫 完美連擊！停不下來！',
        '💖 尖叫聲不要停！',
        '🎉 應援聲浪爆炸！',
      ];
    } else if (currentCombo >= 35) {
      pool = [
        '🌈 螢光棒狂拋！舞台狂熱！',
        '🌋 傳奇偶像誕生啦！！！',
        '⚡ 宇宙頂流！太神啦！',
        '💖 萬人齊呼應援！',
        '🌟 アンコール！アンコール！',
      ];
    }

    const comment: AudienceCheerComment = {
      id: Date.now() + Math.random(),
      text: pool[Math.floor(Math.random() * pool.length)],
      xPercent: 12 + Math.random() * 70,
      color: currentCombo >= 35 ? '#FFD700' : currentCombo >= 20 ? '#00FFFF' : '#FF69B4',
    };

    setCheerComments((prev) => [...prev.slice(-5), comment]);
    setTimeout(() => {
      setCheerComments((prev) => prev.filter((c) => c.id !== comment.id));
    }, 2000);
  }, []);

  const triggerSuddenEvent = useCallback(
    (type: SuddenEventType) => {
      if (type === 'NONE' || countdown !== null) return;
      setCurrentEvent(type);
      setEventProgress(0);

      // Play emergency alert siren & trigger comedy screen shake
      audioService.playEmergencyAlert();
      triggerScreenShake('event');

      const eventDuration = isStage1 ? 4800 : isStage2 ? 4000 : 3400;

      if (type === 'BANANA') {
        setEventMessage('突發事件！小心香蕉皮！按 ↑ 跳起！');
        audioService.playBananaSlip();
      } else if (type === 'FLYING_MIC') {
        setEventMessage('突發事件！失控麥克風！按 ↓ 蹲下！');
        audioService.playDodgeMic();
      } else if (type === 'SPEED_UP') {
        setEventMessage('突發事件！音樂突然暴走加速！⚡');
        setIsSpeedUp(true);
        setTimeout(() => setIsSpeedUp(false), 6000);
      } else if (type === 'BLACKOUT') {
        setEventMessage('突發事件！燈光短暫跳電！💡');
        setIsBlackout(true);
        setTimeout(() => setIsBlackout(false), 5000);
      }

      const startTime = performance.now();

      const stepEvent = (now: number) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / eventDuration);
        setEventProgress(p);

        if (p < 1) {
          requestAnimationFrame(stepEvent);
        } else {
          setCurrentEvent((prev) => {
            if (prev === 'BANANA') {
              triggerScreenShake('event');
              setCharAction('slip');
              setLeftCharAction('slip');
              setRightCharAction('slip');
              audioService.playBananaSlip();
              triggerSpeech(char.dialogues.slipBanana, 2000);
              setStats((s) => ({
                ...s,
                popularity: Math.max(0, s.popularity - 10),
                combo: 0,
              }));
              setTimeout(() => {
                setCharAction('idle');
                setLeftCharAction('idle');
                setRightCharAction('idle');
              }, 800);
            } else if (prev === 'FLYING_MIC') {
              triggerScreenShake('event');
              setCharAction('miss');
              setLeftCharAction('miss');
              setRightCharAction('crouch');
              audioService.playMiss();
              triggerSpeech('哇啊！被失控麥克風打到了！', 1500);
              setStats((s) => ({
                ...s,
                popularity: Math.max(0, s.popularity - 10),
                combo: 0,
              }));
              setTimeout(() => {
                setCharAction('idle');
                setLeftCharAction('idle');
                setRightCharAction('idle');
              }, 700);
            }
            return 'NONE';
          });
          setEventMessage(null);
        }
      };
      requestAnimationFrame(stepEvent);
    },
    [char.dialogues.slipBanana, countdown, isStage1, isStage2, triggerScreenShake, triggerSpeech]
  );

  // Sudden event scheduler
  useEffect(() => {
    if (countdown !== null) return;

    const intervalTime = isStage1 ? 14000 : isStage2 ? 12000 : 10000;
    const eventInterval = window.setInterval(() => {
      if (isPaused) return;
      if (stage.events.length > 0) {
        const randomEv = stage.events[Math.floor(Math.random() * stage.events.length)];
        triggerSuddenEvent(randomEv);
      }
    }, intervalTime);
    eventTimerRef.current = eventInterval;

    return () => {
      if (eventTimerRef.current) clearInterval(eventTimerRef.current);
    };
  }, [countdown, isPaused, isStage1, isStage2, stage.events, triggerSuddenEvent]);

  // Main Animation / Game Clock Loop
  useEffect(() => {
    if (countdown !== null) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      if (!isPaused) {
        const delta = (time - lastTime) / 1000;
        lastTime = time;

        const currentElapsedSec = (time - gameStartTimeRef.current) / 1000;
        const currentRemaining = Math.max(0, stage.durationSec - currentElapsedSec);
        setTimeRemaining(Math.ceil(currentRemaining));

        // Check Stage Clear condition
        if (currentRemaining <= 0) {
          audioService.stopBgm();
          const s = statsRef.current;
          const maxPossible = (s.perfectCount + s.greatCount + s.missCount || 1) * 100;
          const ratio = s.score / (maxPossible || 1);
          let grade: 'S' | 'A' | 'B' | 'C' = 'B';
          if (ratio >= 0.82 && s.popularity >= 50) grade = 'S';
          else if (ratio >= 0.65) grade = 'A';
          else if (ratio >= 0.45) grade = 'B';
          else grade = 'C';

          onFinishStage(s, grade);
          return;
        }

        // Check Game Over condition
        if (statsRef.current.popularity <= 0) {
          audioService.stopBgm();
          audioService.playFailSound();
          onGameOver(statsRef.current);
          return;
        }

        const isObstacleActive =
          currentEventRef.current === 'BANANA' || currentEventRef.current === 'FLYING_MIC';

        if (!isObstacleActive) {
          const effectiveBpm = isSpeedUp ? stage.bpm * 1.2 : stage.bpm;
          const beatDurationMs = (60 / effectiveBpm) * 1000;
          const elapsedMs = time - gameStartTimeRef.current;

          const beatDivider = isStage1 ? 2 : isStage2 ? 1.7 : 1.55;
          const currentBeat = Math.floor(elapsedMs / (beatDurationMs * beatDivider));

          if (currentBeat > lastSpawnBeatRef.current) {
            lastSpawnBeatRef.current = currentBeat;

            let chosenDir: DirectionKey = 'LEFT';
            let isSpecial = false;

            if (isStage1) {
              const stage1Cycle: DirectionKey[] = ['LEFT', 'DOWN', 'UP', 'RIGHT'];
              chosenDir = stage1Cycle[patternStepRef.current % stage1Cycle.length];
              patternStepRef.current++;
            } else if (isStage2) {
              const stage2Cycle: DirectionKey[] = ['LEFT', 'DOWN', 'UP', 'RIGHT'];
              if (Math.random() < 0.1) {
                chosenDir = 'SPACE';
                isSpecial = true;
              } else {
                chosenDir = stage2Cycle[patternStepRef.current % stage2Cycle.length];
              }
              patternStepRef.current++;
            } else {
              const stage3Cycle: DirectionKey[] = ['LEFT', 'DOWN', 'UP', 'RIGHT'];
              if (Math.random() < 0.12) {
                chosenDir = 'SPACE';
                isSpecial = true;
              } else {
                chosenDir = stage3Cycle[patternStepRef.current % stage3Cycle.length];
              }
              patternStepRef.current++;
            }

            const targetTimeMs = elapsedMs + travelDurationMs;

            setNotes((prev) => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                direction: chosenDir,
                timeMs: targetTimeMs,
                hit: false,
                special: isSpecial,
              },
            ]);
          }
        }

        // Missed notes
        const elapsedMs = time - gameStartTimeRef.current;
        setNotes((prevNotes) => {
          let updated = false;
          const newNotes = prevNotes.map((note) => {
            if (!note.hit && elapsedMs - note.timeMs > 220) {
              updated = true;
              audioService.playMiss();
              setCurrentJudgment('MISS');
              setJudgmentKey(Date.now());
              setCharAction('miss');
              setLeftCharAction('miss');
              setRightCharAction('miss');
              setTimeout(() => {
                setCharAction('idle');
                setLeftCharAction('idle');
                setRightCharAction('idle');
              }, 250);

              setStats((s) => ({
                ...s,
                missCount: s.missCount + 1,
                combo: 0,
                popularity: Math.max(0, s.popularity - missPenalty),
              }));

              return { ...note, hit: true, judgment: 'MISS' as Judgment };
            }
            return note;
          });

          return newNotes.filter((n) => !n.hit || elapsedMs - n.timeMs < 400);
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    countdown,
    isPaused,
    stage.bpm,
    stage.durationSec,
    isSpeedUp,
    isStage1,
    isStage2,
    missPenalty,
    travelDurationMs,
    onFinishStage,
    onGameOver,
  ]);

  // Handle Player Hit input
  const handleInput = useCallback(
    (dir: DirectionKey) => {
      if (isPaused || countdown !== null) return;

      setActiveKeys((prev) => ({ ...prev, [dir]: true }));
      setTimeout(() => {
        setActiveKeys((prev) => ({ ...prev, [dir]: false }));
      }, 160);

      const centerMove =
        dir === 'LEFT'
          ? 'left'
          : dir === 'RIGHT'
          ? 'right'
          : dir === 'UP'
          ? 'jump'
          : dir === 'DOWN'
          ? 'crouch'
          : 'special';
      const leftMove =
        dir === 'LEFT' ? 'left' : dir === 'UP' ? 'jump' : dir === 'SPACE' ? 'special' : 'jump';
      const rightMove =
        dir === 'RIGHT' ? 'right' : dir === 'DOWN' ? 'crouch' : dir === 'SPACE' ? 'special' : 'left';

      setCharAction(centerMove);
      setLeftCharAction(leftMove);
      setRightCharAction(rightMove);
      setTimeout(() => {
        setCharAction('idle');
        setLeftCharAction('idle');
        setRightCharAction('idle');
      }, 240);

      // Sudden event avoidance
      if (currentEvent === 'BANANA' && dir === 'UP') {
        audioService.playGreatHit();
        audioService.playCrowdCheer();
        spawnHitParticles('UP', true);
        triggerSpeech(char.dialogues.dodgeMic || '完美的偶像跳躍！', 1500);
        setCurrentEvent('NONE');
        setEventMessage('✨ 成功跳躍閃避香蕉！+200分！');
        setCharAction('jump');
        setLeftCharAction('jump');
        setRightCharAction('jump');
        setTimeout(() => {
          setCharAction('idle');
          setLeftCharAction('idle');
          setRightCharAction('idle');
        }, 400);
        setStats((s) => ({
          ...s,
          score: s.score + 200,
          eventsAvoided: s.eventsAvoided + 1,
          popularity: Math.min(100, s.popularity + 12),
        }));
        setTimeout(() => setEventMessage(null), 1200);
        return;
      }

      if (currentEvent === 'FLYING_MIC' && dir === 'DOWN') {
        audioService.playDodgeMic();
        audioService.playCrowdCheer();
        spawnHitParticles('DOWN', true);
        triggerSpeech(char.dialogues.dodgeMic || '俯身閃避麥克風！', 1500);
        setCurrentEvent('NONE');
        setEventMessage('✨ 靈敏下蹲閃避麥克風！+200分！');
        setCharAction('crouch');
        setLeftCharAction('crouch');
        setRightCharAction('crouch');
        setTimeout(() => {
          setCharAction('idle');
          setLeftCharAction('idle');
          setRightCharAction('idle');
        }, 400);
        setStats((s) => ({
          ...s,
          score: s.score + 200,
          eventsAvoided: s.eventsAvoided + 1,
          popularity: Math.min(100, s.popularity + 12),
        }));
        setTimeout(() => setEventMessage(null), 1200);
        return;
      }

      // Check rhythm hit timing
      const currentElapsedMs = performance.now() - gameStartTimeRef.current;
      const candidates = notesRef.current.filter((n) => !n.hit && n.direction === dir);

      if (candidates.length === 0) {
        return;
      }

      let closestNote = candidates[0];
      let minDiff = Math.abs(currentElapsedMs - candidates[0].timeMs);

      for (let i = 1; i < candidates.length; i++) {
        const diff = Math.abs(currentElapsedMs - candidates[i].timeMs);
        if (diff < minDiff) {
          minDiff = diff;
          closestNote = candidates[i];
        }
      }

      if (minDiff <= perfectWindow) {
        audioService.playPerfectHit();
        setCurrentJudgment('PERFECT');
        setJudgmentKey(Date.now());
        spawnHitParticles(dir, true);
        triggerScreenShake('perfect');

        // Responsive 3-idol group dance choreography on perfect hit
        setCharAction(centerMove);
        setLeftCharAction(leftMove);
        setRightCharAction(rightMove);
        setTimeout(() => {
          setCharAction('idle');
          setLeftCharAction('idle');
          setRightCharAction('idle');
        }, 220);

        if (Math.random() < 0.25) {
          const randQuote =
            char.dialogues.perfectHit[
              Math.floor(Math.random() * char.dialogues.perfectHit.length)
            ];
          triggerSpeech(randQuote, 1000);
        }

        setFeverGauge((prev) => {
          const next = Math.min(100, prev + 6);
          if (next >= 100 && !isFever) {
            setIsFever(true);
            audioService.playSpecialMove();
            setTimeout(() => setIsFever(false), 6000);
          }
          return next;
        });

        const currentCombo = statsRef.current.combo;
        const newCombo = currentCombo + 1;

        // High combo audience interaction: glowstick toss & cheers!
        if (newCombo >= 15) {
          if (newCombo === 15 || newCombo === 20 || newCombo === 25 || newCombo === 30 || newCombo === 40 || newCombo === 50) {
            triggerGlowstickToss(newCombo >= 30 ? 7 : 5);
          } else if (newCombo > 20 && (newCombo % 3 === 0 || Math.random() < 0.45)) {
            triggerGlowstickToss(3);
          }
        }
        if (newCombo % 4 === 0 || newCombo === 10 || newCombo === 20 || newCombo === 30) {
          spawnAudienceCheer(newCombo);
        }

        const comboBonus = Math.floor((currentCombo + 1) / 10) * 50;
        const pts = (dir === 'SPACE' ? 200 : 100) + comboBonus;
        spawnFloatingText(dir, 'PERFECT', isFever ? Math.floor(pts * 1.5) : pts);

        setStats((s) => {
          if (newCombo > 0 && newCombo % 5 === 0) {
            const milestoneText =
              newCombo >= 20
                ? `👑 ${newCombo} COMBO! 宇宙無敵大熱舞！`
                : newCombo >= 10
                ? `🔥 ${newCombo} COMBO! 舞台全場沸騰啦！`
                : `⚡ ${newCombo} COMBO! 偶像熱力發動！`;
            setComboBanner(milestoneText);
            audioService.playCrowdCheer();
            setTimeout(() => setComboBanner(null), 1400);
          }

          return {
            ...s,
            score: s.score + (isFever ? Math.floor(pts * 1.5) : pts),
            combo: newCombo,
            maxCombo: Math.max(s.maxCombo, newCombo),
            perfectCount: s.perfectCount + 1,
            specialCount: dir === 'SPACE' ? s.specialCount + 1 : s.specialCount,
            popularity: Math.min(100, s.popularity + perfectRecovery),
          };
        });

        closestNote.hit = true;
        closestNote.judgment = 'PERFECT';
      } else if (minDiff <= greatWindow) {
        audioService.playGreatHit();
        setCurrentJudgment('GREAT');
        setJudgmentKey(Date.now());
        spawnHitParticles(dir, false);
        triggerScreenShake('great');

        // Responsive 3-idol group dance choreography on great hit
        setCharAction(centerMove);
        setLeftCharAction(leftMove);
        setRightCharAction(rightMove);
        setTimeout(() => {
          setCharAction('idle');
          setLeftCharAction('idle');
          setRightCharAction('idle');
        }, 200);

        const currentCombo = statsRef.current.combo;
        const newCombo = currentCombo + 1;
        if (newCombo >= 20 && (newCombo % 5 === 0 || Math.random() < 0.35)) {
          triggerGlowstickToss(3);
        }
        if (newCombo % 5 === 0) {
          spawnAudienceCheer(newCombo);
        }

        const comboBonus = Math.floor((currentCombo + 1) / 10) * 30;
        const pts = (dir === 'SPACE' ? 140 : 70) + comboBonus;
        spawnFloatingText(dir, 'GREAT', isFever ? Math.floor(pts * 1.5) : pts);

        setStats((s) => {
          return {
            ...s,
            score: s.score + (isFever ? Math.floor(pts * 1.5) : pts),
            combo: newCombo,
            maxCombo: Math.max(s.maxCombo, newCombo),
            greatCount: s.greatCount + 1,
            popularity: Math.min(100, s.popularity + Math.max(2, perfectRecovery - 2)),
          };
        });

        closestNote.hit = true;
        closestNote.judgment = 'GREAT';
      } else if (minDiff < 380) {
        audioService.playMiss();
        if (statsRef.current.combo >= 10) {
          spawnAudienceCheer(0);
        }
        setCurrentJudgment('MISS');
        setJudgmentKey(Date.now());
        setCharAction('miss');
        setLeftCharAction('miss');
        setRightCharAction('miss');
        setTimeout(() => {
          setCharAction('idle');
          setLeftCharAction('idle');
          setRightCharAction('idle');
        }, 250);

        setStats((s) => ({
          ...s,
          missCount: s.missCount + 1,
          combo: 0,
          popularity: Math.max(0, s.popularity - missPenalty),
        }));

        closestNote.hit = true;
        closestNote.judgment = 'MISS';
      }
    },
    [
      isPaused,
      countdown,
      currentEvent,
      char.dialogues.dodgeMic,
      char.dialogues.perfectHit,
      isFever,
      perfectWindow,
      greatWindow,
      perfectRecovery,
      missPenalty,
      spawnHitParticles,
      triggerSpeech,
      triggerScreenShake,
      spawnFloatingText,
    ]
  );

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        handleInput('LEFT');
      } else if (e.key === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleInput('DOWN');
      } else if (e.key === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleInput('UP');
      } else if (e.key === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        handleInput('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleInput('SPACE');
      } else if (e.key === 'Escape') {
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  const currentElapsedMs =
    countdown !== null ? 0 : performance.now() - gameStartTimeRef.current;

  // Dynamic Beat & State Responsive Neon Slogan
  const dynamicNeonSlogan = isFever
    ? '💖 FEVER TIME! 宇宙熱力全開 💖'
    : isSpeedUp
    ? '⚡ SPEED UP! 音樂極速暴走 ⚡'
    : stats.combo >= 20
    ? '👑 宇宙頂級偶像誕生！SUPER IDOL 👑'
    : stats.combo >= 10
    ? '🔥 STAGE ON FIRE! 全場沸騰中 🔥'
    : stageId === 1
    ? '★ 新人出道戰 · SUPER DEBUT LIVE ★'
    : stageId === 2
    ? '✨ 霓虹大型舞台 · NEON CONCERT ✨'
    : '🌟 宇宙銀河總決賽 · GRAND FINALE 🌟';

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-center items-center bg-[#0d041e] text-white p-2 md:p-6 select-none overflow-hidden">
      {/* Top Left Badge matching Image 6 */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 border border-pink-300 text-white font-black text-xs md:text-sm shadow-md">
          <span>★</span>
          <span>遊戲畫面</span>
        </div>
        <button
          onClick={() => {
            audioService.playClick();
            setIsPaused(true);
          }}
          className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
        >
          ⏸ 暫停
        </button>
      </div>

      {/* Main Game Stage Container mimicking Image 6 with Dynamic Screen Shake on Hits & Events */}
      <div
        className={`relative w-full max-w-4xl aspect-[16/10] max-h-[88vh] rounded-3xl overflow-hidden border-3 border-pink-400/80 shadow-[0_0_50px_rgba(255,105,180,0.5)] flex flex-col justify-between items-center bg-gradient-to-b from-[#1b083e] via-[#2d0c56] to-[#110324] p-3 md:p-5 transition-all duration-75 ${
          shakeType === 'event'
            ? 'animate-shake-event ring-6 ring-red-500/90 shadow-[0_0_80px_rgba(255,0,0,0.95)]'
            : shakeType === 'perfect'
            ? 'animate-shake-perfect ring-4 ring-yellow-400/80 shadow-[0_0_60px_rgba(255,215,0,0.8)]'
            : shakeType === 'great'
            ? 'animate-shake-great ring-2 ring-cyan-400/70 shadow-[0_0_50px_rgba(0,229,255,0.6)]'
            : ''
        }`}
      >
        {/* Sudden Event Warning Red Light Strobe & Beacon Overlay */}
        {currentEvent !== 'NONE' && (
          <div className="absolute inset-0 z-30 pointer-events-none rounded-3xl overflow-hidden">
            {/* Flashing warning red alert strobe */}
            <div className="absolute inset-0 bg-red-600/25 animate-warning-strobe border-4 border-red-500/90 shadow-[inset_0_0_80px_rgba(255,0,0,0.7)]" />

            {/* Stage Top Hazard Warning Banner */}
            <div className="absolute top-11 sm:top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 sm:px-6 py-1 sm:py-1.5 rounded-full bg-red-600/95 border-2 border-yellow-300 text-white font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(255,0,0,0.9)] animate-hazard uppercase tracking-wider">
              <span className="text-yellow-300 text-sm sm:text-base animate-spin">⚠️</span>
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {currentEvent === 'BANANA'
                  ? '🚨 突發警報！巨大香蕉皮從天而降！'
                  : currentEvent === 'FLYING_MIC'
                  ? '🚨 突發警報！失控麥克風超音速飛襲！'
                  : currentEvent === 'SPEED_UP'
                  ? '⚡ 突發警報！BGM 狂暴加速失控！'
                  : '💡 突發警報！舞台燈光短暫異常！'}
              </span>
              <span className="text-yellow-300 text-sm sm:text-base animate-spin">⚠️</span>
            </div>
          </div>
        )}

        {/* Background Stage Image Art from Image 6 */}
        <img
          src="/assets/aistudio/__6_51baaee9.png"
          alt="打歌舞台大亂鬥 遊戲畫面"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-40 mix-blend-screen"
        />

        {/* Dynamic Sweeping Lasers in Background */}
        <div className="absolute -top-10 left-1/4 w-72 h-full bg-gradient-to-b from-pink-500/35 via-purple-500/10 to-transparent blur-2xl origin-top animate-laser-left pointer-events-none" />
        <div className="absolute -top-10 right-1/4 w-72 h-full bg-gradient-to-b from-cyan-400/35 via-blue-500/10 to-transparent blur-2xl origin-top animate-laser-right pointer-events-none" />

        {/* ========================================================= */}
        {/* DYNAMIC BACKGROUND ELEMENTS: LIGHT BULBS, DISCO BALL, RIBBONS */}
        {/* ========================================================= */}

        {/* 1. Stage Top Lighting Truss with Blinking Stage Bulbs */}
        <div className="absolute top-0 left-0 right-0 h-4 flex items-center justify-around px-8 sm:px-14 z-20 pointer-events-none opacity-85">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white/60 ${
                i % 2 === 0 ? 'bg-pink-400 animate-bulb-1' : 'bg-cyan-300 animate-bulb-2'
              }`}
              style={{ animationDelay: `${(i * 0.12).toFixed(2)}s` }}
            />
          ))}
        </div>

        {/* 2. Twinkling Disco Mirror Ball in Stage Ceiling */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="w-0.5 h-6 sm:h-8 bg-white/40" />
          <div className="relative flex items-center justify-center -mt-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-slate-100 via-pink-200 to-cyan-300 border border-white/90 shadow-[0_0_20px_rgba(255,255,255,0.7)] flex items-center justify-center text-lg sm:text-xl animate-disco-spin select-none">
              🪩
            </div>
            <div className="absolute -inset-2 rounded-full bg-radial from-pink-400/25 via-cyan-300/20 to-transparent animate-disco-glimmer pointer-events-none" />
            <div className="absolute -top-1 -right-2 text-yellow-300 text-xs sm:text-sm animate-pulse">✨</div>
            <div className="absolute -bottom-1 -left-2 text-cyan-200 text-xs sm:text-sm animate-pulse" style={{ animationDelay: '0.4s' }}>✦</div>
          </div>
        </div>

        {/* 3. Floating Festive Streamers / Ribbons in Stage Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {/* Left Streamer 1 (Pink) */}
          <svg
            className="absolute left-[10%] -top-8 w-12 sm:w-16 h-80 opacity-45 animate-ribbon-l"
            viewBox="0 0 50 300"
            fill="none"
          >
            <path
              d="M25 0 Q45 75 15 150 T35 300"
              stroke="url(#streamer-pink)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="streamer-pink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4081" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#FF80AB" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#EA80FC" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Left Streamer 2 (Yellow) */}
          <svg
            className="absolute left-[20%] -top-4 w-10 sm:w-14 h-72 opacity-40 animate-ribbon-r"
            style={{ animationDelay: '1.2s' }}
            viewBox="0 0 50 300"
            fill="none"
          >
            <path
              d="M30 0 Q10 80 40 160 T20 300"
              stroke="url(#streamer-yellow)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="streamer-yellow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD54F" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#FFE082" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFCA28" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Right Streamer 1 (Cyan) */}
          <svg
            className="absolute right-[12%] -top-6 w-12 sm:w-16 h-80 opacity-45 animate-ribbon-r"
            style={{ animationDelay: '0.6s' }}
            viewBox="0 0 50 300"
            fill="none"
          >
            <path
              d="M20 0 Q5 70 35 140 T15 300"
              stroke="url(#streamer-cyan)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="streamer-cyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#80D8FF" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#00B0FF" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Right Streamer 2 (Purple) */}
          <svg
            className="absolute right-[21%] -top-10 w-10 sm:w-14 h-72 opacity-40 animate-ribbon-l"
            style={{ animationDelay: '2s' }}
            viewBox="0 0 50 300"
            fill="none"
          >
            <path
              d="M35 0 Q15 90 45 180 T25 300"
              stroke="url(#streamer-purple)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="streamer-purple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E040FB" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#EA80FC" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#B388FF" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 4. Beat & Combo Responsive Dynamic Neon Slogan */}
        <div className="absolute top-18 sm:top-20 left-1/2 -translate-x-1/2 z-15 pointer-events-none flex flex-col items-center">
          <div className="px-4 sm:px-6 py-1 rounded-full bg-slate-950/60 backdrop-blur-xs border-2 border-pink-400/80 shadow-[0_0_20px_rgba(255,64,129,0.7)] animate-neon-slogan">
            <span
              className={`font-black text-[11px] sm:text-xs md:text-sm tracking-wider uppercase transition-colors duration-300 ${
                isFever
                  ? 'text-yellow-300 drop-shadow-[0_0_12px_#FFD700]'
                  : isSpeedUp
                  ? 'text-cyan-300 drop-shadow-[0_0_12px_#00E5FF]'
                  : stats.combo >= 10
                  ? 'text-pink-300 drop-shadow-[0_0_12px_#FF4081]'
                  : 'text-amber-200 drop-shadow-[0_0_10px_#FFA000]'
              }`}
              style={{ fontFamily: "'Fredoka', 'Noto Sans TC', sans-serif" }}
            >
              {dynamicNeonSlogan}
            </span>
          </div>
        </div>

        {/* Three Glowing Neon Stars in Stage Ceiling matching Image 6 */}
        <div className="absolute top-12 left-1/4 text-pink-400 text-6xl md:text-7xl font-thin opacity-80 filter drop-shadow(0 0 15px rgba(255,105,180,0.9)) animate-pulse pointer-events-none">
          ☆
        </div>
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-yellow-300 text-7xl md:text-8xl font-thin opacity-90 filter drop-shadow(0 0 20px rgba(255,215,0,0.9)) animate-pulse pointer-events-none">
          ☆
        </div>
        <div className="absolute top-12 right-1/4 text-cyan-300 text-6xl md:text-7xl font-thin opacity-80 filter drop-shadow(0 0 15px rgba(0,255,255,0.9)) animate-pulse pointer-events-none">
          ☆
        </div>

        {/* Left Side: Vertical Glowing Star Gauge matching Image 6 */}
        <div className="absolute left-3 sm:left-5 top-14 bottom-14 w-5 sm:w-6 flex flex-col items-center z-20 pointer-events-none">
          <div className="text-yellow-300 text-xl sm:text-2xl -mb-1 animate-bounce filter drop-shadow(0 0 8px #FFD700)">
            ★
          </div>
          <div className="w-full flex-1 bg-slate-900/80 rounded-full border-2 border-yellow-300/80 p-0.5 overflow-hidden flex flex-col justify-end shadow-lg">
            <div
              className="w-full rounded-full bg-gradient-to-t from-cyan-400 via-pink-400 to-yellow-300 transition-all duration-300"
              style={{ height: `${feverGauge}%` }}
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* TOP HUD BAR matching Image 6: 分數, 人氣值 Heart Bar, 連擊 */}
        {/* ========================================================= */}
        <div className="relative z-30 w-full flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-6 pt-1">
          {/* Left: 分數 Pill matching Image 6 */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-2xl bg-[#39296B]/90 border-2 border-[#8165D8] shadow-md">
            <span className="text-xs sm:text-sm font-black text-pink-300 tracking-wider">分數</span>
            <span className="text-base sm:text-xl md:text-2xl font-black text-white font-mono tracking-tight tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Center: 人氣值 Heart Bar matching Image 6 */}
          <div className="flex-1 max-w-xs sm:max-w-md flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-2xl bg-[#39296B]/90 border-2 border-[#8165D8] shadow-md">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs sm:text-sm font-black text-white tracking-wider">人氣值</span>
              <span className="text-pink-400 text-base sm:text-lg animate-pulse">💖</span>
            </div>

            <div className="relative flex-1 h-3.5 sm:h-4 bg-[#1e1540] rounded-full border border-pink-400/60 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-200 relative"
                style={{ width: `${stats.popularity}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right: 連擊 Pill matching Image 6 */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-2xl bg-[#39296B]/90 border-2 border-[#8165D8] shadow-md">
            <span className="text-xs sm:text-sm font-black text-white tracking-wider">連擊</span>
            <span className="text-base sm:text-xl md:text-2xl font-black text-yellow-300 font-mono tracking-tight tabular-nums">
              {stats.combo}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER STAGE: IDOLS, SUDDEN EVENT CLOUD & HIT JUDGMENT    */}
        {/* ========================================================= */}
        <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-end pb-2">
          {/* Sudden Event Dynamic Obstacles: Animated Falling Banana & Runaway Mic */}
          {currentEvent === 'BANANA' && (
            <div className="absolute bottom-12 left-6 sm:left-14 z-25 flex flex-col items-center pointer-events-none animate-banana-drop">
              <div className="relative text-5xl sm:text-7xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
                🍌
                <span className="absolute -top-3 -right-2 text-xl sm:text-2xl animate-bounce">💢</span>
              </div>
              <div className="mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-900 text-[10px] sm:text-xs font-black border-2 border-white shadow-xl flex items-center gap-1 animate-pulse">
                <span>⬆️ [W] 跳躍避開！</span>
              </div>
            </div>
          )}

          {currentEvent === 'FLYING_MIC' && (
            <div className="absolute top-1/3 left-0 right-0 z-25 flex items-center justify-center pointer-events-none animate-mic-swoop">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl text-cyan-300 font-black animate-pulse tracking-tighter">
                  💨 💨 ⚡
                </span>
                <div className="relative text-5xl sm:text-6xl -rotate-45 filter drop-shadow-[0_0_25px_rgba(0,255,255,0.95)]">
                  🎤
                  <span className="absolute -top-2 -right-2 text-lg sm:text-xl text-yellow-300 animate-spin">✨</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-900 text-[10px] sm:text-xs font-black border-2 border-white shadow-xl flex items-center gap-1 animate-pulse">
                  <span>⬇️ [S] 俯身閃避！</span>
                </div>
              </div>
            </div>
          )}

          {/* Yellow Comic Cloud Event Box matching Image 6 on the right */}
          {currentEvent !== 'NONE' && (
            <div className="absolute top-2 right-2 sm:right-6 z-30 flex items-center gap-2 animate-bounce">
              <div className="relative bg-[#FFEB3B] text-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl font-black text-xs sm:text-sm border-2 border-[#FBC02D] shadow-xl flex items-center gap-1.5">
                <span className="text-red-600 animate-pulse">🚨</span>
                <span>{eventMessage}</span>
              </div>
              <div className="text-3xl sm:text-4xl animate-pulse">
                {currentEvent === 'BANANA' ? '🍌' : currentEvent === 'FLYING_MIC' ? '🎤' : '⚡'}
              </div>
            </div>
          )}

          {/* Persistent Stage Props matching Image 6 when no active event */}
          {currentEvent === 'NONE' && (
            <>
              <div className="absolute bottom-16 left-12 text-3xl sm:text-4xl animate-bounce pointer-events-none opacity-80">
                🍌
              </div>
              <div className="absolute bottom-20 right-16 text-3xl sm:text-4xl -rotate-45 pointer-events-none opacity-80">
                🎤
              </div>
            </>
          )}

          {/* Center 3D PERFECT! Text matching Image 6 */}
          {currentJudgment && (
            <div
              key={judgmentKey}
              className="absolute top-1/4 z-30 pointer-events-none flex flex-col items-center animate-hit-pop"
            >
              <div
                className="text-4xl sm:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 filter drop-shadow(0 0 15px rgba(255,215,0,0.9))"
                style={{
                  fontFamily: "'Fredoka', 'Noto Sans TC', sans-serif",
                  textShadow: '3px 3px 0 #1A237E, -2px -2px 0 #00E5FF, 0 0 20px #FFD700',
                }}
              >
                {currentJudgment === 'MISS' ? 'MISS...' : currentJudgment === 'GREAT' ? 'GREAT!' : 'PERFECT!'}
              </div>
            </div>
          )}

          {/* Eye-catching Combo Milestone Banner */}
          {comboBanner && (
            <div className="absolute top-1/3 z-40 px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 border-2 border-white shadow-[0_0_25px_rgba(255,215,0,0.9)] text-white font-black text-sm sm:text-base md:text-lg animate-hit-pop pointer-events-none">
              {comboBanner}
            </div>
          )}

          {/* Behind Idols: Stage Audio Visualizer Bars */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 sm:w-88 flex items-end justify-between px-4 h-24 pointer-events-none opacity-30 z-10">
            {[45, 75, 95, 60, 85, 100, 75, 90, 65, 80, 50, 85].map((h, idx) => (
              <div
                key={idx}
                className="w-2 sm:w-2.5 rounded-t-full bg-gradient-to-t from-purple-600 via-pink-400 to-cyan-300 animate-eq-bar origin-bottom"
                style={{
                  height: `${h}%`,
                  animationDelay: `${(idx * 0.07).toFixed(2)}s`,
                  animationDuration: isSpeedUp ? '0.28s' : '0.48s',
                }}
              />
            ))}
          </div>

          {/* The 3 Idols Onstage dancing */}
          {/* The 3 Idols Onstage actively dancing together */}
          <div className="relative flex items-end justify-center gap-3 sm:gap-8 md:gap-14 pb-2 z-20">
            {/* Left Idol: Active group dancing */}
            <div className="flex flex-col items-center">
              <CharacterSprite
                id={leftCharId}
                variant="full"
                size="md"
                action={leftCharAction}
                position="left"
              />
            </div>

            {/* Center Idol: Chosen Leader Dancing in Front */}
            <div className="flex flex-col items-center -translate-y-2 scale-110">
              <CharacterSprite
                id={centerCharId}
                variant="full"
                size="lg"
                action={charAction}
                showSpeech={speech}
                position="center"
              />
            </div>

            {/* Right Idol: Active group dancing */}
            <div className="flex flex-col items-center">
              <CharacterSprite
                id={rightCharId}
                variant="full"
                size="md"
                action={rightCharAction}
                position="right"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM RECEPTORS: 4 CIRCULAR BUTTONS EXACTLY LIKE IMAGE 6 */}
        {/* ========================================================= */}
        <div className="relative z-30 w-full max-w-xl flex flex-col items-center pb-2">
          {/* Floating Hit Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute text-2xl sm:text-3xl"
                style={{
                  left: `${p.xPercent}%`,
                  bottom: '60px',
                  animation: 'heart-rise 0.65s ease-out forwards',
                  filter: `drop-shadow(0 0 10px ${p.color})`,
                }}
              >
                {p.icon}
              </div>
            ))}
          </div>

          {/* Floating Hit Pop-up Text Effect for Hits */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {floatingTexts.map((item) => (
              <div
                key={item.id}
                className="absolute flex flex-col items-center animate-float-text"
                style={{
                  left: `${item.xPercent}%`,
                  bottom: '75px',
                  transform: 'translateX(-50%)',
                }}
              >
                <span
                  className={`font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-full border shadow-xl ${
                    item.type === 'PERFECT'
                      ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-purple-950 border-white shadow-[0_0_15px_#ffd700]'
                      : 'bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 text-slate-900 border-white shadow-[0_0_12px_#00e5ff]'
                  }`}
                  style={{
                    textShadow:
                      item.type === 'PERFECT' ? '1px 1px 0 rgba(255,255,255,0.6)' : 'none',
                  }}
                >
                  {item.text}
                </span>
                <span className="font-black text-xs sm:text-sm text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] -mt-0.5 font-mono">
                  {item.scoreBonus}
                </span>
              </div>
            ))}
          </div>

          {/* Falling Notes Track Area */}
          <div className="relative w-full h-16 overflow-hidden rounded-2xl bg-black/30 border border-white/20 mb-2">
            {notes.map((note) => {
              if (note.hit) return null;
              const remainingMs = note.timeMs - currentElapsedMs;
              const progress = 1 - remainingMs / travelDurationMs;

              if (progress < 0 || progress > 1.25) return null;

              const colIndex =
                note.direction === 'LEFT'
                  ? 0
                  : note.direction === 'DOWN'
                  ? 1
                  : note.direction === 'UP'
                  ? 2
                  : 3;

              const leftPercent = colIndex * 25 + 12.5;
              const topPercent = Math.min(95, Math.max(0, progress * 80));

              let noteColor = 'bg-[#FF4081] text-white';
              let noteIcon = '←';
              if (note.direction === 'DOWN') {
                noteColor = 'bg-[#29B6F6] text-white';
                noteIcon = '↓';
              } else if (note.direction === 'UP') {
                noteColor = 'bg-[#00E676] text-white';
                noteIcon = '↑';
              } else if (note.direction === 'RIGHT') {
                noteColor = 'bg-[#448AFF] text-white';
                noteIcon = '→';
              }

              return (
                <div
                  key={note.id}
                  className={`absolute -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${noteColor} flex items-center justify-center font-black text-lg border-2 border-white pointer-events-none shadow-md`}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                  }}
                >
                  {noteIcon}
                </div>
              );
            })}
          </div>

          {/* The 4 Circular Target Buttons matching Image 6 */}
          <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full px-4">
            {/* Button 1: Pink Left Arrow (with blue glowing arc underneath) */}
            <div className="relative flex flex-col items-center">
              {activeKeys.LEFT && (
                <div className="absolute inset-0 rounded-full border-4 border-pink-300 animate-ripple pointer-events-none" />
              )}
              <button
                onClick={() => handleInput('LEFT')}
                className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#FF4081] hover:brightness-110 active:scale-95 border-3 sm:border-4 border-white flex flex-col items-center justify-center text-white font-black text-2xl sm:text-3xl md:text-4xl shadow-[0_0_20px_rgba(255,64,129,0.8)] cursor-pointer transition-all ${
                  activeKeys.LEFT ? 'ring-4 ring-cyan-300 scale-95' : ''
                }`}
              >
                <span>←</span>
              </button>
              {/* Blue glowing neon arc under left button like Image 6 */}
              <div className="w-12 sm:w-16 h-2 rounded-full bg-cyan-400 blur-xs shadow-[0_0_12px_#00FFFF] mt-1" />
              <span className="text-[10px] text-pink-300 font-bold opacity-80 mt-0.5">A / ←</span>
            </div>

            {/* Button 2: Light Blue / Cyan Down Arrow */}
            <div className="relative flex flex-col items-center">
              {activeKeys.DOWN && (
                <div className="absolute inset-0 rounded-full border-4 border-cyan-300 animate-ripple pointer-events-none" />
              )}
              <button
                onClick={() => handleInput('DOWN')}
                className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#29B6F6] hover:brightness-110 active:scale-95 border-3 sm:border-4 border-white flex flex-col items-center justify-center text-white font-black text-2xl sm:text-3xl md:text-4xl shadow-[0_0_20px_rgba(41,182,246,0.8)] cursor-pointer transition-all ${
                  activeKeys.DOWN ? 'ring-4 ring-pink-300 scale-95' : ''
                }`}
              >
                <span>↓</span>
              </button>
              <div className="w-12 sm:w-16 h-2 rounded-full bg-blue-500/30 blur-xs mt-1" />
              <span className="text-[10px] text-cyan-300 font-bold opacity-80 mt-0.5">S / ↓</span>
            </div>

            {/* Button 3: Lime Green Up Arrow */}
            <div className="relative flex flex-col items-center">
              {activeKeys.UP && (
                <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ripple pointer-events-none" />
              )}
              <button
                onClick={() => handleInput('UP')}
                className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#00E676] hover:brightness-110 active:scale-95 border-3 sm:border-4 border-white flex flex-col items-center justify-center text-white font-black text-2xl sm:text-3xl md:text-4xl shadow-[0_0_20px_rgba(0,230,118,0.8)] cursor-pointer transition-all ${
                  activeKeys.UP ? 'ring-4 ring-yellow-300 scale-95' : ''
                }`}
              >
                <span>↑</span>
              </button>
              <div className="w-12 sm:w-16 h-2 rounded-full bg-green-500/30 blur-xs mt-1" />
              <span className="text-[10px] text-emerald-300 font-bold opacity-80 mt-0.5">W / ↑</span>
            </div>

            {/* Button 4: Blue/Purple Right Arrow */}
            <div className="relative flex flex-col items-center">
              {activeKeys.RIGHT && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ripple pointer-events-none" />
              )}
              <button
                onClick={() => handleInput('RIGHT')}
                className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#448AFF] hover:brightness-110 active:scale-95 border-3 sm:border-4 border-white flex flex-col items-center justify-center text-white font-black text-2xl sm:text-3xl md:text-4xl shadow-[0_0_20px_rgba(68,138,255,0.8)] cursor-pointer transition-all ${
                  activeKeys.RIGHT ? 'ring-4 ring-rose-300 scale-95' : ''
                }`}
              >
                <span>→</span>
              </button>
              <div className="w-12 sm:w-16 h-2 rounded-full bg-blue-500/30 blur-xs mt-1" />
              <span className="text-[10px] text-indigo-300 font-bold opacity-80 mt-0.5">D / →</span>
            </div>
          </div>

          {/* Optional Space Bar for Stage 2 & 3 Special Notes */}
          {!isStage1 && (
            <div className="mt-1 flex items-center justify-center">
              <button
                onClick={() => handleInput('SPACE')}
                className={`px-6 py-1 rounded-full text-xs font-bold border ${
                  activeKeys.SPACE
                    ? 'bg-yellow-400 text-purple-950 scale-95 border-white'
                    : 'bg-purple-900/60 text-yellow-300 border-yellow-400/50 hover:bg-purple-800'
                } transition-all cursor-pointer shadow-md`}
              >
                ⭐ 空白鍵 [SPACE] 絕招按鍵
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* AUDIENCE INTERACTION UI & REAL-TIME CHEERING SOUNDWAVE    */}
        {/* ========================================================= */}

        {/* 1. Thrown Glowsticks Shower Animation Layer (極高連擊拋灑螢光棒動畫) */}
        {thrownGlowsticks.map((stick) => {
          const arcClass =
            stick.type === 'l'
              ? 'animate-glowstick-l'
              : stick.type === 'r'
              ? 'animate-glowstick-r'
              : 'animate-glowstick-c';
          return (
            <div
              key={stick.id}
              className={`absolute bottom-6 z-35 pointer-events-none flex flex-col items-center ${arcClass}`}
              style={{ left: `${stick.xPercent}%` }}
            >
              <div
                className={`w-3 sm:w-4 ${stick.size === 'lg' ? 'h-16 sm:h-20' : 'h-12 sm:h-16'} rounded-full bg-gradient-to-t ${stick.color} border-2 border-white/95 ${stick.glow} flex items-center justify-center relative shadow-xl`}
              >
                <div className="w-1 h-3/4 rounded-full bg-white/90" />
                <span className="absolute -top-3 text-xs sm:text-sm animate-pulse">✨</span>
              </div>
            </div>
          );
        })}

        {/* 2. Floating Audience Cheer Comments (即時歡呼聲浪彈幕) */}
        {cheerComments.map((c) => (
          <div
            key={c.id}
            className="absolute bottom-28 z-40 pointer-events-none px-3.5 py-1 rounded-full bg-slate-900/95 border border-white/40 shadow-2xl text-xs sm:text-sm font-black animate-cheer-comment whitespace-nowrap flex items-center gap-1.5"
            style={{ left: `${c.xPercent}%`, color: c.color }}
          >
            <span className="text-yellow-300 animate-bounce">📣</span>
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{c.text}</span>
          </div>
        ))}

        {/* 3. Stage Bottom Cheer Soundwave Bar & Audience Hype Banner (螢幕下方歡呼聲浪特效) */}
        <div className="relative w-full z-30 flex flex-col items-center mt-1 pointer-events-none">
          {/* Soundwave Hype Status Pill */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-xs mb-1">
            <span className="text-pink-400 text-xs sm:text-sm animate-pulse">
              {stats.combo >= 30 ? '🌋' : stats.combo >= 15 ? '⚡' : '💖'}
            </span>
            <span className="text-[10px] sm:text-xs font-black tracking-wide text-white">
              {stats.combo >= 30
                ? '🔥 現場應援聲浪：全場狂歡沸騰 MAX！螢光棒狂拋中！'
                : stats.combo >= 15
                ? '⚡ 現場應援聲浪：熱烈打 CALL 沸騰中！'
                : stats.combo >= 5
                ? '🎵 現場應援聲浪：歡呼應援升溫中！'
                : '✨ 現場應援聲浪：觀眾期待開場！'}
            </span>
            {stats.combo >= 15 && (
              <span className="text-yellow-300 text-[10px] sm:text-xs font-extrabold animate-bounce">
                {stats.combo >= 30 ? '✨ GLOWSTICKS FEVER! ✨' : '🔥 HYPED!'}
              </span>
            )}
          </div>

          {/* Equalizer Soundwave Audio Wave Bars Reacting to Combo */}
          <div className="w-full max-w-xl h-4 sm:h-5 flex items-end justify-between px-3 sm:px-6">
            {[
              25, 45, 60, 35, 75, 90, 50, 80, 100, 65, 85, 40, 70, 95, 55, 80, 100, 60, 75, 45, 85, 65, 50, 30,
            ].map((baseHeight, idx) => {
              // Height dynamically scales with combo
              const comboMultiplier =
                stats.combo >= 30
                  ? 1.25
                  : stats.combo >= 15
                  ? 0.95
                  : stats.combo >= 5
                  ? 0.7
                  : 0.45;
              const barHeight = Math.min(100, Math.max(18, Math.round(baseHeight * comboMultiplier)));

              const barColor =
                stats.combo >= 30
                  ? 'bg-gradient-to-t from-pink-500 via-amber-300 to-yellow-400 shadow-[0_0_8px_#ffd700]'
                  : stats.combo >= 15
                  ? 'bg-gradient-to-t from-cyan-400 to-pink-500 shadow-[0_0_8px_#00ffff]'
                  : 'bg-gradient-to-t from-purple-600 to-pink-400';

              return (
                <div
                  key={idx}
                  className={`w-1 sm:w-1.5 rounded-full ${barColor} animate-eq-bar origin-bottom transition-all duration-300`}
                  style={{
                    height: `${barHeight}%`,
                    animationDelay: `${(idx * 0.05).toFixed(2)}s`,
                    animationDuration:
                      stats.combo >= 30 ? '0.25s' : stats.combo >= 15 ? '0.38s' : '0.55s',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Foreground Waving Penlights on Stage Corners */}
        <div className="absolute -bottom-2 left-2 z-40 flex items-end gap-1.5 pointer-events-none opacity-85">
          <div className="w-2.5 h-12 bg-pink-500 rounded-full shadow-[0_0_12px_#ff69b4] animate-penlight-l origin-bottom" />
          <div className="w-2.5 h-16 bg-yellow-300 rounded-full shadow-[0_0_12px_#ffd700] animate-penlight-r origin-bottom" />
          <div className="w-2.5 h-10 bg-cyan-400 rounded-full shadow-[0_0_12px_#00ffff] animate-penlight-l origin-bottom" />
        </div>
        <div className="absolute -bottom-2 right-2 z-40 flex items-end gap-1.5 pointer-events-none opacity-85">
          <div className="w-2.5 h-10 bg-cyan-400 rounded-full shadow-[0_0_12px_#00ffff] animate-penlight-r origin-bottom" />
          <div className="w-2.5 h-16 bg-pink-400 rounded-full shadow-[0_0_12px_#ff69b4] animate-penlight-l origin-bottom" />
          <div className="w-2.5 h-12 bg-purple-400 rounded-full shadow-[0_0_12px_#da70d6] animate-penlight-r origin-bottom" />
        </div>
      </div>

      {/* PAUSE MODAL OVERLAY */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-pink-500/80 rounded-3xl p-6 text-center text-white shadow-2xl">
            <h3 className="text-2xl font-black text-yellow-300 mb-2">舞台暫停中</h3>
            <p className="text-xs text-slate-300 mb-6">休息一下，隨時準備重新嗨翻全場！</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  audioService.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 font-bold text-white shadow-lg cursor-pointer hover:brightness-110 active:scale-95"
              >
                繼續演出
              </button>
              <button
                onClick={() => {
                  audioService.playClick();
                  onQuit();
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 cursor-pointer transition-colors"
              >
                返回選關
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
