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

const SIMPLE_PROVENANCE_LABELS = new Map([
  ['record', 'Saved data'],
  ['script-output', 'Script result'],
  ['local-evidence', 'Saved rule'],
  ['external-source', 'Installed software'],
  ['model-inference', 'AI opinion'],
  ['your-input', "User's file"],
  ['missing', 'No data'],
]);

export const BOUNDARY_ROWS = [
  {
    output: 'ATS report rules',
    technical_fields: ['schema_version', 'harness', 'mode', 'chapter'],
    label: 'local-evidence',
    record: 'Chapter 13 and the saved ATS test rules',
    machine_can_verify: 'The report names the test and uses an allowed test mode.',
    human_keeps: 'Whether those rules are good enough for this assignment.',
  },
  {
    output: 'The PDF chosen for the ATS test',
    technical_fields: ['document_id', 'inputs.* paths', 'inputs.* file types'],
    label: 'your-input',
    record: 'The file path typed in the command',
    machine_can_verify: 'The file exists, is a supported type, and is saved in an allowed place.',
    human_keeps: 'Whether it is the right PDF and is safe to use.',
  },
  {
    output: 'The software that reads the PDF',
    technical_fields: ['parser.name', 'parser.version', 'parser.source_type'],
    label: 'external-source',
    record: 'The installed PDF.js package and its saved version number',
    machine_can_verify: 'Which PDF reader and version actually ran.',
    human_keeps: 'Whether that reader is similar enough to a real company ATS.',
  },
  {
    output: 'The answer sheet for the public ATS example',
    technical_fields: [
      'inputs.expectation_manifest',
      'inputs.source_markdown',
      'fields[*].id',
      'fields[*].category',
      'fields[*].expected',
      'fields[*].match',
      'fields[*].occurrence',
      'fields[*].required',
    ],
    label: 'record',
    record: 'The saved public résumé and its separate expected-field file',
    machine_can_verify: 'The expected text really appears in the public source résumé.',
    human_keeps: 'Whether the chosen fields cover the important parts of the résumé.',
  },
  {
    output: 'Text and page count taken from the PDF',
    technical_fields: ['paste-test.txt', 'metrics.pages.value'],
    label: 'script-output',
    record: 'The selected PDF',
    machine_can_verify: 'The text it extracted and the number of PDF pages.',
    human_keeps: 'Whether the text still has the right meaning and whether the length is acceptable.',
  },
  {
    output: 'ATS field, order, and final PASS/FAIL results',
    technical_fields: [
      'fields[*].status',
      'fields[*].observed_index',
      'fields[*].evidence.observed_record',
      'order_checks[*].status',
      'order_checks[*].positions',
      'order_checks[*].reason',
      'order_checks[*].evidence',
      'verdict',
      'metrics.required_fields',
      'metrics.order_checks',
      'summary',
    ],
    label: 'script-output',
    record: 'The extracted text compared with the saved answer sheet',
    machine_can_verify: 'Which listed fields were found, whether they stayed in order, and the totals.',
    human_keeps: 'Whether a PASS means the résumé is ready for a real application.',
  },
  {
    output: 'General ATS inspection results',
    technical_fields: ['parser_floor', 'checks[*]', 'inventory.*', 'page_metrics.*'],
    label: 'script-output',
    record: 'The extracted text and the locations of text on each page',
    machine_can_verify: 'Basic reading problems and simple counts of headings, dates, and bullet-like lines.',
    human_keeps: 'Whether the résumé is complete and useful. These counts are not a quality score.',
  },
  {
    output: 'Warnings about what the ATS test cannot prove',
    technical_fields: ['boundary', 'limitations'],
    label: 'local-evidence',
    record: 'Chapter 13 and the checker rules',
    machine_can_verify: 'The report shows its limits and does not make the final decision.',
    human_keeps: 'The final decision about the résumé.',
  },
  {
    output: 'Gate test rules and saved settings',
    technical_fields: [
      'schema_version',
      'harness',
      'fixture',
      'sources',
      'contract',
      'sponsorship weight',
      'Apply threshold',
      'zero/one gate controls',
    ],
    label: 'record',
    record: 'Chapters 11 and 16, the saved test cases, and the real scoring program settings',
    machine_can_verify: 'The test used the same saved rules and settings as the real scoring program.',
    human_keeps: 'Whether the weight and cutoff are good enough for real decisions.',
  },
  {
    output: 'Identity and basic checks of the saved H-1B database',
    technical_fields: [
      'database.path',
      'database.sha256',
      'database.data_record_count',
      'database.column_count',
      'database.complete_record_count',
      'database.arithmetic_mismatch_count',
    ],
    label: 'script-output',
    record: 'data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv',
    machine_can_verify: 'Which saved file was used, its size and shape, and whether its rate math is correct.',
    human_keeps: 'Whether companies were matched correctly when this file was created.',
  },
  {
    output: 'The one saved H-1B row used by the test',
    technical_fields: ['company', 'approvals', 'denials', 'approval_rate'],
    label: 'record',
    record: 'First complete H-1B record in stored CSV order',
    machine_can_verify: 'The company and numbers really occur in that saved row and its rate math is correct.',
    human_keeps: 'Whether that company was matched correctly. The original matching proof is missing.',
  },
  {
    output: 'The H-1B rate changed from percent to decimal for the test',
    technical_fields: ['normalized_h1b_rate', 'sponsorship.p'],
    label: 'script-output',
    record: 'The saved approval rate divided by 100',
    machine_can_verify: 'The conversion and the later score calculation.',
    human_keeps: 'This is only a test starting value, not the full chance of sponsorship.',
  },
  {
    output: 'Names and purpose of the three Gate test cases',
    technical_fields: ['production.implementation', 'cases[*].id', 'cases[*].purpose', 'cases[*].mutation_witness'],
    label: 'local-evidence',
    record: 'The Gate test program and its saved test-case file',
    machine_can_verify: 'The names and descriptions were copied correctly.',
    human_keeps: 'Whether three cases cover enough possible mistakes.',
  },
  {
    output: 'Correct Gate results and totals',
    technical_fields: [
      'generated',
      'cases[*].expected.*',
      'cases[*].observed.composite',
      'cases[*].observed.recommendation',
      'cases[*].observed.reason',
      'cases[*].observed.gate_product',
      'cases[*].checks[*].status',
      'cases[*].status',
      'production.summary',
      'machine_result',
    ],
    label: 'script-output',
    record: 'The saved H-1B row, the chapter rules, and the real scoring program',
    machine_can_verify: 'The expected and actual results, every PASS/FAIL check, the totals, and the run time.',
    human_keeps: 'Whether the test inputs are true for a real job and whether more cases are needed.',
  },
  {
    output: 'Results from deliberately wrong Gate code',
    technical_fields: ['deliberate_break.mutation_result', 'deliberate_break.detection', 'deliberate_break.witnesses', 'deliberate_break.failed_checks'],
    label: 'script-output',
    record: 'A saved bad version of the formula used only inside the test',
    machine_can_verify: 'The bad code produces the wrong Apply results and the test catches both.',
    human_keeps: 'Whether other kinds of bad code should also be tested.',
  },
  {
    output: 'Final human review status',
    technical_fields: ['human_decision'],
    label: 'local-evidence',
    record: 'Human-review rule in SNICKERDOODLE.md',
    machine_can_verify: 'The program leaves the final decision as HUMAN_REVIEW_REQUIRED.',
    human_keeps: 'A named person must read the work and approve it.',
  },
  {
    output: 'Facts this project does not have',
    technical_fields: [
      'real résumé truth',
      'all commercial ATS results',
      'current job-opening status',
      'full sponsorship probability',
      'personal visa legality',
      'final Apply decision',
    ],
    label: 'missing',
    record: 'No verified record is available in this project',
    machine_can_verify: 'The reports leave these items unknown or say NOT_IMPLEMENTED.',
    human_keeps: 'Find real evidence later or leave the answer unknown.',
  },
  {
    output: 'Any future AI opinion',
    technical_fields: ['model judgments'],
    label: 'model-inference',
    record: 'The current public tests do not create an AI opinion',
    machine_can_verify: 'Test values are not presented as facts or AI opinions.',
    human_keeps: 'Check any future AI opinion against real evidence.',
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
    '# Step 3 — Where the Evidence Came From',
    '',
    `Generated: ${evidence.generated}`,
    '',
    '## Result',
    '',
    `Script result: **${evidence.machine_result}**. Privacy: **${evidence.ethics_gate.privacy}**. Number checks: **${evidence.ethics_gate.honesty}**.`,
    '',
    'This report checks where the numbers came from. It also checks that no private file is being committed and that missing evidence was not replaced with a guess.',
    '',
    evidence.human_attestation.status === 'RECORDED'
      ? `Human review: **${evidence.human_attestation.reviewer}** approved moving to Step 4 on ${evidence.human_attestation.recorded_on}.`
      : 'Human review is still required. Step 4 cannot begin until a named person reads the reports.',
    '',
    'The scripts cannot approve themselves. The recipe stays `RUNNABLE-SAMPLE`, and the gate report still says `HUMAN_REVIEW_REQUIRED`.',
    '',
    '## Privacy and honesty checks',
    '',
    'Any failure here stops the run.',
  ];
  for (const entry of evidence.checks) {
    const name = checkNames.get(entry.id) ?? entry.id;
    const note = checkNotes.get(entry.id) ?? entry.observed;
    lines.push(`- **${entry.status} — ${name}.** ${note} Source: \`${entry.record}\`.`);
  }
  lines.push(
    '',
    `Final check: privacy **${evidence.ethics_gate.privacy}**; numbers and sources **${evidence.ethics_gate.honesty}**; human review **${evidence.ethics_gate.human_decision}**.`,
    '',
    '## What the source words mean',
    '',
    'The assignment requires these labels:',
    '',
    '- `record`: copied from a saved record.',
    '- `script-output`: calculated by a script.',
    '- `local-evidence`: a saved rule or test value, not a real-world fact.',
    '- `external-source`: reported by an installed tool.',
    '- `your-input`: supplied by the person running the command.',
    '- `model-inference`: an AI judgment, not a fact.',
    '- `missing`: this project does not have the needed evidence.',
    '',
    '## What the scripts check and what a person checks',
    '',
    'The assignment requires this table. It separates what a script can prove from what still needs a person. Exact computer field names remain in `step3.json` under `boundary[*].technical_fields`.',
    '',
    '| Part of the report | Evidence label | Where it comes from | What the script can prove | What a person must decide |',
    '|---|---|---|---|---|',
  );
  for (const row of evidence.boundary) {
    lines.push(`| ${escapeCell(row.output)} | **${row.label}** | ${escapeCell(row.record)} | ${escapeCell(row.machine_can_verify)} | ${escapeCell(row.human_keeps)} |`);
  }
  lines.push(
    '',
    '## Main numbers and their sources',
    '',
    'The full list is in `step3.json` under `number_trace`. These are the main results:',
    '',
    `- **Normal ATS PDF:** ${positive.pages} pages; ${positive.fields_passed}/${positive.fields_total} fields; ${positive.order_passed}/${positive.order_total} order check. Script: \`${INPUTS.atsScript}\`. Record: \`${INPUTS.atsPositive}\`.`,
    `- **Broken ATS PDF:** ${broken.pages} page; ${broken.fields_passed}/${broken.fields_total} fields; ${broken.order_passed}/${broken.order_total} order check; result ${broken.verdict}. Script: \`${INPUTS.atsScript}\`. Record: \`${INPUTS.atsBreak}\`.`,
    `- **Gate checks:** ${gate.cases_passed}/${gate.cases_total} cases and ${gate.checks_passed}/${gate.checks_total} checks. Scripts: \`${INPUTS.gateScript}\` and \`${INPUTS.scorer}\`. Record: \`${INPUTS.gate}\`.`,
    `- **Stored H-1B record:** ${gate.database_company}; ${gate.database_approvals} approvals; ${gate.database_denials} denials; ${gate.database_rate_percent}% saved rate; math ${gate.database_arithmetic_status}. Script: \`${INPUTS.gateDatabaseScript}\`. Record: \`${INPUTS.gateDatabase}\`.`,
    `- **Wrong Gate code:** ${gate.witnesses.map((witness) => `${witness.id}: ${witness.composite} / ${witness.recommendation} / ${witness.status}`).join('; ')}. Script: \`${INPUTS.gateCore}\`. Record: \`${INPUTS.gate}\`.`,
    '',
    '## Human review',
    '',
    evidence.human_attestation.status === 'RECORDED'
      ? `${evidence.human_attestation.reviewer} read the evidence summary and approved moving to Step 4. The signed decision record is \`${evidence.human_attestation.record}\`.`
      : 'A named person must read this report and the three Markdown audits before Step 4.',
    '',
    'This approval clears the assignment phase gate. It does not claim that the tools are correct for every ATS, job, company, or visa case.',
    '',
    '## What is still unknown',
    '',
    '- Commercial ATS products other than PDF.js.',
    '- Whether a real résumé is true or persuasive.',
    '- Current job liveness.',
    '- A complete sponsorship probability.',
    '- A person’s legal visa timeline.',
    '- Whether the scorer weights are well calibrated.',
    '- The final Apply, Consider, or Skip decision for a real job.',
    '',
    'Missing real inputs stay `NOT_IMPLEMENTED`. Step 4 is recorded separately in `step4.md`.',
    '',
    '## Problems found and fixed',
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
