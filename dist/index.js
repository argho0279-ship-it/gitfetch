#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/terminal.js
var ESC = "\x1B";
var CSI = `${ESC}[`;
var colors = {
  reset: `${CSI}0m`,
  bold: `${CSI}1m`,
  dim: `${CSI}2m`,
  blink: `${CSI}5m`,
  reverse: `${CSI}7m`,
  black: `${CSI}30m`,
  red: `${CSI}31m`,
  green: `${CSI}32m`,
  yellow: `${CSI}33m`,
  blue: `${CSI}34m`,
  magenta: `${CSI}35m`,
  cyan: `${CSI}36m`,
  white: `${CSI}37m`,
  gray: `${CSI}90m`,
  bgBlack: `${CSI}40m`,
  bgRed: `${CSI}41m`,
  bgGreen: `${CSI}42m`,
  bgYellow: `${CSI}43m`,
  bgBlue: `${CSI}44m`,
  bgMagenta: `${CSI}45m`,
  bgCyan: `${CSI}46m`,
  bgWhite: `${CSI}47m`,
  bgGray: `${CSI}100m`,
  brightCyan: `${CSI}96m`,
  brightGreen: `${CSI}92m`,
  brightYellow: `${CSI}93m`,
  brightRed: `${CSI}91m`,
  brightWhite: `${CSI}97m`,
  brightMagenta: `${CSI}95m`
};
function getTermSize() {
  return {
    cols: process.stdout.columns || 120,
    rows: process.stdout.rows || 40
  };
}
function moveTo(row, col) {
  return `${CSI}${row};${col}H`;
}
function clearScreen() {
  process.stdout.write(`${CSI}2J${CSI}H`);
}
function hideCursor() {
  process.stdout.write(`${CSI}?25l`);
}
function showCursor() {
  process.stdout.write(`${CSI}?25h`);
}
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}
function visibleLength(str) {
  return stripAnsi(str).length;
}
function padRight(str, width, padChar = " ") {
  const len = visibleLength(str);
  if (len >= width)
    return str;
  return str + padChar.repeat(width - len);
}
function truncate(str, maxLen, suffix = "\u2026") {
  const len = visibleLength(str);
  if (len <= maxLen)
    return str;
  return str.slice(0, maxLen - suffix.length) + suffix;
}
function writeAt(row, col, text) {
  process.stdout.write(moveTo(row, col) + text);
}
function drawBox(startRow, startCol, width, height, opts = {}) {
  const {
    borderColor = colors.cyan,
    fillColor = "",
    title = "",
    titleColor = colors.brightCyan + colors.bold
  } = opts;
  const tl = "\u2554", tr = "\u2557", bl = "\u255A", br = "\u255D", h = "\u2550", v = "\u2551";
  const innerWidth = width - 2;
  const lines = [];
  let top = tl + h.repeat(innerWidth) + tr;
  if (title) {
    const t = ` ${title} `;
    const tLen = visibleLength(t);
    if (tLen < innerWidth) {
      const leftPad = Math.floor((innerWidth - tLen) / 2);
      const rightPad = innerWidth - tLen - leftPad;
      top = tl + h.repeat(leftPad) + titleColor + t + colors.reset + borderColor + h.repeat(rightPad) + tr;
    }
  }
  process.stdout.write(moveTo(startRow, startCol) + borderColor + top + colors.reset);
  for (let r = 1; r < height - 1; r++) {
    const fill = fillColor ? fillColor + " ".repeat(innerWidth) + colors.reset : " ".repeat(innerWidth);
    process.stdout.write(moveTo(startRow + r, startCol) + borderColor + v + colors.reset + fill + borderColor + v + colors.reset);
  }
  process.stdout.write(moveTo(startRow + height - 1, startCol) + borderColor + bl + h.repeat(innerWidth) + br + colors.reset);
}

// src/logo.js
var LOGO_COMPACT = [
  "  \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557  \u2588\u2588\u2557     \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557     \u2588\u2588\u2557",
  " \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D \u2588\u2588\u2551\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551  \u2588\u2588\u2551    \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551     \u2588\u2588\u2551",
  " \u2588\u2588\u2551  \u2588\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2557     \u2588\u2588\u2551   \u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551     \u2588\u2588\u2551",
  " \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u255D  \u2588\u2588\u2554\u2550\u2550\u255D     \u2588\u2588\u2551   \u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551    \u2588\u2588\u2551     \u2588\u2588\u2551     \u2588\u2588\u2551",
  " \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551    \u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551",
  "  \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D     \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D    \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D    \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D"
];
var TAGLINE = "\u2726  Browse & Download GitHub Repositories  \u2726";
var VERSION = "v1.0.0";
function getLogoLines() {
  const { cols } = getTermSize();
  const logoToUse = cols < 100 ? LOGO_COMPACT : LOGO_COMPACT;
  return logoToUse;
}
function renderLogo(startRow) {
  const { cols } = getTermSize();
  const logoLines = getLogoLines();
  let row = startRow;
  for (const line of logoLines) {
    const cleanLen = line.replace(/\s+$/, "").length;
    const col = Math.max(1, Math.floor((cols - cleanLen) / 2) + 1);
    writeAt(row, col, colors.brightCyan + colors.bold + line + colors.reset);
    row++;
  }
  row++;
  const tagline = colors.cyan + colors.dim + TAGLINE + colors.reset;
  const taglineClean = TAGLINE;
  const tagCol = Math.max(1, Math.floor((cols - taglineClean.length) / 2) + 1);
  writeAt(row, tagCol, tagline);
  row++;
  const ver = colors.gray + VERSION + colors.reset;
  const verCol = Math.max(1, Math.floor((cols - VERSION.length) / 2) + 1);
  writeAt(row, verCol, ver);
  row++;
  return row + 1;
}
function getLogoHeight() {
  return getLogoLines().length + 4;
}

