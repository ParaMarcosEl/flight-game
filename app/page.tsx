'use client';

import { useRouter } from 'next/navigation';
import { useGameStore } from '../lib/store';

export default function Home() {
  const router = useRouter();
  const setScene = useGameStore((s) => s.setScene);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>🚀 Flight Game</h1>
      <button
        onClick={() => {
          setScene('select');
          router.push('/stage-select');
        }}
      >
        Start Game
      </button>
    </main>
  );
}
