import { faker } from '@faker-js/faker';

/** Cuenta palabras como secuencias separadas por espacios. */
export const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

/** Genera un texto aleatorio de N palabras sin puntuación. */
export const randomWords = (n: number): string => faker.word.words(n);
