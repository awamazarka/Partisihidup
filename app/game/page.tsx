'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Trophy, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  Gamepad2, 
  Heart, 
  Zap,
  Loader2,
  Lock,
  ArrowRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import Link from 'next/link';

// Game Constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const CAR_WIDTH = 40;
const CAR_HEIGHT = 70;

export default function GamePage() {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null as any);
  const gameStateRef = useRef(gameState);
  const supabase = createClient();

  // Audio Refs
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const sfxHit = useRef<HTMLAudioElement | null>(null);
  const sfxGameOver = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Audio with more reliable sources
    bgMusic.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.3;

    sfxHit.current = new Audio('https://www.myinstants.com/media/sounds/boom.mp3');
    sfxGameOver.current = new Audio('https://www.myinstants.com/media/sounds/gta-v-wasted.mp3');

    // Pre-load check to avoid NotSupportedError
    const handleAudioError = (e: any) => {
        console.warn("Audio source failed to load, game will continue without sound:", e.target.src);
    };

    [bgMusic, sfxHit, sfxGameOver].forEach(ref => {
        if (ref.current) {
            ref.current.addEventListener('error', handleAudioError);
        }
    });

    return () => {
      bgMusic.current?.pause();
      [bgMusic, sfxHit, sfxGameOver].forEach(ref => {
          if (ref.current) {
              ref.current.removeEventListener('error', handleAudioError);
          }
      });
      bgMusic.current = null;
    };
  }, []);

  useEffect(() => {
    if (bgMusic.current) {
        bgMusic.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle Game State Effects (Navbar & Music)
  useEffect(() => {
    gameStateRef.current = gameState;
    
    // Dispatch custom event to hide/show navbar
    window.dispatchEvent(new CustomEvent('game-active', { detail: gameState === 'playing' }));

    // Handle Music State with Playback Safety
    const music = bgMusic.current;
    if (music) {
        if (gameState === 'playing' && !isMuted) {
            music.play().catch(() => {
                console.log("Auto-play blocked or source invalid");
            });
        } else {
            music.pause();
            music.currentTime = 0;
        }
    }
  }, [gameState, isMuted]);

  // Game Logic Refs
  const playerPos = useRef({ x: CANVAS_WIDTH / 2 - CAR_WIDTH / 2, y: CANVAS_HEIGHT - 100 });
  const obstacles = useRef<any[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});
  const lastLevelUp = useRef(0);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      fetchLeaderboard();
      setLoading(false);
    }
    init();

    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Ensure navbar is restored on unmount
      window.dispatchEvent(new CustomEvent('game-active', { detail: false }));
    };
  }, []);

  async function fetchLeaderboard() {
    try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, high_score')
          .gt('high_score', 0) // Only show players with more than 0 points
          .order('high_score', { ascending: false })
          .limit(10);
        
        if (error) {
            console.error("Leaderboard Fetch Error:", error.message);
            return;
        }

        if (data) {
            setLeaderboard(data);
        }
    } catch (err) {
        console.error("Unexpected Leaderboard Error:", err);
    }
  }

  async function updateHighScore(finalScore: number) {
    if (!user || finalScore <= 0) return;
    
    setIsSaving(true);
    console.log(`[SYNC] Manual save triggered for score: ${finalScore}`);

    try {
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('high_score')
            .eq('id', user.id)
            .maybeSingle();
        
        if (fetchError) throw fetchError;

        const currentDBHighScore = profile?.high_score || 0;
        
        if (finalScore > currentDBHighScore) {
          const { data: updateResult, error: updateError } = await supabase
            .from('profiles')
            .update({ high_score: finalScore })
            .eq('id', user.id)
            .select();
          
          if (updateError) throw updateError;
          
          if (!updateResult || updateResult.length === 0) {
              const { data: upsertResult, error: upsertError } = await supabase
                  .from('profiles')
                  .upsert({ 
                      id: user.id, 
                      username: user.user_metadata?.username || user.email?.split('@')[0],
                      high_score: finalScore 
                  }, { onConflict: 'id' })
                  .select();
                  
              if (upsertError || !upsertResult || upsertResult.length === 0) {
                  throw new Error("Supabase RLS Policy memblokir akses penyimpanan skor.");
              }
          }
          
          console.log("[SYNC] Update Success!");
          await fetchLeaderboard();
          alert("NEW HIGH SCORE SAVED! 🏁");
        } else {
            alert(`Skor kamu (${finalScore}) belum melewati rekor lama (${currentDBHighScore}). Terus berjuang!`);
        }
    } catch (err: any) {
        console.error("[SYNC] Sync failed:", err.message);
        alert("Gagal simpan skor: " + err.message);
    } finally {
        setIsSaving(false);
    }
  }

  const handleHit = () => {
    if (!isMuted) {
        sfxHit.current?.play().catch(() => {});
    }
    setLives(prevLives => {
      const newLives = prevLives - 1;
      if (newLives <= 0) {
        if (!isMuted) {
            sfxGameOver.current?.play().catch(() => {});
        }
        setGameState('gameover');
        return 0;
      }
      return newLives;
    });
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    obstacles.current = [];
    playerPos.current = { x: CANVAS_WIDTH / 2 - CAR_WIDTH / 2, y: CANVAS_HEIGHT - 100 };
    lastLevelUp.current = 0;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = (time: number) => {
    if (gameStateRef.current !== 'playing') return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    updatePhysics();
    draw(ctx);

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const updatePhysics = () => {
    // Move Player
    const speed = 5 + (level * 0.5);
    if (keys.current['ArrowLeft'] && playerPos.current.x > 10) playerPos.current.x -= speed;
    if (keys.current['ArrowRight'] && playerPos.current.x < CANVAS_WIDTH - CAR_WIDTH - 10) playerPos.current.x += speed;

    // Spawn Obstacles
    if (Math.random() < 0.02 + (level * 0.005)) {
      obstacles.current.push({
        x: Math.random() * (CANVAS_WIDTH - CAR_WIDTH - 20) + 10,
        y: -CAR_HEIGHT,
        color: ['#FF007A', '#00FFFF', '#A3E635', '#FB923C'][Math.floor(Math.random() * 4)],
        scored: false
      });
    }

    // Move Obstacles
    obstacles.current.forEach((obs, index) => {
      obs.y += 4 + (level * 0.8);
      
      // Collision Detection
      if (
        playerPos.current.x < obs.x + CAR_WIDTH - 5 &&
        playerPos.current.x + CAR_WIDTH - 5 > obs.x &&
        playerPos.current.y < obs.y + CAR_HEIGHT - 5 &&
        playerPos.current.y + CAR_HEIGHT - 5 > obs.y
      ) {
        obstacles.current.splice(index, 1);
        handleHit();
      }

      // Score logic - item must be passed the player y to count
      if (!obs.scored && obs.y > playerPos.current.y + CAR_HEIGHT) {
          obs.scored = true;
          setScore(prev => prev + 10);
      }

      // Cleanup
      if (obs.y > CANVAS_HEIGHT) {
        obstacles.current.splice(index, 1);
      }
    });

    // Level Up Logic
    setScore(currentScore => {
        const nextLevelScore = level * 500;
        if (currentScore >= nextLevelScore && currentScore > lastLevelUp.current) {
            setLevel(prev => prev + 1);
            lastLevelUp.current = currentScore;
        }
        return currentScore;
    });
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Road Lines
    ctx.strokeStyle = '#ffffff20';
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 3, 0); ctx.lineTo(CANVAS_WIDTH / 3, CANVAS_HEIGHT);
    ctx.moveTo(CANVAS_WIDTH * 2 / 3, 0); ctx.lineTo(CANVAS_WIDTH * 2 / 3, CANVAS_HEIGHT);
    ctx.stroke();

    // Draw Obstacles
    obstacles.current.forEach(obs => {
      ctx.fillStyle = obs.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = obs.color;
      ctx.fillRect(obs.x, obs.y, CAR_WIDTH, CAR_HEIGHT);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeRect(obs.x, obs.y, CAR_WIDTH, CAR_HEIGHT);
    });

    // Draw Player
    ctx.fillStyle = '#FFDE03';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFDE03';
    ctx.fillRect(playerPos.current.x, playerPos.current.y, CAR_WIDTH, CAR_HEIGHT);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(playerPos.current.x, playerPos.current.y, CAR_WIDTH, CAR_HEIGHT);
    
    // Player Glow Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(playerPos.current.x + 8, playerPos.current.y + 10, 6, 15);
    ctx.fillRect(playerPos.current.x + 26, playerPos.current.y + 10, 6, 15);

    ctx.shadowBlur = 0;
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[#FFD600] animate-spin" />
        <p className="font-black uppercase italic text-white">Loading Engine...</p>
    </div>
  );

  if (!user) return (
    <main className="min-h-screen bg-zinc-950 pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="p-8 bg-white border-[4px] border-black shadow-[15px_15px_0_0_rgba(255,222,3,1)] rounded-3xl max-w-md">
            <Lock className="w-16 h-16 mx-auto mb-6 text-black" />
            <h1 className="text-4xl font-black uppercase italic mb-4 text-black">Midnight Restricted</h1>
            <p className="font-bold text-zinc-600 mb-8 italic">You need to be part of the crew to race. Sign in to unlock the garage and join the leaderboard.</p>
            <Link href="/login" className="neo-brutal-btn-yellow w-full flex items-center justify-center gap-3">
                JOIN THE CREW <ArrowRight />
            </Link>
        </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-zinc-950 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Game Area */}
        <div className="lg:col-span-2 flex flex-col items-center">
            <div className="w-full flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-5xl font-black uppercase italic text-white tracking-tighter leading-none">JDM <br /> <span className="text-[#FFD600]">OUTRUN.</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="bg-black border-[3px] border-white p-3 shadow-[4px_4px_0_0_white] text-white hover:bg-zinc-800 transition-colors"
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <div className="bg-black border-[3px] border-[#A3E635] p-3 shadow-[4px_4px_0_0_#A3E635]">
                        <p className="text-[10px] font-black uppercase text-[#A3E635] opacity-60">Score</p>
                        <p className="text-xl font-black text-white italic">{score.toLocaleString()}</p>
                    </div>
                    <div className="bg-black border-[3px] border-[#FB923C] p-3 shadow-[4px_4px_0_0_#FB923C]">
                        <p className="text-[10px] font-black uppercase text-[#FB923C] opacity-60">Level</p>
                        <p className="text-xl font-black text-white italic">{level}</p>
                    </div>
                </div>
            </div>

            <div className="relative border-[8px] border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)] rounded-3xl overflow-hidden bg-zinc-900">
                <canvas 
                    ref={canvasRef} 
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT}
                    className="max-w-full"
                />

                {gameState === 'menu' && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center">
                        <Gamepad2 className="w-20 h-20 text-[#FFD600] mb-6 animate-bounce" />
                        <h2 className="text-4xl font-black uppercase italic text-white mb-2">Ready to Race?</h2>
                        <p className="text-white/60 font-bold mb-8 italic">Avoid traffic, level up, and become the legend of midnight.</p>
                        <div className="space-y-4 w-full">
                            <button onClick={startGame} className="neo-brutal-btn-yellow w-full flex items-center justify-center gap-3">
                                START ENGINE <Play fill="black" />
                            </button>
                            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Use Arrow Keys to Steer</p>
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="absolute inset-0 bg-red-600/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center">
                        <h2 className="text-6xl font-black uppercase italic text-white mb-2 drop-shadow-lg">WASTED.</h2>
                        <div className="bg-black p-6 border-[4px] border-white mb-8 rotate-2">
                            <p className="text-xs font-black uppercase text-white mb-1">Final Score</p>
                            <p className="text-4xl font-black text-[#FFD600] italic">{score.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex flex-col gap-3 w-full max-w-[200px]">
                            <button 
                                onClick={() => updateHighScore(score)} 
                                disabled={isSaving || score === 0}
                                className={`bg-black border-[4px] border-white px-6 py-3 font-black uppercase italic text-sm shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 text-white ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}
                            >
                                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Trophy className="w-4 h-4 text-[#FFD600]" />}
                                {isSaving ? 'SAVING...' : 'SAVE RECORD'}
                            </button>

                            <button onClick={startGame} className="bg-white border-[4px] border-black px-6 py-3 font-black uppercase italic text-sm shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 text-black">
                                <RotateCcw className="w-4 h-4" /> TRY AGAIN
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="absolute top-6 left-6 flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <Heart 
                                key={i} 
                                className={`w-6 h-6 transition-all ${i < lives ? 'text-red-500 fill-red-500 animate-pulse' : 'text-white/10'}`} 
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <div className="mt-8 flex gap-6 text-white/40 font-black uppercase italic text-[10px] tracking-widest">
                <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-[#FFD600]" /> Use ← → Arrow keys</span>
                <span className="flex items-center gap-2"><Heart className="w-3 h-3 text-red-500" /> 3 Lives total</span>
                <span className="flex items-center gap-2"><Trophy className="w-3 h-3 text-[#A3E635]" /> Level up every 500pts</span>
            </div>
        </div>

        {/* Leaderboard Area */}
        <div className="flex flex-col gap-8">
            <div className="bg-white border-[4px] border-black shadow-[10px_10px_0_0_#A3E635] rounded-3xl p-8">
                <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3 underline decoration-[#A3E635]">
                    <Trophy className="w-6 h-6 text-[#A3E635]" />
                    Hall of Fame
                </h3>
                <div className="space-y-3">
                    {leaderboard.length > 0 ? leaderboard.map((entry, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 border-[2px] border-black ${entry.username === user?.user_metadata?.username ? 'bg-[#FFD600]' : 'bg-[#FAF8F5]'}`}>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-xs italic opacity-40">#{i + 1}</span>
                                <span className="font-black uppercase text-sm italic">{entry.username || 'Anonymous'}</span>
                            </div>
                            <span className="font-black text-sm italic">{entry.high_score?.toLocaleString() || 0}</span>
                        </div>
                    )) : (
                        <div className="text-center py-10 border-[2px] border-black border-dashed bg-[#FAF8F5]">
                            <p className="font-black uppercase italic opacity-40 text-xs">Legends in the making...</p>
                            <p className="text-[8px] font-bold opacity-30 mt-1 uppercase">Break a record to appear here!</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-[#FB923C] border-[4px] border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-3xl p-8">
                <h3 className="text-xl font-black uppercase italic mb-4 text-black underline">Driver Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase italic opacity-60">Username</span>
                        <span className="font-black text-sm italic text-black">{user?.user_metadata?.username || 'Racer'}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase italic opacity-60">Personal Best</span>
                        <span className="font-black text-xl italic text-black underline">{leaderboard.find(e => e.username === user?.user_metadata?.username || e.username === user?.email?.split('@')[0])?.high_score || 0}</span>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </main>
  );
}
