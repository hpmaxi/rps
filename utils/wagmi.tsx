import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import abi from './verifierAbi.json';
import { chainId, verifier } from './addresses.json';
import { hardhat, scrollSepolia } from 'viem/chains';

const connector = injected({ target: 'rabby' });
export const config = createConfig({
  connectors: [connector],
  chains: [scrollSepolia, hardhat],
  transports: {
    [scrollSepolia.id]: http('https://rpc.ankr.com/scroll_sepolia_testnet'),
    [hardhat.id]: http('http://127.0.0.1:8545/'),
  },
});

export const contractCallConfig = {
  address: verifier as `0x${string}`,
  abi,
  chainId: chainId,
  functionName: 'verify',
};
