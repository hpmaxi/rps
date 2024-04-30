import { writeFileSync } from 'fs';
import hre from 'hardhat';
const { viem } = hre;

async function main() {
  const publicClient = await viem.getPublicClient();

  // Deploy the verifier contract
  const verifierValid = await viem.deployContract('contracts/circuits/rps_valid_play/contract/rps_valid_play/plonk_vk.sol:UltraVerifier');
  const verifierReveal = await viem.deployContract('contracts/circuits/rps_reveal_play/contract/rps_reveal_play/plonk_vk.sol:UltraVerifier');
  const rps = await viem.deployContract('contracts/RPS.sol:RPS', [verifierValid.address, verifierReveal.address]);

  // Create a config object
  const config = {
    chainId: publicClient.chain.id,
    verifierValid: verifierValid.address,
    verifierReveal: verifierReveal.address,
    rps: rps.address
  };

  // Print the config
  console.log('Deployed at', config);
  writeFileSync('utils/addresses.json', JSON.stringify(config), { flag: 'w' });
  process.exit();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
