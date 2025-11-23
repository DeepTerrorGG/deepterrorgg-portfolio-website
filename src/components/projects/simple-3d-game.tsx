
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Sphere, Plane, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const useKeyboardControls = () => {
    const keys = useRef<{ [key: string]: boolean }>({});

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = true;
        const onKeyUp = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = false;
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    return keys;
};

function Player() {
    const playerRef = useRef<THREE.Mesh>(null!);
    const keys = useKeyboardControls();
    const speed = 0.1;

    useFrame((state, delta) => {
        const { w, a, s, d } = keys.current;

        if (w) playerRef.current.position.z -= speed;
        if (s) playerRef.current.position.z += speed;
        if (a) playerRef.current.position.x -= speed;
        if (d) playerRef.current.position.x += speed;

        // Make camera follow player
        state.camera.lookAt(playerRef.current.position);
    });

    return (
        <Sphere ref={playerRef} args={[0.5, 32, 32]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="royalblue" />
        </Sphere>
    );
}

function Collectible({ position, onCollect }: { position: [number, number, number], onCollect: () => void }) {
    const collectibleRef = useRef<THREE.Mesh>(null!);
    const [collected, setCollected] = useState(false);

    useFrame(({ scene }) => {
        const player = scene.getObjectByName('player-sphere');
        if (player && !collected) {
            const distance = player.position.distanceTo(collectibleRef.current.position);
            if (distance < 1) {
                setCollected(true);
                onCollect();
            }
        }
    });

    useFrame(() => {
        collectibleRef.current.rotation.y += 0.01;
        collectibleRef.current.rotation.x += 0.01;
    });

    if (collected) return null;

    return (
        <Box ref={collectibleRef} args={[0.5, 0.5, 0.5]} position={position}>
            <meshStandardMaterial color="gold" />
        </Box>
    );
}


function GameScene() {
    const [score, setScore] = useState(0);
    const initialCollectibles = useMemo(() => [
        { id: 1, pos: [3, 0.25, 3] },
        { id: 2, pos: [-3, 0.25, -3] },
        { id: 3, pos: [5, 0.25, -2] },
        { id: 4, pos: [-5, 0.25, 4] },
        { id: 5, pos: [0, 0.25, -6] },
    ] as const, []);
    
    const [collectibles, setCollectibles] = useState(initialCollectibles);

    const handleCollect = (id: number) => {
        setScore(s => s + 1);
        setCollectibles(c => c.filter(item => item.id !== id));
    };

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <Player />
            {collectibles.map(item => (
                <Collectible key={item.id} position={item.pos} onCollect={() => handleCollect(item.id)} />
            ))}
            <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <meshStandardMaterial color="lightgreen" />
            </Plane>
            <Text position={[0, 5, -10]} fontSize={1} color="black">
                Score: {score}
            </Text>
            {collectibles.length === 0 && (
                <Text position={[0, 4, -10]} fontSize={1.5} color="hotpink">
                    You Win!
                </Text>
            )}
            <OrbitControls />
        </>
    );
}

const Simple3DGame = () => {
    return (
        <div className="w-full h-full bg-sky-200">
            <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
                <GameScene />
            </Canvas>
        </div>
    );
};

export default Simple3DGame;
