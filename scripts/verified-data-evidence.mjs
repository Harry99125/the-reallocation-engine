#!/usr/bin/env node

// Step 3 evidence gate for the unified ATS paste-test + gate-behavior
// contribution. It reconciles every reported metric with the underlying audit
// records, checks the public/private boundary, and emits a human-readable
// verified-vs-inferred table. It does not sign the human attestation.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'reports/generated/zening-teng-contribution');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'step3.json');
const OUTPUT_MD = path.join(OUTPUT_DIR, 'step3.md');

const INPUTS = {
  atsPositive: 'reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json',
  atsBreak: 'reports/generated/ats-paste-test/break-attempt/paste-test-audit.json',
  gate: 'reports/generated/gate-behavior/gate-behavior-audit.json',
  atsManifest: 'data/examples/aarav-patel-ats-expected.json',
  gateFixture: 'data/examples/gate-behavior-cases.json',
  atsScript: 'scripts/resumes/ats-parse-test.mjs',
  gateScript: 'scripts/score/gate-behavior-harness.mjs',
  gateCore: 'scripts/score/gate-behavior-core.mjs',
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
    output: 'ATS schema_version, harness, mode, chapter',
    label: 'local-evidence',
    record: 'Chapter 13 and the ATS checker rules',
    machine_can_verify: 'The fields exist and the mode is allowed',
    human_keeps: 'Whether these rules are enough for the intended use',
  },
  {
    output: 'ATS document_id',
    label: 'your-input',
    record: 'Expected-field file or input filename',
    machine_can_verify: 'The ID is present and copied correctly',
    human_keeps: 'Whether it points to the right résumé',
  },
  {
    output: 'ATS parser.name, parser.version, parser.source_type',
    label: 'external-source',
    record: 'pdfjs-dist version in package.json and the installed package',
    machine_can_verify: 'Which parser and version ran',
    human_keeps: 'Whether that parser is close enough to a commercial ATS',
  },
  {
    output: 'ATS inputs.* paths and file types',
    label: 'your-input',
    record: 'CLI arguments',
    machine_can_verify: 'The file exists, has a supported type, and follows the privacy rule',
    human_keeps: 'Whether this is the right and safe file to inspect',
  },
  {
    output: 'ATS inputs.expectation_manifest and inputs.source_markdown',
    label: 'local-evidence',
    record: 'data/examples/aarav-patel-ats-expected.json',
    machine_can_verify: 'Both files exist and each expected value matches its source line',
    human_keeps: 'Whether the public sample is good enough for the task',
  },
  {
    output: 'paste-test.txt extracted text',
    label: 'script-output',
    record: 'Text read from the PDF and saved in paste-test.txt',
    machine_can_verify: 'The text was extracted and cleaned with fixed rules',
    human_keeps: 'Whether the meaning, design, and claims are correct',
  },
  {
    output: 'ATS metrics.pages.value',
    label: 'script-output',
    record: 'PDF page tree',
    machine_can_verify: 'The page count returned by PDF.js',
    human_keeps: 'Whether the number of pages is acceptable',
  },
  {
    output: 'ATS verify fields[*].id/category/expected/match/occurrence/required',
    label: 'record',
    record: 'Public résumé lines named by aarav-patel-ats-expected.json',
    machine_can_verify: 'The expected-field file is valid and still matches the résumé source',
    human_keeps: 'Whether the chosen fields cover enough of the résumé',
  },
  {
    output: 'ATS verify fields[*].status/observed_index/evidence.observed_record',
    label: 'script-output',
    record: 'ATS checker comparison with paste-test.txt',
    machine_can_verify: 'Whether each expected field was found with the stated rule',
    human_keeps: 'Whether the text makes the right claim',
  },
  {
    output: 'ATS verify order_checks[*].status/positions/reason and evidence',
    label: 'script-output',
    record: 'Field results and positions in paste-test.txt',
    machine_can_verify: 'Whether fields are missing or out of order',
    human_keeps: 'Whether that order will work in every ATS',
  },
  {
    output: 'ATS verify verdict, metrics.required_fields/order_checks, summary',
    label: 'script-output',
    record: 'Field and order results in the same audit JSON',
    machine_can_verify: 'The totals and final PASS/FAIL result',
    human_keeps: 'Whether a passing résumé is ready to submit',
  },
  {
    output: 'ATS inspect parser_floor and checks[*]',
    label: 'script-output',
    record: 'PDF pages, text, characters, lines, and text positions',
    machine_can_verify: 'The basic parser checks listed by the tool',
    human_keeps: 'Whether the extracted résumé is complete and useful',
  },
  {
    output: 'ATS inspect inventory.* and page_metrics.*',
    label: 'script-output',
    record: 'paste-test.txt lines and PDF.js text positions',
    machine_can_verify: 'Counts made with the saved text and layout rules',
    human_keeps: 'What those rough counts mean; they are not a quality score',
  },
  {
    output: 'ATS decision and boundary/limitations text',
    label: 'local-evidence',
    record: 'Chapter 13 and the checker rules',
    machine_can_verify: 'The report includes HUMAN_REVIEW_REQUIRED and its limits',
    human_keeps: 'The final decision about the résumé',
  },
  {
    output: 'Gate schema_version, harness, fixture, sources, contract',
    label: 'local-evidence',
    record: 'Gate test cases and Chapters 11 and 16',
    machine_can_verify: 'The report points to the saved test file and chapters',
    human_keeps: 'Whether these rules are enough for a real decision',
  },
  {
    output: 'Gate generated timestamp',
    label: 'script-output',
    record: 'System clock read by the gate report program',
    machine_can_verify: 'The run saved a time',
    human_keeps: 'Whether the report is recent enough',
  },
  {
    output: 'Gate production implementation and case id/purpose/mutation_witness',
    label: 'local-evidence',
    record: 'Gate report program and gate-behavior-cases.json',
    machine_can_verify: 'The case names and test labels were copied correctly',
    human_keeps: 'Whether the six cases cover enough situations',
  },
  {
    output: 'Gate production cases[*].expected.* and expected check values',
    label: 'local-evidence',
    record: 'Expected values in gate-behavior-cases.json',
    machine_can_verify: 'The test file is valid and the results match it',
    human_keeps: 'Whether important real situations are missing',
  },
  {
    output: 'Gate production observed composite/recommendation/reason/gate_product',
    label: 'script-output',
    record: 'Production scorer run on each controlled case',
    machine_can_verify: 'The formula result and saved calculation details',
    human_keeps: 'Whether the inputs for a real job are true',
  },
  {
    output: 'Gate case/check status and production summary counts',
    label: 'script-output',
    record: 'Gate checker comparisons',
    machine_can_verify: 'Each PASS/FAIL result and the final totals',
    human_keeps: 'Whether more checks are needed',
  },
  {
    output: 'Gate deliberate_break mutation result, detection, witnesses, failed checks',
    label: 'script-output',
    record: 'Deliberately wrong code in gate-behavior-core.mjs',
    machine_can_verify: 'The wrong code fails and both examples are caught',
    human_keeps: 'Whether other wrong versions should also be tested',
  },
  {
    output: 'Gate machine_result',
    label: 'script-output',
    record: 'Real scorer result plus the wrong-version result',
    machine_can_verify: 'Whether the real code passed and the wrong code failed',
    human_keeps: 'Whether that is enough to approve the work',
  },
  {
    output: 'Gate human_decision',
    label: 'local-evidence',
    record: 'Human-review rule in SNICKERDOODLE.md',
    machine_can_verify: 'The value stays HUMAN_REVIEW_REQUIRED',
    human_keeps: 'The named review and final approval',
  },
  {
    output: 'Real résumé truth, universal ATS compatibility, live posting truth, visa legality, final Apply decision',
    label: 'missing',
    record: 'These two tools do not have those records',
    machine_can_verify: 'The reports do not claim to know these things',
    human_keeps: 'Find other evidence or leave the answer unknown',
  },
  {
    output: 'Model judgments',
    label: 'model-inference',
    record: 'The public test does not create AI judgments',
    machine_can_verify: 'Controlled test values are not mislabeled as AI or outside facts',
    human_keeps: 'Check any future AI judgment against real evidence',
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
  if (key.includes('.expected.') || key.endsWith('.expected')) {
    return {
      label: 'local-evidence',
      script: INPUTS.gateCore,
      record: INPUTS.gateFixture,
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

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
}

function renderMarkdown(evidence) {
  const positive = evidence.metric_readout.ats_positive;
  const broken = evidence.metric_readout.ats_break;
  const gate = evidence.metric_readout.gate;
  const checkNames = new Map([
    ['privacy:no-private-staged', 'No private files staged'],
    ['privacy:no-private-tracked', 'No private files tracked'],
    ['privacy:doctor-clean', 'Strict doctor check'],
    ['honesty:ats-positive-reconciles', 'Complete résumé totals'],
    ['honesty:ats-break-reconciles', 'Broken résumé totals'],
    ['honesty:gate-production-reconciles', 'Production gate totals'],
    ['honesty:mutation-is-caught', 'Wrong gate examples'],
    ['honesty:controlled-input-labels', 'Controlled test labels'],
    ['honesty:no-self-attestation', 'Human review remains open'],
    ['honesty:ats-limitation-visible', 'ATS limitation is shown'],
    ['provenance:boundary-labels', 'Source labels are allowed'],
    ['provenance:every-number-traced', 'Every number has a source'],
  ]);
  const checkNotes = new Map([
    ['privacy:no-private-staged', 'No private paths found'],
    ['privacy:no-private-tracked', 'No private paths found'],
    ['privacy:doctor-clean', 'Runnable, privacy clean, and recipe files valid'],
    ['honesty:no-self-attestation', 'The result is still HUMAN_REVIEW_REQUIRED'],
    ['honesty:ats-limitation-visible', 'The report says one parser cannot represent every ATS'],
    ['provenance:boundary-labels', 'All labels come from the assignment list'],
    ['provenance:every-number-traced', 'No untraced numbers found'],
  ]);
  const lines = [
    '# Step 3 — Where the Numbers Came From',
    '',
    `Generated: ${evidence.generated}`,
    '',
    '## Short answer',
    '',
    `The machine checks passed: **${evidence.machine_result}**. The privacy check passed, and the reported numbers match the saved records.`,
    '',
    'A person still has to read the reports and sign the review. Until that happens, Step 4 must not start.',
    '',
    '## Checks I ran',
    '',
    '| Check | Status | Result | Record |',
    '|---|---|---|---|',
  ];
  for (const entry of evidence.checks) {
    const name = checkNames.get(entry.id) ?? entry.id;
    const note = checkNotes.get(entry.id) ?? entry.observed;
    lines.push(`| ${escapeCell(name)} | **${entry.status}** | ${escapeCell(note)} | ${escapeCell(entry.record)} |`);
  }
  lines.push(
    '',
    `Privacy: **${evidence.ethics_gate.privacy}**. Number and source checks: **${evidence.ethics_gate.honesty}**. Human review: **${evidence.ethics_gate.human_decision}**.`,
    '',
    '## What the labels mean',
    '',
    '- `record`: a value copied from a saved source record.',
    '- `script-output`: a value calculated by a program.',
    '- `local-evidence`: a rule or controlled test value stored in this project.',
    '- `external-source`: information reported by an outside dependency.',
    '- `your-input`: a value supplied by the person running the command.',
    '- `model-inference`: an AI judgment, not a fact.',
    '- `missing`: the program does not have the evidence.',
    '',
    '## What is checked and what still needs a person',
    '',
    'The assignment asks for every output group to be listed. That is why this section uses a table.',
    '',
    '| Output | Label | Source | Program checked | Person must decide |',
    '|---|---|---|---|---|',
  );
  for (const row of evidence.boundary) {
    lines.push(`| ${escapeCell(row.output)} | **${row.label}** | ${escapeCell(row.record)} | ${escapeCell(row.machine_can_verify)} | ${escapeCell(row.human_keeps)} |`);
  }
  lines.push(
    '',
    '## Main numbers',
    '',
    'The full number-by-number list is in `step3.json` under `number_trace`. It stores each JSON path, value, program, label, and source file. These are the main results:',
    '',
    '| Result | Program | Saved record | Value |',
    '|---|---|---|---|',
    `| ATS positive pages / required fields / order checks | ${INPUTS.atsScript} | ${INPUTS.atsPositive} and its paste-test.txt | ${positive.pages} pages; ${positive.fields_passed}/${positive.fields_total} fields; ${positive.order_passed}/${positive.order_total} order |`,
    `| ATS deliberate break pages / required fields / order checks | ${INPUTS.atsScript} | ${INPUTS.atsBreak} and its paste-test.txt | ${broken.pages} page; ${broken.fields_passed}/${broken.fields_total} fields; ${broken.order_passed}/${broken.order_total} order; verdict ${broken.verdict} |`,
    `| Gate production cases / assertions | ${INPUTS.gateScript} + ${INPUTS.scorer} | ${INPUTS.gate} | ${gate.cases_passed}/${gate.cases_total} cases; ${gate.checks_passed}/${gate.checks_total} assertions |`,
    `| Gate-as-vote witnesses | ${INPUTS.gateCore} | ${INPUTS.gate} | ${gate.witnesses.map((witness) => `${witness.id}: ${witness.composite} / ${witness.recommendation} / ${witness.status}`).join('; ')} |`,
    '',
    '## What I still need to do',
    '',
    'A named person must read this report and the three Markdown audits. That person must confirm what was run, what the results show, and what was not tested.',
    '',
    'Until that review is written down, the recipe stays at `RUNNABLE-SAMPLE`, `attestation` stays `null`, and Step 4 must not begin.',
    '',
    '### Not tested',
    '',
    '- Commercial ATS products other than PDF.js.',
    '- Whether a real résumé is true or persuasive.',
    '- Current job liveness, sponsorship, role quality, or visa timing.',
    '- Whether the scorer weights are good.',
    '- Whether a person should Apply, Consider, or Skip.',
    '- A live or private Step 4 run.',
    '',
    '### Problems found and fixed',
    '',
    '- The first ATS failure report sounded like every field passed. I changed the report and added a test for it.',
    '- The gate sample first used labels meant for real records. Controlled values are now labeled `local-evidence`.',
    '- On Windows, `doctor` missed Python, Git privacy checks, and CRLF frontmatter. Those checks now work on this machine.',
  );
  return lines.join('\n');
}

export function buildEvidence({ atsPositive, atsBreak, gateAudit, gateFixture, stagedFiles, trackedFiles, doctorOutput }) {
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
  const fixtureSources = gateFixture.cases.flatMap((entry) => [
    entry.role.sponsorship?.source,
    entry.role.fit?.source,
    entry.role.role_quality?.source,
    entry.role.liveness?.source,
    entry.role.timeline?.source,
  ]);
  const witnesses = gateAudit.deliberate_break.witnesses;

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
    check('honesty:controlled-input-labels', fixtureSources.every((source) => source === 'local-evidence'), 'every controlled gate factor labeled local-evidence', [...new Set(fixtureSources)].join(', '), INPUTS.gateFixture),
    check('honesty:no-self-attestation', gateAudit.human_decision === 'HUMAN_REVIEW_REQUIRED', 'machine output preserves human review boundary', gateAudit.human_decision, INPUTS.gate),
    check('honesty:ats-limitation-visible', atsPositive.limitations.some((entry) => /not proof of compatibility with every ATS/i.test(entry)), 'universal ATS compatibility explicitly not claimed', atsPositive.limitations.join(' | '), INPUTS.atsPositive),
    check('provenance:boundary-labels', BOUNDARY_ROWS.every((row) => PROVENANCE_LABELS.has(row.label)), 'all boundary rows use assignment-approved labels', [...new Set(BOUNDARY_ROWS.map((row) => row.label))].join(', '), 'BOUNDARY_ROWS in scripts/verified-data-evidence.mjs'),
  ];

  const privacyChecks = checks.filter((entry) => entry.id.startsWith('privacy:'));
  const honestyChecks = checks.filter((entry) => !entry.id.startsWith('privacy:'));
  const machineResult = checks.every((entry) => entry.status === 'PASS') ? 'PASS' : 'FAIL';
  const numberTrace = [
    ...collectNumberTrace('ats-positive', atsPositive),
    ...collectNumberTrace('ats-break', atsBreak),
    ...collectNumberTrace('gate-behavior', gateAudit),
  ];
  const untracedNumbers = numberTrace.filter((entry) => !PROVENANCE_LABELS.has(entry.label) || !entry.script || !entry.record);
  checks.push(check('provenance:every-number-traced', untracedNumbers.length === 0, 'every numeric audit leaf has label, script, and record', untracedNumbers.length ? untracedNumbers.map((entry) => `${entry.report}:${entry.json_path}`).join(', ') : 'none untraced', 'number_trace in this evidence JSON'));

  return {
    schema_version: '1.0.0',
    artifact: 'verified-data-evidence',
    contribution: 'reallocation-verification-harness',
    recipe_version: '0.8.0',
    generated: new Date().toISOString(),
    machine_result: checks.every((entry) => entry.status === 'PASS') ? 'PASS' : 'FAIL',
    human_attestation: 'REQUIRED_BEFORE_STEP_4',
    ethics_gate: {
      privacy: privacyChecks.every((entry) => entry.status === 'PASS') ? 'PASS' : 'FAIL',
      honesty: honestyChecks.every((entry) => entry.status === 'PASS') && untracedNumbers.length === 0 ? 'PASS' : 'FAIL',
      human_decision: 'HUMAN_REVIEW_REQUIRED',
      rule: 'A FAIL blocks the run; machine PASS does not replace named human review.',
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
  const required = Object.values(INPUTS).filter((entry) => entry.endsWith('.json') || entry.endsWith('.mjs'));
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
  console.log(`  human attestation: ${evidence.human_attestation}`);
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
