#!/usr/bin/env node

// Step 3 evidence gate for the unified ATS paste-test + gate-behavior
// contribution. It reconciles every reported metric with the underlying audit
// records, checks the public/private boundary, and emits a human-readable
// verified-vs-inferred table. It does not sign the human attestation.

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'reports/generated/zening-teng-contribution');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'step3.json');
const OUTPUT_MD = path.join(OUTPUT_DIR, 'step3.md');
const CURRENT_RECIPE_VERSION = '0.12.0';

const INPUTS = {
  atsPositive: 'reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json',
  atsBreak: 'reports/generated/ats-paste-test/break-attempt/paste-test-audit.json',
  gate: 'reports/generated/gate-behavior/gate-behavior-audit.json',
  atsManifest: 'data/examples/aarav-patel-ats-expected.json',
  gateFixture: 'data/examples/gate-behavior-cases.json',
  gateDatabase: 'data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv',
  gateJoinAudit: 'data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped-join-validation-audit.md',
  step3Review: 'logs/zening-teng-step3-review-v0.12.0.json',
  atsScript: 'scripts/resumes/ats-parse-test.mjs',
  gateScript: 'scripts/score/gate-behavior-harness.mjs',
  gateCore: 'scripts/score/gate-behavior-core.mjs',
  gateDatabaseScript: 'scripts/score/gate-database-evidence.mjs',
  scorer: 'scripts/score/role-scorer.mjs',
};

export const PROVENANCE_LABELS = new Set([
  'record',
  'script-output',
  'local-evidence',
  'external-source',
  'model-inference',
  'your-input',
  'missing',
]);

