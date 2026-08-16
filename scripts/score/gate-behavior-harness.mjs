#!/usr/bin/env node

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { assessGateHarness } from './gate-behavior-core.mjs';
import {
  DEFAULT_DATABASE,
  loadGateDatabaseEvidence,
  materializeDatabaseBackedFixture,
} from './gate-database-evidence.mjs';
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
  const database = audit.database_evidence;
  const record = database.selected_record;
  const lines = [
    '# Gate Behavior Harness — Chapter 11 / Chapter 16',
    '',
    `Generated: ${audit.generated}`,
    '',
    `Machine handoff result: **${audit.machine_result}**. Human decision: **${audit.human_decision}**.`,
    '',
    `The production scorer passed ${audit.production.summary.cases_passed} of ${audit.production.summary.cases_total} cases and ${audit.production.summary.checks_passed} of ${audit.production.summary.checks_total} assertions. The deliberate gate-as-vote bug was **${audit.deliberate_break.detection === 'PASS' ? 'CAUGHT' : 'MISSED'}**.`,
    '',
    '## Database record used',
    '',
    `Source: \`${database.source.path}\``,
    '',
    `SHA-256: \`${database.source.sha256}\``,
    '',
    `The script read ${database.scan.data_records} stored rows and ${database.scan.columns} columns. It found ${database.scan.complete_h1b_records} complete H-1B records and ${database.scan.approval_rate_arithmetic_mismatches} approval-rate arithmetic mismatches.`,
    '',
    `It used stored record ${record.data_record_number}: **${record.company_name}**. The record says ${record.total_approvals} approvals, ${record.total_denials} denials, and an approval rate of ${formatNumber(record.approval_rate_percent)}%. Recomputing approvals divided by total petitions gives ${formatNumber(record.recomputed_approval_rate_percent)}%, so the arithmetic check is **${record.arithmetic_status}**.`,
    '',
    `Selection rule: ${record.selection_rule}.`,
    '',
    '**Important:** the normalized historical approval rate is used only as a nonzero, database-derived proxy for this mechanical gate test. It is not the complete Chapter 7 sponsorship probability and it is not a recommendation about this company.',
    '',
    '## Executable contract',
    '',
    '`composite = (sum of weighted votes) × liveness × timeline`',
    '',
    'The 0 and 1 gate values are Chapter 11/16 contract controls, not claims about a live job or a real visa timeline. A zero in either gate must produce composite `0` and `Skip`.',
    '',
    `The sponsorship coefficient ${audit.contract_parameters.sponsorship_weight.value} and current production Apply threshold ${audit.contract_parameters.apply_threshold.value} come from the Chapter 11 project rule and scorer configuration. They are algorithm settings, not database observations or new calibration findings.`,
    '',
    '## Production scorer results',
  ];

  for (const entry of audit.production.cases) {
    const expectedRecommendation = entry.expected.recommendation ?? 'not asserted for the open control';
    lines.push('', `- **${entry.id}: ${entry.status}.** ${entry.purpose} Expected ${formatNumber(entry.expected.composite)} / ${expectedRecommendation}; observed ${formatNumber(entry.observed.composite)} / ${entry.observed.recommendation}.`);
  }

  lines.push(
    '',
    '## Deliberate break: gate-as-vote',
    '',
    'The sentinel is intentionally wrong. It adds the two contract gates as votes instead of multiplying by them. These are test outputs, not real role scores.',
  );
  for (const witness of audit.deliberate_break.witnesses) {
    lines.push('', `- **${witness.id}: ${witness.mutation_status === 'FAIL' ? 'CAUGHT' : 'MISSED'}.** Contract expected ${formatNumber(witness.expected.composite)} / ${witness.expected.recommendation}; broken code returned ${formatNumber(witness.mutation_observed.composite)} / ${witness.mutation_observed.recommendation}. Failed checks: ${witness.failed_checks.join(', ')}.`);
  }

  lines.push(
    '',
    '## Not implemented',
    '',
    `- Full sponsorship probability: **${database.not_implemented.full_sponsorship_probability}**.`,
    `- Real job liveness: **${database.not_implemented.real_job_liveness}**.`,
    `- Personal visa timeline: **${database.not_implemented.personal_visa_timeline}**.`,
    `- Real role recommendation: **${database.not_implemented.real_role_recommendation}**.`,
    '',
    '## Limits',
    '',
    `- ${database.limitations[0]}`,
    `- ${database.limitations[1]}`,
    '- The harness proves scorer mechanics only. A person still owns the final adequacy decision.',
    '',
  );
  return lines.join('\n');
}

export async function main(args = process.argv.slice(2)) {
  const fixturePath = option(args, '--fixture', DEFAULT_FIXTURE);
  const outDir = option(args, '--out-dir', DEFAULT_OUTPUT);
  const databasePath = option(args, '--database', DEFAULT_DATABASE);
  const template = JSON.parse(await readFile(fixturePath, 'utf8'));
  const databaseEvidence = await loadGateDatabaseEvidence(databasePath);
  const fixture = materializeDatabaseBackedFixture(template, databaseEvidence, CONFIG.weights);
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
    contract_parameters: {
      sponsorship_weight: {
        value: CONFIG.weights.sponsorship,
        source: 'chapters/11-the-bayesian-role-scorer.md',
        status: 'STORED_PROJECT_RULE_NOT_DATABASE_OBSERVATION',
      },
      apply_threshold: {
        value: CONFIG.apply_threshold,
        source: 'chapters/11-the-bayesian-role-scorer.md and scripts/score/role-scorer.mjs',
        status: 'CURRENT_PROJECT_CONFIG_CHAPTER_DESCRIBES_THRESHOLD_AS_NEAR',
      },
      gate_control_values: {
        values: [0, 1],
        source: 'chapters/11-the-bayesian-role-scorer.md and chapters/16-the-build-and-the-honest-run.md',
        status: 'CONTRACT_TEST_CONTROLS_NOT_REAL_WORLD_OBSERVATIONS',
      },
    },
    database_evidence: databaseEvidence,
    ...result,
  };

  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'gate-behavior-audit.json');
  const markdownPath = path.join(outDir, 'gate-behavior-audit.md');
  await writeFile(jsonPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  await writeFile(markdownPath, renderMarkdown(audit), 'utf8');

  console.log(`${audit.machine_result === 'PASS' ? 'PASS' : 'FAIL'} gate contract: production ${audit.production.summary.cases_passed}/${audit.production.summary.cases_total} cases; gate-as-vote mutation ${audit.deliberate_break.detection === 'PASS' ? 'caught' : 'missed'}`);
  console.log(`Database: ${audit.database_evidence.source.path} (${audit.database_evidence.source.sha256})`);
  console.log(`Record: ${recordSummary(audit.database_evidence.selected_record)}`);
  console.log('NOT IMPLEMENTED: real liveness, personal timeline, full sponsorship probability, or real-role recommendation');
  console.log(`Human decision: ${audit.human_decision}`);
  console.log(path.relative(process.cwd(), markdownPath));
  return audit.machine_result === 'PASS' ? 0 : 1;
}

function recordSummary(record) {
  return `${record.company_name}; approvals ${record.total_approvals}; denials ${record.total_denials}; stored rate ${formatNumber(record.approval_rate_percent)}%`;
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
