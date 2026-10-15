import { faker } from '@faker-js/faker';
import type { Keyword } from '../pages/WordCounterPage';

/** Cuenta palabras como secuencias separadas por espacios (válido para textos sin puntuación). */
export const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

/**
 * Vocabulario verificado contra la lista de stop words del sitio (que incluye palabras como `river`), para que el resultado
 * esperado de Keyword Density no dependa de la lista interna del sitio.
 */
const VOCABULARY = [
  'lantern',
  'mountain',
  'planet',
  'garden',
  'violin',
  'engine',
  'pencil',
  'forest',
  'castle',
  'rocket',
  'island',
  'window',
  'ladder',
  'mirror',
  'candle',
  'bridge',
  'desert',
  'tiger',
  'falcon',
  'harbor',
];

/**
 * Genera un texto aleatorio con un top 3 conocido: tres palabras con frecuencias
 * distintas y estrictamente mayores que las demás, mezcladas al azar.
 */
export const textWithKnownTopKeywords = (seed?: number): { text: string; top: Keyword[]; words: number } => {
  if (seed !== undefined) faker.seed(seed);
  const [first, second, third, ...rest] = faker.helpers.shuffle(VOCABULARY);
  const counts = [
    faker.number.int({ min: 8, max: 12 }),
    faker.number.int({ min: 5, max: 7 }),
    faker.number.int({ min: 3, max: 4 }),
  ];
  const fillers = faker.helpers.arrayElements(rest, 6);

  const tokens = faker.helpers.shuffle([
    ...Array<string>(counts[0]).fill(first),
    ...Array<string>(counts[1]).fill(second),
    ...Array<string>(counts[2]).fill(third),
    ...fillers.flatMap((w) => Array<string>(faker.number.int({ min: 1, max: 2 })).fill(w)),
  ]);

  return {
    text: tokens.join(' '),
    top: [
      { word: first, count: counts[0] },
      { word: second, count: counts[1] },
      { word: third, count: counts[2] },
    ],
    words: tokens.length,
  };
};

/** Texto largo de N palabras repitiendo el vocabulario. */
export const longText = (n: number): string =>
  Array.from({ length: n }, (_, i) => VOCABULARY[i % VOCABULARY.length]).join(' ');
