import { useAccount } from 'wagmi';

export const User = () => {
  const { address, isConnected } = useAccount();

  return isConnected ? <h2>{address}</h2> : <h2>Not connected</h2>;
};