export const BOUNDARY_ROWS = [
  {
    output: 'ATS test rules',
    technical_fields: ['schema_version', 'harness', 'mode', 'chapter'],
    label: 'local-evidence',
    record: 'Chapter 13',
    machine_can_verify: 'Checks that the saved rules were used.',
    human_keeps: 'Are these rules good enough?',
  },
  {
    output: 'PDF file',
    technical_fields: ['document_id', 'inputs.source', 'inputs.source_type', 'inputs.pdf'],
    label: 'your-input',
    record: 'The command',
    machine_can_verify: 'Checks that the file exists and can be opened.',
    human_keeps: 'Is this the right and safe file?',
  },
  {
    output: 'PDF reader',
    technical_fields: ['parser.name', 'parser.version', 'parser.source_type'],
    label: 'external-source',
    record: 'Installed PDF.js',
    machine_can_verify: 'Shows which reader and version ran.',
    human_keeps: 'Would a real ATS read it the same way?',
  },
  {
    output: 'Public test files',
    technical_fields: [
      'inputs.expectation_manifest',
      'inputs.source_markdown',
    ],
    label: 'local-evidence',
    record: 'Saved public files',
    machine_can_verify: 'Checks that both files are there.',
    human_keeps: 'Are these the right test files?',
  },
  {
    output: 'Public test answer list',
    technical_fields: [
      'fields[*].id',
      'fields[*].category',
      'fields[*].expected',
      'fields[*].evidence.expected_record',
    ],
    label: 'record',
    record: 'Public résumé and answer file',
    machine_can_verify: 'Checks that every answer came from the résumé.',
    human_keeps: 'Does the list cover the important parts?',
  },
  {
    output: 'Public test match rules',
    technical_fields: [
      'fields[*].match',
      'fields[*].occurrence',
      'fields[*].required',
      'order_checks[*].id',
      'order_checks[*].fields',
    ],
    label: 'local-evidence',
    record: 'Saved answer file',
    machine_can_verify: 'Uses the saved match and order rules.',
    human_keeps: 'Are these rules good enough?',
  },
  {
    output: 'PDF text and page count',
    technical_fields: ['paste-test.txt', 'metrics.pages.*'],
    label: 'script-output',
    record: 'PDF file',
    machine_can_verify: 'Reads the text and counts the pages.',
    human_keeps: 'Does the text still make sense?',
  },
  {
    output: 'ATS test result',
    technical_fields: [
      'fields[*].status',
      'fields[*].observed_index',
      'fields[*].evidence.observed_record',
      'order_checks[*].status',
      'order_checks[*].observed_positions',
      'order_checks[*].reason',
      'order_checks[*].evidence.observed_record',
      'verdict',
      'metrics.required_fields.*',
      'metrics.order_checks.*',
      'summary.*',
    ],
    label: 'script-output',
    record: 'PDF text and answer list',
    machine_can_verify: 'Checks the fields, their order, and PASS or FAIL.',
    human_keeps: 'Is the résumé really ready to use?',
  },
  {
    output: 'Basic PDF check',
    technical_fields: ['parser_floor', 'checks[*]', 'inventory.*', 'page_metrics.*'],
    label: 'script-output',
    record: 'PDF text',
    machine_can_verify: 'Counts headings, dates, and bullet lines.',
    human_keeps: 'Is the résumé complete and useful?',
  },
  {
    output: 'ATS limits',
    technical_fields: ['boundary', 'limitations'],
    label: 'local-evidence',
    record: 'Chapter 13',
    machine_can_verify: 'Shows what the test cannot prove.',
    human_keeps: 'Makes the final résumé decision.',
  },
  {
    output: 'Gate rules',
    technical_fields: [
      'schema_version',
      'harness',
      'fixture',
      'sources.*',
      'contract.*',
      'contract_parameters.sponsorship_weight.*',
      'contract_parameters.apply_threshold.*',
      'contract_parameters.gate_control_values.*',
    ],
    label: 'record',
    record: 'Chapters 11 and 16',
    machine_can_verify: 'Checks that the saved Gate rules were used.',
    human_keeps: 'Are the scoring numbers good enough?',
  },
  {
    output: 'H-1B data file',
    technical_fields: [
      'database_evidence.source.path',
      'database_evidence.source.sha256',
      'database_evidence.scan.data_records',
      'database_evidence.scan.columns',
      'database_evidence.scan.complete_h1b_records',
      'database_evidence.scan.approval_rate_arithmetic_mismatches',
    ],
    label: 'script-output',
    record: 'Saved H-1B file',
    machine_can_verify: 'Checks the file, row counts, and rate math.',
    human_keeps: 'Were the companies matched correctly?',
  },
  {
    output: 'Rule used to pick the H-1B row',
    technical_fields: ['database_evidence.selected_record.selection_rule'],
    label: 'local-evidence',
    record: 'Saved test rule',
    machine_can_verify: 'Uses the first complete row.',
    human_keeps: 'Is this a fair test rule?',
  },
  {
    output: 'H-1B row used in the test',
    technical_fields: [
      'database_evidence.selected_record.company_name',
      'database_evidence.selected_record.total_approvals',
      'database_evidence.selected_record.total_denials',
      'database_evidence.selected_record.approval_rate_percent',
    ],
    label: 'record',
    record: 'First complete row in the file',
    machine_can_verify: 'Checks the company, numbers, and rate math.',
    human_keeps: 'Was this company matched correctly?',
  },
  {
    output: 'H-1B row checks and test value',
    technical_fields: [
      'database_evidence.selected_record.data_record_number',
      'database_evidence.selected_record.recomputed_approval_rate_percent',
      'database_evidence.selected_record.normalized_approval_rate',
      'database_evidence.selected_record.arithmetic_status',
    ],
    label: 'script-output',
    record: 'Saved rate divided by 100',
    machine_can_verify: 'Checks the division and score math.',
    human_keeps: 'Remembers this is not a real sponsorship chance.',
  },
  {
    output: 'How the H-1B row is used',
    technical_fields: ['database_evidence.harness_use.*'],
    label: 'local-evidence',
    record: 'Saved Gate test rule',
    machine_can_verify: 'Uses the rate only as a test value.',
    human_keeps: 'Does not call it a real sponsorship chance.',
  },
  {
    output: 'Three Gate test cases',
    technical_fields: ['production.implementation', 'production.cases[*].id', 'production.cases[*].purpose', 'production.cases[*].mutation_witness'],
    label: 'local-evidence',
    record: 'Saved Gate test file',
    machine_can_verify: 'Checks the test names and purpose.',
    human_keeps: 'Are three tests enough?',
  },
  {
    output: 'Correct Gate results',
    technical_fields: [
      'generated',
      'production.cases[*].expected.*',
      'production.cases[*].observed.*',
      'production.cases[*].checks[*].*',
      'production.cases[*].status',
      'production.summary.*',
      'machine_result',
    ],
    label: 'script-output',
    record: 'H-1B row, Gate rules, and scoring program',
    machine_can_verify: 'Compares the expected and real results.',
    human_keeps: 'Would this be true for a real job?',
  },
  {
    output: 'Wrong-code test',
    technical_fields: [
      'deliberate_break.mutation_result',
      'deliberate_break.detection',
      'deliberate_break.witnesses[*].*',
      'deliberate_break.failed_checks[*]',
      'deliberate_break.full_result.*',
    ],
    label: 'script-output',
    record: 'Bad formula used only for testing',
    machine_can_verify: 'Checks that both wrong Apply results are caught.',
    human_keeps: 'Should more wrong formulas be tested?',
  },
  {
    output: 'Human review',
    technical_fields: ['human_decision'],
    label: 'local-evidence',
    record: 'Project review rule',
    machine_can_verify: 'Leaves the final result for a person.',
    human_keeps: 'Reads and approves the work.',
  },
  {
    output: 'Missing real facts',
    technical_fields: [
      'database_evidence.not_implemented.full_sponsorship_probability',
      'database_evidence.not_implemented.real_job_liveness',
      'database_evidence.not_implemented.personal_visa_timeline',
      'database_evidence.not_implemented.real_role_recommendation',
      'real résumé truth',
      'all commercial ATS results',
    ],
    label: 'missing',
    record: 'No saved proof',
    machine_can_verify: 'Leaves the answer unknown.',
    human_keeps: 'Finds proof or keeps it unknown.',
  },
  {
    output: 'Known limits',
    technical_fields: ['limitations[*]', 'database_evidence.limitations[*]'],
    label: 'local-evidence',
    record: 'Saved limit notes',
    machine_can_verify: 'Shows the limits in the report.',
    human_keeps: 'Decides if the limits are safe.',
  },
  {
    output: 'Future AI opinion',
    technical_fields: ['model judgments'],
    label: 'model-inference',
    record: 'None in this test',
    machine_can_verify: 'Does not call test values facts.',
    human_keeps: 'Checks any AI opinion against real proof.',
  },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8'));
}