// src/input-screen.js
var import_child_process = require("child_process");
var PLACEHOLDER = "github.com/owner/repo";
var InputScreen = class {
  constructor() {
    this._value = "";
    this._cursorPos = 0;
    this._blinkState = true;
    this._blinkInterval = null;
    this._resolve = null;
    this._reject = null;
    this._status = null;
    this._statusType = null;
    this._onData = null;
    this._scrollOffset = 0;
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
    const logoStartRow = 2;
    const nextRow = renderLogo(logoStartRow);
    const sepRow = nextRow;
    const sepWidth = Math.min(cols - 4, 80);
    const sep = colors.cyan + colors.dim + "\u2500".repeat(sepWidth) + colors.reset;
    const sepCol = Math.max(1, Math.floor((cols - sepWidth) / 2) + 1);
    writeAt(sepRow, sepCol, sep);
    const boxWidth = Math.min(70, cols - 4);
    const boxHeight = 5;
    const boxCol = Math.floor((cols - boxWidth) / 2) + 1;
    const boxRow = sepRow + 2;
    drawBox(boxRow, boxCol, boxWidth, boxHeight, {
      borderColor: colors.cyan,
      title: " Enter GitHub Repository URL ",
      titleColor: colors.brightCyan + colors.bold
    });
    const innerWidth = boxWidth - 4;
    const inputRow = boxRow + 2;
    const inputCol = boxCol + 2;
    this._inputRow = inputRow;
    this._inputCol = inputCol;
    this._innerWidth = innerWidth;
    this._drawInputLine();
    const hintRow = boxRow + boxHeight + 1;
    const hint = colors.gray + "\u21B5 Enter to fetch  \u2022  Ctrl+V/Right-Click to paste  \u2022  Ctrl+C to exit" + colors.reset;
    const hintCol = Math.floor((cols - 70) / 2) + 1;
    writeAt(hintRow, hintCol, hint);
    if (this._status) {
      const statusRow = hintRow + 2;
      this._renderStatus(statusRow, this._status, this._statusType);
    }
    const ctrlRow = rows - 3;
    const ctrl = [
      colors.gray + "[\u21B5] Fetch  " + colors.reset,
      colors.gray + "[Ctrl+C] Quit" + colors.reset
    ].join(colors.dim + "  \u2502  " + colors.reset);
    const ctrlClean = "[\u21B5] Fetch    \u2502    [Ctrl+C] Quit";
    const ctrlCol = Math.floor((cols - ctrlClean.length) / 2) + 1;
    writeAt(ctrlRow, ctrlCol, ctrl);
    process.stdout.write(moveTo(rows, 1));
  }
  // Draws just the input field content (used by both _render and _renderCursorOnly)
  _drawInputLine() {
    const innerWidth = this._innerWidth;
    const inputRow = this._inputRow;
    const inputCol = this._inputCol;
    let displayVal = this._value;
    let cursorDisplayPos = this._cursorPos;
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
      const atCursor = displayVal[cursorDisplayPos] || " ";
      const cursorChar = this._blinkState ? colors.bgCyan + colors.black + atCursor + colors.reset : colors.brightWhite + atCursor + colors.reset;
      const after = colors.brightWhite + displayVal.slice(cursorDisplayPos + 1) + colors.reset;
      lineContent = before + cursorChar + after;
    }
    const padded = lineContent + " ".repeat(Math.max(0, innerWidth - visibleLength(lineContent)));
    writeAt(inputRow, inputCol, padded);
    const { rows } = getTermSize();
    process.stdout.write(moveTo(rows, 1));
  }
  _renderStatus(row, msg, type) {
    const { cols } = getTermSize();
    const icons = { info: "\u2139", success: "\u2714", error: "\u2716", warning: "\u26A0" };
    const clr = {
      info: colors.cyan,
      success: colors.brightGreen,
      error: colors.brightRed,
      warning: colors.yellow
    };
    const icon = icons[type] || "\u2139";
    const color = clr[type] || colors.cyan;
    const text = `${color}${color === colors.brightGreen ? colors.bold : ""}  ${icon}  ${msg}  ${colors.reset}`;
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
    if (!this._inputRow)
      return;
    this._drawInputLine();
  }
  _attachInput() {
    const stdin = process.stdin;
    if (this._onData) {
      stdin.removeListener("data", this._onData);
      this._onData = null;
    }
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.setEncoding("utf8");
    this._onData = (key) => this._handleKey(key);
    stdin.on("data", this._onData);
  }
  _detachInput() {
    clearInterval(this._blinkInterval);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    if (this._onData) {
      process.stdin.removeListener("data", this._onData);
      this._onData = null;
    }
  }
  _handleKey(key) {
    if (key.length > 1 && key !== "\r" && key !== "\n") {
      let pasteText = key.replace(/\x16/g, "").replace(/\x1b\[2~/g, "").replace(/\x1b\[200~/g, "").replace(/[\r\n]/g, "");
      if (pasteText.length > 3 || pasteText.includes("github.com")) {
        if (process.platform === "win32") {
          try {
            const clipboard = (0, import_child_process.execSync)('powershell -Command "Get-Clipboard -Raw"', { encoding: "utf8", timeout: 500 }).trim();
            if (clipboard && clipboard.length > 0 && clipboard.length < 500) {
              this._value = this._value.slice(0, this._cursorPos) + clipboard + this._value.slice(this._cursorPos);
              this._cursorPos += clipboard.length;
              this._blinkState = true;
              this._render();
              return;
            }
          } catch (e) {
          }
        }
        if (pasteText.length > 0) {
          this._value = this._value.slice(0, this._cursorPos) + pasteText + this._value.slice(this._cursorPos);
          this._cursorPos += pasteText.length;
          this._blinkState = true;
          this._render();
        }
        return;
      }
    }
    if (key === "") {
      if (process.platform === "win32") {
        try {
          const clipboard = (0, import_child_process.execSync)('powershell -Command "Get-Clipboard -Raw"', { encoding: "utf8", timeout: 500 }).trim();
          if (clipboard && clipboard.length > 0 && clipboard.length < 500) {
            this._value = this._value.slice(0, this._cursorPos) + clipboard + this._value.slice(this._cursorPos);
            this._cursorPos += clipboard.length;
            this._blinkState = true;
            this._render();
          }
        } catch (e) {
        }
      }
      return;
    }
    if (key === "") {
      this._detachInput();
      showCursor();
      process.stdout.write("\n");
      process.exit(0);
    }
    if (key === "\r" || key === "\n") {
      const val = this._value.trim();
      if (!val) {
        this._status = "Please enter a GitHub repository URL";
        this._statusType = "warning";
        this._render();
        return;
      }
      this._detachInput();
      showCursor();
      this._resolve(val);
      return;
    }
    if (key === "\x7F" || key === "\b") {
      if (this._cursorPos > 0) {
        this._value = this._value.slice(0, this._cursorPos - 1) + this._value.slice(this._cursorPos);
        this._cursorPos--;
        this._blinkState = true;
        this._render();
      }
      return;
    }
    if (key === "\x1B[3~") {
      if (this._cursorPos < this._value.length) {
        this._value = this._value.slice(0, this._cursorPos) + this._value.slice(this._cursorPos + 1);
        this._render();
      }
      return;
    }
    if (key === "\x1B[D") {
      if (this._cursorPos > 0) {
        this._cursorPos--;
        this._blinkState = true;
        this._renderCursorOnly();
      }
      return;
    }
    if (key === "\x1B[C") {
      if (this._cursorPos < this._value.length) {
        this._cursorPos++;
        this._blinkState = true;
        this._renderCursorOnly();
      }
      return;
    }
    if (key === "\x1B[H" || key === "") {
      this._cursorPos = 0;
      this._scrollOffset = 0;
      this._blinkState = true;
      this._render();
      return;
    }
    if (key === "\x1B[F" || key === "") {
      this._cursorPos = this._value.length;
      this._blinkState = true;
      this._render();
      return;
    }
    if (key.startsWith("\x1B"))
      return;
    if (key.length === 1 && key >= " ") {
      this._value = this._value.slice(0, this._cursorPos) + key + this._value.slice(this._cursorPos);
      this._cursorPos++;
      this._blinkState = true;
      this._render();
    }
  }
};

// src/file-browser.js
var FileBrowser = class {
  constructor(tree, repoMeta) {
    this._fullTree = tree;
    this._repoMeta = repoMeta;
    this._currentPath = "";
    this._currentItems = [];
    this._selectedPaths = /* @__PURE__ */ new Set();
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
      this._loadDirectory("");
      this._render();
      this._attachInput();
    });
  }
  _loadDirectory(path2) {
    this._currentPath = path2;
    this._cursor = 0;
    this._scrollTop = 0;
    const prefix = path2 ? path2 + "/" : "";
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    for (const node of this._fullTree) {
      if (!node.path.startsWith(prefix))
        continue;
      const rest = node.path.slice(prefix.length);
      const name = rest.split("/")[0];
      if (!name || seen.has(name))
        continue;
      seen.add(name);
      const isDir = rest.includes("/") || node.type === "tree";
      items.push({
        name,
        fullPath: prefix + name,
        type: isDir ? "dir" : "file",
        sha: node.sha,
        url: node.url,
        size: node.size
      });
    }
    items.sort((a, b) => {
      if (a.type !== b.type)
        return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    this._currentItems = items;
  }
  _getVisibleRows() {
    const { rows } = getTermSize();
    const logoH = getLogoHeight();
    const metaH = 5;
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
    const nextRow = renderLogo(1);
    const metaRow = nextRow;
    this._renderMeta(metaRow);
    const listStartRow = metaRow + 5;
    this._renderFileList(listStartRow);
    const visRows = this._getVisibleRows();
    const listBoxHeight = visRows + 4;
    const statusRow = listStartRow + listBoxHeight + 1;
    if (this._status) {
      this._renderStatus(statusRow, this._status, this._statusType);
    }
    this._renderHints(rows - 2);
  }
  _renderMeta(startRow) {
    const { cols } = getTermSize();
    const m = this._repoMeta;
    const boxWidth = Math.min(80, cols - 4);
    const boxCol = Math.floor((cols - boxWidth) / 2) + 1;
    drawBox(startRow, boxCol, boxWidth, 4, {
      borderColor: colors.green,
      title: " Repository Info ",
      titleColor: colors.brightGreen + colors.bold
    });
    const inner = boxWidth - 4;
    const stars = `\u2B50 ${(m.stargazers_count || 0).toLocaleString()}`;
    const forks = `\u{1F374} ${(m.forks_count || 0).toLocaleString()}`;
    const lang = m.language ? `\u{1F524} ${m.language}` : "";
    const titleStr = `${colors.brightWhite}${colors.bold}${m.full_name}${colors.reset}  ${colors.yellow}${stars}${colors.reset}  ${colors.cyan}${forks}${colors.reset}${lang ? `  ${colors.magenta}${lang}${colors.reset}` : ""}`;
    const descStr = m.description ? colors.gray + truncate(m.description, inner - 2) + colors.reset : colors.gray + colors.dim + "(no description)" + colors.reset;
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
    const crumb = this._currentPath ? `\u{1F4C1} /${this._currentPath}` : "\u{1F4C1} / (root)";
    const crumbDisplay = truncate(crumb, 40);
    drawBox(startRow, boxCol, boxWidth, boxHeight, {
      borderColor: colors.cyan,
      title: ` ${crumbDisplay} `,
      titleColor: colors.brightCyan + colors.bold
    });
    const headerRow = startRow + 1;
    const selCol = boxCol + 2;
    const nameCol = boxCol + 6;
    const nameWidth = inner - 14;
    const sizeWidth = 10;
    writeAt(
      headerRow,
      selCol,
      colors.gray + colors.dim + padRight("  \u2713  Name", nameWidth + 6) + padRight("Size", sizeWidth) + colors.reset
    );
    writeAt(
      headerRow + 1,
      boxCol + 1,
      colors.cyan + colors.dim + "\u2500".repeat(boxWidth - 2) + colors.reset
    );
    const end = Math.min(this._scrollTop + visRows, this._currentItems.length);
    let r = headerRow + 2;
    for (let i = this._scrollTop; i < end; i++) {
      const item = this._currentItems[i];
      const isSelected = this._cursor === i;
      const isChecked = this._selectedPaths.has(item.fullPath);
      const icon = item.type === "dir" ? "\u{1F4C1}" : "\u{1F4C4}";
      const checkbox = isChecked ? colors.brightGreen + "[\u2714]" + colors.reset : colors.gray + "[ ]" + colors.reset;
      let nameColor = item.type === "dir" ? colors.brightCyan + colors.bold : colors.brightWhite;
      const displayName = truncate(item.name, nameWidth);
      const sizeStr = item.type === "file" && item.size != null ? formatSize(item.size) : "";
      let line;
      if (isSelected) {
        const bg = colors.bgBlue;
        line = bg + colors.brightWhite + colors.bold + " " + (isChecked ? "[\u2714]" : "[ ]") + " " + icon + " " + padRight(displayName, nameWidth) + colors.dim + padRight(sizeStr, sizeWidth) + colors.reset;
      } else {
        line = " " + checkbox + " " + nameColor + icon + " " + padRight(displayName, nameWidth) + colors.reset + colors.gray + padRight(sizeStr, sizeWidth) + colors.reset;
      }
      writeAt(r, boxCol + 1, line);
      r++;
    }
    if (this._currentItems.length === 0) {
      const msg = colors.gray + colors.dim + "(empty directory)" + colors.reset;
      const msgCol = Math.floor((cols - 17) / 2) + 1;
      writeAt(r + 1, msgCol, msg);
    }
    if (this._scrollTop > 0) {
      writeAt(startRow + 3, boxCol + Math.floor(boxWidth / 2), colors.cyan + "\u25B2" + colors.reset);
    }
    if (end < this._currentItems.length) {
      writeAt(startRow + boxHeight - 2, boxCol + Math.floor(boxWidth / 2), colors.cyan + "\u25BC" + colors.reset);
    }
    const countStr = colors.gray + `${this._currentItems.length} items  \u2022  ${this._selectedPaths.size} selected` + colors.reset;
    const countClean = `${this._currentItems.length} items  \u2022  ${this._selectedPaths.size} selected`;
    const countCol = Math.floor((cols - countClean.length) / 2) + 1;
    writeAt(startRow + boxHeight - 1, countCol, countStr);
  }
  _renderStatus(row, msg, type) {
    const { cols } = getTermSize();
    const icons = { info: "\u2139", success: "\u2714", error: "\u2716", warning: "\u26A0" };
    const clr = {
      info: colors.cyan,
      success: colors.brightGreen,
      error: colors.brightRed,
      warning: colors.yellow
    };
    const icon = icons[type] || "\u2139";
    const color = clr[type] || colors.cyan;
    const text = `${color}  ${icon}  ${msg}  ${colors.reset}`;
    const cleanText = `  ${icon}  ${msg}  `;
    const col = Math.max(1, Math.floor((cols - cleanText.length) / 2) + 1);
    writeAt(row, col, text);
  }
  _renderHints(row) {
    const { cols } = getTermSize();
    const hints = [
      colors.gray + "[\u2191\u2193] Navigate" + colors.reset,
      colors.gray + "[Space] Select" + colors.reset,
      colors.gray + "[\u21B5] Open Dir" + colors.reset,
      colors.gray + "[Esc] Back" + colors.reset,
      colors.cyan + "[Ctrl+A] Clone Repo" + colors.reset,
      colors.green + "[Ctrl+D] Download Selected" + colors.reset,
      colors.dim + colors.gray + "[Ctrl+C] Quit" + colors.reset
    ];
    const sep = colors.dim + colors.gray + " \u2502 " + colors.reset;
    const line = hints.join(sep);
    const cleanLine = "[\u2191\u2193] Navigate \u2502 [Space] Select \u2502 [\u21B5] Open Dir \u2502 [Esc] Back \u2502 [Ctrl+A] Clone Repo \u2502 [Ctrl+D] Download Selected \u2502 [Ctrl+C] Quit";
    const lineCol = Math.max(1, Math.floor((cols - cleanLine.length) / 2) + 1);
    writeAt(row, lineCol, line);
  }
  _attachInput() {
    const stdin = process.stdin;
    if (stdin.isTTY)
      stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    this._onData = (key) => this._handleKey(key);
    stdin.on("data", this._onData);
    this._resizeListener = () => {
      this._scrollTop = Math.min(
        this._scrollTop,
        Math.max(0, this._currentItems.length - this._getVisibleRows())
      );
      this._render();
    };
    process.stdout.on("resize", this._resizeListener);
  }
  _detachInput() {
    if (process.stdin.isTTY)
      process.stdin.setRawMode(false);
    process.stdin.pause();
    if (this._onData) {
      process.stdin.removeListener("data", this._onData);
      this._onData = null;
    }
    if (this._resizeListener) {
      process.stdout.removeListener("resize", this._resizeListener);
      this._resizeListener = null;
    }
  }
  _handleKey(key) {
    const visRows = this._getVisibleRows();
    if (key === "") {
      this._detachInput();
      showCursor();
      process.stdout.write("\n");
      process.exit(0);
    }
    if (key === "") {
      this._detachInput();
      showCursor();
      this._resolve({ action: "clone" });
      return;
    }
    if (key === "") {
      if (this._selectedPaths.size === 0) {
        this._status = "No files selected. Use Space to select files.";
        this._statusType = "warning";
        this._render();
        return;
      }
      this._detachInput();
      showCursor();
      this._resolve({ action: "download", paths: Array.from(this._selectedPaths) });
      return;
    }
    if (key === "\x1B") {
      if (this._currentPath) {
        const parts = this._currentPath.split("/");
        parts.pop();
        this._loadDirectory(parts.join("/"));
        this._status = null;
        this._render();
      }
      return;
    }
    if (key === "\x1B[A") {
      if (this._cursor > 0) {
        this._cursor--;
        if (this._cursor < this._scrollTop) {
          this._scrollTop = this._cursor;
        }
        this._render();
      }
      return;
    }
    if (key === "\x1B[C" && key.length === 3) {
      return;
    }
    if (key === "\x1B[B") {
      if (this._cursor < this._currentItems.length - 1) {
        this._cursor++;
        if (this._cursor >= this._scrollTop + visRows) {
          this._scrollTop = this._cursor - visRows + 1;
        }
        this._render();
      }
      return;
    }
    if (key === "\x1B[5~") {
      this._cursor = Math.max(0, this._cursor - visRows);
      this._scrollTop = Math.max(0, this._scrollTop - visRows);
      this._render();
      return;
    }
    if (key === "\x1B[6~") {
      this._cursor = Math.min(this._currentItems.length - 1, this._cursor + visRows);
      this._scrollTop = Math.min(
        Math.max(0, this._currentItems.length - visRows),
        this._scrollTop + visRows
      );
      this._render();
      return;
    }
    if (key === " ") {
      const item = this._currentItems[this._cursor];
      if (!item)
        return;
      if (this._selectedPaths.has(item.fullPath)) {
        this._selectedPaths.delete(item.fullPath);
        for (const p of this._selectedPaths) {
          if (p.startsWith(item.fullPath + "/")) {
            this._selectedPaths.delete(p);
          }
        }
      } else {
        this._selectedPaths.add(item.fullPath);
        if (item.type === "dir") {
          for (const node of this._fullTree) {
            if (node.path.startsWith(item.fullPath + "/") && node.type === "blob") {
              this._selectedPaths.add(node.path);
            }
          }
        }
      }
      this._status = null;
      this._render();
      return;
    }
    if (key === "\r" || key === "\n") {
      const item = this._currentItems[this._cursor];
      if (!item)
        return;
      if (item.type === "dir") {
        this._loadDirectory(item.fullPath);
        this._status = null;
        this._render();
      } else {
        this._status = `  "${item.name}"  Press Space to select, Ctrl+D to download`;
        this._statusType = "info";
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
};
function formatSize(bytes) {
  if (!bytes)
    return "";
  if (bytes < 1024)
    return `${bytes}B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / 1024 / 1024).toFixed(1)}M`;
}

// src/github.js
var import_https = __toESM(require("https"));
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        "User-Agent": "GitFetch-CLI/1.0.0",
        "Accept": "application/vnd.github.v3+json",
        ...headers
      }
    };
    const req = import_https.default.get(url, opts, (res) => {
      let data = "";
      console.error(`[DEBUG] GitHub API Response: ${res.statusCode} ${res.statusMessage}`);
      console.error(`[DEBUG] Request URL: ${url}`);
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          console.error(`[DEBUG] Redirect to: ${res.headers.location}`);
          return httpGet(res.headers.location, headers).then(resolve).catch(reject);
        }
        if (res.statusCode === 404) {
          console.error(`[DEBUG] Repository not found at: ${url}`);
          return reject(new Error(`Repository not found (404). Check the URL and try again.
URL: ${url}`));
        }
        if (res.statusCode === 403) {
          console.error(`[DEBUG] Rate limited or forbidden. Headers: ${JSON.stringify(res.headers)}`);
          return reject(new Error("GitHub API rate limit exceeded. Try again later or add a GitHub token."));
        }
        if (res.statusCode !== 200) {
          console.error(`[DEBUG] API Error: ${res.statusCode} - ${data.substring(0, 200)}`);
          return reject(new Error(`GitHub API error: HTTP ${res.statusCode}
${data.substring(0, 100)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error(`[DEBUG] JSON parse error: ${e.message}, data: ${data.substring(0, 100)}`);
          reject(new Error("Failed to parse API response"));
        }
      });
    });
    req.on("error", (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });
    req.setTimeout(15e3, () => {
      req.destroy();
      reject(new Error("Request timed out after 15s"));
    });
  });
}
function parseGitHubUrl(input) {
  let url = input.trim().replace(/^https?:\/\//i, "").replace(/^github\.com\//i, "").replace(/\.git$/, "").replace(/\/$/, "");
  console.error(`[DEBUG] Parsed URL: "${url}"`);
  const parts = url.split("/").filter(Boolean);
  console.error(`[DEBUG] URL parts: ${JSON.stringify(parts)}`);
  if (parts.length < 2) {
    throw new Error(`Invalid GitHub URL. Format: github.com/owner/repo
Got: "${input}"`);
  }
  console.error(`[DEBUG] Extracted owner: "${parts[0]}", repo: "${parts[1]}"`);
  return { owner: parts[0], repo: parts[1] };
}
async function fetchRepoMetadata(owner, repo, token) {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  return httpGet(url, headers);
}
async function fetchFileTree(owner, repo, sha = "HEAD", token) {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
  const data = await httpGet(url, headers);
  if (data.truncated) {
    const rootUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`;
    return httpGet(rootUrl, headers);
  }
  return data;
}

// src/downloader.js
var import_child_process2 = require("child_process");
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var import_https2 = __toESM(require("https"));
function renderProgress(message, current, total, statusLines = []) {
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
    title: " Downloading ",
    titleColor: colors.brightCyan + colors.bold
  });
  const msgRow = boxRow + 2;
  const msg = colors.brightWhite + message + colors.reset;
  const msgCol = boxCol + 2;
  writeAt(msgRow, msgCol, msg);
  if (total > 0) {
    const barWidth = boxWidth - 10;
    const filled = Math.round(current / total * barWidth);
    const empty = barWidth - filled;
    const pct = Math.round(current / total * 100);
    const bar = colors.brightGreen + "\u2588".repeat(filled) + colors.gray + "\u2591".repeat(empty) + colors.reset;
    const pctStr = colors.yellow + ` ${pct}%` + colors.reset;
    writeAt(msgRow + 2, boxCol + 3, bar + pctStr);
    writeAt(msgRow + 3, boxCol + 2, colors.gray + `${current} / ${total} files` + colors.reset);
  }
  for (let i = 0; i < statusLines.length; i++) {
    writeAt(msgRow + 5 + i, boxCol + 2, colors.dim + colors.gray + statusLines[i] + colors.reset);
  }
}
async function downloadSelectedFiles(owner, repo, branch, selectedPaths, token, onProgress) {
  const outDir = import_path.default.join(process.cwd(), `${repo}-files`);
  import_fs.default.mkdirSync(outDir, { recursive: true });
  const filePaths = selectedPaths.filter((p) => {
    return true;
  });
  let done = 0;
  const errors = [];
  for (const filePath of filePaths) {
    onProgress && onProgress(filePath, done, filePaths.length);
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    const destPath = import_path.default.join(outDir, filePath);
    try {
      await downloadRaw(rawUrl, destPath, token);
      done++;
    } catch (err) {
      errors.push(`Failed: ${filePath} \u2014 ${err.message}`);
      done++;
    }
  }
  return { outDir, errors, total: filePaths.length };
}
function downloadRaw(url, destPath, token) {
  return new Promise((resolve, reject) => {
    const dir = import_path.default.dirname(destPath);
    import_fs.default.mkdirSync(dir, { recursive: true });
    const headers = { "User-Agent": "GitFetch-CLI/1.0.0" };
    if (token)
      headers["Authorization"] = `token ${token}`;
    const doGet = (targetUrl) => {
      const file = import_fs.default.createWriteStream(destPath);
      import_https2.default.get(targetUrl, { headers }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          import_fs.default.unlink(destPath, () => {
          });
          return doGet(res.headers.location);
        }
        if (res.statusCode !== 200) {
          file.close();
          import_fs.default.unlink(destPath, () => {
          });
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
        file.on("error", (err) => {
          import_fs.default.unlink(destPath, () => {
          });
          reject(err);
        });
      }).on("error", (err) => {
        import_fs.default.unlink(destPath, () => {
        });
        reject(err);
      });
    };
    doGet(url);
  });
}
function cloneRepo(owner, repo, cloneUrl) {
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
      title: " Cloning Repository ",
      titleColor: colors.yellow + colors.bold
    });
    writeAt(
      boxRow + 2,
      boxCol + 2,
      colors.brightWhite + `Cloning ${colors.cyan}${owner}/${repo}${colors.reset}${colors.brightWhite} ...` + colors.reset
    );
    writeAt(
      boxRow + 3,
      boxCol + 2,
      colors.gray + `$ git clone ${cloneUrl}` + colors.reset
    );
    const destDir = import_path.default.join(process.cwd(), repo);
    const child = (0, import_child_process2.spawn)("git", ["clone", "--progress", cloneUrl, destDir], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    let outputLines = [];
    const maxLines = 4;
    const appendLine = (line) => {
      if (!line.trim())
        return;
      outputLines.push(line.trim());
      if (outputLines.length > maxLines)
        outputLines.shift();
      for (let i = 0; i < maxLines; i++) {
        const l = outputLines[i] || "";
        writeAt(
          boxRow + 5 + i,
          boxCol + 2,
          colors.gray + l.slice(0, boxWidth - 4).padEnd(boxWidth - 4, " ") + colors.reset
        );
      }
    };
    child.stdout.on("data", (d) => d.toString().split("\n").forEach(appendLine));
    child.stderr.on("data", (d) => d.toString().split("\n").forEach(appendLine));
    child.on("close", (code) => {
      showCursor();
      if (code === 0) {
        resolve({ destDir });
      } else {
        reject(new Error(`git clone exited with code ${code}`));
      }
    });
    child.on("error", (err) => {
      showCursor();
      reject(new Error(`git not found: ${err.message}`));
    });
  });
}

