import {
  colors, getTermSize, clearScreen, hideCursor, showCursor,
  writeAt, drawBox, padCenter,
} from './terminal.js';
import { renderLogo, getLogoHeight } from './logo.js';
import { InputScreen } from './input-screen.js';
import { FileBrowser } from './file-browser.js';
import { parseGitHubUrl, fetchRepoMetadata, fetchFileTree } from './github.js';
import { downloadSelectedFiles, cloneRepo, renderProgress } from './downloader.js';

export class App {
  constructor() {
    this._token = process.env.GITHUB_TOKEN || null;
  }

  async start() {
    // Handle resize globally
    process.stdout.on('resize', () => {});

    await this._runInputScreen();
  }

  async _runInputScreen(statusMsg = null, statusType = null) {
    const input = new InputScreen();
    let rawUrl;
    try {
      rawUrl = await input.show(statusMsg, statusType);
    } catch (e) {
      showCursor();
      process.exit(0);
    }

    await this._handleFetch(rawUrl);
  }

  _stopLoading() {
    if (this._spinnerInterval) {
      clearInterval(this._spinnerInterval);
      this._spinnerInterval = null;
    }
    showCursor();
  }

  async _handleFetch(rawUrl) {
    let parsed;
    try {
      parsed = parseGitHubUrl(rawUrl);
    } catch (e) {
      this._stopLoading();
      return this._runInputScreen(e.message, 'error');
    }

    const { owner, repo } = parsed;

    // Show loading screen
    this._showLoading(`Fetching ${owner}/${repo} …`);

    let meta, tree;
    try {
      meta = await fetchRepoMetadata(owner, repo, this._token);
    } catch (e) {
      this._stopLoading();
      return this._runInputScreen(e.message, 'error');
    }

    this._stopLoading();
    this._showLoading(`Fetching file tree for ${owner}/${repo} …`);

    try {
      const branch = meta.default_branch || 'main';
      const treeData = await fetchFileTree(owner, repo, branch, this._token);
      tree = treeData.tree || [];
    } catch (e) {
      this._stopLoading();
      return this._runInputScreen(`Tree fetch failed: ${e.message}`, 'error');
    }

    this._stopLoading();
    await this._runBrowser(meta, tree);
  }

  async _runBrowser(meta, tree) {
    const browser = new FileBrowser(tree, meta);
    let result;
    try {
      result = await browser.show();
    } catch (e) {
      return this._runInputScreen(e.message, 'error');
    }

    if (result.action === 'clone') {
      await this._handleClone(meta);
    } else if (result.action === 'download') {
      await this._handleDownload(meta, tree, result.paths);
    }
  }

  async _handleClone(meta) {
    const cloneUrl = meta.clone_url || `https://github.com/${meta.full_name}.git`;
    try {
      const { destDir } = await cloneRepo(meta.owner.login, meta.name, cloneUrl);
      await this._showResult('success', [
        `Repository cloned successfully!`,
        `Location: ${destDir}`,
      ], meta);
    } catch (e) {
      await this._showResult('error', [
        `Clone failed: ${e.message}`,
        `Make sure git is installed and accessible.`,
      ], meta);
    }
  }

  async _handleDownload(meta, tree, selectedPaths) {
    const owner = meta.owner.login;
    const repo = meta.name;
    const branch = meta.default_branch || 'main';

    // Expand any directory paths to actual file paths
    const blobPaths = new Set();
    for (const sel of selectedPaths) {
      // Check if it's a blob directly
      const blob = tree.find(n => n.path === sel && n.type === 'blob');
      if (blob) {
        blobPaths.add(sel);
      } else {
        // It's a directory — add all children blobs
        for (const node of tree) {
          if (node.type === 'blob' && (node.path === sel || node.path.startsWith(sel + '/'))) {
            blobPaths.add(node.path);
          }
        }
      }
    }

    const paths = Array.from(blobPaths);
    if (paths.length === 0) {
      return this._runBrowserAgain(meta, tree, 'No files found in selection.', 'warning');
    }

    renderProgress('Preparing download…', 0, paths.length);

    let statusLines = [];
    const { outDir, errors, total } = await downloadSelectedFiles(
      owner, repo, branch, paths, this._token,
      (filePath, done, total) => {
        statusLines.unshift(filePath);
        if (statusLines.length > 3) statusLines = statusLines.slice(0, 3);
        renderProgress(`Downloading files…`, done, total, statusLines);
      }
    );

    const successCount = total - errors.length;
    const lines = [
      `Downloaded ${successCount}/${total} files successfully`,
      `Output directory: ${outDir}`,
    ];
    if (errors.length > 0) {
      lines.push(`${errors.length} error(s) occurred (see above)`);
    }

    await this._showResult(errors.length === 0 ? 'success' : 'warning', lines, meta);
  }

