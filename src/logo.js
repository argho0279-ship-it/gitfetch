import { colors, getTermSize, padCenter, writeAt } from './terminal.js';

const LOGO_LINES = [
  '  ██████╗ ██╗████████╗███████╗███████╗████████╗ ██████╗██╗  ██╗',
  ' ██╔════╝ ██║╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║',
  ' ██║  ███╗██║   ██║   █████╗  █████╗     ██║   ██║     ███████║',
  ' ██║   ██║██║   ██║   ██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║',
  ' ╚██████╔╝██║   ██║   ██║     ███████╗   ██║   ╚██████╗██║  ██║',
  '  ╚═════╝ ╚═╝   ╚═╝   ╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝',
  '',
  '       ▄████▄   ██▓     ██▓',
  '      ▒██▀ ▀█  ▓██▒    ▓██▒',
  '      ▒▓█    ▄ ▒██░    ▒██▒',
  '      ▒▓▄ ▄██▒▒██░    ░██░',
  '      ▒ ▓███▀ ░░██████▒░██░',
  '      ░ ░▒ ▒  ░░ ▒░▓  ░░▓  ',
  '        ░  ▒   ░ ░ ▒  ░ ▒ ░',
  '      ░          ░ ░    ▒ ░',
  '      ░ ░          ░  ░ ░  ',
];

// Compact single-block logo for smaller terminals
const LOGO_COMPACT = [
  '  ██████╗ ██╗████████╗███████╗███████╗████████╗ ██████╗██╗  ██╗     ██████╗██╗     ██╗',
  ' ██╔════╝ ██║╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║    ██╔════╝██║     ██║',
  ' ██║  ███╗██║   ██║   █████╗  █████╗     ██║   ██║     ███████║    ██║     ██║     ██║',
  ' ██║   ██║██║   ██║   ██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║    ██║     ██║     ██║',
  ' ╚██████╔╝██║   ██║   ██║     ███████╗   ██║   ╚██████╗██║  ██║    ╚██████╗███████╗██║',
  '  ╚═════╝ ╚═╝   ╚═╝   ╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝    ╚═════╝╚══════╝╚═╝',
];

const TAGLINE = '✦  Browse & Download GitHub Repositories  ✦';
const VERSION = 'v1.0.0';

function getLogoLines() {
  const { cols } = getTermSize();
  // Use compact if terminal too narrow for split logo
  const logoToUse = cols < 100 ? LOGO_COMPACT : LOGO_COMPACT;
  return logoToUse;
}

function renderLogo(startRow) {
  const { cols } = getTermSize();
  const logoLines = getLogoLines();
  let row = startRow;

  // Draw each logo line centered
  for (const line of logoLines) {
    const cleanLen = line.replace(/\s+$/, '').length;
    const col = Math.max(1, Math.floor((cols - cleanLen) / 2) + 1);
    writeAt(row, col, colors.brightCyan + colors.bold + line + colors.reset);
    row++;
  }

  row++; // blank line

  // Tagline
  const tagline = colors.cyan + colors.dim + TAGLINE + colors.reset;
  const taglineClean = TAGLINE;
  const tagCol = Math.max(1, Math.floor((cols - taglineClean.length) / 2) + 1);
  writeAt(row, tagCol, tagline);
  row++;

  // Version
  const ver = colors.gray + VERSION + colors.reset;
  const verCol = Math.max(1, Math.floor((cols - VERSION.length) / 2) + 1);
  writeAt(row, verCol, ver);
  row++;

  return row + 1; // return next available row (with gap)
}

function getLogoHeight() {
  return getLogoLines().length + 4; // lines + tagline + version + gaps
}

export { renderLogo, getLogoHeight };
