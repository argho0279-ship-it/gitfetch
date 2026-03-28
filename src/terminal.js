// ANSI escape codes
const ESC = '\x1b';
const CSI = `${ESC}[`;

const colors = {
  reset:      `${CSI}0m`,
  bold:       `${CSI}1m`,
  dim:        `${CSI}2m`,
  blink:      `${CSI}5m`,
  reverse:    `${CSI}7m`,

  black:      `${CSI}30m`,
  red:        `${CSI}31m`,
  green:      `${CSI}32m`,
  yellow:     `${CSI}33m`,
  blue:       `${CSI}34m`,
  magenta:    `${CSI}35m`,
  cyan:       `${CSI}36m`,
  white:      `${CSI}37m`,
  gray:       `${CSI}90m`,

  bgBlack:    `${CSI}40m`,
  bgRed:      `${CSI}41m`,
  bgGreen:    `${CSI}42m`,
  bgYellow:   `${CSI}43m`,
  bgBlue:     `${CSI}44m`,
  bgMagenta:  `${CSI}45m`,
  bgCyan:     `${CSI}46m`,
  bgWhite:    `${CSI}47m`,
  bgGray:     `${CSI}100m`,

  brightCyan:    `${CSI}96m`,
  brightGreen:   `${CSI}92m`,
  brightYellow:  `${CSI}93m`,
  brightRed:     `${CSI}91m`,
  brightWhite:   `${CSI}97m`,
  brightMagenta: `${CSI}95m`,
};

function getTermSize() {
  return {
    cols: process.stdout.columns || 120,
    rows: process.stdout.rows || 40,
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

function saveCursor() {
  process.stdout.write(`${ESC}7`);
}

function restoreCursor() {
  process.stdout.write(`${ESC}8`);
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function visibleLength(str) {
  return stripAnsi(str).length;
}

function padCenter(str, width, padChar = ' ') {
  const len = visibleLength(str);
  if (len >= width) return str;
  const total = width - len;
  const left = Math.floor(total / 2);
  const right = total - left;
  return padChar.repeat(left) + str + padChar.repeat(right);
}

function padRight(str, width, padChar = ' ') {
  const len = visibleLength(str);
  if (len >= width) return str;
  return str + padChar.repeat(width - len);
}

function truncate(str, maxLen, suffix = '…') {
  const len = visibleLength(str);
  if (len <= maxLen) return str;
  return str.slice(0, maxLen - suffix.length) + suffix;
}

function writeAt(row, col, text) {
  process.stdout.write(moveTo(row, col) + text);
}

function drawBox(startRow, startCol, width, height, opts = {}) {
  const {
    borderColor = colors.cyan,
    fillColor = '',
    title = '',
    titleColor = colors.brightCyan + colors.bold,
  } = opts;

  const tl = '╔', tr = '╗', bl = '╚', br = '╝', h = '═', v = '║';

  const innerWidth = width - 2;
  const lines = [];

  // Top border
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
    const fill = fillColor ? fillColor + ' '.repeat(innerWidth) + colors.reset : ' '.repeat(innerWidth);
    process.stdout.write(moveTo(startRow + r, startCol) + borderColor + v + colors.reset + fill + borderColor + v + colors.reset);
  }

  process.stdout.write(moveTo(startRow + height - 1, startCol) + borderColor + bl + h.repeat(innerWidth) + br + colors.reset);
}

export {
  colors,
  getTermSize,
  moveTo,
  clearScreen,
  hideCursor,
  showCursor,
  saveCursor,
  restoreCursor,
  stripAnsi,
  visibleLength,
  padCenter,
  padRight,
  truncate,
  writeAt,
  drawBox,
};
