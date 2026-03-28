import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outExtension: { '.js': '.js' }
});

const fs = await import('fs');
const shebang = '#!/usr/bin/env node\n';
const content = fs.readFileSync('dist/index.js', 'utf8');
fs.writeFileSync('dist/index.js', shebang + content);

console.log('Build complete!');
