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
    record: 'Harness contract and Chapter 13',
    machine_can_verify: 'Presence and allowed mode',
    human_keeps: 'Whether this contract is adequate for the intended workflow',
  },
  {
    output: 'ATS document_id',
    label: 'your-input',
    record: 'Expectation manifest in verify mode; input filename in inspect mode',
    machine_can_verify: 'Identifier is nonempty and consistently copied',
    human_keeps: 'Whether the identifier names the intended résumé',
  },
  {
    output: 'ATS parser.name, parser.version, parser.source_type',
    label: 'external-source',
    record: 'Exact pdfjs-dist dependency in package.json plus installed module metadata',
    machine_can_verify: 'Parser identity/version used for this run',
    human_keeps: 'Whether this parser represents a target commercial ATS',
  },
  {
    output: 'ATS inputs.* paths and file types',
    label: 'your-input',
    record: 'CLI arguments',
    machine_can_verify: 'Existence, supported extension, and private-output policy',
    human_keeps: 'Whether the input is appropriate and safe to inspect',
  },
  {
    output: 'ATS inputs.expectation_manifest and inputs.source_markdown',
    label: 'local-evidence',
    record: 'data/examples/aarav-patel-ats-expected.json',
    machine_can_verify: 'Manifest/source existence and source-line agreement',
    human_keeps: 'Whether the declared public sample is suitable evidence',
  },
  {
    output: 'paste-test.txt extracted text',
    label: 'script-output',
    record: 'PDF text items from the named input, written to paste-test.txt',
    machine_can_verify: 'Extraction and deterministic normalization',
    human_keeps: 'Semantic completeness, visual adequacy, and factual truth',
  },
  {
    output: 'ATS metrics.pages.value',
    label: 'script-output',
    record: 'PDF page tree',
    machine_can_verify: 'Page count returned by PDF.js',
    human_keeps: 'Whether pagination is professionally acceptable',
  },
  {
    output: 'ATS verify fields[*].id/category/expected/match/occurrence/required',
    label: 'record',
    record: 'resumes/aarav-patel-cv.md source lines, located by data/examples/aarav-patel-ats-expected.json',
    machine_can_verify: 'Manifest shape and expectation/source drift',
    human_keeps: 'Whether the declared fields are sufficient for the intended hiring workflow',
  },
  {
    output: 'ATS verify fields[*].status/observed_index/evidence.observed_record',
    label: 'script-output',
    record: 'scripts/resumes/ats-parse-test.mjs comparison against paste-test.txt',
    machine_can_verify: 'Presence under the declared match and occurrence rules',
    human_keeps: 'Whether a present string conveys the correct résumé claim',
  },
  {
    output: 'ATS verify order_checks[*].status/positions/reason and evidence',
    label: 'script-output',
    record: 'Field results and paste-test.txt offsets',
    machine_can_verify: 'Declared linear order and missing fields',
    human_keeps: 'Whether the reading order is usable in every ATS',
  },
  {
    output: 'ATS verify verdict, metrics.required_fields/order_checks, summary',
    label: 'script-output',
    record: 'Per-field and per-order records in the same audit JSON',
    machine_can_verify: 'Counts and PASS/FAIL reconciliation',
    human_keeps: 'Whether mechanical PASS is adequate to submit',
  },
  {
    output: 'ATS inspect parser_floor and checks[*]',
    label: 'script-output',
    record: 'PDF page tree, text layer, Unicode/control characters, line structure, and text-item geometry',
    machine_can_verify: 'The named deterministic parser-floor rules',
    human_keeps: 'Whether the extracted résumé is complete and useful',
  },
  {
    output: 'ATS inspect inventory.* and page_metrics.*',
    label: 'script-output',
    record: 'paste-test.txt lines and PDF.js text-item geometry',
    machine_can_verify: 'Counts under the documented regex/geometry rules',
    human_keeps: 'Inventory meaning; these counts are heuristic, not résumé quality',
  },
  {
    output: 'ATS decision and boundary/limitations text',
    label: 'local-evidence',
    record: 'Chapter 13 scope and maintained harness policy',
    machine_can_verify: 'HUMAN_REVIEW_REQUIRED and limitation text are present',
    human_keeps: 'The actual adequacy decision',
  },
  {
    output: 'Gate schema_version, harness, fixture, sources, contract',
    label: 'local-evidence',
    record: 'data/examples/gate-behavior-cases.json and Chapters 11/16',
    machine_can_verify: 'Fixture and source binding',
    human_keeps: 'Whether the chapter contract is adequate for a real decision',
  },
  {
    output: 'Gate generated timestamp',
    label: 'script-output',
    record: 'System clock read by scripts/score/gate-behavior-harness.mjs',
    machine_can_verify: 'A timestamp was emitted for this execution',
    human_keeps: 'Whether the evidence is recent enough for the intended use',
  },
  {
    output: 'Gate production implementation and case id/purpose/mutation_witness',
    label: 'local-evidence',
    record: 'scripts/score/gate-behavior-harness.mjs and data/examples/gate-behavior-cases.json',
    machine_can_verify: 'Identifiers and controlled-case declarations are copied consistently',
    human_keeps: 'Whether the cases are representative',
  },
  {
    output: 'Gate production cases[*].expected.* and expected check values',
    label: 'local-evidence',
    record: 'data/examples/gate-behavior-cases.json controlled truth table',
    machine_can_verify: 'Fixture shape and exact comparison',
    human_keeps: 'Whether the controlled cases cover all important real-world states',
  },
  {
    output: 'Gate production observed composite/recommendation/reason/gate_product',
    label: 'script-output',
    record: 'scripts/score/role-scorer.mjs run on each controlled fixture role',
    machine_can_verify: 'Formula result and trace shape/value',
    human_keeps: 'Truth of any upstream real-role factor',
  },
  {
    output: 'Gate case/check status and production summary counts',
    label: 'script-output',
    record: 'scripts/score/gate-behavior-core.mjs comparisons',
    machine_can_verify: 'Every status and aggregate count reconciles',
    human_keeps: 'Adequacy of the assertions',
  },
  {
    output: 'Gate deliberate_break mutation result, detection, witnesses, failed checks',
    label: 'script-output',
    record: 'Deliberate gate-as-vote implementation in scripts/score/gate-behavior-core.mjs',
    machine_can_verify: 'The wrong implementation fails and both named witnesses are caught',
    human_keeps: 'Whether other plausible mutations should also be tested',
  },
  {
    output: 'Gate machine_result',
    label: 'script-output',
    record: 'Production contract verdict plus mutation-detection result',
    machine_can_verify: 'Mechanical handoff condition',
    human_keeps: 'No adequacy claim follows automatically',
  },
  {
    output: 'Gate human_decision',
    label: 'local-evidence',
    record: 'SNICKERDOODLE.md human-gate policy',
    machine_can_verify: 'Value remains HUMAN_REVIEW_REQUIRED',
    human_keeps: 'Named review, ethics clearance, and final go/no-go',
  },
  {
    output: 'Real résumé truth, universal ATS compatibility, live posting truth, visa legality, final Apply decision',
    label: 'missing',
    record: 'No qualifying record exists inside these two harnesses',
    machine_can_verify: 'The reports do not claim these capabilities',
    human_keeps: 'Supply independent evidence or leave the result unknown',
  },
  {
    output: 'Model judgments',
    label: 'model-inference',
    record: 'Not emitted by the controlled public sample; any future model-derived value must carry this label',
    machine_can_verify: 'Controlled fixture sources are not mislabeled as model or external records',
    human_keeps: 'Judge any future inference against reality',
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
  const lines = [
    '# Verified-data evidence — Reallocation Verification Harness',
    '',
    `- Generated: ${evidence.generated}`,
    `- Machine evidence result: **${evidence.machine_result}**`,
    '- Human attestation: **REQUIRED BEFORE STEP 4**',
    '- Scope: one unified contribution containing the Chapter 13 ATS paste-test and Chapter 11/16 gate-behavior harness.',
    '',
    'This is the machine evidence packet for Step 3. It reconciles records and exposes the boundary; it does not self-certify human adequacy or honesty.',
    '',
    '## Ethics gate evidence',
    '',
    '| Check | Status | Expected | Observed | Record |',
    '|---|---|---|---|---|',
  ];
  for (const entry of evidence.checks) {
    lines.push(`| ${escapeCell(entry.id)} | **${entry.status}** | ${escapeCell(entry.expected)} | ${escapeCell(entry.observed)} | ${escapeCell(entry.record)} |`);
  }
  lines.push(
    '',
    `Privacy machine gate: **${evidence.ethics_gate.privacy}**. Mechanical honesty/provenance gate: **${evidence.ethics_gate.honesty}**. Human ethics decision: **${evidence.ethics_gate.human_decision}**.`,
    '',
    '## Verified-vs-inferred boundary',
    '',
    '| Emitted field/number family | Label | Record | Machine can verify | Human keeps |',
    '|---|---|---|---|---|',
  );
  for (const row of evidence.boundary) {
    lines.push(`| ${escapeCell(row.output)} | **${row.label}** | ${escapeCell(row.record)} | ${escapeCell(row.machine_can_verify)} | ${escapeCell(row.human_keeps)} |`);
  }
  lines.push(
    '',
    '## Number trace and metric readout',
    '',
    'Every numeric leaf in the three machine audits is enumerated in `step3.json` under `number_trace`, with its JSON path, value, producing script, provenance label, and source record. The headline figures are:',
    '',
    '| Figure | Script | Record | Observed |',
    '|---|---|---|---|',
    `| ATS positive pages / required fields / order checks | ${INPUTS.atsScript} | ${INPUTS.atsPositive} and its paste-test.txt | ${positive.pages} pages; ${positive.fields_passed}/${positive.fields_total} fields; ${positive.order_passed}/${positive.order_total} order |`,
    `| ATS deliberate break pages / required fields / order checks | ${INPUTS.atsScript} | ${INPUTS.atsBreak} and its paste-test.txt | ${broken.pages} page; ${broken.fields_passed}/${broken.fields_total} fields; ${broken.order_passed}/${broken.order_total} order; verdict ${broken.verdict} |`,
    `| Gate production cases / assertions | ${INPUTS.gateScript} + ${INPUTS.scorer} | ${INPUTS.gate} | ${gate.cases_passed}/${gate.cases_total} cases; ${gate.checks_passed}/${gate.checks_total} assertions |`,
    `| Gate-as-vote witnesses | ${INPUTS.gateCore} | ${INPUTS.gate} | ${gate.witnesses.map((witness) => `${witness.id}: ${witness.composite} / ${witness.recommendation} / ${witness.status}`).join('; ')} |`,
    '',
    '## Human attestation handoff',
    '',
    'A named human must now read this report plus the three underlying Markdown audits, confirm that no sample résumé claim or limitation is misleading, and record what was run/seen/expected plus what was not tested. Until then, the recipe remains `RUNNABLE-SAMPLE`, `attestation: null`, and Step 4 must not begin.',
    '',
    '### Did not test',
    '',
    '- Compatibility with commercial ATS products other than the named PDF.js parser.',
    '- Factual truth or persuasiveness of any real résumé.',
    '- Current liveness, sponsorship, role quality, or legal correctness of a real visa timeline.',
    '- Calibration of scorer weights or the wisdom of a real Apply/Consider/Skip decision.',
    '- A live/private run; that belongs to Step 4 after a named human clears this ethics gate.',
    '',
    '### Broke during testing, fixed',
    '',
    '- The ATS failure report initially described a FAIL run as though all strings were present and ordered; rendering was made verdict-aware and regression-covered.',
    '- The gate fixture initially reused real-run provenance labels for controlled values; all controlled factors are now labeled `local-evidence`.',
    '- On Windows, `doctor` initially missed the installed `python` runtime, skipped privacy under Git safe-directory protection, and missed CRLF recipe frontmatter; the checks now use a Windows Python fallback, explicit repository-scoped Git safety, and CRLF-safe parsing.',
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
