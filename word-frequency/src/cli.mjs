#!/usr/bin/env node
/**
 * Uso:
 *   node word-frequency/src/cli.mjs <archivo> [--bars]
 *
 *   --bars   además de la frecuencia, dibuja el histograma con barras.
 */
import { readFile } from 'node:fs/promises';
import { analyze, formatReport } from './word-frequency.mjs';

const args = process.argv.slice(2);
const bars = args.includes('--bars');
const file = args.find((arg) => !arg.startsWith('--'));

if (!file) {
  console.error('Uso: node word-frequency/src/cli.mjs <archivo> [--bars]');
  process.exit(1);
}

try {
  const text = await readFile(file, 'utf8');
  console.log(formatReport(analyze(text), { bars }));
} catch (error) {
  console.error(`No se pudo leer "${file}": ${error.message}`);
  process.exit(1);
}
