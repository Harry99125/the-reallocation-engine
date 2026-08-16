import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assessGateHarness,
  runGateContract,
  scoreWithGateAsVoteMutation,
  validateGateFixture,
} from './gate-behavior-core.mjs';
import {
  loadGateDatabaseEvidence,
  materializeDatabaseBackedFixture,
} from './gate-database-evidence.mjs';
import { main as runHarness } from './gate-behavior-harness.mjs';
import { CONFIG, scoreRole } from './role-scorer.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FIXTURE_PATH = path.join(REPO_ROOT, 'data/examples/gate-behavior-cases.json');
const template = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
const databaseEvidence = await loadGateDatabaseEvidence();
const fixture = materializeDatabaseBackedFixture(template, databaseEvidence, CONFIG.weights);
const productionScore = (role) => scoreRole(role, CONFIG.weights, true);

function caseById(id) {
  return fixture.cases.find((entry) => entry.id === id);
}

test('stored database record is complete and its approval-rate arithmetic passes', () => {
  assert.equal(databaseEvidence.selected_record.arithmetic_status, 'PASS');
  assert.equal(databaseEvidence.scan.approval_rate_arithmetic_mismatches, 0);
  assert.equal(
    databaseEvidence.selected_record.normalized_approval_rate,
    databaseEvidence.selected_record.approval_rate_percent / 100,
  );
});

test('database-backed fixture is a valid Ch.11/16 gate truth table', () => {
  assert.equal(validateGateFixture(fixture), fixture);
  assert.equal(fixture.cases.length, 3);
  assert.equal(fixture.cases.filter((entry) => entry.mutation_witness).length, 2);
  assert.ok(fixture.cases.every((entry) => entry.role.sponsorship.source === 'database-record-proxy'));
});

test('fixture rejects a hand-written business score', () => {
  const invalid = structuredClone(template);
  invalid.cases[0].role = { sponsorship: { p: 0.42 } };
  assert.throws(
    () => materializeDatabaseBackedFixture(invalid, databaseEvidence, CONFIG.weights),
    /must not contain a hand-written role or expected business score/,
  );
});

test('open gates preserve the database-derived weighted vote sum', () => {
  const result = productionScore(caseById('open-gates-control').role);
  const expectedVote = Number((databaseEvidence.selected_record.normalized_approval_rate * CONFIG.weights.sponsorship).toFixed(4));
  assert.equal(result.trace.vote_sum, expectedVote);
  assert.equal(result.trace.gate_product, 1);
  assert.equal(result.composite, expectedVote);
});

test('zero liveness forces composite zero and Skip despite a nonzero database vote', () => {
  const result = productionScore(caseById('liveness-zero-database-vote').role);
  assert.ok(result.trace.vote_sum > 0);
  assert.equal(result.composite, 0);
  assert.equal(result.machine_recommendation, 'Skip');
  assert.match(result.reason, /liveness/);
});

test('zero timeline forces composite zero and Skip despite a nonzero database vote', () => {
  const result = productionScore(caseById('timeline-zero-database-vote').role);
  assert.ok(result.trace.vote_sum > 0);
  assert.equal(result.composite, 0);
  assert.equal(result.machine_recommendation, 'Skip');
  assert.match(result.reason, /timeline/);
});

test('production scorer passes the complete gate contract', () => {
  const result = runGateContract(productionScore, fixture, 'production-role-scorer');
  assert.equal(result.verdict, 'PASS');
  assert.deepEqual(result.summary, {
    cases_passed: 3,
    cases_total: 3,
    checks_passed: 19,
    checks_total: 19,
  });
});

test('the contract rejects the deliberate gate-as-vote mutation', () => {
  const result = runGateContract(scoreWithGateAsVoteMutation, fixture, 'deliberate-mutation');
  assert.equal(result.verdict, 'FAIL');
  for (const id of ['liveness-zero-database-vote', 'timeline-zero-database-vote']) {
    const witness = result.cases.find((entry) => entry.id === id);
    assert.equal(witness.status, 'FAIL');
    assert.equal(witness.observed.recommendation, 'Apply');
    assert.notEqual(witness.observed.composite, 0);
  }
});

test('harness reports machine PASS only when production passes and mutation is caught', () => {
  const result = assessGateHarness(productionScore, fixture);
  assert.equal(result.machine_result, 'PASS');
  assert.equal(result.human_decision, 'HUMAN_REVIEW_REQUIRED');
  assert.equal(result.deliberate_break.detection, 'PASS');
});

test('CLI harness writes both machine and human views', async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'gate-behavior-'));
  try {
    const exitCode = await runHarness(['--fixture', FIXTURE_PATH, '--out-dir', outDir]);
    assert.equal(exitCode, 0);
    const audit = JSON.parse(await readFile(path.join(outDir, 'gate-behavior-audit.json'), 'utf8'));
    const report = await readFile(path.join(outDir, 'gate-behavior-audit.md'), 'utf8');
    assert.equal(audit.machine_result, 'PASS');
    assert.equal(audit.deliberate_break.detection, 'PASS');
    assert.equal(audit.database_evidence.selected_record.arithmetic_status, 'PASS');
    assert.equal(audit.database_evidence.not_implemented.real_job_liveness, 'NOT_IMPLEMENTED_NO_PUBLIC_ATS_OBSERVATION_IN_DATABASE');
    assert.match(report, /HUMAN_REVIEW_REQUIRED/);
    assert.match(report, /CAUGHT/);
    assert.match(report, /NOT_IMPLEMENTED/);
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});
