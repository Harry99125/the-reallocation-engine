#!/usr/bin/env node

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { assessGateHarness } from './gate-behavior-core.mjs';
import { CONFIG, scoreRole } from './role-scorer.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const DEFAULT_FIXTURE = path.join(REPO_ROOT, 'data/examples/gate-behavior-cases.json');
const DEFAULT_OUTPUT = path.join(REPO_ROOT, 'reports/generated/gate-behavior');

function option(args, name, fallback) {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} requires a path.`);
  return path.resolve(args[index + 1]);
}

function formatNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(4) : String(value);
}

function renderMarkdown(audit) {
  const lines = [
    '# Gate Behavior Harness — Chapter 11 / Chapter 16',
    '',
    `- Generated: ${audit.generated}`,
    `- Machine handoff result: **${audit.machine_result}**`,
    `- Human decision: **${audit.human_decision}**`,
    `- Production cases: ${audit.production.summary.cases_passed}/${audit.production.summary.cases_total} passed`,
    `- Production assertions: ${audit.production.summary.checks_passed}/${audit.production.summary.checks_total} passed`,
    `- Deliberate gate-as-vote mutation detected: **${audit.deliberate_break.detection}**`,
    '',
    '## Executable contract',
    '',
    '`composite = (sum of weighted votes) × liveness × timeline`',
    '',
    'Liveness and timeline remain outside the vote list. An exact zero in either gate must produce composite `0` and machine recommendation `Skip`, even with perfect sponsorship and fit.',
    '',
    '## Production scorer results',
    '',
    '| Case | Liveness × timeline behavior | Expected | Observed | Result |',
    '|---|---|---|---|---|',
  ];

  for (const entry of audit.production.cases) {
    lines.push(`| ${entry.id} | ${entry.purpose} | ${formatNumber(entry.expected.composite)} / ${entry.expected.recommendation} | ${formatNumber(entry.observed.composite)} / ${entry.observed.recommendation} | **${entry.status}** |`);
  }

  lines.push(
    '',
    '## Deliberate break: gate-as-vote',
    '',
    'The sentinel implementation intentionally adds liveness and timeline as weighted terms. The two high-vote witnesses below would receive a plausible-looking Apply if that named capstone bug reached production.',
    '',
    '| Witness | Contract expected | Mutated result | Failed assertions | Detection |',
    '|---|---|---|---|---|',
  );
  for (const witness of audit.deliberate_break.witnesses) {
    lines.push(`| ${witness.id} | ${formatNumber(witness.expected.composite)} / ${witness.expected.recommendation} | ${formatNumber(witness.mutation_observed.composite)} / ${witness.mutation_observed.recommendation} | ${witness.failed_checks.join(', ')} | **${witness.mutation_status === 'FAIL' ? 'CAUGHT' : 'MISSED'}** |`);
  }

  lines.push(
    '',
    '## Evidence and limits',
    '',
    `- Fixture: \`${audit.fixture}\``,
    '- Contract sources: `chapters/11-the-bayesian-role-scorer.md` and `chapters/16-the-build-and-the-honest-run.md`.',
    '- This harness verifies scorer mechanics. It does not establish whether an upstream liveness observation or a personal timeline factor is true.',
    '- Weight calibration and the final go/no-go decision remain human judgments.',
    '',
  );
  return lines.join('\n');
}

export async function main(args = process.argv.slice(2)) {
  const fixturePath = option(args, '--fixture', DEFAULT_FIXTURE);
  const outDir = option(args, '--out-dir', DEFAULT_OUTPUT);
  const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
  const productionScore = (role) => scoreRole(role, CONFIG.weights, true);
  const result = assessGateHarness(productionScore, fixture);
  const generated = new Date().toISOString();
  const audit = {
    schema_version: '1.0.0',
    harness: 'gate-behavior',
    generated,
    fixture: path.relative(REPO_ROOT, fixturePath).replaceAll('\\', '/'),
    sources: fixture.sources,
    contract: fixture.contract,
    ...result,
  };

  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'gate-behavior-audit.json');
  const markdownPath = path.join(outDir, 'gate-behavior-audit.md');
  await writeFile(jsonPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  await writeFile(markdownPath, renderMarkdown(audit), 'utf8');

  console.log(`${audit.machine_result === 'PASS' ? 'PASS' : 'FAIL'} gate contract: production ${audit.production.summary.cases_passed}/${audit.production.summary.cases_total} cases; gate-as-vote mutation ${audit.deliberate_break.detection === 'PASS' ? 'caught' : 'missed'}`);
  console.log(`Human decision: ${audit.human_decision}`);
  console.log(path.relative(process.cwd(), markdownPath));
  return audit.machine_result === 'PASS' ? 0 : 1;
}

const invokedAsScript = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (invokedAsScript) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    console.error(`ERROR ${error.message}`);
    process.exitCode = 2;
  });
}
