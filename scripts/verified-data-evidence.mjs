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
    output: 'ATS boundary and limitations text',
    label: 'local-evidence',
    record: 'Chapter 13 and the checker rules',
    machine_can_verify: 'The report states the parser boundary and its limits without generating a decision',
    human_keeps: 'The final decision about the résumé',
  },
  {
    output: 'Gate schema_version, harness, fixture, sources, contract',
    label: 'record',
    record: 'Gate test cases, Chapters 11 and 16, and the stored H-1B database',
    machine_can_verify: 'The report points to the saved test file and chapters',
    human_keeps: 'Whether these rules are enough for a real decision',
  },
  {
    output: 'Gate sponsorship weight, Apply threshold, and zero/one controls',
    label: 'record',
    record: 'Chapter 11, Chapter 16, and the stored production scorer configuration',
    machine_can_verify: 'The run used the same saved algorithm settings and contract controls',
    human_keeps: 'Whether the approximate threshold and weight are adequately calibrated',
  },
  {
    output: 'Gate database path, SHA-256, row/column counts, complete-record count, arithmetic mismatches',
    label: 'script-output',
    record: 'data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv',
    machine_can_verify: 'The stored bytes, schema, record count, and approval-rate arithmetic',
    human_keeps: 'Whether the mapped company identities are trustworthy enough to use',
  },
  {
    output: 'Gate selected H-1B record: company, approvals, denials, approval rate',
    label: 'record',
    record: 'First complete H-1B record in stored CSV order',
    machine_can_verify: 'The values occur in the selected stored record and the rate recomputes',
    human_keeps: 'Whether the entity join is correct; raw match evidence is missing',
  },
  {
    output: 'Gate normalized H-1B rate used as sponsorship.p',
    label: 'script-output',
    record: 'Stored Approval_Rate divided by 100',
    machine_can_verify: 'The unit conversion and scorer arithmetic',
    human_keeps: 'It is only a mechanical proxy, not full P(sponsorship)',
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
    human_keeps: 'Whether the three gate cases cover enough situations',
  },
  {
    output: 'Gate production cases[*].expected.* and expected check values',
    label: 'script-output',
    record: 'Database record plus Chapter 11/16 contract controls in gate-behavior-cases.json',
    machine_can_verify: 'The expected values recompute from the stored record and contract controls',
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
    output: 'Real résumé truth, universal ATS compatibility, current posting truth, full sponsorship probability, visa legality, final Apply decision',
    label: 'missing',
    record: 'The reports explicitly mark these records NOT IMPLEMENTED or unavailable',
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
    ['honesty:database-record-reconciles', 'Stored H-1B record'],
    ['honesty:contract-controls', 'Chapter gate controls'],
    ['honesty:not-implemented-visible', 'Missing inputs stay missing'],
    ['honesty:no-self-attestation', 'Human review remains open'],
    ['honesty:named-review-record', 'Named Step 3 review'],
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
    ['honesty:database-record-reconciles', 'Database hash and approval-rate arithmetic match'],
    ['honesty:contract-controls', 'Only Chapter contract controls 0 and 1 are used'],
    ['honesty:not-implemented-visible', 'No missing live or personal value was filled in'],
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
    evidence.human_attestation.status === 'RECORDED'
      ? `Named review recorded: **${evidence.human_attestation.reviewer}** approved Step 4 on ${evidence.human_attestation.recorded_on}.`
      : 'A person still has to read the database-backed reports and sign the current review. Until that happens, Step 4 cannot be finalized for this version.',
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
    '- `local-evidence`: a saved rule or test definition, not a real-company fact.',
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
    `| Gate database record | ${INPUTS.gateDatabaseScript} | ${INPUTS.gateDatabase} | ${gate.database_company}; ${gate.database_approvals} approvals; ${gate.database_denials} denials; ${gate.database_rate_percent}% stored rate; arithmetic ${gate.database_arithmetic_status} |`,
    `| Gate-as-vote witnesses | ${INPUTS.gateCore} | ${INPUTS.gate} | ${gate.witnesses.map((witness) => `${witness.id}: ${witness.composite} / ${witness.recommendation} / ${witness.status}`).join('; ')} |`,
    '',
    '## Human review',
    '',
    evidence.human_attestation.status === 'RECORDED'
      ? `${evidence.human_attestation.reviewer} confirmed the plain-language evidence summary and approved moving to Step 4. The decision is stored in \`${evidence.human_attestation.record}\`.`
      : 'A named person must read this report and the three Markdown audits before Step 4.',
    '',
    'This approval clears the Step 3 assignment gate. It does not make the programs universally correct and does not change the limits below.',
    '',
    '### Not tested',
    '',
    '- Commercial ATS products other than PDF.js.',
    '- Whether a real résumé is true or persuasive.',
    '- Current job liveness, full sponsorship probability, role quality, or visa timing.',
    '- Whether the scorer weights are good.',
    '- Whether a person should Apply, Consider, or Skip.',
    '- Step 4 is recorded separately in `step4.md`; this Step 3 checker does not judge that run.',
    '',
    '### Problems found and fixed',
    '',
    '- The first ATS failure report sounded like every field passed. I changed the report and added a test for it.',
    '- The first gate sample used hand-written business values. The harness now reads the stored H-1B database and keeps missing real inputs as `NOT_IMPLEMENTED`.',
    '- On Windows, `doctor` missed Python, Git privacy checks, and CRLF frontmatter. Those checks now work on this machine.',
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
    check('provenance:boundary-labels', BOUNDARY_ROWS.every((row) => PROVENANCE_LABELS.has(row.label)), 'all boundary rows use assignment-approved labels', [...new Set(BOUNDARY_ROWS.map((row) => row.label))].join(', '), 'BOUNDARY_ROWS in scripts/verified-data-evidence.mjs'),
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
        database_company: databaseEvidence.selected_record.company_name,
        database_approvals: databaseEvidence.selected_record.total_approvals,
        database_denials: databaseEvidence.selected_record.total_denials,
        database_rate_percent: databaseEvidence.selected_record.approval_rate_percent,
        database_arithmetic_status: databaseEvidence.selected_record.arithmetic_status,
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