function git(args) {
  const safeRoot = REPO_ROOT.replaceAll('\\', '/');
  return execFileSync('git', ['-c', `safe.directory=${safeRoot}`, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).split(/\r?\n/).filter(Boolean);
}

function check(id, pass, expected, observed, record) {
  return { id, status: pass ? 'PASS' : 'FAIL', expected, observed, record };
}

function recomputeAts(audit) {
  const required = audit.fields.filter((field) => field.required);
  const fieldsPassed = required.filter((field) => field.status === 'PASS').length;
  const orderPassed = audit.order_checks.filter((entry) => entry.status === 'PASS').length;
  const verdict = fieldsPassed === required.length && orderPassed === audit.order_checks.length ? 'PASS' : 'FAIL';
  return {
    fieldsPassed,
    fieldsTotal: required.length,
    orderPassed,
    orderTotal: audit.order_checks.length,
    verdict,
  };
}

function normalizedPath(parts) {
  return parts.map((part) => (typeof part === 'number' ? '[*]' : part)).join('.').replace(/\.\[\*\]/g, '[*]');
}

function numberProvenance(reportName, parts) {
  const key = normalizedPath(parts);
  if (reportName.startsWith('ats-')) {
    if (key === 'chapter' || key.endsWith('.occurrence')) {
      return {
        label: 'local-evidence',
        script: INPUTS.atsScript,
        record: `${INPUTS.atsManifest} and resumes/aarav-patel-cv.md`,
      };
    }
    return {
      label: 'script-output',
      script: INPUTS.atsScript,
      record: reportName === 'ats-positive' ? INPUTS.atsPositive : INPUTS.atsBreak,
    };
  }
  if (key.startsWith('database_evidence.selected_record.')
    && /(?:total_approvals|total_denials|approval_rate_percent)$/.test(key)) {
    return {
      label: 'record',
      script: INPUTS.gateDatabaseScript,
      record: INPUTS.gateDatabase,
    };
  }
  if (key.startsWith('database_evidence.')) {
    return {
      label: 'script-output',
      script: INPUTS.gateDatabaseScript,
      record: INPUTS.gateDatabase,
    };
  }
  if (key.startsWith('contract_parameters.')) {
    return {
      label: 'record',
      script: INPUTS.gateScript,
      record: 'chapters/11-the-bayesian-role-scorer.md, chapters/16-the-build-and-the-honest-run.md, and scripts/score/role-scorer.mjs',
    };
  }
  if (key.includes('.expected.') || key.endsWith('.expected')) {
    return {
      label: 'script-output',
      script: INPUTS.gateDatabaseScript,
      record: `${INPUTS.gateDatabase} and ${INPUTS.gateFixture}`,
    };
  }
  return {
    label: 'script-output',
    script: key.includes('deliberate_break') ? INPUTS.gateCore : INPUTS.scorer,
    record: INPUTS.gate,
  };
}

function collectNumberTrace(reportName, value, parts = [], trace = []) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    trace.push({
      report: reportName,
      json_path: normalizedPath(parts),
      value,
      ...numberProvenance(reportName, parts),
    });
    return trace;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectNumberTrace(reportName, entry, [...parts, index], trace));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => collectNumberTrace(reportName, entry, [...parts, key], trace));
  }
  return trace;
}

