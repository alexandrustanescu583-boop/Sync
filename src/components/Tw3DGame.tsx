import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, Volume, ArrowLeft, RotateCcw, Play, Trophy, Shield } from 'lucide-react';
import { TwLogo } from './TwLogo';

interface Tw3DGameProps {
  onBackToChat: () => void;
  userName?: string;
}

export const Tw3DGame: React.FC<Tw3DGameProps> = ({ onBackToChat, userName = 'Pilot' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('tw_3d_highscore') || '0');
  });
  const [isMuted, setIsMuted] = useState(false);

  // References for game loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shipRef = useRef<THREE.Group | null>(null);
  const obstaclesRef = useRef<THREE.Mesh[]>([]);
  const collectiblesRef = useRef<THREE.Mesh[]>([]);
  const starFieldRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  const keysRef = useRef<{ left: boolean; right: boolean; boost: boolean }>({
    left: false,
    right: false,
    boost: false,
  });
  const audioCtxRef = useRef<AudioContext | null>(null);
  const shipTargetXRef = useRef(0);
  const shipSpeedRef = useRef(35);
  const scoreRef = useRef(0);

  // Sound generator using Web Audio API
  const playSynth = (type: 'start' | 'collect' | 'hit' | 'boost') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'collect') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch {
      // Audio fallback
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e0e12);
    scene.fog = new THREE.FogExp2(0x0e0e12, 0.008);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 2, -20);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x9b72cf, 2.5);
    dirLight.position.set(5, 15, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x4285f4, 3, 50);
    pointLight.position.set(0, 2, -5);
    scene.add(pointLight);

    // 5. Starfield Particles
    const starCount = 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 160;
      starPositions[i + 1] = (Math.random() - 0.5) * 100;
      starPositions[i + 2] = -Math.random() * 250;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x9b72cf,
      size: 0.8,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    starFieldRef.current = starField;

    // 6. Build Composite 3D Spaceship ("Tw Interceptor")
    const ship = new THREE.Group();
    shipRef.current = ship;

    // Fuselage
    const bodyGeo = new THREE.ConeGeometry(0.8, 3.2, 5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e1f20,
      metalness: 0.8,
      roughness: 0.2,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    ship.add(body);

    // Wings
    const wingGeo = new THREE.BoxGeometry(3.6, 0.1, 1.2);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x4285f4,
      metalness: 0.9,
      roughness: 0.1,
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0, 0.4);
    ship.add(wings);

    // Cockpit Canopy
    const cockpitGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x9b72cf,
      emissive: 0x9b72cf,
      emissiveIntensity: 0.6,
      roughness: 0.1,
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.35, -0.2);
    cockpit.scale.set(0.8, 0.5, 1.4);
    ship.add(cockpit);

    // Thruster engine glow
    const thrusterGeo = new THREE.CylinderGeometry(0.3, 0.1, 0.8, 8);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xd96570 });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.rotation.x = Math.PI / 2;
    thruster.position.set(0, 0, 1.8);
    ship.add(thruster);

    ship.position.set(0, 1.2, 0);
    scene.add(ship);

    // 7. Ground Grid Track
    const gridHelper = new THREE.GridHelper(160, 40, 0x4285f4, 0x282a2c);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 8. Obstacles & Collectibles Pools
    const obstacles: THREE.Mesh[] = [];
    const obstacleGeo = new THREE.DodecahedronGeometry(1.1);
    const obstacleMat = new THREE.MeshStandardMaterial({
      color: 0xd96570,
      emissive: 0x551122,
      roughness: 0.3,
    });

    for (let i = 0; i < 7; i++) {
      const obs = new THREE.Mesh(obstacleGeo, obstacleMat);
      obs.position.set(
        (Math.random() - 0.5) * 14,
        1.2,
        -40 - i * 35
      );
      scene.add(obs);
      obstacles.push(obs);
    }
    obstaclesRef.current = obstacles;

    const collectibles: THREE.Mesh[] = [];
    const orbGeo = new THREE.OctahedronGeometry(0.7);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x4285f4,
      emissive: 0x224499,
      metalness: 0.8,
      roughness: 0.1,
    });

    for (let i = 0; i < 5; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(
        (Math.random() - 0.5) * 12,
        1.2,
        -25 - i * 40
      );
      scene.add(orb);
      collectibles.push(orb);
    }
    collectiblesRef.current = collectibles;

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);

      // Stars warp effect
      if (starFieldRef.current) {
        const pos = starFieldRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 2; i < starCount * 3; i += 3) {
          pos.array[i] += shipSpeedRef.current * delta * 2;
          if (pos.array[i] > 10) {
            pos.array[i] = -250;
          }
        }
        pos.needsUpdate = true;
      }

      // Track movement
      gridHelper.position.z += shipSpeedRef.current * delta;
      if (gridHelper.position.z > 4) {
        gridHelper.position.z = 0;
      }

      // Title idle animation
      if (gameState === 'title') {
        const time = clock.getElapsedTime();
        if (shipRef.current) {
          shipRef.current.position.y = 1.2 + Math.sin(time * 2) * 0.3;
          shipRef.current.rotation.z = Math.sin(time * 1.5) * 0.1;
        }
        renderer.render(scene, camera);
        return;
      }

      if (gameState === 'playing' && shipRef.current) {
        // Handle Left / Right inputs
        const targetX = shipTargetXRef.current;
        if (keysRef.current.left) {
          shipTargetXRef.current = Math.max(-6.5, shipTargetXRef.current - 12 * delta);
        }
        if (keysRef.current.right) {
          shipTargetXRef.current = Math.min(6.5, shipTargetXRef.current + 12 * delta);
        }

        // Smooth ship lerp
        shipRef.current.position.x += (targetX - shipRef.current.position.x) * 10 * delta;
        shipRef.current.rotation.z = -(targetX - shipRef.current.position.x) * 0.4;
        shipRef.current.position.y = 1.2 + Math.sin(clock.getElapsedTime() * 8) * 0.08;

        // Move and check obstacles
        obstaclesRef.current.forEach((obs) => {
          obs.position.z += shipSpeedRef.current * delta;
          obs.rotation.x += delta * 2;
          obs.rotation.y += delta * 1.5;

          // Collision detection with ship
          const dist = obs.position.distanceTo(shipRef.current!.position);
          if (dist < 1.6) {
            playSynth('hit');
            setGameState('gameover');
            setHighScore((prev) => {
              const newHigh = Math.max(prev, scoreRef.current);
              localStorage.setItem('tw_3d_highscore', String(newHigh));
              return newHigh;
            });
          }

          if (obs.position.z > 15) {
            obs.position.z = -180;
            obs.position.x = (Math.random() - 0.5) * 13;
          }
        });

        // Move and collect orbs
        collectiblesRef.current.forEach((orb) => {
          orb.position.z += shipSpeedRef.current * delta;
          orb.rotation.y += delta * 3;

          const dist = orb.position.distanceTo(shipRef.current!.position);
          if (dist < 1.7) {
            playSynth('collect');
            scoreRef.current += 100;
            setScore(scoreRef.current);
            orb.position.z = -160;
            orb.position.x = (Math.random() - 0.5) * 12;
          }

          if (orb.position.z > 15) {
            orb.position.z = -160;
            orb.position.x = (Math.random() - 0.5) * 12;
          }
        });

        // Score ticks over time
        scoreRef.current += Math.round(delta * 20);
        setScore(scoreRef.current);

        // Gradually increase speed
        shipSpeedRef.current = Math.min(65, 35 + scoreRef.current * 0.015);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState !== 'playing') {
          startGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const startGame = () => {
    playSynth('start');
    scoreRef.current = 0;
    setScore(0);
    shipSpeedRef.current = 35;
    shipTargetXRef.current = 0;

    // Reset obstacles & collectibles
    obstaclesRef.current.forEach((obs, i) => {
      obs.position.set((Math.random() - 0.5) * 13, 1.2, -40 - i * 30);
    });
    collectiblesRef.current.forEach((orb, i) => {
      orb.position.set((Math.random() - 0.5) * 12, 1.2, -25 - i * 35);
    });

    setGameState('playing');
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#0e0e12] overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 pointer-events-auto">
        <button
          onClick={onBackToChat}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#1e1f20]/90 hover:bg-[#282a2c] text-white border border-white/10 backdrop-blur-md text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la Chat</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#1e1f20]/90 border border-white/10 backdrop-blur-md text-xs font-mono tabular-nums text-white shadow-lg">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Record:</span>
            <span className="font-bold text-amber-300">{highScore}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#1e1f20]/90 border border-white/10 backdrop-blur-md text-sm font-mono tabular-nums text-white shadow-lg">
            <span className="text-[#4285F4] font-bold">Scor:</span>
            <span className="font-extrabold text-white text-base">{score}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-2xl bg-[#1e1f20]/90 hover:bg-[#282a2c] text-zinc-300 border border-white/10 backdrop-blur-md cursor-pointer transition-all"
            title={isMuted ? 'Activează sunetul' : 'Dezactivează sunetul'}
          >
            {isMuted ? <Volume className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-[#4285F4]" />}
          </button>
        </div>
      </div>

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-[#1e1f20]/95 border border-white/15 rounded-3xl p-7 text-center shadow-2xl backdrop-blur-xl">
            <div className="flex justify-center mb-3">
              <TwLogo size={64} withGlow={true} />
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
              Tw <span className="bg-gradient-to-r from-[#4285F4] via-[#9B72CF] to-[#D96570] bg-clip-text text-transparent">3D Odyssey</span>
            </h1>
            <p className="text-xs text-zinc-400 mb-6">
              Navighează prin spațiul cosmic 3D, colectează orburile de energie și evită asteroizii!
            </p>

            <button
              onClick={startGame}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#4285F4] via-[#9B72CF] to-[#D96570] hover:opacity-95 text-white font-bold text-sm rounded-2xl transition-all cursor-pointer shadow-xl shadow-[#9B72CF]/25 flex items-center justify-center gap-2 active:scale-98 mb-4"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Pornește Misiunea (Enter / Space)</span>
            </button>

            <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-center gap-3">
              <span>⬅️ ➡️ Săgeți sau A / D</span>
              <span>·</span>
              <span>📱 Butoane Touch pe Mobil</span>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="max-w-sm w-full bg-[#1e1f20] border border-[#9B72CF]/30 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-[#9B72CF] border border-purple-500/40 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1">Misiune Încheiată</h2>
            <p className="text-xs text-zinc-400 mb-4">
              Scor final atins de pilotul {userName}:
            </p>

            <div className="p-3 rounded-2xl bg-[#131314] border border-white/10 mb-5 flex items-center justify-around font-mono">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Scor Curent</div>
                <div className="text-xl font-extrabold text-white">{score}</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Record</div>
                <div className="text-xl font-extrabold text-amber-300">{highScore}</div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={startGame}
                className="w-full py-3 px-5 bg-gradient-to-r from-[#4285F4] to-[#9B72CF] text-white font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Joacă Din Nou</span>
              </button>

              <button
                onClick={onBackToChat}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold rounded-2xl transition-all cursor-pointer"
              >
                Înapoi în Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Touch Controls for 3D Game */}
      {gameState === 'playing' && (
        <div className="absolute bottom-6 left-0 right-0 px-6 flex items-center justify-between pointer-events-none z-20">
          <button
            onTouchStart={() => (keysRef.current.left = true)}
            onTouchEnd={() => (keysRef.current.left = false)}
            onMouseDown={() => (keysRef.current.left = true)}
            onMouseUp={() => (keysRef.current.left = false)}
            className="w-16 h-16 rounded-2xl bg-[#1e1f20]/90 border border-white/20 active:bg-[#4285F4]/40 text-white font-black text-xl flex items-center justify-center pointer-events-auto backdrop-blur-md shadow-2xl active:scale-95 transition-all select-none"
          >
            ◀
          </button>

          <button
            onTouchStart={() => (keysRef.current.right = true)}
            onTouchEnd={() => (keysRef.current.right = false)}
            onMouseDown={() => (keysRef.current.right = true)}
            onMouseUp={() => (keysRef.current.right = false)}
            className="w-16 h-16 rounded-2xl bg-[#1e1f20]/90 border border-white/20 active:bg-[#4285F4]/40 text-white font-black text-xl flex items-center justify-center pointer-events-auto backdrop-blur-md shadow-2xl active:scale-95 transition-all select-none"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
};