// src/app.js
var App = class {
  constructor() {
    this._token = process.env.GITHUB_TOKEN || null;
  }
  async start() {
    process.stdout.on("resize", () => {
    });
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
      return this._runInputScreen(e.message, "error");
    }
    const { owner, repo } = parsed;
    this._showLoading(`Fetching ${owner}/${repo} \u2026`);
    let meta, tree;
    try {
      meta = await fetchRepoMetadata(owner, repo, this._token);
    } catch (e) {
      this._stopLoading();
      return this._runInputScreen(e.message, "error");
    }
    this._stopLoading();
    this._showLoading(`Fetching file tree for ${owner}/${repo} \u2026`);
    try {
      const branch = meta.default_branch || "main";
      const treeData = await fetchFileTree(owner, repo, branch, this._token);
      tree = treeData.tree || [];
    } catch (e) {
      this._stopLoading();
      return this._runInputScreen(`Tree fetch failed: ${e.message}`, "error");
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
      return this._runInputScreen(e.message, "error");
    }
    if (result.action === "clone") {
      await this._handleClone(meta);
    } else if (result.action === "download") {
      await this._handleDownload(meta, tree, result.paths);
    }
  }
  async _handleClone(meta) {
    const cloneUrl = meta.clone_url || `https://github.com/${meta.full_name}.git`;
    try {
      const { destDir } = await cloneRepo(meta.owner.login, meta.name, cloneUrl);
      await this._showResult("success", [
        `Repository cloned successfully!`,
        `Location: ${destDir}`
      ], meta);
    } catch (e) {
      await this._showResult("error", [
        `Clone failed: ${e.message}`,
        `Make sure git is installed and accessible.`
      ], meta);
    }
  }
  async _handleDownload(meta, tree, selectedPaths) {
    const owner = meta.owner.login;
    const repo = meta.name;
    const branch = meta.default_branch || "main";
    const blobPaths = /* @__PURE__ */ new Set();
    for (const sel of selectedPaths) {
      const blob = tree.find((n) => n.path === sel && n.type === "blob");
      if (blob) {
        blobPaths.add(sel);
      } else {
        for (const node of tree) {
          if (node.type === "blob" && (node.path === sel || node.path.startsWith(sel + "/"))) {
            blobPaths.add(node.path);
          }
        }
      }
    }
    const paths = Array.from(blobPaths);
    if (paths.length === 0) {
      return this._runBrowserAgain(meta, tree, "No files found in selection.", "warning");
    }
    renderProgress("Preparing download\u2026", 0, paths.length);
    let statusLines = [];
    const { outDir, errors, total } = await downloadSelectedFiles(
      owner,
      repo,
      branch,
      paths,
      this._token,
      (filePath, done, total2) => {
        statusLines.unshift(filePath);
        if (statusLines.length > 3)
          statusLines = statusLines.slice(0, 3);
        renderProgress(`Downloading files\u2026`, done, total2, statusLines);
      }
    );
    const successCount = total - errors.length;
    const lines = [
      `Downloaded ${successCount}/${total} files successfully`,
      `Output directory: ${outDir}`
    ];
    if (errors.length > 0) {
      lines.push(`${errors.length} error(s) occurred (see above)`);
    }
    await this._showResult(errors.length === 0 ? "success" : "warning", lines, meta);
  }
  async _runBrowserAgain(meta, tree, msg, type) {
    const browser = new FileBrowser(tree, meta);
    browser._status = msg;
    browser._statusType = type;
    const result = await browser.show();
    if (result.action === "clone") {
      await this._handleClone(meta);
    } else if (result.action === "download") {
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
      title: " Loading ",
      titleColor: colors.yellow + colors.bold
    });
    const spinner = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
    let i = 0;
    const msgRow = boxRow + 2;
    const msgCol = boxCol + 3;
    writeAt(msgRow, msgCol, colors.yellow + spinner[0] + "  " + colors.brightWhite + message + colors.reset);
    this._spinnerInterval = setInterval(() => {
      i = (i + 1) % spinner.length;
      writeAt(msgRow, msgCol, colors.yellow + spinner[i] + "  " + colors.brightWhite + message + colors.reset);
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
    const isSuccess = type === "success";
    const isError = type === "error";
    const borderColor = isSuccess ? colors.brightGreen : isError ? colors.brightRed : colors.yellow;
    const titleColor = borderColor + colors.bold;
    const titleText = isSuccess ? " \u2714 Success " : isError ? " \u2716 Error " : " \u26A0 Warning ";
    drawBox(boxRow, boxCol, boxWidth, boxHeight, {
      borderColor,
      title: titleText,
      titleColor
    });
    for (let i = 0; i < lines.length; i++) {
      writeAt(boxRow + 2 + i, boxCol + 3, colors.brightWhite + lines[i] + colors.reset);
    }
    const hint = colors.gray + "Press any key to continue\u2026" + colors.reset;
    const hintClean = "Press any key to continue\u2026";
    const hintCol = Math.floor((cols - hintClean.length) / 2) + 1;
    writeAt(boxRow + boxHeight + 2, hintCol, hint);
    await new Promise((resolve) => {
      const stdin = process.stdin;
      if (stdin.isTTY)
        stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");
      const onKey = (key) => {
        if (key === "") {
          showCursor();
          process.exit(0);
        }
        stdin.removeListener("data", onKey);
        if (stdin.isTTY)
          stdin.setRawMode(false);
        stdin.pause();
        resolve();
      };
      stdin.on("data", onKey);
    });
    await this._runInputScreen();
  }
};

// src/index.js
async function main() {
  const app = new App();
  await app.start();
}
main().catch((err) => {
  process.stderr.write(`
Fatal error: ${err.message}
`);
  process.exit(1);
});
