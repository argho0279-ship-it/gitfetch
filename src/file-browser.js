import {
  colors, getTermSize, clearScreen, hideCursor, showCursor,
  writeAt, drawBox, padRight, truncate, visibleLength, moveTo,
} from './terminal.js';
import { renderLogo, getLogoHeight } from './logo.js';

export class FileBrowser {
  constructor(tree, repoMeta) {
    this._fullTree = tree;          // flat list from API {path, type, sha, url, size}
    this._repoMeta = repoMeta;
    this._currentPath = '';         // current directory path
    this._currentItems = [];        // items visible in current view
    this._selectedPaths = new Set();
    this._cursor = 0;
    this._scrollTop = 0;
    this._status = null;
    this._statusType = null;
    this._resolve = null;
    this._onData = null;
    this._resizeListener = null;
  }

  show() {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._loadDirectory('');
      this._render();
      this._attachInput();
    });
  }

  _loadDirectory(path) {
    this._currentPath = path;
    this._cursor = 0;
    this._scrollTop = 0;

    // Get items directly under path
    const prefix = path ? path + '/' : '';
    const seen = new Set();
    const items = [];

    for (const node of this._fullTree) {
      if (!node.path.startsWith(prefix)) continue;
      const rest = node.path.slice(prefix.length);
      const name = rest.split('/')[0];
      if (!name || seen.has(name)) continue;
      seen.add(name);

      const isDir = rest.includes('/') || node.type === 'tree';
      items.push({
        name,
        fullPath: prefix + name,
        type: isDir ? 'dir' : 'file',
        sha: node.sha,
        url: node.url,
        size: node.size,
      });
    }

    // Sort: dirs first, then files
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    this._currentItems = items;
  }

  _getVisibleRows() {
    const { rows } = getTermSize();
    const logoH = getLogoHeight();
    const metaH = 5;   // metadata panel
    const listHeaderH = 2;
    const statusH = 3;
    const hintsH = 2;
    const boxBorder = 2;
    return Math.max(5, rows - logoH - metaH - listHeaderH - statusH - hintsH - boxBorder - 3);
  }

  _render() {
    const { cols, rows } = getTermSize();
    clearScreen();
    hideCursor();

    // Logo
    const nextRow = renderLogo(1);

    // Meta panel
    const metaRow = nextRow;
    this._renderMeta(metaRow);

    // File list box
    const listStartRow = metaRow + 5;
    this._renderFileList(listStartRow);

    // Status
    const visRows = this._getVisibleRows();
    const listBoxHeight = visRows + 4;
    const statusRow = listStartRow + listBoxHeight + 1;
    if (this._status) {
      this._renderStatus(statusRow, this._status, this._statusType);
    }

    // Hints
    this._renderHints(rows - 2);
  }

  _renderMeta(startRow) {
    const { cols } = getTermSize();
    const m = this._repoMeta;
    const boxWidth = Math.min(80, cols - 4);
    const boxCol = Math.floor((cols - boxWidth) / 2) + 1;

    drawBox(startRow, boxCol, boxWidth, 4, {
      borderColor: colors.green,
      title: ' Repository Info ',
      titleColor: colors.brightGreen + colors.bold,
    });

    const inner = boxWidth - 4;
    const stars = `⭐ ${(m.stargazers_count || 0).toLocaleString()}`;
    const forks = `🍴 ${(m.forks_count || 0).toLocaleString()}`;
    const lang = m.language ? `🔤 ${m.language}` : '';

    const titleStr = `${colors.brightWhite}${colors.bold}${m.full_name}${colors.reset}  ${colors.yellow}${stars}${colors.reset}  ${colors.cyan}${forks}${colors.reset}${lang ? `  ${colors.magenta}${lang}${colors.reset}` : ''}`;
    const descStr = m.description
      ? colors.gray + truncate(m.description, inner - 2) + colors.reset
      : colors.gray + colors.dim + '(no description)' + colors.reset;

    writeAt(startRow + 1, boxCol + 2, titleStr);
    writeAt(startRow + 2, boxCol + 2, descStr);
  }

  _renderFileList(startRow) {
    const { cols } = getTermSize();
    const visRows = this._getVisibleRows();
    const boxWidth = Math.min(80, cols - 4);
    const boxHeight = visRows + 4;
    const boxCol = Math.floor((cols - boxWidth) / 2) + 1;
    const inner = boxWidth - 4;

    // Breadcrumb title
    const crumb = this._currentPath
      ? `📁 /${this._currentPath}`
      : '📁 / (root)';
    const crumbDisplay = truncate(crumb, 40);

    drawBox(startRow, boxCol, boxWidth, boxHeight, {
      borderColor: colors.cyan,
      title: ` ${crumbDisplay} `,
      titleColor: colors.brightCyan + colors.bold,
    });

    // Column headers
    const headerRow = startRow + 1;
    const selCol = boxCol + 2;
    const nameCol = boxCol + 6;
    const nameWidth = inner - 14;
    const sizeWidth = 10;

    writeAt(headerRow, selCol,
      colors.gray + colors.dim +
      padRight('  ✓  Name', nameWidth + 6) +
      padRight('Size', sizeWidth) +
      colors.reset
    );

    // Separator
    writeAt(headerRow + 1, boxCol + 1,
      colors.cyan + colors.dim + '─'.repeat(boxWidth - 2) + colors.reset
    );

    // Items
    const end = Math.min(this._scrollTop + visRows, this._currentItems.length);
    let r = headerRow + 2;

    for (let i = this._scrollTop; i < end; i++) {
      const item = this._currentItems[i];
      const isSelected = this._cursor === i;
      const isChecked = this._selectedPaths.has(item.fullPath);

      const icon = item.type === 'dir' ? '📁' : '📄';
      const checkbox = isChecked ? colors.brightGreen + '[✔]' + colors.reset : colors.gray + '[ ]' + colors.reset;

      let nameColor = item.type === 'dir'
        ? colors.brightCyan + colors.bold
        : colors.brightWhite;

      const displayName = truncate(item.name, nameWidth);
      const sizeStr = item.type === 'file' && item.size != null
        ? formatSize(item.size)
        : '';

      let line;
      if (isSelected) {
        // Highlighted row
        const bg = colors.bgBlue;
        line = bg + colors.brightWhite + colors.bold +
          ' ' + (isChecked ? '[✔]' : '[ ]') + ' ' +
          icon + ' ' +
          padRight(displayName, nameWidth) +
          colors.dim + padRight(sizeStr, sizeWidth) +
          colors.reset;
      } else {
        line =
          ' ' + checkbox + ' ' +
          nameColor + icon + ' ' +
          padRight(displayName, nameWidth) + colors.reset +
          colors.gray + padRight(sizeStr, sizeWidth) + colors.reset;
      }

      writeAt(r, boxCol + 1, line);
      r++;
    }

    // Empty state
    if (this._currentItems.length === 0) {
      const msg = colors.gray + colors.dim + '(empty directory)' + colors.reset;
      const msgCol = Math.floor((cols - 17) / 2) + 1;
      writeAt(r + 1, msgCol, msg);
    }

    // Scroll indicators
    if (this._scrollTop > 0) {
      writeAt(startRow + 3, boxCol + Math.floor(boxWidth / 2), colors.cyan + '▲' + colors.reset);
    }
    if (end < this._currentItems.length) {
      writeAt(startRow + boxHeight - 2, boxCol + Math.floor(boxWidth / 2), colors.cyan + '▼' + colors.reset);
    }

    // Item count
    const countStr = colors.gray + `${this._currentItems.length} items  •  ${this._selectedPaths.size} selected` + colors.reset;
    const countClean = `${this._currentItems.length} items  •  ${this._selectedPaths.size} selected`;
    const countCol = Math.floor((cols - countClean.length) / 2) + 1;
    writeAt(startRow + boxHeight - 1, countCol, countStr);
  }

  _renderStatus(row, msg, type) {
    const { cols } = getTermSize();
    const icons = { info: 'ℹ', success: '✔', error: '✖', warning: '⚠' };
    const clr = {
      info: colors.cyan,
      success: colors.brightGreen,
      error: colors.brightRed,
      warning: colors.yellow,
    };
    const icon = icons[type] || 'ℹ';
    const color = clr[type] || colors.cyan;
    const text = `${color}  ${icon}  ${msg}  ${colors.reset}`;
    const cleanText = `  ${icon}  ${msg}  `;
    const col = Math.max(1, Math.floor((cols - cleanText.length) / 2) + 1);
    writeAt(row, col, text);
  }

  _renderHints(row) {
    const { cols } = getTermSize();
    const hints = [
      colors.gray + '[↑↓] Navigate' + colors.reset,
      colors.gray + '[Space] Select' + colors.reset,
      colors.gray + '[↵] Open Dir' + colors.reset,
      colors.gray + '[Esc] Back' + colors.reset,
      colors.cyan + '[Ctrl+A] Clone Repo' + colors.reset,
      colors.green + '[Ctrl+D] Download Selected' + colors.reset,
      colors.dim + colors.gray + '[Ctrl+C] Quit' + colors.reset,
    ];

    const sep = colors.dim + colors.gray + ' │ ' + colors.reset;
    const line = hints.join(sep);
    const cleanLine = '[↑↓] Navigate │ [Space] Select │ [↵] Open Dir │ [Esc] Back │ [Ctrl+A] Clone Repo │ [Ctrl+D] Download Selected │ [Ctrl+C] Quit';
    const lineCol = Math.max(1, Math.floor((cols - cleanLine.length) / 2) + 1);
    writeAt(row, lineCol, line);
  }

  _attachInput() {
    const stdin = process.stdin;
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    this._onData = (key) => this._handleKey(key);
    stdin.on('data', this._onData);

    this._resizeListener = () => {
      this._scrollTop = Math.min(
        this._scrollTop,
        Math.max(0, this._currentItems.length - this._getVisibleRows())
      );
      this._render();
    };
    process.stdout.on('resize', this._resizeListener);
  }

  _detachInput() {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdin.pause();
    if (this._onData) {
      process.stdin.removeListener('data', this._onData);
      this._onData = null;
    }
    if (this._resizeListener) {
      process.stdout.removeListener('resize', this._resizeListener);
      this._resizeListener = null;
    }
  }

  _handleKey(key) {
    const visRows = this._getVisibleRows();

    // Ctrl+C
    if (key === '\x03') {
      this._detachInput();
      showCursor();
      process.stdout.write('\n');
      process.exit(0);
    }

    // Ctrl+A — clone entire repo
    if (key === '\x01') {
      this._detachInput();
      showCursor();
      this._resolve({ action: 'clone' });
      return;
    }

    // Ctrl+D — download selected
    if (key === '\x04') {
      if (this._selectedPaths.size === 0) {
        this._status = 'No files selected. Use Space to select files.';
        this._statusType = 'warning';
        this._render();
        return;
      }
      this._detachInput();
      showCursor();
      this._resolve({ action: 'download', paths: Array.from(this._selectedPaths) });
      return;
    }

    // Escape — go up
    if (key === '\x1b') {
      if (this._currentPath) {
        const parts = this._currentPath.split('/');
        parts.pop();
        this._loadDirectory(parts.join('/'));
        this._status = null;
        this._render();
      }
      return;
    }

    // Arrow up
    if (key === '\x1b[A') {
      if (this._cursor > 0) {
        this._cursor--;
        if (this._cursor < this._scrollTop) {
          this._scrollTop = this._cursor;
        }
        this._render();
      }
      return;
    }

    // Arrow down
    if (key === '\x1b[C' && key.length === 3) {
      // right arrow — ignore in list
      return;
    }

    if (key === '\x1b[B') {
      if (this._cursor < this._currentItems.length - 1) {
        this._cursor++;
        if (this._cursor >= this._scrollTop + visRows) {
          this._scrollTop = this._cursor - visRows + 1;
        }
        this._render();
      }
      return;
    }

    // Page Up
    if (key === '\x1b[5~') {
      this._cursor = Math.max(0, this._cursor - visRows);
      this._scrollTop = Math.max(0, this._scrollTop - visRows);
      this._render();
      return;
    }

    // Page Down
    if (key === '\x1b[6~') {
      this._cursor = Math.min(this._currentItems.length - 1, this._cursor + visRows);
      this._scrollTop = Math.min(
        Math.max(0, this._currentItems.length - visRows),
        this._scrollTop + visRows
      );
      this._render();
      return;
    }

    // Space — toggle selection
    if (key === ' ') {
      const item = this._currentItems[this._cursor];
      if (!item) return;
      if (this._selectedPaths.has(item.fullPath)) {
        this._selectedPaths.delete(item.fullPath);
        // Also deselect children
        for (const p of this._selectedPaths) {
          if (p.startsWith(item.fullPath + '/')) {
            this._selectedPaths.delete(p);
          }
        }
      } else {
        this._selectedPaths.add(item.fullPath);
        // For dirs, also select all children
        if (item.type === 'dir') {
          for (const node of this._fullTree) {
            if (node.path.startsWith(item.fullPath + '/') && node.type === 'blob') {
              this._selectedPaths.add(node.path);
            }
          }
        }
      }
      this._status = null;
      this._render();
      return;
    }

    // Enter — open directory
    if (key === '\r' || key === '\n') {
      const item = this._currentItems[this._cursor];
      if (!item) return;
      if (item.type === 'dir') {
        this._loadDirectory(item.fullPath);
        this._status = null;
        this._render();
      } else {
        this._status = `  "${item.name}"  Press Space to select, Ctrl+D to download`;
        this._statusType = 'info';
        this._render();
      }
      return;
    }
  }

  setStatus(msg, type) {
    this._status = msg;
    this._statusType = type;
    this._render();
  }
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / 1024 / 1024).toFixed(1)}M`;
}
