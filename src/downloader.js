import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import https from 'https';

import { colors, getTermSize, clearScreen, hideCursor, showCursor, writeAt, drawBox, padCenter } from './terminal.js';
import { renderLogo, getLogoHeight } from './logo.js';

export function renderProgress(message, current, total, statusLines = []) {
  const { cols, rows } = getTermSize();
  clearScreen();
  hideCursor();

  const nextRow = renderLogo(1);

  const boxWidth = Math.min(70, cols - 4);
  const boxHeight = 8 + statusLines.length;
  const boxCol = Math.floor((cols - boxWidth) / 2) + 1;
  const boxRow = nextRow + 1;

  drawBox(boxRow, boxCol, boxWidth, boxHeight, {
    borderColor: colors.cyan,
    title: ' Downloading ',
    titleColor: colors.brightCyan + colors.bold,
  });

  // Progress message
  const msgRow = boxRow + 2;
  const msg = colors.brightWhite + message + colors.reset;
  const msgCol = boxCol + 2;
  writeAt(msgRow, msgCol, msg);

  // Progress bar
  if (total > 0) {
    const barWidth = boxWidth - 10;
    const filled = Math.round((current / total) * barWidth);
    const empty = barWidth - filled;
    const pct = Math.round((current / total) * 100);

    const bar = colors.brightGreen + '█'.repeat(filled) + colors.gray + '░'.repeat(empty) + colors.reset;
    const pctStr = colors.yellow + ` ${pct}%` + colors.reset;

    writeAt(msgRow + 2, boxCol + 3, bar + pctStr);
    writeAt(msgRow + 3, boxCol + 2, colors.gray + `${current} / ${total} files` + colors.reset);
  }

  // Status lines
  for (let i = 0; i < statusLines.length; i++) {
    writeAt(msgRow + 5 + i, boxCol + 2, colors.dim + colors.gray + statusLines[i] + colors.reset);
  }
}

export async function downloadSelectedFiles(owner, repo, branch, selectedPaths, token, onProgress) {
  const outDir = path.join(process.cwd(), `${repo}-files`);
  fs.mkdirSync(outDir, { recursive: true });

  // Only download blob files (filter out dir entries)
  const filePaths = selectedPaths.filter(p => {
    // We filter by checking if it's a file (no trailing slash, not a dir-only entry)
    return true; // All selected paths from the browser include full blob paths
  });

  let done = 0;
  const errors = [];

  for (const filePath of filePaths) {
    onProgress && onProgress(filePath, done, filePaths.length);

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    const destPath = path.join(outDir, filePath);

    try {
      await downloadRaw(rawUrl, destPath, token);
      done++;
    } catch (err) {
      errors.push(`Failed: ${filePath} — ${err.message}`);
      done++;
    }
  }

  return { outDir, errors, total: filePaths.length };
}

function downloadRaw(url, destPath, token) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    fs.mkdirSync(dir, { recursive: true });

    const headers = { 'User-Agent': 'GitFetch-CLI/1.0.0' };
    if (token) headers['Authorization'] = `token ${token}`;

    const doGet = (targetUrl) => {
      const file = fs.createWriteStream(destPath);

      https.get(targetUrl, { headers }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlink(destPath, () => {});
          return doGet(res.headers.location);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {});
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };

    doGet(url);
  });
}

export function cloneRepo(owner, repo, cloneUrl) {
  return new Promise((resolve, reject) => {
    const { cols, rows } = getTermSize();
    clearScreen();
    hideCursor();

    const nextRow = renderLogo(1);
    const boxWidth = Math.min(70, cols - 4);
    const boxHeight = 10;
    const boxCol = Math.floor((cols - boxWidth) / 2) + 1;
    const boxRow = nextRow + 1;

    drawBox(boxRow, boxCol, boxWidth, boxHeight, {
      borderColor: colors.yellow,
      title: ' Cloning Repository ',
      titleColor: colors.yellow + colors.bold,
    });

    writeAt(boxRow + 2, boxCol + 2,
      colors.brightWhite + `Cloning ${colors.cyan}${owner}/${repo}${colors.reset}${colors.brightWhite} ...` + colors.reset
    );
    writeAt(boxRow + 3, boxCol + 2,
      colors.gray + `$ git clone ${cloneUrl}` + colors.reset
    );

    const destDir = path.join(process.cwd(), repo);
    const child = spawn('git', ['clone', '--progress', cloneUrl, destDir], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let outputLines = [];
    const maxLines = 4;

    const appendLine = (line) => {
      if (!line.trim()) return;
      outputLines.push(line.trim());
      if (outputLines.length > maxLines) outputLines.shift();
      for (let i = 0; i < maxLines; i++) {
        const l = outputLines[i] || '';
        writeAt(boxRow + 5 + i, boxCol + 2,
          colors.gray + l.slice(0, boxWidth - 4).padEnd(boxWidth - 4, ' ') + colors.reset
        );
      }
    };

    child.stdout.on('data', d => d.toString().split('\n').forEach(appendLine));
    child.stderr.on('data', d => d.toString().split('\n').forEach(appendLine));

    child.on('close', (code) => {
      showCursor();
      if (code === 0) {
        resolve({ destDir });
      } else {
        reject(new Error(`git clone exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      showCursor();
      reject(new Error(`git not found: ${err.message}`));
    });
  });
}
