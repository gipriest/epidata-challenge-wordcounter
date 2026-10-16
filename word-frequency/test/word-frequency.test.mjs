import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { analyze, countCharacters, formatReport, tokenize, wordFrequencies } from '../src/word-frequency.mjs';

const EXPECTED_SAMPLE_OUTPUT = `14 words
99 characters

farmatodo: 6
cuida: 3
salud: 2
tu: 2
toda: 1`;

test('reproduce la salida del enunciado', async () => {
  const text = await readFile(new URL('../samples/ejemplo.txt', import.meta.url), 'utf8');
  assert.equal(formatReport(analyze(text)), EXPECTED_SAMPLE_OUTPUT);
});

test('los saltos de línea no cuentan como caracteres (\\n, \\r\\n y \\r)', () => {
  assert.equal(countCharacters('ab cd\nef'), 7);
  assert.equal(countCharacters('ab cd\r\nef'), 7);
  assert.equal(countCharacters('ab cd\ref'), 7);
});

test('los espacios y tabulaciones sí cuentan como caracteres', () => {
  assert.equal(countCharacters('a  b\tc'), 6);
});

test('un emoji cuenta como un carácter', () => {
  assert.equal(countCharacters('hola 👋'), 6);
});

test('ignora puntuación y normaliza a minúsculas', () => {
  assert.deepEqual(tokenize('¡Hola, HOLA! ¿hola?'), ['hola', 'hola', 'hola']);
});

test('respeta acentos, ñ y palabras con apóstrofe o guion', () => {
  assert.deepEqual(tokenize("Acción ñandú don't bien-estar"), ['acción', 'ñandú', "don't", 'bien-estar']);
});

test('desempata alfabéticamente', () => {
  assert.deepEqual(wordFrequencies(['zeta', 'beta', 'alfa', 'beta']), [
    ['beta', 2],
    ['alfa', 1],
    ['zeta', 1],
  ]);
});

test('texto vacío', () => {
  assert.equal(formatReport(analyze('')), '0 words\n0 characters\n');
});

test('modo histograma dibuja barras proporcionales', () => {
  const report = formatReport(analyze('a a a bb'), { bars: true });
  assert.equal(report.split('\n').slice(3).join('\n'), 'a:  ███ 3\nbb: █ 1');
});
