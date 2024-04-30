import { useState } from 'react';
import React from 'react';

import { useOnChainVerification } from '../hooks/useOnChainVerification.jsx';
import { useProofGeneration } from '../hooks/useProofGeneration.jsx';
import { useOffChainVerification } from '../hooks/useOffChainVerification.jsx';
import { User } from './user.jsx';

type Hand = 'SCISSORS' | 'ROCK' | 'PAPER';
const MapField: Record<Hand, number> = {
  ROCK: 0,
  PAPER: 1,
  SCISSORS: 2,
};

function Home() {
  const [hand, setHand] = useState<Hand | null>(null);
  const [input, setInput] = useState<{ hand: number } | undefined>();

  const { noir, proofData } = useProofGeneration(input);
  useOffChainVerification(noir, proofData);
  useOnChainVerification(proofData);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hand) return;

    setInput({ hand: MapField[hand] });
  };

  return (
    <form className="container" onSubmit={submit}>
      <h1>Rock paper scissors</h1>
      <User />
      <h2>Select your hand</h2>
      <div>
        <button onClick={() => setHand('ROCK')}>🪨</button>
        <button onClick={() => setHand('PAPER')}>📄</button>
        <button onClick={() => setHand('SCISSORS')}>✂️</button>
      </div>

      <button type="submit" disabled={!hand}>
        Submit proof
      </button>
    </form>
  );
}

export default Home;
