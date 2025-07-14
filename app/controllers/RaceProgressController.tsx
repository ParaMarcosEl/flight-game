import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './GameController';
import { useRef } from 'react';

const UPDATE_INTERVAL_MS = 200;
const MAX_DELTA_MS = 200;


export function useRaceProgress({
    playerRef,
    botRefs,
}: {
    playerRef: React.RefObject<THREE.Object3D>;
    botRefs: React.RefObject<THREE.Object3D>[];
}) {
    const { setPlayerPosition, setBotPositions } = useGameStore();
    const elapsedRef = useRef(0);

    useFrame((_, delta) => {
    if (document.hidden) return;

    const safeDelta = Math.min(delta * 1000, MAX_DELTA_MS);
    elapsedRef.current += safeDelta;

    if (elapsedRef.current >= UPDATE_INTERVAL_MS) {
        elapsedRef.current = 0;

        if (playerRef.current) {
        setPlayerPosition(playerRef.current.position.clone());
        }

        const botPositions = botRefs
        .map((bot) => bot.current?.position.clone())
        .filter(Boolean) as THREE.Vector3[];

        setBotPositions(botPositions);
    }
    });
}