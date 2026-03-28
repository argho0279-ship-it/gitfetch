import {
  colors, getTermSize, clearScreen, hideCursor, showCursor,
  writeAt, drawBox, padCenter, visibleLength, moveTo,
} from './terminal.js';
import { renderLogo, getLogoHeight } from './logo.js';
import { execSync } from 'child_process';

const PLACEHOLDER = 'github.com/owner/repo';

export class InputScreen {
  constructor() {
    this._value = '';
    this._cursorPos = 0;
    this._blinkState = true;
    this._blinkInterval = null;
    this._resolve = null;
    this._reject = null;
    this._status = null;
    this._statusType = null;
    this._onData = null;
    this._scrollOffset = 0;
    // Cached layout positions so _renderCursorOnly uses exact same coords as _render
    this._inputRow = 0;
    this._inputCol = 0;
    this._innerWidth = 0;
  }

  show(statusMsg = null, statusType = null) {
    this._status = statusMsg;
    this._statusType = statusType;

    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      this._render();
      this._startBlink();
      this._attachInput();
    });
  }

  _render() {
    const { cols, rows } = getTermSize();
    clearScreen();
    hideCursor();

    // --- Logo ---
    const logoStartRow = 2;
    const nextRow = renderLogo(logoStartRow);

    // --- Separator ---
    const sepRow = nextRow;
    const sepWidth = Math.min(cols - 4, 80);
    const sep = colors.cyan + colors.dim + '─'.repeat(sepWidth) + colors.reset;
    const sepCol = Math.max(1, Math.floor((cols - sepWidth) / 2) + 1);
    writeAt(sepRow, sepCol, sep);

    // --- Input box ---
    const boxWidth = Math.min(70, cols - 4);
    const boxHeight = 5;
    const boxCol = Math.floor((cols - boxWidth) / 2) + 1;
    const boxRow = sepRow + 2;

    drawBox(boxRow, boxCol, boxWidth, boxHeight, {
      borderColor: colors.cyan,
      title: ' Enter GitHub Repository URL ',
      titleColor: colors.brightCyan + colors.bold,
    });

    // Cache layout for _renderCursorOnly
    const innerWidth = boxWidth - 4;
    const inputRow = boxRow + 2;
    const inputCol = boxCol + 2;
    this._inputRow = inputRow;
    this._inputCol = inputCol;
    this._innerWidth = innerWidth;

    this._drawInputLine();

    // --- Hint row ---
    const hintRow = boxRow + boxHeight + 1;
    const hint = colors.gray + '↵ Enter to fetch  •  Ctrl+V/Right-Click to paste  •  Ctrl+C to exit' + colors.reset;
    const hintCol = Math.floor((cols - 70) / 2) + 1;
    writeAt(hintRow, hintCol, hint);

    // --- Status message ---
    if (this._status) {
      const statusRow = hintRow + 2;
      this._renderStatus(statusRow, this._status, this._statusType);
    }

    // --- Controls reference ---
    const ctrlRow = rows - 3;
    const ctrl = [
      colors.gray + '[↵] Fetch  ' + colors.reset,
      colors.gray + '[Ctrl+C] Quit' + colors.reset,
    ].join(colors.dim + '  │  ' + colors.reset);
    const ctrlClean = '[↵] Fetch    │    [Ctrl+C] Quit';
    const ctrlCol = Math.floor((cols - ctrlClean.length) / 2) + 1;
    writeAt(ctrlRow, ctrlCol, ctrl);

    // Park the real terminal cursor off-screen at bottom-left so
    // any stray terminal echo doesn't appear over our UI.
    process.stdout.write(moveTo(rows, 1));
  }

  // Draws just the input field content (used by both _render and _renderCursorOnly)
  _drawInputLine() {
    const innerWidth = this._innerWidth;
    const inputRow = this._inputRow;
    const inputCol = this._inputCol;

    let displayVal = this._value;
    let cursorDisplayPos = this._cursorPos;

    // Horizontal scroll
    if (displayVal.length > innerWidth - 1) {
      const maxScroll = displayVal.length - (innerWidth - 1);
      this._scrollOffset = Math.min(this._scrollOffset, maxScroll);
      this._scrollOffset = Math.max(this._scrollOffset, this._cursorPos - (innerWidth - 2));
      displayVal = displayVal.slice(this._scrollOffset);
      cursorDisplayPos = this._cursorPos - this._scrollOffset;
    } else {
      this._scrollOffset = 0;
    }

    let lineContent;
    if (this._value.length === 0) {
      lineContent = colors.gray + colors.dim + PLACEHOLDER + colors.reset;
    } else {
      const before = colors.brightWhite + displayVal.slice(0, cursorDisplayPos);
      const atCursor = displayVal[cursorDisplayPos] || ' ';
      const cursorChar = this._blinkState
        ? colors.bgCyan + colors.black + atCursor + colors.reset
        : colors.brightWhite + atCursor + colors.reset;
      const after = colors.brightWhite + displayVal.slice(cursorDisplayPos + 1) + colors.reset;
      lineContent = before + cursorChar + after;
    }

    const padded = lineContent + ' '.repeat(Math.max(0, innerWidth - visibleLength(lineContent)));
    writeAt(inputRow, inputCol, padded);

    // Re-park cursor
    const { rows } = getTermSize();
    process.stdout.write(moveTo(rows, 1));
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
    const text = `${color}${color === colors.brightGreen ? colors.bold : ''}  ${icon}  ${msg}  ${colors.reset}`;
    const cleanText = `  ${icon}  ${msg}  `;
    const col = Math.floor((cols - cleanText.length) / 2) + 1;
    writeAt(row, col, text);
  }

  _startBlink() {
    this._blinkInterval = setInterval(() => {
      this._blinkState = !this._blinkState;
      this._renderCursorOnly();
    }, 500);
  }

  _renderCursorOnly() {
    // Use the exact same coords computed in _render — no recalculation
    if (!this._inputRow) return;
    this._drawInputLine();
  }

  _attachInput() {
    const stdin = process.stdin;

    // Always start clean — remove any leftover listener before adding ours
    if (this._onData) {
      stdin.removeListener('data', this._onData);
      this._onData = null;
    }

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.setEncoding('utf8');

    this._onData = (key) => this._handleKey(key);
    stdin.on('data', this._onData);
  }

  _detachInput() {
    clearInterval(this._blinkInterval);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    if (this._onData) {
      process.stdin.removeListener('data', this._onData);
      this._onData = null;
    }
  }

  _handleKey(key) {
    // Handle paste - detect multi-character input (paste sends entire string at once)
    // This handles Ctrl+V, Shift+Insert, and right-click paste
    if (key.length > 1 && key !== '\r' && key !== '\n') {
      // This is likely a paste operation - extract just the text
      let pasteText = key
        .replace(/\x16/g, '')  // Remove Ctrl+V
        .replace(/\x1b\[2~/g, '')  // Remove Shift+Insert sequence
        .replace(/\x1b\[200~/g, '')  // Remove bracketed paste
        .replace(/[\r\n]/g, '');  // Remove newlines
      
      // If it's still long or contains URL-like content, try clipboard
      if (pasteText.length > 3 || pasteText.includes('github.com')) {
        if (process.platform === 'win32') {
          try {
            const clipboard = execSync('powershell -Command "Get-Clipboard -Raw"', { encoding: 'utf8', timeout: 500 }).trim();
            if (clipboard && clipboard.length > 0 && clipboard.length < 500) {
              this._value = this._value.slice(0, this._cursorPos) + clipboard + this._value.slice(this._cursorPos);
              this._cursorPos += clipboard.length;
              this._blinkState = true;
              this._render();
              return;
            }
          } catch (e) {}
        }
        
        // Fallback: use what we received
        if (pasteText.length > 0) {
          this._value = this._value.slice(0, this._cursorPos) + pasteText + this._value.slice(this._cursorPos);
          this._cursorPos += pasteText.length;
          this._blinkState = true;
          this._render();
        }
        return;
      }
    }

    // Ctrl+V (single char paste)
    if (key === '\x16') {
      if (process.platform === 'win32') {
        try {
          const clipboard = execSync('powershell -Command "Get-Clipboard -Raw"', { encoding: 'utf8', timeout: 500 }).trim();
          if (clipboard && clipboard.length > 0 && clipboard.length < 500) {
            this._value = this._value.slice(0, this._cursorPos) + clipboard + this._value.slice(this._cursorPos);
            this._cursorPos += clipboard.length;
            this._blinkState = true;
            this._render();
          }
        } catch (e) {}
      }
      return;
    }

    // Ctrl+C
    if (key === '\x03') {
      this._detachInput();
      showCursor();
      process.stdout.write('\n');
      process.exit(0);
    }

    // Enter
    if (key === '\r' || key === '\n') {
      const val = this._value.trim();
      if (!val) {
        this._status = 'Please enter a GitHub repository URL';
        this._statusType = 'warning';
        this._render();
        return;
      }
      this._detachInput();
      showCursor();
      this._resolve(val);
      return;
    }

    // Backspace
    if (key === '\x7f' || key === '\x08') {
      if (this._cursorPos > 0) {
        this._value = this._value.slice(0, this._cursorPos - 1) + this._value.slice(this._cursorPos);
        this._cursorPos--;
        this._blinkState = true;
        this._render();
      }
      return;
    }

    // Delete
    if (key === '\x1b[3~') {
      if (this._cursorPos < this._value.length) {
        this._value = this._value.slice(0, this._cursorPos) + this._value.slice(this._cursorPos + 1);
        this._render();
      }
      return;
    }

    // Arrow left
    if (key === '\x1b[D') {
      if (this._cursorPos > 0) {
        this._cursorPos--;
        this._blinkState = true;
        this._renderCursorOnly();
      }
      return;
    }

    // Arrow right
    if (key === '\x1b[C') {
      if (this._cursorPos < this._value.length) {
        this._cursorPos++;
        this._blinkState = true;
        this._renderCursorOnly();
      }
      return;
    }

    // Home
    if (key === '\x1b[H' || key === '\x01') {
      this._cursorPos = 0;
      this._scrollOffset = 0;
      this._blinkState = true;
      this._render();
      return;
    }

    // End
    if (key === '\x1b[F' || key === '\x05') {
      this._cursorPos = this._value.length;
      this._blinkState = true;
      this._render();
      return;
    }

    // Ignore other escape sequences
    if (key.startsWith('\x1b')) return;

    // Printable characters
    if (key.length === 1 && key >= ' ') {
      this._value = this._value.slice(0, this._cursorPos) + key + this._value.slice(this._cursorPos);
      this._cursorPos++;
      this._blinkState = true;
      this._render();
    }
  }
}
