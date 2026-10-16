/**
 * Contador de frecuencia de palabras.
 *
 * Lógica pura (sin E/S) para poder testearla aislada del CLI.
 */

// Una palabra es una secuencia de letras o dígitos (Unicode, así "acción" o "ñandú" cuentan
// como una sola), que puede incluir apóstrofes o guiones internos ("don't", "bien-estar").
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

// Saltos de línea: \n (Unix), \r\n (Windows) y \r (Mac clásico).
const LINE_BREAKS = /\r\n|\r|\n/g;

const collator = new Intl.Collator('es', { sensitivity: 'base' });

/**
 * Cuenta caracteres incluyendo espacios y excluyendo saltos de línea.
 * Usa code points (no unidades UTF-16) para que un emoji cuente como 1.
 */
export function countCharacters(text) {
  return Array.from(text.replace(LINE_BREAKS, '')).length;
}

/** Extrae las palabras normalizadas a minúsculas. */
export function tokenize(text) {
  return (text.match(WORD_PATTERN) ?? []).map((word) => word.toLocaleLowerCase('es'));
}

/**
 * Devuelve [palabra, frecuencia] ordenado por frecuencia descendente y,
 * ante empate, alfabéticamente.
 */
export function wordFrequencies(words) {
  const counts = new Map();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);

  return [...counts.entries()].sort(([wordA, countA], [wordB, countB]) => {
    if (countA !== countB) return countB - countA;
    return collator.compare(wordA, wordB) || (wordA < wordB ? -1 : wordA > wordB ? 1 : 0);
  });
}

/** Analiza un texto completo. */
export function analyze(text) {
  const words = tokenize(text);
  return {
    words: words.length,
    characters: countCharacters(text),
    frequencies: wordFrequencies(words),
  };
}

/** Arma la salida en el formato pedido por el enunciado. */
export function formatReport({ words, characters, frequencies }, { bars = false } = {}) {
  const lines = [`${words} words`, `${characters} characters`, ''];

  const width = Math.max(0, ...frequencies.map(([word]) => word.length));
  for (const [word, count] of frequencies) {
    lines.push(bars ? `${`${word}:`.padEnd(width + 1)} ${'█'.repeat(count)} ${count}` : `${word}: ${count}`);
  }

  return lines.join('\n');
}
