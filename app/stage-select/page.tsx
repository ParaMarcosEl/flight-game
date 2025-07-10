'use client';

import { useRouter } from 'next/navigation';
import { useGameStore } from '../../lib/store';

export default function StageSelect() {
  const router = useRouter();
  const setScene = useGameStore((s) => s.setScene);
  const setSelectedStage = useGameStore((s) => s.setSelectedStage);

  return (
    <main style={{ padding: '2rem' }}>
      <h2>Select Stage</h2>
      <button
        onClick={() => {
          setSelectedStage(1);
          setScene('stage');
          router.push('/stage');
        }}
      >
        Stage 1
      </button>
    </main>
  );
}
