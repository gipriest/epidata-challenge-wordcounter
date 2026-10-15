import type { Keyword } from '../pages/WordCounterPage';

/**
 * Casos curados. Los valores esperados se calcularon a mano a partir de las reglas
 * documentadas en el README (sección "Supuestos"), no copiando lo que muestra el sitio.
 */

export type CountCase = { name: string; text: string; expected: number };
export type KeywordCase = { name: string; text: string; expected: Keyword[] };

export const wordCases: CountCase[] = [
  { name: 'texto vacío', text: '', expected: 0 },
  { name: 'solo espacios', text: '   ', expected: 0 },
  { name: 'una palabra', text: 'Hello', expected: 1 },
  { name: 'frase simple', text: 'Hello world', expected: 2 },
  { name: 'espacios múltiples entre palabras', text: 'uno   dos    tres', expected: 3 },
  { name: 'espacios al inicio y al final', text: '  hi  ', expected: 1 },
  { name: 'saltos de línea y párrafos', text: 'line one\nline two\n\nline three', expected: 6 },
  { name: 'tabulaciones', text: 'tab\tseparated\twords', expected: 3 },
  { name: 'puntuación pegada a las palabras', text: 'Hello world. This is a test, right?', expected: 7 },
  { name: 'puntuación separada por espacios', text: 'hello , world !', expected: 2 },
  { name: 'solo signos de puntuación', text: '... !!! ???', expected: 0 },
  { name: 'palabras con guion', text: 'well-known state-of-the-art', expected: 2 },
  { name: 'contracciones', text: "don't can't it's", expected: 3 },
  { name: 'números', text: '2026 3.14 1,000 42', expected: 4 },
  { name: 'acentos y ñ', text: 'café niño acción', expected: 3 },
  { name: 'alfabetos no latinos', text: 'Мир мир привет 世界 世界', expected: 5 },
];

export const characterCases: CountCase[] = [
  { name: 'texto vacío', text: '', expected: 0 },
  { name: 'solo espacios', text: '   ', expected: 3 },
  { name: 'una palabra', text: 'Hello', expected: 5 },
  { name: 'cuenta los espacios', text: 'Hello world', expected: 11 },
  { name: 'espacios múltiples', text: 'uno   dos    tres', expected: 17 },
  { name: 'espacios al inicio y al final', text: '  hi  ', expected: 6 },
  { name: 'puntuación', text: 'hello , world !', expected: 15 },
  { name: 'solo signos de puntuación', text: '... !!! ???', expected: 11 },
  { name: 'acentos y ñ', text: 'café niño acción', expected: 16 },
  { name: 'tabulaciones', text: 'tab\tseparated\twords', expected: 19 },
  { name: 'los saltos de línea no cuentan', text: 'line one\nline two', expected: 16 },
  { name: 'saltos de línea Windows (CRLF) no cuentan', text: 'a\r\nb', expected: 2 },
];

export const keywordCases: KeywordCase[] = [
  {
    name: 'top 3 con frecuencias distintas',
    text: 'The cat and the dog. The cat runs fast, the dog runs faster. Cat cat dog bird.',
    expected: [
      { word: 'cat', count: 4 },
      { word: 'dog', count: 3 },
      { word: 'runs', count: 2 },
    ],
  },
  {
    name: 'no distingue mayúsculas de minúsculas',
    text: 'Apple apple APPLE Banana banana cherry',
    expected: [
      { word: 'apple', count: 3 },
      { word: 'banana', count: 2 },
      { word: 'cherry', count: 1 },
    ],
  },
  {
    name: 'excluye stop words aunque sean las más repetidas',
    text: 'the the the the the and and and and of of of python python java java java swift',
    expected: [
      { word: 'java', count: 3 },
      { word: 'python', count: 2 },
      { word: 'swift', count: 1 },
    ],
  },
  {
    name: 'ignora la puntuación pegada',
    text: 'Data, data; DATA! science? science. art',
    expected: [
      { word: 'data', count: 3 },
      { word: 'science', count: 2 },
      { word: 'art', count: 1 },
    ],
  },
  {
    name: 'palabras con guion como una sola keyword',
    text: 'state-of-the-art design state-of-the-art design state-of-the-art code',
    expected: [
      { word: 'state-of-the-art', count: 3 },
      { word: 'design', count: 2 },
      { word: 'code', count: 1 },
    ],
  },
  {
    name: 'acentos',
    text: 'café café café latte latte mocha',
    expected: [
      { word: 'café', count: 3 },
      { word: 'latte', count: 2 },
      { word: 'mocha', count: 1 },
    ],
  },
  {
    name: 'empate: se ordena por primera aparición',
    text: 'zeta alpha beta zeta alpha beta gamma',
    expected: [
      { word: 'zeta', count: 2 },
      { word: 'alpha', count: 2 },
      { word: 'beta', count: 2 },
    ],
  },
  {
    name: 'empate en el 3er puesto: queda la que aparece primero',
    text: 'apple banana apple banana apple cherry date cherry date',
    expected: [
      { word: 'apple', count: 3 },
      { word: 'banana', count: 2 },
      { word: 'cherry', count: 2 },
    ],
  },
  {
    name: 'menos de 3 palabras distintas',
    text: 'hello hello world',
    expected: [
      { word: 'hello', count: 2 },
      { word: 'world', count: 1 },
    ],
  },
  { name: 'texto vacío no muestra keywords', text: '', expected: [] },
];

/**
 * Consistencia: en textos sin stop words (y con menos de 10 palabras distintas, el
 * máximo que muestra el panel), la suma de Keyword Density debe igualar al contador
 * de palabras. Si no coinciden, los dos componentes separan las palabras distinto.
 */
export const consistencyCases: { name: string; text: string }[] = [
  { name: 'texto con puntuación normal', text: 'Hello world. Nice day, nice code!' },
  { name: 'palabras con guion y acentos', text: 'café well-known niño' },
];

/** Casos donde el sitio es inconsistente (ver "Defectos encontrados" en el README). */
export const consistencyDefectCases: { name: string; text: string }[] = [
  { name: 'puntuación sin espacios (one.two,three;four)', text: 'one.two,three;four' },
  { name: 'espacio de no separación (NBSP)', text: 'word word' },
  { name: 'URL y email', text: 'https://wordcounter.net test@example.com' },
];
