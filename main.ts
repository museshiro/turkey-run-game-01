// main.ts — Pipkin's Great Escape (turkey-run-game-01 v2).
// Copies game/ and screenshots/ into the output directory and writes
// dossier.json with buildDossier from vendor/makefun-game.ts.
// Node 22, standard library only. Deterministic: two runs write
// byte-identical output.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// CAPS — the same caps the scorer uses: source text at most 160 KiB,
// at most 4 screenshots of at most 256 KiB each, game at most 993
// files and 48 MiB in all.
const CAPS = {
  text_max_bytes: 163840,
  max_images: 4,
  image_max_bytes: 262144,
  max_files: 993,
  max_bytes: 48 * 1024 * 1024,
};

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : '/output';

// cleanChild — remove one child inside the output directory only.
// Never touches the output directory itself: on the grader /output
// is a mount whose parent is read-only, so deleting it fails the run.
async function cleanChild(outDir: string, name: string): Promise<void> {
  try {
    await rm(join(outDir, name), { recursive: true, force: true });
  } catch (err) {
    console.warn(`warning: could not remove ${name} from output: ${String(err)}`);
  }
}

async function main(): Promise<void> {
  const outDir = OUT;
  // Clear only the three children we own, each in its own try/catch,
  // so a missing child is a no-op and a stuck child only warns.
  await cleanChild(outDir, 'game');
  await cleanChild(outDir, 'screenshots');
  await cleanChild(outDir, 'dossier.json');

  // Create the output directory if it does not exist (idempotent).
  await mkdir(outDir, { recursive: true });

  // Copy the game and its screenshots from the repository.
  await cp(join(ROOT, 'game'), join(outDir, 'game'), { recursive: true });
  await cp(join(ROOT, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

  // Build the dossier from what is now in the output directory, so
  // the dossier the gate rebuilds from /output matches byte for byte.
  // buildDossier returns the dossier bytes (a Uint8Array); write them
  // raw — stringifying them would inflate the file past the cap.
  const dossier = await buildDossier(outDir, CAPS);
  const bytes = typeof dossier === 'string'
    ? Buffer.from(dossier, 'utf8')
    : Buffer.from(dossier as Uint8Array);
  await writeFile(join(outDir, 'dossier.json'), bytes);
  console.log(`wrote ${outDir}/dossier.json (${bytes.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
