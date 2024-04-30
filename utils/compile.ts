import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { CompiledCircuit } from '@noir-lang/types';


export type Circuit = 'rps_reveal_play' | 'rps_valid_play'
export async function getCircuit(circuit: Circuit) {
  const fm = createFileManager('/');
  const main = (await fetch(new URL(`../circuits/${circuit}/src/main.nr`, import.meta.url)))
    .body as ReadableStream<Uint8Array>;
  const nargoToml = (await fetch(new URL(`../circuits/${circuit}/Nargo.toml`, import.meta.url)))
    .body as ReadableStream<Uint8Array>;

  fm.writeFile('./src/main.nr', main);
  fm.writeFile('./Nargo.toml', nargoToml);
  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }
  return result.program as CompiledCircuit;
}
