import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';

/** Historias (stories) con las que se agrupan los escenarios en el reporte de Allure. */
export const Story = {
  INITIAL_STATE: 'Estado inicial',
  CURATED_CASES: 'Casos curados',
  LIVE_UPDATE: 'Actualización al editar',
  VOLUME: 'Textos largos y aleatorios',
  CONSISTENCY: 'Consistencia entre contador y Keyword Density',
  KNOWN_DEFECTS: 'Defectos conocidos del sitio',
} as const;

const SEVERITY_BY_STORY: Record<(typeof Story)[keyof typeof Story], Severity> = {
  [Story.INITIAL_STATE]: Severity.CRITICAL,
  [Story.CURATED_CASES]: Severity.NORMAL,
  [Story.LIVE_UPDATE]: Severity.CRITICAL,
  [Story.VOLUME]: Severity.NORMAL,
  [Story.CONSISTENCY]: Severity.NORMAL,
  [Story.KNOWN_DEFECTS]: Severity.MINOR,
};

/** Etiqueta el test actual en Allure: epic, feature, story, severidad y parámetros del caso. */
export const allureMeta = async (
  feature: string,
  story: (typeof Story)[keyof typeof Story],
  parameters: Record<string, string | number> = {},
): Promise<void> => {
  await allure.epic('wordcounter.net');
  await allure.feature(feature);
  await allure.story(story);
  await allure.severity(SEVERITY_BY_STORY[story]);
  for (const [name, value] of Object.entries(parameters)) {
    await allure.parameter(name, typeof value === 'string' ? JSON.stringify(value) : String(value));
  }
};
