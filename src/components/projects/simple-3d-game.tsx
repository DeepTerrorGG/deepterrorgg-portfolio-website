
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// --- Helper: Keyboard Controls ---
const useKeyboardControls = () => {
  const keys = useRef<{ [key: string]: boolean }>({});
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => (keys.current[e.key] = true);
    const onKeyUp = (e: KeyboardEvent) => (keys.current[e.key] = false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
  return keys;
};

// --- Game Components ---

function Player() {
  const ref = useRef<THREE.Mesh>(null!);
  const keys = useKeyboardControls();
  const speed = 0.1;

  useFrame(() => {
    if (!ref.current) return;
    if (keys.current.w || keys.current.ArrowUp) ref.current.position.z -= speed;
    if (keys.current.s || keys.current.ArrowDown) ref.current.position.z += speed;
    if (keys.current.a || keys.current.ArrowLeft) ref.current.position.x -= speed;
    if (keys.current.d || keys.current.ArrowRight) ref.current.position.x += speed;
  });

  return (
    <Sphere ref={ref} args={[0.5, 32, 32]}>
      <meshStandardMaterial color="dodgerblue" />
    </Sphere>
  );
}

function Collectible({ position, onCollect }: { position: [number, number, number], onCollect: () => void }) {
  const ref = useRef<THREE.Mesh>(null!);
  const [collected, setCollected] = useState(false);

  useFrame(({ scene }) => {
    if (collected || !ref.current) return;
    ref.current.rotation.y += 0.02;

    const player = scene.getObjectByName('player');
    if (player && ref.current.position.distanceTo(player.position) < 1) {
      setCollected(true);
      onCollect();
    }
  });

  if (collected) return null;

  return (
    <Box ref={ref} position={position} args={[0.6, 0.6, 0.6]}>
      <meshStandardMaterial color="gold" />
    </Box>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#4a4a4a" />
    </mesh>
  );
}


// --- Main Game Component ---

const Simple3DGame = () => {
  const [score, setScore] = useState(0);
  const collectibles = useMemo(() => [
    { id: 1, position: [-5, -0.2, -5] },
    { id: 2, position: [5, -0.2, -5] },
    { id: 3, position: [5, -0.2, 5] },
    { id: 4, position: [-5, -0.2, 5] },
    { id: 5, position: [0, -0.2, 0] },
  ], []);

  const handleCollect = () => {
    setScore(s => s + 1);
  };
  
  const allCollected = score >= collectibles.length;

  return (
    <div className="w-full h-full relative bg-gray-800">
      <div className="absolute top-4 left-4 z-10 text-white p-2 bg-black/50 rounded-lg">
        <h2 className="font-bold">Score: {score}</h2>
        <p className="text-xs">Use WASD or Arrow Keys to move.</p>
      </div>
      <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <group name="player">
          <Player />
        </group>
        
        <Ground />
        
        {!allCollected && collectibles.map(c => (
          <Collectible key={c.id} position={c.position as [number, number, number]} onCollect={handleCollect} />
        ))}
        
        {allCollected && (
            <Text
              position={[0, 1, 0]}
              fontSize={1.5}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              You Win!
            </Text>
        )}

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default Simple3DGame;
