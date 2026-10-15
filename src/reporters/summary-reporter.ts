import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FullResult, Reporter, Suite, TestCase } from '@playwright/test/reporter';

type Status = 'passed' | 'failed' | 'flaky' | 'skipped';

type Row = {
  project: string;
  file: string;
  title: string;
  tags: string[];
  status: Status;
  durationMs: number;
  error?: string;
};

const STATUS_BY_OUTCOME: Record<ReturnType<TestCase['outcome']>, Status> = {
  expected: 'passed',
  unexpected: 'failed',
  flaky: 'flaky',
  skipped: 'skipped',
};

const STATUS_ORDER: Status[] = ['failed', 'flaky', 'passed', 'skipped'];

const LABEL: Record<Status, string> = {
  passed: '✅ Pasó',
  failed: '❌ Falló',
  flaky: '⚠️ Inestable',
  skipped: '⏭️ Omitido',
};

const stripAnsi = (s: string): string => s.replace(/\u001b\[[0-9;]*m/g, '');

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Mensaje de error corto y legible: las primeras líneas sin códigos de color ni stack. */
const describeError = (test: TestCase): string | undefined => {
  const last = test.results.at(-1);
  const error = last?.errors[0];
  if (!error) return undefined;
  const message = stripAnsi(error.message ?? error.value ?? 'Error desconocido');
  // El "Call log" de Playwright es ruido para un resumen: cortamos ahí.
  const [relevant] = message.split(/^\s*Call log:/im);
  const lines = relevant
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    // Playwright repite el mensaje custom del expect ("Error: X" seguido de "X").
    .filter((line, i, all) => i === 0 || line !== all[i - 1].replace(/^Error: /, ''));
  return lines.length > 25 ? [...lines.slice(0, 25), '…'].join('\n') : lines.join('\n');
};

type Options = { outputDir?: string };

/**
 * Reporter de resumen: cuántos escenarios se ejecutaron, pasaron y fallaron, con la
 * descripción del error de cada fallo. Genera `summary.md` y `summary.html`, y si corre
 * en GitHub Actions también publica el resumen en la pestaña del job.
 *
 * Un test que falla y pasa en un reintento cuenta como "inestable" (no como pasado).
 */
export default class SummaryReporter implements Reporter {
  private root?: Suite;
  private startedAt = new Date();
  private readonly outputDir: string;

  constructor(options: Options = {}) {
    this.outputDir = options.outputDir ?? 'summary-report';
  }

  onBegin(_config: unknown, suite: Suite): void {
    this.root = suite;
    this.startedAt = new Date();
  }

  onEnd(result: FullResult): void {
    // Fallos primero, para que se vean sin tener que recorrer la tabla.
    const rows = (this.root?.allTests() ?? [])
      .map((test) => this.toRow(test))
      .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
    const totals = {
      total: rows.length,
      passed: rows.filter((r) => r.status === 'passed').length,
      failed: rows.filter((r) => r.status === 'failed').length,
      flaky: rows.filter((r) => r.status === 'flaky').length,
      skipped: rows.filter((r) => r.status === 'skipped').length,
    };
    const executed = totals.total - totals.skipped;

    mkdirSync(this.outputDir, { recursive: true });
    const markdown = this.markdown(rows, totals, executed, result);
    writeFileSync(join(this.outputDir, 'summary.md'), markdown);
    writeFileSync(join(this.outputDir, 'summary.html'), this.html(rows, totals, executed, result));
    writeFileSync(
      join(this.outputDir, 'summary.json'),
      JSON.stringify({ ...totals, executed, tests: rows }, null, 2),
    );
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);

    console.log(
      `\nResumen: ${executed} ejecutados · ${totals.passed} pasaron · ${totals.failed} fallaron` +
        (totals.flaky ? ` · ${totals.flaky} inestables` : '') +
        (totals.skipped ? ` · ${totals.skipped} omitidos` : '') +
        `\nReporte: ${join(this.outputDir, 'summary.html')}`,
    );
  }

  private toRow(test: TestCase): Row {
    const [, project, file] = test.titlePath();
    return {
      project,
      file,
      title: test.titlePath().slice(3).join(' › '),
      tags: test.tags,
      status: STATUS_BY_OUTCOME[test.outcome()],
      durationMs: test.results.reduce((sum, r) => sum + r.duration, 0),
      error: test.outcome() === 'expected' ? undefined : describeError(test),
    };
  }

  private markdown(rows: Row[], t: Record<string, number>, executed: number, result: FullResult): string {
    const lines = [
      '# Resumen de pruebas: wordcounter.net',
      '',
      `Fecha: ${this.startedAt.toLocaleString('es-AR')} · Duración: ${(result.duration / 1000).toFixed(1)} s · Estado: **${result.status}**`,
      '',
      '| Ejecutados | Pasaron | Fallaron | Inestables | Omitidos |',
      '| ---: | ---: | ---: | ---: | ---: |',
      `| ${executed} | ${t.passed} | ${t.failed} | ${t.flaky} | ${t.skipped} |`,
      '',
    ];

    const problems = rows.filter((r) => r.status === 'failed' || r.status === 'flaky');
    if (problems.length) {
      lines.push('## Fallos', '');
      for (const r of problems) {
        lines.push(
          `### ${LABEL[r.status]}: ${r.title}`,
          '',
          `\`${r.project}\` · \`${r.file}\` ${r.tags.join(' ')}`,
          '',
        );
        lines.push('```text', r.error ?? 'Sin detalle', '```', '');
      }
    }

    lines.push(
      '## Escenarios',
      '',
      '| Estado | Escenario | Proyecto | Tags | Duración |',
      '| --- | --- | --- | --- | ---: |',
    );
    for (const r of rows) {
      lines.push(
        `| ${LABEL[r.status]} | ${r.title.replace(/\|/g, '\\|')} | ${r.project} | ${r.tags.join(' ')} | ${(r.durationMs / 1000).toFixed(1)} s |`,
      );
    }
    return lines.join('\n') + '\n';
  }

  private html(rows: Row[], t: Record<string, number>, executed: number, result: FullResult): string {
    const card = (label: string, value: number, cls: string) =>
      `<div class="card ${cls}"><div class="value">${value}</div><div class="label">${label}</div></div>`;
    const body = rows
      .map(
        (r) => `<tr class="${r.status}">
  <td class="status">${LABEL[r.status]}</td>
  <td>${escapeHtml(r.title)}${r.tags.map((tag) => ` <span class="tag">${escapeHtml(tag)}</span>`).join('')}
    ${r.error ? `<pre>${escapeHtml(r.error)}</pre>` : ''}</td>
  <td>${escapeHtml(r.project)}</td>
  <td class="num">${(r.durationMs / 1000).toFixed(1)} s</td>
</tr>`,
      )
      .join('\n');

    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Resumen de pruebas</title>
<style>
  :root { --bg:#fff; --fg:#1d1d1f; --muted:#6b6b70; --line:#e5e5ea; --ok:#1a7f37; --ko:#cf222e; --warn:#9a6700; --code:#f6f8fa; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0d1117; --fg:#e6edf3; --muted:#8b949e; --line:#30363d; --ok:#3fb950; --ko:#f85149; --warn:#d29922; --code:#161b22; } }
  body { margin:0; padding:24px 16px; background:var(--bg); color:var(--fg); font:14px/1.5 system-ui, sans-serif; }
  main { max-width:1100px; margin:0 auto; }
  h1 { margin:0 0 4px; font-size:22px; }
  .meta { color:var(--muted); margin-bottom:20px; }
  .cards { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:24px; }
  .card { flex:1 1 120px; border:1px solid var(--line); border-radius:8px; padding:12px 16px; }
  .card .value { font-size:28px; font-weight:600; }
  .card .label { color:var(--muted); }
  .card.ok .value { color:var(--ok); } .card.ko .value { color:var(--ko); } .card.warn .value { color:var(--warn); }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  th, td { text-align:left; vertical-align:top; padding:8px; border-bottom:1px solid var(--line); }
  th { color:var(--muted); font-weight:500; }
  td.status { white-space:nowrap; } td.num { text-align:right; white-space:nowrap; }
  tr.failed td.status { color:var(--ko); } tr.flaky td.status { color:var(--warn); }
  pre { margin:6px 0 0; padding:8px; background:var(--code); border-radius:6px; white-space:pre-wrap; font-size:12px; }
  .tag { font-size:11px; color:var(--muted); border:1px solid var(--line); border-radius:4px; padding:0 4px; }
</style>
</head>
<body>
<main>
  <h1>Resumen de pruebas: wordcounter.net</h1>
  <div class="meta">${escapeHtml(this.startedAt.toLocaleString('es-AR'))} · ${(result.duration / 1000).toFixed(1)} s · estado: ${result.status}</div>
  <div class="cards">
    ${card('Ejecutados', executed, '')}
    ${card('Pasaron', t.passed, 'ok')}
    ${card('Fallaron', t.failed, 'ko')}
    ${card('Inestables', t.flaky, 'warn')}
    ${card('Omitidos', t.skipped, '')}
  </div>
  <div class="table-wrap">
  <table>
    <thead><tr><th>Estado</th><th>Escenario / error</th><th>Proyecto</th><th>Duración</th></tr></thead>
    <tbody>
${body}
    </tbody>
  </table>
  </div>
</main>
</body>
</html>
`;
  }
}