function renderMarkdown(evidence) {
  const positive = evidence.metric_readout.ats_positive;
  const broken = evidence.metric_readout.ats_break;
  const gate = evidence.metric_readout.gate;
  const livenessWitness = gate.witnesses.find((witness) => witness.id.startsWith('liveness')) ?? gate.witnesses[0];
  const timelineWitness = gate.witnesses.find((witness) => witness.id.startsWith('timeline')) ?? gate.witnesses[1];
  const ethicsStatus = evidence.ethics_gate.privacy === 'PASS' && evidence.ethics_gate.honesty === 'PASS' ? 'PASS' : 'FAIL';
  const lines = [
    '# Step 3 — Proof Check',
    '',
    `Made on: ${evidence.generated}`,
    '',
    '## 1. Data and judgment split',
    '',
    '- `record`: saved résumé facts, Gate rules, and the saved H-1B row.',
    '- `script-output`: PDF text, counts, math, PASS/FAIL, and Gate results.',
    '- `local-evidence`: saved test rules, limits, test cases, and review rules.',
    '- `external-source`: PDF.js name and version.',
    '- `your-input`: the PDF file picked by the user.',
    '- `model-inference`: none in this run. Any future AI idea must use this label.',
    '- `missing`: real résumé truth, all ATS results, live job status, full sponsorship chance, visa law, and a real Apply choice.',
    '',
    'Code may read, count, compare, and do math. A person must judge meaning, safety, company matching, and the final choice.',
    '',
    'The full field-by-field split is in `step3.json` under `boundary`. Each item has exact fields, a label, a source, the code job, and the human job.',
  ];
  lines.push(
    '',
    '## 2. Every number has a source',
    '',
    'Each line names its code and record.',
    '',
    `- **ATS:** good run = ${positive.pages} pages, ${positive.fields_passed}/${positive.fields_total} fields, ${positive.order_passed}/${positive.order_total} order, ${positive.verdict}; broken run = ${broken.pages} page, ${broken.fields_passed}/${broken.fields_total} fields, ${broken.order_passed}/${broken.order_total} order, ${broken.verdict}. Code: \`${INPUTS.atsScript}\`. Records: \`${INPUTS.atsPositive}\` and \`${INPUTS.atsBreak}\`.`,
    `- **Gate rule values:** sponsorship weight ${gate.sponsorship_weight}; Apply line ${gate.apply_threshold}; Gate test values ${gate.gate_control_values.join(' and ')}. Code: \`${INPUTS.scorer}\` and \`${INPUTS.gateScript}\`. Records: \`chapters/11-the-bayesian-role-scorer.md\`, \`chapters/16-the-build-and-the-honest-run.md\`, and \`${INPUTS.gateFixture}\`.`,
    `- **H-1B:** ${gate.database_records} rows, ${gate.database_columns} columns, ${gate.database_complete_records} complete rows, ${gate.database_math_mismatches} math errors. Row ${gate.database_record_number} is ${gate.database_company}: ${gate.database_approvals} approvals, ${gate.database_denials} denials, ${gate.database_rate_percent}% saved rate, ${gate.database_recomputed_rate_percent}% checked rate, test value ${gate.database_normalized_rate}, math ${gate.database_arithmetic_status}. Code: \`${INPUTS.gateDatabaseScript}\`. Records: \`${INPUTS.gateDatabase}\` and \`${INPUTS.gate}\`.`,
    `- **Good Gate run:** ${gate.cases_passed}/${gate.cases_total} cases and ${gate.checks_passed}/${gate.checks_total} checks passed. Open Gates gave ${gate.open_case.composite}. Liveness at 0 gave ${gate.liveness_case.composite} / ${gate.liveness_case.recommendation}. Timeline at 0 gave ${gate.timeline_case.composite} / ${gate.timeline_case.recommendation}. Code: \`${INPUTS.gateScript}\` and \`${INPUTS.scorer}\`. Record: \`${INPUTS.gate}\`.`,
    `- **Bad Gate run:** ${gate.broken_cases_passed}/${gate.broken_cases_total} cases and ${gate.broken_checks_passed}/${gate.broken_checks_total} checks passed. The open case gave ${gate.broken_open_composite}. Liveness at 0 gave ${livenessWitness.composite} / ${livenessWitness.recommendation} / ${livenessWitness.status}. Timeline at 0 gave ${timelineWitness.composite} / ${timelineWitness.recommendation} / ${timelineWitness.status}. Code: \`${INPUTS.gateCore}\`. Record: \`${INPUTS.gate}\`.`,
    '',
    'All smaller numbers are in `step3.json` under `number_trace`. Each has a label, script, and record.',
    '',
    'This run has no `model-inference` number. It prints no AI score as a fact.',
    '',
    `## 3. Ethics gate — ${ethicsStatus}`,
    '',
    'A privacy or honesty FAIL stops Step 3. Step 4 must not run.',
    '',
    `- **Privacy — ${evidence.ethics_gate.privacy}:** no private path is staged or tracked; \`node scripts/doctor.mjs --strict\` passed.`,
    `- **Honesty — ${evidence.ethics_gate.honesty}:** totals and math match saved records; bad code was caught; every number is traced; missing facts stay \`missing\` or \`NOT_IMPLEMENTED\`.`,
    '',
    evidence.human_attestation.status === 'RECORDED'
      ? `${evidence.human_attestation.reviewer} allowed Step 4 on ${evidence.human_attestation.recorded_on}. Record: \`${evidence.human_attestation.record}\`.`
      : 'A named person has not approved Step 4.',
    '',
    'The code did not approve itself. This is not proof for every ATS, job, company, or visa case.',
  );
  return lines.join('\n');
}

