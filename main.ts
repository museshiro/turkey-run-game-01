// Pipkin's Great Escape — hand-in program (Node 22, standard library only).
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-game.ts. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for /output. Nothing is written anywhere else.
import { cpSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// The scorer's own caps, so the dossier we write is the one it expects.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

function copyTree(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  cpSync(from, to, { recursive: true, dereference: false });
}

function countFiles(dir: string): number {
  let n = 0;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    n += statSync(p).isDirectory() ? countFiles(p) : 1;
  }
  return n;
}

function main(): void {
  // Clean only the contents we own inside outputDir, never outputDir itself:
  // on the grader /output is a writable mount whose parent (/) is read-only,
  // so removing /output itself needs a write to / and fails with EPERM/EROFS.
  for (const child of ['game', 'screenshots', 'dossier.json']) {
    try {
      rmSync(join(outputDir, child), { recursive: true, force: true });
    } catch (err) {
      // A stale child we cannot remove must not abort the run: copyTree
      // below overwrites game/screenshots and dossier.json is rewritten,
      // so the worst case is leftover files, not a failed submission.
      console.warn(`warn: could not remove ${join(outputDir, child)}: ${(err as Error).message}`);
    }
  }
  mkdirSync(outputDir, { recursive: true });
  copyTree('game');
  copyTree('screenshots');
  const dossier = buildDossier(outputDir, caps);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`wrote ${outputDir} (game: ${countFiles(join(outputDir, 'game'))} files, dossier ${dossier.length} bytes)`);
}

main();