  async _runBrowserAgain(meta, tree, msg, type) {
    const browser = new FileBrowser(tree, meta);
    browser._status = msg;
    browser._statusType = type;
    const result = await browser.show();
    if (result.action === 'clone') {
      await this._handleClone(meta);
    } else if (result.action === 'download') {
      await this._handleDownload(meta, tree, result.paths);
    }
  }

  _showLoading(message) {
    const { cols, rows } = getTermSize();
    clearScreen();
    hideCursor();

    const nextRow = renderLogo(1);

    const boxWidth = Math.min(60, cols - 4);
    const boxHeight = 5;
    const boxCol = Math.floor((cols - boxWidth) / 2) + 1;
    const boxRow = nextRow + 2;

    drawBox(boxRow, boxCol, boxWidth, boxHeight, {
      borderColor: colors.yellow,
      title: ' Loading ',
      titleColor: colors.yellow + colors.bold,
    });

    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const msgRow = boxRow + 2;
    const msgCol = boxCol + 3;

    writeAt(msgRow, msgCol, colors.yellow + spinner[0] + '  ' + colors.brightWhite + message + colors.reset);

    // Animate spinner briefly
    this._spinnerInterval = setInterval(() => {
      i = (i + 1) % spinner.length;
      writeAt(msgRow, msgCol, colors.yellow + spinner[i] + '  ' + colors.brightWhite + message + colors.reset);
    }, 80);
  }

  async _showResult(type, lines, meta) {
    if (this._spinnerInterval) {
      clearInterval(this._spinnerInterval);
      this._spinnerInterval = null;
    }

    const { cols, rows } = getTermSize();
    clearScreen();
    hideCursor();

    const nextRow = renderLogo(1);

    const boxWidth = Math.min(70, cols - 4);
    const boxHeight = lines.length + 6;
    const boxCol = Math.floor((cols - boxWidth) / 2) + 1;
    const boxRow = nextRow + 2;

    const isSuccess = type === 'success';
    const isError = type === 'error';
    const borderColor = isSuccess ? colors.brightGreen : isError ? colors.brightRed : colors.yellow;
    const titleColor = borderColor + colors.bold;
    const titleText = isSuccess ? ' ✔ Success ' : isError ? ' ✖ Error ' : ' ⚠ Warning ';

    drawBox(boxRow, boxCol, boxWidth, boxHeight, {
      borderColor,
      title: titleText,
      titleColor,
    });

    for (let i = 0; i < lines.length; i++) {
      writeAt(boxRow + 2 + i, boxCol + 3, colors.brightWhite + lines[i] + colors.reset);
    }

    const hint = colors.gray + 'Press any key to continue…' + colors.reset;
    const hintClean = 'Press any key to continue…';
    const hintCol = Math.floor((cols - hintClean.length) / 2) + 1;
    writeAt(boxRow + boxHeight + 2, hintCol, hint);

    // Wait for keypress
    await new Promise((resolve) => {
      const stdin = process.stdin;
      if (stdin.isTTY) stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      const onKey = (key) => {
        if (key === '\x03') { showCursor(); process.exit(0); }
        stdin.removeListener('data', onKey);
        if (stdin.isTTY) stdin.setRawMode(false);
        stdin.pause();
        resolve();
      };

      stdin.on('data', onKey);
    });

    // Return to input screen
    await this._runInputScreen();
  }
}
