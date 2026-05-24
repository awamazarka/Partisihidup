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
  VolumeX,
  UserCircle
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
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null as any);
  const supabase = createClient();

  // Audio Refs
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const sfxHit = useRef<HTMLAudioElement | null>(null);
  const sfxGameOver = useRef<HTMLAudioElement | null>(null);

  // Asset Refs
  const playerImg = useRef<HTMLImageElement | null>(null);
  const carImages = useRef<HTMLImageElement[]>([]);

  // Engine Refs
  const gameScoreRef = useRef(0);
  const gameLevelRef = useRef(1);
  const gameLivesRef = useRef(3);
  const gameStateRef = useRef<'menu' | 'playing' | 'gameover'>('menu');
  const playerPos = useRef({ x: CANVAS_WIDTH / 2 - CAR_WIDTH / 2, y: CANVAS_HEIGHT - 120 });
  const obstacles = useRef<any[]>([]);
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Initialize Audio
    bgMusic.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.3;
    sfxHit.current = new Audio('https://www.myinstants.com/media/sounds/boom.mp3');
    sfxGameOver.current = new Audio('https://www.myinstants.com/media/sounds/gta-v-wasted.mp3');

    // Load Assets with Promises to ensure they are ready
    const loadImg = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    };

    async function loadAllAssets() {
        try {
            // Highly reliable top-down car assets (Wikimedia/Standard CDNs)
            const player = await loadImg('https://raw.githubusercontent.com/subidit/Top-down-Car-Racing-Game/master/img/car_yellow.png');
            playerImg.current = player;

            const enemies = await Promise.all([
                loadImg('https://raw.githubusercontent.com/subidit/Top-down-Car-Racing-Game/master/img/car_red.png'),
                loadImg('https://raw.githubusercontent.com/subidit/Top-down-Car-Racing-Game/master/img/car_blue.png'),
                loadImg('https://raw.githubusercontent.com/subidit/Top-down-Car-Racing-Game/master/img/car_green.png')
            ]);
            carImages.current = enemies;
            setAssetsLoaded(true);
        } catch (err) {
            console.error("Asset loading failed, using vector fallbacks:", err);
            setAssetsLoaded(true); // Continue with fallbacks
        }
    }
    loadAllAssets();

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
      bgMusic.current?.pause();
      bgMusic.current = null;
      window.dispatchEvent(new CustomEvent('game-active', { detail: false }));
    };
  }, []);

  useEffect(() => {
    if (bgMusic.current) bgMusic.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    gameStateRef.current = gameState;
    window.dispatchEvent(new CustomEvent('game-active', { detail: gameState === 'playing' }));

    if (gameState === 'playing') {
        if (!isMuted) bgMusic.current?.play().catch(() => {});
    } else {
        bgMusic.current?.pause();
        if (bgMusic.current) bgMusic.current.currentTime = 0;
    }
  }, [gameState, isMuted]);

  async function fetchLeaderboard() {
    try {
        const { data } = await supabase
          .from('profiles')
          .select('username, high_score')
          .gt('high_score', 0)
          .order('high_score', { ascending: false })
          .limit(10);
        if (data) setLeaderboard(data);
    } catch (err) { console.error(err); }
  }

  async function updateHighScore(finalScore: number) {
    if (!user || finalScore <= 0) return;
    setIsSaving(true);
    try {
        const { data: profile } = await supabase.from('profiles').select('high_score').eq('id', user.id).maybeSingle();
        if (finalScore > (profile?.high_score || 0)) {
          await supabase.from('profiles').update({ high_score: finalScore }).eq('id', user.id).select();
          await fetchLeaderboard();
          alert("NEW HIGH SCORE SAVED! 🏁");
        }
    } catch (err: any) { console.error(err); } finally { setIsSaving(false); }
  }

  const startGame = () => {
    gameScoreRef.current = 0;
    gameLevelRef.current = 1;
    gameLivesRef.current = 3;
    gameStateRef.current = 'playing';
    
    setScore(0);
    setLevel(1);
    setLives(3);
    setGameState('playing');

    obstacles.current = [];
    keys.current = {};
    playerPos.current = { x: CANVAS_WIDTH / 2 - CAR_WIDTH / 2, y: CANVAS_HEIGHT - 120 };
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
    if (gameStateRef.current !== 'playing') return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    updatePhysics();
    draw(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const updatePhysics = () => {
    // Movement
    const playerSpeed = 8 + (gameLevelRef.current * 1.5);
    if (keys.current['ArrowLeft'] && playerPos.current.x > 20) playerPos.current.x -= playerSpeed;
    if (keys.current['ArrowRight'] && playerPos.current.x < CANVAS_WIDTH - CAR_WIDTH - 20) playerPos.current.x += playerSpeed;

    // Spawn Obstacles
    if (Math.random() < 0.02 + (gameLevelRef.current * 0.01)) {
      obstacles.current.push({
        x: Math.random() * (CANVAS_WIDTH - CAR_WIDTH - 40) + 20,
        y: -CAR_HEIGHT,
        imgIndex: Math.floor(Math.random() * carImages.current.length),
        scored: false
      });
    }

    // Obstacle Speed - 2x jump per level
    const currentSpeed = 5 * Math.pow(2, gameLevelRef.current - 1);

    for (let i = obstacles.current.length - 1; i >= 0; i--) {
        const obs = obstacles.current[i];
        obs.y += currentSpeed;

        // Collision
        if (
            playerPos.current.x < obs.x + CAR_WIDTH - 8 &&
            playerPos.current.x + CAR_WIDTH - 8 > obs.x &&
            playerPos.current.y < obs.y + CAR_HEIGHT - 8 &&
            playerPos.current.y + CAR_HEIGHT - 8 > obs.y
        ) {
            obstacles.current.splice(i, 1);
            handleHit();
            continue;
        }

        // Scoring
        if (!obs.scored && obs.y > playerPos.current.y + CAR_HEIGHT) {
            obs.scored = true;
            gameScoreRef.current += 10;
            setScore(gameScoreRef.current);

            // Level Up Check - Every 300 points
            if (gameScoreRef.current > 0 && gameScoreRef.current % 300 === 0) {
                gameLevelRef.current += 1;
                setLevel(gameLevelRef.current);
            }
        }

        // Cleanup
        if (obs.y > CANVAS_HEIGHT) {
            obstacles.current.splice(i, 1);
        }
    }
  };

  const handleHit = () => {
    if (!isMuted) sfxHit.current?.play().catch(() => {});
    gameLivesRef.current -= 1;
    setLives(gameLivesRef.current);

    if (gameLivesRef.current <= 0) {
        gameStateRef.current = 'gameover';
        setGameState('gameover');
        if (!isMuted) sfxGameOver.current?.play().catch(() => {});
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // 1. Asphalt Background
    ctx.fillStyle = '#333333'; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 2. Grainy Texture
    ctx.fillStyle = '#ffffff05';
    for(let i=0; i<500; i++) {
        ctx.fillRect(Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 1, 1);
    }

    // 3. Side Curbs (Circuit Style - Red/White)
    const curbWidth = 15;
    const stripeHeight = 40;
    const offset = (Date.now() / 10 * (gameLevelRef.current)) % (stripeHeight * 2);

    for(let y = -stripeHeight * 2; y < CANVAS_HEIGHT + stripeHeight; y += stripeHeight) {
        ctx.fillStyle = (Math.floor((y + offset) / stripeHeight) % 2 === 0) ? '#ffffff' : '#ff0000';
        ctx.fillRect(0, y + offset, curbWidth, stripeHeight);
        ctx.fillRect(CANVAS_WIDTH - curbWidth, y + offset, curbWidth, stripeHeight);
    }

    // 4. Center Lines
    ctx.strokeStyle = '#ffffff40';
    ctx.setLineDash([30, 30]);
    ctx.lineDashOffset = -Date.now() / 5 * (gameLevelRef.current);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0); ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw Obstacles (Cars)
    obstacles.current.forEach(obs => {
      const img = carImages.current[obs.imgIndex];
      if (img && img.complete) {
          ctx.drawImage(img, obs.x, obs.y, CAR_WIDTH, CAR_HEIGHT);
      } else {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(obs.x, obs.y, CAR_WIDTH, CAR_HEIGHT);
      }
    });

    // 6. Draw Player (Car)
    const pImg = playerImg.current;
    if (pImg && pImg.complete) {
        ctx.drawImage(pImg, playerPos.current.x, playerPos.current.y, CAR_WIDTH, CAR_HEIGHT);
    } else {
        ctx.fillStyle = '#FFDE03';
        ctx.fillRect(playerPos.current.x, playerPos.current.y, CAR_WIDTH, CAR_HEIGHT);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;

  if (!user) return (
    <main className="min-h-screen bg-zinc-950 pt-40 pb-20 px-6 flex flex-col items-center justify-center">
        <div className="p-8 bg-white border-[4px] border-black shadow-[15px_15px_0_0_rgba(255,222,3,1)] rounded-3xl max-w-md text-center">
            <Lock className="w-16 h-16 mx-auto mb-6 text-black" />
            <h1 className="text-4xl font-black uppercase italic mb-4 text-black">Midnight Restricted</h1>
            <p className="font-bold text-zinc-600 mb-8 italic">Sign in to race and join the leaderboard.</p>
            <Link href="/login" className="neo-brutal-btn-yellow w-full flex items-center justify-center gap-3">JOIN THE CREW <ArrowRight /></Link>
        </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-zinc-950 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col items-center w-full">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 mb-6 px-2">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl sm:text-5xl font-black uppercase italic text-white tracking-tighter leading-none">JDM <br className="hidden sm:block" /> <span className="text-[#FFD600]">OUTRUN.</span></h1>
                </div>
                <div className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-center">
                    <button onClick={() => setIsMuted(!isMuted)} className="bg-black border-[2px] sm:border-[3px] border-white p-2 sm:p-3 text-white">
                        {isMuted ? <VolumeX className="w-4 h-4 sm:w-6 sm:h-6" /> : <Volume2 className="w-4 h-4 sm:w-6 sm:h-6" />}
                    </button>
                    <div className="flex-1 sm:flex-none bg-black border-[2px] sm:border-[3px] border-[#A3E635] p-2 sm:p-3 text-center">
                        <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#A3E635] opacity-60">Score</p>
                        <p className="text-base sm:text-xl font-black text-white italic leading-none">{score.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 sm:flex-none bg-black border-[2px] sm:border-[3px] border-[#FB923C] p-2 sm:p-3 text-center">
                        <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#FB923C] opacity-60">Level</p>
                        <p className="text-base sm:text-xl font-black text-white italic leading-none">{level}</p>
                    </div>
                </div>
            </div>

            <div className="relative border-[8px] border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)] rounded-3xl overflow-hidden bg-zinc-900">
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="max-w-full" />

                {gameState === 'menu' && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center text-white">
                        <Gamepad2 className="w-20 h-20 text-[#FFD600] mb-6 animate-bounce" />
                        <h2 className="text-4xl font-black uppercase italic mb-2">Ready?</h2>
                        <button onClick={startGame} className="neo-brutal-btn-yellow w-full flex items-center justify-center gap-3 mt-8">START ENGINE <Play fill="black" /></button>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="absolute inset-0 bg-red-600/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center text-white">
                        <h2 className="text-6xl font-black uppercase italic text-white mb-2">WASTED.</h2>
                        <div className="bg-black p-6 border-[4px] border-white mb-8 rotate-2">
                            <p className="text-xs font-black uppercase mb-1">Final Score</p>
                            <p className="text-4xl font-black text-[#FFD600] italic">{score.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col gap-3 w-full max-w-[200px]">
                            <button onClick={() => updateHighScore(score)} disabled={isSaving || score === 0} className="bg-black border-[4px] border-white px-6 py-3 font-black uppercase italic text-sm text-white">{isSaving ? 'SAVING...' : 'SAVE RECORD'}</button>
                            <button onClick={startGame} className="bg-white border-[4px] border-black px-6 py-3 font-black uppercase italic text-sm text-black">TRY AGAIN</button>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <>
                        <div className="absolute top-6 left-6 flex gap-2">
                            {[...Array(3)].map((_, i) => (
                                <Heart key={i} className={`w-6 h-6 transition-all ${i < lives ? 'text-red-500 fill-red-500 animate-pulse' : 'text-white/10'}`} />
                            ))}
                        </div>
                        <div className="lg:hidden absolute inset-x-0 bottom-24 flex justify-between px-6 pointer-events-none">
                            <button 
                                onTouchStart={(e) => { e.preventDefault(); keys.current['ArrowLeft'] = true; }}
                                onTouchEnd={(e) => { e.preventDefault(); keys.current['ArrowLeft'] = false; }}
                                className="w-16 h-16 bg-white/10 backdrop-blur-md border-[3px] border-white/40 rounded-2xl flex items-center justify-center pointer-events-auto active:bg-[#FFD600]"
                            >
                                <ChevronRight className="w-8 h-8 text-white rotate-180" />
                            </button>
                            <button 
                                onTouchStart={(e) => { e.preventDefault(); keys.current['ArrowRight'] = true; }}
                                onTouchEnd={(e) => { e.preventDefault(); keys.current['ArrowRight'] = false; }}
                                className="w-16 h-16 bg-white/10 backdrop-blur-md border-[3px] border-white/40 rounded-2xl flex items-center justify-center pointer-events-auto active:bg-[#FFD600]"
                            >
                                <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>

        <div className="flex flex-col gap-8">
            <div className="bg-white border-[4px] border-black shadow-[10px_10px_0_0_#A3E635] rounded-3xl p-8">
                <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3 underline decoration-[#A3E635]"><Trophy className="w-6 h-6 text-[#A3E635]" /> Hall of Fame</h3>
                <div className="space-y-3">
                    {leaderboard.map((entry, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 border-[2px] border-black ${entry.username === user?.user_metadata?.username ? 'bg-[#FFD600]' : 'bg-[#FAF8F5]'}`}>
                            <div className="flex items-center gap-3"><span className="font-black text-xs italic opacity-40">#{i + 1}</span><span className="font-black uppercase text-sm italic">{entry.username}</span></div>
                            <span className="font-black text-sm italic">{entry.high_score?.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#FB923C] border-[4px] border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-3xl p-8">
                <h3 className="text-xl font-black uppercase italic mb-4 text-black underline">Driver Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase italic opacity-60">Racer Profile</span>
                        <span className="font-black text-sm italic text-black">{user?.user_metadata?.username || 'Guest Racer'}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase italic opacity-60">Personal Best</span>
                        <span className="font-black text-xl italic text-black underline">
                            {leaderboard.find(e => e.username === user?.user_metadata?.username || e.username === (user?.email?.split('@')[0]))?.high_score || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
