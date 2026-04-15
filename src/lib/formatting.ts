// src/lib/formatting.ts
import chalk from 'chalk';
import type { ConfidenceLevel } from './types.js';

export { getConfidence } from '../shared/index.js';
export type { ConfidenceResult } from '../shared/index.js';

/** Strip ANSI escape codes for accurate width measurement */
// eslint-disable-next-line no-control-regex
const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*m/g, '');

/** Pad a string that may contain ANSI codes to a visible width */
function padEndVisible(s: string, width: number): string {
  const visible = stripAnsi(s).length;
  return s + ' '.repeat(Math.max(0, width - visible));
}

/**
 * Simple table formatter for terminal output.
 * Pads columns to the widest value per column.
 */
export function formatTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) =>
    Math.max(stripAnsi(h).length, ...rows.map((r) => stripAnsi(r[i] || '').length))
  );

  const sep = widths.map((w) => '-'.repeat(w + 2)).join('+');
  const fmtRow = (cells: string[]) =>
    cells.map((c, i) => ` ${padEndVisible(c || '', widths[i])} `).join('|');

  const lines = [fmtRow(headers), sep, ...rows.map(fmtRow)];
  return lines.join('\n');
}

/** Colorize test status */
export function colorStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'running':
      return chalk.green(status);
    case 'paused':
    case 'stopped':
      return chalk.yellow(status);
    case 'completed':
      return chalk.blue(status);
    case 'error':
      return chalk.red(status);
    case 'draft':
    case 'building':
      return chalk.gray(status);
    default:
      return status;
  }
}

/** Colorize confidence level */
export function colorConfidence(level: ConfidenceLevel): string {
  switch (level) {
    case 'winner':
      return chalk.green.bold('Winner');
    case 'significant':
      return chalk.blue('Significant');
    case 'not-significant':
      return chalk.gray('Not significant');
    case 'low-data':
      return chalk.yellow('Low data');
    default:
      return level;
  }
}

/** Format uplift percentage */
export function formatUplift(controlRate: number, variantRate: number): string {
  if (controlRate === 0) return 'N/A';
  const pct = ((variantRate - controlRate) / controlRate) * 100;
  const sign = pct >= 0 ? '+' : '';
  const formatted = `${sign}${pct.toFixed(1)}%`;
  if (pct > 0) return chalk.green(formatted);
  if (pct < 0) return chalk.red(formatted);
  return formatted;
}
