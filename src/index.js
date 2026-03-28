import { App } from './app.js';

async function main() {
  const app = new App();
  await app.start();
}

main().catch((err) => {
  process.stderr.write(`\nFatal error: ${err.message}\n`);
  process.exit(1);
});