export function buildEvidence({ atsPositive, atsBreak, gateAudit, gateFixture, step3Review = null, stagedFiles, trackedFiles, doctorOutput }) {
  const positive = recomputeAts(atsPositive);
  const broken = recomputeAts(atsBreak);
  const productionCases = gateAudit.production.cases;
  const productionChecks = productionCases.flatMap((entry) => entry.checks);
  const casesPassed = productionCases.filter((entry) => entry.status === 'PASS').length;
  const checksPassed = productionChecks.filter((entry) => entry.status === 'PASS').length;
  const privateStaged = stagedFiles.filter((file) => /^(?:private|data\/ats)\//i.test(file)
    || /^resumes\/.*\.pdf$/i.test(file) || /(^|\/)\.env(?:\.|$)/i.test(file));
  const scaffold = (file) => /(^|\/)(README\.md|\.gitkeep|\.gitignore)$/i.test(file) || /\.example\./i.test(file);
  const trackedLeaks = trackedFiles.filter((file) => ((/^(?:private|data\/ats)\//i.test(file) && !scaffold(file))
    || /^resumes\/.*\.pdf$/i.test(file) || /(^|\/)\.env(?:\.|$)/i.test(file)));
  const contractGateValues = gateFixture.cases.flatMap((entry) => Object.values(entry.contract_gates || {}));
  const databaseEvidence = gateAudit.database_evidence;
  const databasePath = databaseEvidence?.source?.path
    ? path.join(REPO_ROOT, databaseEvidence.source.path)
    : null;
  const databaseHash = databasePath && fs.existsSync(databasePath)
    ? createHash('sha256').update(fs.readFileSync(databasePath)).digest('hex')
    : null;
  const witnesses = gateAudit.deliberate_break.witnesses;
  const openCase = productionCases.find((entry) => entry.id === 'open-gates-control');
  const livenessCase = productionCases.find((entry) => entry.id.startsWith('liveness-zero'));
  const timelineCase = productionCases.find((entry) => entry.id.startsWith('timeline-zero'));
  const brokenOpenCase = gateAudit.deliberate_break.full_result.cases.find((entry) => entry.id === 'open-gates-control');
  const reviewRecord = INPUTS.step3Review;
  const humanReviewRecorded = Boolean(step3Review
    && step3Review.source === 'your-input'
    && step3Review.reviewer === 'Zening Teng'
    && step3Review.decision === 'APPROVED_FOR_STEP_4'
    && step3Review.reviewed_recipe_version === CURRENT_RECIPE_VERSION
    && step3Review.reviewed_gate_database_sha256 === databaseEvidence?.source?.sha256
    && /^\d{4}-\d{2}-\d{2}$/.test(step3Review.recorded_on)
    && Array.isArray(step3Review.reviewed_records)
    && step3Review.reviewed_records.length >= 4
    && Array.isArray(step3Review.acknowledged_limits)
    && step3Review.acknowledged_limits.some((entry) => /entity join/i.test(entry))
    && step3Review.acknowledged_limits.some((entry) => /full sponsorship probability/i.test(entry)));

  const boundaryLabels = new Set(BOUNDARY_ROWS.map((row) => row.label));
  const checks = [
    check('privacy:no-private-staged', privateStaged.length === 0, 'no private/, data/ats/, résumé PDF, or .env path staged', privateStaged.length ? privateStaged.join(', ') : 'none', 'git diff --cached --name-only'),
    check('privacy:no-private-tracked', trackedLeaks.length === 0, 'no non-scaffold private/PII path tracked', trackedLeaks.length ? trackedLeaks.join(', ') : 'none', 'git ls-files'),
    check('privacy:doctor-clean', /environment: ✓ runnable/.test(doctorOutput) && /no private\/PII paths are tracked/.test(doctorOutput) && /missing: 0/.test(doctorOutput) && !/todos_open mismatch/.test(doctorOutput), 'strict doctor reports runnable, privacy clean, all recipe frontmatter, and no TODO-count mismatch', doctorOutput.split(/\r?\n/).filter((line) => /environment:|no private\/PII|with lifecycle|mismatch/.test(line)).join(' | '), 'node scripts/doctor.mjs --strict'),
    check('honesty:ats-positive-reconciles', atsPositive.verdict === positive.verdict && positive.verdict === 'PASS'
      && atsPositive.summary.fields.passed === positive.fieldsPassed && atsPositive.summary.fields.total === positive.fieldsTotal
      && atsPositive.summary.order_checks.passed === positive.orderPassed && atsPositive.summary.order_checks.total === positive.orderTotal,
    'positive verdict/counts recompute to PASS', `${positive.fieldsPassed}/${positive.fieldsTotal} fields; ${positive.orderPassed}/${positive.orderTotal} order; ${positive.verdict}`, INPUTS.atsPositive),
    check('honesty:ats-break-reconciles', atsBreak.verdict === broken.verdict && broken.verdict === 'FAIL'
      && broken.fieldsPassed < broken.fieldsTotal && broken.orderPassed < broken.orderTotal,
    'break verdict/counts recompute to deterministic FAIL', `${broken.fieldsPassed}/${broken.fieldsTotal} fields; ${broken.orderPassed}/${broken.orderTotal} order; ${broken.verdict}`, INPUTS.atsBreak),
    check('honesty:gate-production-reconciles', gateAudit.production.summary.cases_passed === casesPassed
      && gateAudit.production.summary.cases_total === productionCases.length
      && gateAudit.production.summary.checks_passed === checksPassed
      && gateAudit.production.summary.checks_total === productionChecks.length
      && gateAudit.production.verdict === 'PASS',
    'production counts recompute and verdict is PASS', `${casesPassed}/${productionCases.length} cases; ${checksPassed}/${productionChecks.length} assertions`, INPUTS.gate),
    check('honesty:mutation-is-caught', gateAudit.deliberate_break.detection === 'PASS'
      && gateAudit.deliberate_break.observed_contract_result === 'FAIL'
      && witnesses.length >= 2 && witnesses.every((entry) => entry.mutation_status === 'FAIL'
        && entry.mutation_observed.composite !== 0 && entry.mutation_observed.recommendation !== 'Skip'),
    'wrong gate-as-vote implementation fails; every named witness is caught', witnesses.map((entry) => `${entry.id}:${entry.mutation_observed.composite}/${entry.mutation_observed.recommendation}/${entry.mutation_status}`).join('; '), INPUTS.gate),
    check('honesty:database-record-reconciles', databaseEvidence?.source?.path === INPUTS.gateDatabase
      && databaseEvidence.source.sha256 === databaseHash
      && databaseEvidence.selected_record?.arithmetic_status === 'PASS'
      && databaseEvidence.scan?.approval_rate_arithmetic_mismatches === 0
      && Math.abs(databaseEvidence.selected_record.normalized_approval_rate
        - (databaseEvidence.selected_record.approval_rate_percent / 100)) <= 1e-9,
    'stored database hash and selected H-1B record arithmetic reconcile', databaseEvidence
      ? `${databaseEvidence.source.sha256}; ${databaseEvidence.selected_record.company_name}; ${databaseEvidence.selected_record.arithmetic_status}`
      : 'missing database evidence', INPUTS.gateDatabase),
    check('honesty:contract-controls', contractGateValues.length === gateFixture.cases.length * 2
      && contractGateValues.every((value) => value === 0 || value === 1),
    'every liveness/timeline test control is a Chapter 11/16 zero-or-one contract value', [...new Set(contractGateValues)].join(', '), INPUTS.gateFixture),
    check('honesty:not-implemented-visible', databaseEvidence
      && Object.values(databaseEvidence.not_implemented || {}).length === 4
      && Object.values(databaseEvidence.not_implemented).every((value) => String(value).startsWith('NOT_IMPLEMENTED'))
      && databaseEvidence.limitations.some((value) => /join remains unverified/i.test(value)),
    'missing real inputs and the unverified entity join are stated, not replaced with scores', databaseEvidence
      ? Object.values(databaseEvidence.not_implemented).join(' | ')
      : 'missing database evidence', INPUTS.gate),
    check('honesty:no-self-attestation', gateAudit.human_decision === 'HUMAN_REVIEW_REQUIRED', 'machine output preserves human review boundary', gateAudit.human_decision, INPUTS.gate),
    check('honesty:named-review-record', humanReviewRecorded, `a separate named-human record approves recipe ${CURRENT_RECIPE_VERSION} and database ${databaseEvidence?.source?.sha256}`, humanReviewRecorded ? `${step3Review.reviewer}; ${step3Review.recorded_on}; ${step3Review.decision}` : 'old review does not cover the current database-backed version', reviewRecord),
    check('honesty:ats-limitation-visible', atsPositive.limitations.some((entry) => /not proof of compatibility with every ATS/i.test(entry)), 'universal ATS compatibility explicitly not claimed', atsPositive.limitations.join(' | '), INPUTS.atsPositive),
    check('provenance:boundary-labels', BOUNDARY_ROWS.every((row) => PROVENANCE_LABELS.has(row.label))
      && [...PROVENANCE_LABELS].every((label) => boundaryLabels.has(label)),
    'the boundary uses all seven assignment labels and no other label', [...boundaryLabels].join(', '), 'BOUNDARY_ROWS in scripts/verified-data-evidence.mjs'),
    check('provenance:boundary-fields', BOUNDARY_ROWS.every((row) => row.output
      && Array.isArray(row.technical_fields) && row.technical_fields.length > 0
      && row.record && row.machine_can_verify && row.human_keeps),
    'every boundary row names fields, source, code work, and human work', 'complete rows', 'BOUNDARY_ROWS in scripts/verified-data-evidence.mjs'),
  ];

  const privacyChecks = checks.filter((entry) => entry.id.startsWith('privacy:'));
  const honestyChecks = checks.filter((entry) => !entry.id.startsWith('privacy:')
    && entry.id !== 'honesty:named-review-record');
  const numberTrace = [
    ...collectNumberTrace('ats-positive', atsPositive),
    ...collectNumberTrace('ats-break', atsBreak),
    ...collectNumberTrace('gate-behavior', gateAudit),
  ];
  const untracedNumbers = numberTrace.filter((entry) => !PROVENANCE_LABELS.has(entry.label) || !entry.script || !entry.record);
  checks.push(check('provenance:every-number-traced', untracedNumbers.length === 0, 'every numeric audit leaf has label, script, and record', untracedNumbers.length ? untracedNumbers.map((entry) => `${entry.report}:${entry.json_path}`).join(', ') : 'none untraced', 'number_trace in this evidence JSON'));
  const machineChecks = checks.filter((entry) => entry.id !== 'honesty:named-review-record');

  return {
    schema_version: '1.0.0',
    artifact: 'verified-data-evidence',
    contribution: 'reallocation-verification-harness',
    recipe_version: CURRENT_RECIPE_VERSION,
    generated: new Date().toISOString(),
    machine_result: machineChecks.every((entry) => entry.status === 'PASS') ? 'PASS' : 'FAIL',
    human_attestation: humanReviewRecorded ? {
      status: 'RECORDED',
      reviewer: step3Review.reviewer,
      recorded_on: step3Review.recorded_on,
      decision: step3Review.decision,
      source: step3Review.source,
      record: reviewRecord,
    } : {
      status: 'REQUIRED_BEFORE_STEP_4',
      reviewer: null,
      recorded_on: null,
      decision: null,
      source: null,
      record: reviewRecord,
    },
    ethics_gate: {
      privacy: privacyChecks.every((entry) => entry.status === 'PASS') ? 'PASS' : 'FAIL',
      honesty: honestyChecks.every((entry) => entry.status === 'PASS') && untracedNumbers.length === 0 ? 'PASS' : 'FAIL',
      human_decision: humanReviewRecorded ? 'APPROVED_FOR_STEP_4_BY_NAMED_HUMAN' : 'HUMAN_REVIEW_REQUIRED',
      rule: 'A FAIL blocks the run; machine PASS does not replace the separate named-human record.',
    },
    inputs: INPUTS,
    checks,
    boundary: BOUNDARY_ROWS,
    metric_readout: {
      ats_positive: { pages: atsPositive.metrics.pages.value, fields_passed: positive.fieldsPassed, fields_total: positive.fieldsTotal, order_passed: positive.orderPassed, order_total: positive.orderTotal, verdict: positive.verdict },
      ats_break: { pages: atsBreak.metrics.pages.value, fields_passed: broken.fieldsPassed, fields_total: broken.fieldsTotal, order_passed: broken.orderPassed, order_total: broken.orderTotal, verdict: broken.verdict },
      gate: {
        cases_passed: casesPassed,
        cases_total: productionCases.length,
        checks_passed: checksPassed,
        checks_total: productionChecks.length,
        sponsorship_weight: gateAudit.contract_parameters.sponsorship_weight.value,
        apply_threshold: gateAudit.contract_parameters.apply_threshold.value,
        gate_control_values: gateAudit.contract_parameters.gate_control_values.values,
        database_records: databaseEvidence.scan.data_records,
        database_columns: databaseEvidence.scan.columns,
        database_complete_records: databaseEvidence.scan.complete_h1b_records,
        database_math_mismatches: databaseEvidence.scan.approval_rate_arithmetic_mismatches,
        database_record_number: databaseEvidence.selected_record.data_record_number,
        database_company: databaseEvidence.selected_record.company_name,
        database_approvals: databaseEvidence.selected_record.total_approvals,
        database_denials: databaseEvidence.selected_record.total_denials,
        database_rate_percent: databaseEvidence.selected_record.approval_rate_percent,
        database_recomputed_rate_percent: databaseEvidence.selected_record.recomputed_approval_rate_percent,
        database_normalized_rate: databaseEvidence.selected_record.normalized_approval_rate,
        database_arithmetic_status: databaseEvidence.selected_record.arithmetic_status,
        open_case: { composite: openCase.observed.composite, recommendation: openCase.observed.recommendation, status: openCase.status },
        liveness_case: { composite: livenessCase.observed.composite, recommendation: livenessCase.observed.recommendation, status: livenessCase.status },
        timeline_case: { composite: timelineCase.observed.composite, recommendation: timelineCase.observed.recommendation, status: timelineCase.status },
        broken_open_composite: brokenOpenCase.observed.composite,
        broken_cases_passed: gateAudit.deliberate_break.full_result.summary.cases_passed,
        broken_cases_total: gateAudit.deliberate_break.full_result.summary.cases_total,
        broken_checks_passed: gateAudit.deliberate_break.full_result.summary.checks_passed,
        broken_checks_total: gateAudit.deliberate_break.full_result.summary.checks_total,
        witnesses: witnesses.map((entry) => ({ id: entry.id, composite: entry.mutation_observed.composite, recommendation: entry.mutation_observed.recommendation, status: entry.mutation_status })),
      },
    },
    number_trace: numberTrace,
    not_verified: [
      'universal ATS compatibility',
      'truth or persuasiveness of a real resume',
      'current real-job liveness or sponsorship',
      'legal correctness of a personal visa timeline',
      'weight calibration or final application worthiness',
    ],
  };
}

export function main() {
  const required = Object.values(INPUTS).filter((entry) => /\.(?:json|mjs|csv|md)$/.test(entry));
  const missing = required.filter((entry) => !fs.existsSync(path.join(REPO_ROOT, entry)));
  if (missing.length) throw new Error(`Missing required evidence input(s): ${missing.join(', ')}`);

  const doctorOutput = execFileSync(process.execPath, ['scripts/doctor.mjs', '--strict'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const evidence = buildEvidence({
    atsPositive: readJson(INPUTS.atsPositive),
    atsBreak: readJson(INPUTS.atsBreak),
    gateAudit: readJson(INPUTS.gate),
    gateFixture: readJson(INPUTS.gateFixture),
    step3Review: readJson(INPUTS.step3Review),
    stagedFiles: git(['diff', '--cached', '--name-only']),
    trackedFiles: git(['ls-files']),
    doctorOutput,
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  fs.writeFileSync(OUTPUT_MD, `${renderMarkdown(evidence)}\n`, 'utf8');

  console.log(`${evidence.machine_result} Step 3 machine evidence`);
  console.log(`  privacy: ${evidence.ethics_gate.privacy}`);
  console.log(`  honesty/provenance: ${evidence.ethics_gate.honesty}`);
  console.log(`  human review: ${evidence.human_attestation.status}${evidence.human_attestation.reviewer ? ` by ${evidence.human_attestation.reviewer}` : ''}`);
  console.log(`  ${path.relative(REPO_ROOT, OUTPUT_MD)}`);
  return evidence.machine_result === 'PASS' ? 0 : 1;
}

const invokedAsScript = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (invokedAsScript) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`ERROR ${error.message}`);
    process.exitCode = 2;
  }
}
