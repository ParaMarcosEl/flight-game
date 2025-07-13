// components/Bot.tsx
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { curve } from '../../lib/flightPath';
import { useStateMachine } from '../../lib/StateMachine/StateMachine';
import { IdleState } from './IdleState';
import { RaceState } from './RaceState';
import { useGLTF } from '@react-three/drei';
import { SHIP_SCALE } from '../../constants';

export default function Bot({
  startPosition,
  startQuaternion,
}: {
  startPosition: THREE.Vector3;
  startQuaternion: THREE.Quaternion;
}) {
  const { scene } = useGLTF('/models/botship.glb');
  const botRef = useRef<THREE.Object3D>(null);
  const { setState } = useStateMachine(new IdleState());
  useEffect(() => {
    if (botRef.current && startPosition && startQuaternion) {
      botRef.current.position.set(startPosition.x, startPosition.y, startPosition.z);
      botRef.current.quaternion.copy(startQuaternion);
    }
  }, [startPosition, startQuaternion, botRef]);

  useEffect(() => {
    if (botRef.current) {
      setState(new RaceState(botRef.current, curve));
    }
  }, []);

  return (
    <group ref={botRef}>
      <group scale={SHIP_SCALE} rotation={[0, 0, 0]}>
        <primitive object={scene} scale={0.5} />
      </group>
    </group>
  );
}
