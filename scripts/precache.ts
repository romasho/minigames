import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

export function precache(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'minigames-precache',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    closeBundle: {
      order: 'post',
      async handler() {
        const output = resolve(config.root, config.build.outDir);
        const worker = await readFile(
          new URL('./service-worker.js', import.meta.url),
          'utf8',
        );
        const files = (await readdir(output, { recursive: true }))
          .map((file) => file.replaceAll('\\', '/'))
          .filter(
            (file) =>
              file === 'index.html' ||
              file === 'manifest.webmanifest' ||
              file.startsWith('icons/') ||
              (file.startsWith(`${config.build.assetsDir}/`) &&
                !file.endsWith('.map') &&
                !/-hero-[\w-]+\.(?:jpg|png|webp)$/.test(file)),
          )
          .sort();
        const contents = await Promise.all(
          files.map((file) => readFile(resolve(output, file))),
        );
        const hash = createHash('sha256')
          .update(worker)
          .update(JSON.stringify(files));
        for (const content of contents) hash.update(content);
        const version = hash.digest('hex').slice(0, 16);
        await writeFile(
          resolve(output, 'sw.js'),
          `const VERSION = ${JSON.stringify(version)};\nconst FILES = ${JSON.stringify(files)};\n${worker}`,
        );
      },
    },
  };
}
