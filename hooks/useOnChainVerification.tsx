import { ProofData } from '@noir-lang/types';
import { useAccount, useConnect, useReadContract, useReconnect } from 'wagmi';
import { config, contractCallConfig } from '../utils/wagmi.jsx';
import { bytesToHex } from 'viem';
import { useEffect, useState } from 'react';
import { Id, toast } from 'react-toastify';
import { hardhat, scrollSepolia } from 'viem/chains';

export function useOnChainVerification(proofData?: ProofData) {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const [args, setArgs] = useState<[string, string[]] | undefined>();

  const { reconnect } = useReconnect();

  const { data, error } = useReadContract({
    ...contractCallConfig,
    args,
    query: {
      enabled: !!args,
    },
  });

  const [onChainToast, setOnChainToast] = useState<Id>(0);

  useEffect(() => {
    connect({ connector: config.connectors[0], chainId: hardhat.id });
  }, []);

  useEffect(() => {
    if (!proofData || !isConnected) {
      return;
    }

    setArgs([bytesToHex(proofData.proof), proofData.publicInputs]);

    if (!onChainToast)
      setOnChainToast(toast.loading('Verifying proof on-chain', { autoClose: 10000 }));
  }, [proofData]);

  useEffect(() => {
    if (!isConnected) {
      reconnect();
    }
  }, [isConnected]);

  useEffect(() => {
    if (data) {
      toast.update(onChainToast, {
        type: 'success',
        render: 'Proof verified on-chain!',
        isLoading: false,
      });
    } else if (error) {
      toast.update(onChainToast, {
        type: 'error',
        render: 'Error verifying proof on-chain!',
        isLoading: false,
      });
      console.error(error);
    }
  }, [data, error]);
}
