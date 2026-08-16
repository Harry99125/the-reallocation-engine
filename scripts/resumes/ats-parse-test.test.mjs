import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  evaluateManifest,
  extractPdfText,
  inspectExtractedText,
  normalizeForMatch,
  renderVerificationMarkdown,
  validateManifest,
  verifyManifestProvenance,
} from './ats-parse-test.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function manifest() {
  return {
    schema_version: '1.0.0',
    document_id: 'fixture',
    source_markdown: 'fixture.md',
    fields: [
      { id: 'name', category: 'name', expected: 'Aarav Patel', source_line: 1 },
      { id: 'experience', category: 'heading', expected: 'Experience', source_line: 2 },
      { id: 'title', category: 'title', expected: 'Software Engineer', source_line: 3 },
      { id: 'date', category: 'date', expected: 'Jan 2025 - Aug 2025', source_line: 4 },
    ],
    order_checks: [
      { id: 'linear-order', fields: ['name', 'experience', 'title', 'date'] },
    ],
  };
}

test('normalizes ATS-relevant Unicode and whitespace differences', () => {
  assert.equal(normalizeForMatch(' Jan 2025\u00a0—\nAug 2025 '), 'jan 2025 - aug 2025');
});

test('passes present fields in declared order', () => {
  const result = evaluateManifest(
    'Aarav Patel\nExperience\nSoftware Engineer\nJan 2025 - Aug 2025\n',
    manifest(),
  );
  assert.equal(result.verdict, 'PASS');
  assert.deepEqual(result.summary.fields, { passed: 4, total: 4 });
  assert.deepEqual(result.summary.order_checks, { passed: 1, total: 1 });
});

test('fails a missing required field', () => {
  const result = evaluateManifest(
    'Aarav Patel\nExperience\nJan 2025 - Aug 2025\n',
    manifest(),
  );
  assert.equal(result.verdict, 'FAIL');
  assert.equal(result.fields.find((field) => field.id === 'title').status, 'FAIL');
  assert.equal(result.order_checks[0].status, 'FAIL');
});

test('failure report does not claim every declared field passed', () => {
  const result = evaluateManifest(
    'Aarav Patel\nExperience\nJan 2025 - Aug 2025\n',
    manifest(),
  );
  const report = renderVerificationMarkdown({
    document_id: 'fixture',
    verdict: result.verdict,
    parser: { version: 'test' },
    metrics: { pages: { value: 1 } },
    ...result,
  });
  assert.match(report, /FAIL rows above identify evidence that is missing or out of order/);
  assert.doesNotMatch(report, /verified that all declared strings are present and ordered/);
});

test('fails fields that are present but scrambled', () => {
  const result = evaluateManifest(
    'Aarav Patel\nSoftware Engineer\nExperience\nJan 2025 - Aug 2025\n',
    manifest(),
  );
  assert.equal(result.verdict, 'FAIL');
  assert.equal(result.summary.fields.passed, 4);
  assert.equal(result.order_checks[0].reason, 'fields are present but out of order');
});

test('line matching does not confuse a heading with the same word in body text', () => {
  const fixture = manifest();
  fixture.fields.find((field) => field.id === 'experience').match = 'line';
  const result = evaluateManifest(
    'Aarav Patel\nSummary\nExperience with databases\nExperience\nSoftware Engineer\nJan 2025 - Aug 2025\n',
    fixture,
  );
  assert.equal(result.verdict, 'PASS');
  assert.ok(
    result.fields.find((field) => field.id === 'experience').observed_index
      > normalizeForMatch('Aarav Patel\nSummary\nExperience with databases').length,
  );
});

test('line-contains matches a title sharing a row with its date', () => {
  const fixture = manifest();
  const title = fixture.fields.find((field) => field.id === 'title');
  title.match = 'line-contains';
  title.occurrence = 2;
  const result = evaluateManifest(
    'Aarav Patel\nExperience\nSoftware Engineer mentioned in summary\nSoftware Engineer | Jan 2025 - Aug 2025\nJan 2025 - Aug 2025\n',
    fixture,
  );
  assert.equal(result.fields.find((field) => field.id === 'title').status, 'PASS');
});

test('generic inspection passes parser mechanics but still requires human review', () => {
  const result = inspectExtractedText({
    text: 'Candidate Name\nSummary\nExperience with systems.\nEducation\nMay 2026\n',
    pageCount: 1,
    pageMetrics: [{ page: 1, text_items: 5, extracted_lines: 5, explicit_eol_items: 5, vertical_order_reversals: 0 }],
  });
  assert.equal(result.parser_floor, 'PASS');
  assert.equal(result.decision, 'HUMAN_REVIEW_REQUIRED');
  assert.deepEqual(result.inventory.heading_categories_detected, ['summary', 'education']);
  assert.equal(result.inventory.date_like_lines, 1);
});

test('generic inspection fails closed on replacement characters', () => {
  const result = inspectExtractedText({
    text: 'Candidate Name\nExperi\uFFFDnce\n',
    pageCount: 1,
    pageMetrics: [{ page: 1, text_items: 2, extracted_lines: 2, explicit_eol_items: 2, vertical_order_reversals: 0 }],
  });
  assert.equal(result.parser_floor, 'FAIL');
  assert.equal(result.checks.find((check) => check.id === 'replacement-characters').status, 'FAIL');
});

test('rejects an expectation record that drifted from its source line', () => {
  const fixture = manifest();
  validateManifest(fixture);
  assert.throws(
    () => verifyManifestProvenance(fixture, '# Aarav Patel\n## Experience\n### Data Analyst\nJan 2025 - Aug 2025\n'),
    /Expectation\/source contract drift/,
  );
});

test('extracts the tracked anonymized PDF and passes its expectation record', async () => {
  const expectationPath = path.join(REPO_ROOT, 'data/examples/aarav-patel-ats-expected.json');
  const pdfPath = path.join(REPO_ROOT, 'output/resumes/aarav-patel-cv.pdf');
  const expectation = JSON.parse(await readFile(expectationPath, 'utf8'));
  const source = await readFile(path.join(REPO_ROOT, expectation.source_markdown), 'utf8');

  validateManifest(expectation);
  verifyManifestProvenance(expectation, source);
  const extracted = await extractPdfText(pdfPath);
  const result = evaluateManifest(extracted.text, expectation);

  assert.equal(extracted.pageCount, 2);
  assert.equal(result.verdict, 'PASS');
  assert.deepEqual(result.summary.fields, { passed: 13, total: 13 });
  assert.deepEqual(result.summary.order_checks, { passed: 1, total: 1 });
});
