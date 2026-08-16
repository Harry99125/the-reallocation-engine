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
import { main as runHarness } from './gate-behavior-harness.mjs';
import { CONFIG, scoreRole } from './role-scorer.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FIXTURE_PATH = path.join(REPO_ROOT, 'data/examples/gate-behavior-cases.json');
const fixture = JSON.parse(await readFile(FIXTURE_PATH, 'utf8'));
const productionScore = (role) => scoreRole(role, CONFIG.weights, true);

function caseById(id) {
  return fixture.cases.find((entry) => entry.id === id);
}

test('fixture is a valid independent Ch.11/16 truth table', () => {
  assert.equal(validateGateFixture(fixture), fixture);
  assert.equal(fixture.cases.length, 6);
  assert.equal(fixture.cases.filter((entry) => entry.mutation_witness).length, 2);
});

test('open gates preserve the weighted vote sum', () => {
  const result = productionScore(caseById('open-gates-control').role);
  assert.equal(result.trace.vote_sum, 0.65);
  assert.equal(result.trace.gate_product, 1);
  assert.equal(result.composite, 0.65);
  assert.equal(result.machine_recommendation, 'Apply');
});

test('zero liveness forces composite zero and Skip despite perfect votes', () => {
  const result = productionScore(caseById('liveness-zero-high-votes').role);
  assert.equal(result.trace.vote_sum, 0.65);
  assert.equal(result.composite, 0);
  assert.equal(result.machine_recommendation, 'Skip');
  assert.match(result.reason, /liveness/);
});

test('zero timeline forces composite zero and Skip despite perfect votes', () => {
  const result = productionScore(caseById('timeline-zero-high-votes').role);
  assert.equal(result.trace.vote_sum, 0.65);
  assert.equal(result.composite, 0);
  assert.equal(result.machine_recommendation, 'Skip');
  assert.match(result.reason, /timeline/);
});

test('fractional gates scale rather than add to the vote sum', () => {
  const result = productionScore(caseById('fractional-gates-scale').role);
  assert.equal(result.trace.gate_product, 0.4);
  assert.equal(result.composite, 0.26);
  assert.equal(result.machine_recommendation, 'Consider');
});

test('configured closed-gate boundary is a hard stop', () => {
  const result = productionScore(caseById('closed-gate-policy-boundary').role);
  assert.equal(result.composite, 0.0325);
  assert.equal(result.machine_recommendation, 'Skip');
  assert.match(result.reason, /gated: liveness/);
});

test('production scorer passes the complete gate contract', () => {
  const result = runGateContract(productionScore, fixture, 'production-role-scorer');
  assert.equal(result.verdict, 'PASS');
  assert.deepEqual(result.summary, {
    cases_passed: 6,
    cases_total: 6,
    checks_passed: 40,
    checks_total: 40,
  });
});

test('the contract rejects the deliberate gate-as-vote mutation', () => {
  const result = runGateContract(scoreWithGateAsVoteMutation, fixture, 'deliberate-mutation');
  assert.equal(result.verdict, 'FAIL');
  for (const id of ['liveness-zero-high-votes', 'timeline-zero-high-votes']) {
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
    assert.match(report, /HUMAN_REVIEW_REQUIRED/);
    assert.match(report, /CAUGHT/);
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});
