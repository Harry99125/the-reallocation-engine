import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
export const DEFAULT_DATABASE = path.join(
  REPO_ROOT,
  'data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv',
);

const REQUIRED_COLUMNS = [
  'company_name',
  'Total Approvals',
  'Total Denials',
  'Approval_Rate',
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error('Database CSV ends inside a quoted field.');
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}

function finiteNumber(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function relative(filePath) {
  return path.relative(REPO_ROOT, filePath).replaceAll('\\', '/');
}

export async function loadGateDatabaseEvidence(databasePath = DEFAULT_DATABASE) {
  const bytes = await readFile(databasePath);
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  const parsed = parseCsv(text);
  if (parsed.length < 2) throw new Error('Gate database contains no data records.');

  const headers = parsed[0];
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  if (missingColumns.length > 0) {
    throw new Error(`Gate database is missing required column(s): ${missingColumns.join(', ')}`);
  }

  const records = parsed.slice(1).filter((row) => row.some((value) => value !== ''));
  const column = Object.fromEntries(headers.map((header, index) => [header, index]));
  const complete = [];
  let approvalRateMismatches = 0;

  records.forEach((row, dataIndex) => {
    const approvals = finiteNumber(row[column['Total Approvals']]);
    const denials = finiteNumber(row[column['Total Denials']]);
    const approvalRatePercent = finiteNumber(row[column.Approval_Rate]);
    const denominator = approvals == null || denials == null ? null : approvals + denials;
    if (approvals == null || denials == null || approvalRatePercent == null || denominator <= 0) return;

    const recomputedApprovalRatePercent = (approvals / denominator) * 100;
    const arithmeticPass = Math.abs(recomputedApprovalRatePercent - approvalRatePercent) <= 1e-9;
    if (!arithmeticPass) approvalRateMismatches += 1;
    complete.push({
      data_record_number: dataIndex + 1,
      company_name: row[column.company_name],
      total_approvals: approvals,
      total_denials: denials,
      approval_rate_percent: approvalRatePercent,
      recomputed_approval_rate_percent: recomputedApprovalRatePercent,
      normalized_approval_rate: approvalRatePercent / 100,
      arithmetic_status: arithmeticPass ? 'PASS' : 'FAIL',
    });
  });

  if (complete.length === 0) throw new Error('Gate database has no complete H-1B record with a nonzero petition total.');
  const selected = complete[0];
  if (selected.arithmetic_status !== 'PASS') {
    throw new Error('The first complete H-1B database record fails its approval-rate arithmetic check.');
  }

  return {
    source: {
      path: relative(databasePath),
      sha256: createHash('sha256').update(bytes).digest('hex'),
    },
    scan: {
      data_records: records.length,
      columns: headers.length,
      complete_h1b_records: complete.length,
      approval_rate_arithmetic_mismatches: approvalRateMismatches,
    },
    selected_record: {
      selection_rule: 'first complete H-1B record in stored CSV order; no company was hand-picked',
      ...selected,
    },
    harness_use: {
      status: 'RECORD_DERIVED_PROXY_ONLY',
      scorer_field: 'sponsorship.p',
      record_field: 'Approval_Rate divided by 100',
      meaning: 'historical H-1B petition approval-rate proxy used only to create a nonzero pre-gate score',
    },
    not_implemented: {
      full_sponsorship_probability: 'NOT_IMPLEMENTED_MISSING_LCA_RATE_COMPANY_SIZE_AND_PINNED_THRESHOLDS',
      real_job_liveness: 'NOT_IMPLEMENTED_NO_PUBLIC_ATS_OBSERVATION_IN_DATABASE',
      personal_visa_timeline: 'NOT_IMPLEMENTED_PRIVATE_PERSONAL_RECORD_REQUIRED',
      real_role_recommendation: 'NOT_IMPLEMENTED_TEST_SCENARIO_IS_NOT_A_JOB_POSTING',
    },
    limitations: [
      'The stored mapped CSV does not include the raw DOL/USCIS employer rows or match metadata, so the company join remains unverified.',
      'Historical petition approval rate is not the same thing as the Chapter 7 full sponsorship probability.',
    ],
  };
}

export function materializeDatabaseBackedFixture(template, databaseEvidence, weights) {
  if (!template || !Array.isArray(template.cases) || template.cases.length === 0) {
    throw new Error('Gate template must contain at least one case.');
  }
  const record = databaseEvidence?.selected_record;
  if (!record || record.arithmetic_status !== 'PASS') {
    throw new Error('A database record with checked approval-rate arithmetic is required.');
  }
  if (!Number.isFinite(weights?.sponsorship)) throw new Error('The Chapter 11 sponsorship weight is required.');

  const recordVote = record.normalized_approval_rate * weights.sponsorship;
  return {
    ...template,
    database_evidence: databaseEvidence,
    cases: template.cases.map((entry) => {
      if (Object.hasOwn(entry, 'role') || Object.hasOwn(entry, 'expected')) {
        throw new Error(`Gate case ${entry.id || '(missing)'} must not contain a hand-written role or expected business score.`);
      }
      const liveness = entry.contract_gates?.liveness;
      const timeline = entry.contract_gates?.timeline;
      if (![0, 1].includes(liveness) || ![0, 1].includes(timeline)) {
        throw new Error(`Gate case ${entry.id || '(missing)'} must use Chapter contract controls 0 or 1.`);
      }
      const gateProduct = liveness * timeline;
      return {
        id: entry.id,
        purpose: entry.purpose,
        mutation_witness: entry.mutation_witness === true,
        role: {
          role_id: entry.id,
          company: record.company_name,
          title: 'CONTRACT TEST — NOT A REAL JOB POSTING',
          sponsorship: {
            p: record.normalized_approval_rate,
            tier: 'NOT_COMPUTED',
            source: 'database-record-proxy',
          },
          liveness: { factor: liveness, source: 'chapter-contract-control' },
          timeline: { factor: timeline, source: 'chapter-contract-control' },
        },
        expected: {
          composite: Number((recordVote * gateProduct).toFixed(4)),
          recommendation: gateProduct === 0 ? 'Skip' : null,
          gate_product: gateProduct,
          closed_gate: entry.expected_closed_gate ?? null,
        },
      };
    }),
  };
}
