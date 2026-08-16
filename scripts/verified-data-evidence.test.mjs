import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { buildEvidence } from './verified-data-evidence.mjs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));
const doctorOutput = [
  '  ✓ no private/PII paths are tracked',
  '  with lifecycle frontmatter: 46   missing: 0',
  '  environment: ✓ runnable',
].join('\n');

function inputs() {
  return {
    atsPositive: read('reports/generated/ats-paste-test/aarav-patel/paste-test-audit.json'),
    atsBreak: read('reports/generated/ats-paste-test/break-attempt/paste-test-audit.json'),
    gateAudit: read('reports/generated/gate-behavior/gate-behavior-audit.json'),
    gateFixture: read('data/examples/gate-behavior-cases.json'),
    step3Review: read('logs/zening-teng-step3-review.json'),
    stagedFiles: [],
    trackedFiles: ['data/ats/.gitignore', 'private/README.md'],
    doctorOutput,
  };
}

test('current public evidence reconciles without a machine ethics failure', () => {
  const evidence = buildEvidence(inputs());
  assert.equal(evidence.machine_result, 'PASS');
  assert.equal(evidence.ethics_gate.privacy, 'PASS');
  assert.equal(evidence.ethics_gate.honesty, 'PASS');
  assert.equal(evidence.human_attestation.status, 'RECORDED');
  assert.equal(evidence.human_attestation.reviewer, 'Zening Teng');
  assert.equal(evidence.ethics_gate.human_decision, 'APPROVED_FOR_STEP_4_BY_NAMED_HUMAN');
  assert.ok(evidence.number_trace.length > 0);
});

test('machine evidence does not invent a missing human review', () => {
  const sample = inputs();
  sample.step3Review = null;
  const evidence = buildEvidence(sample);
  assert.equal(evidence.human_attestation.status, 'REQUIRED_BEFORE_STEP_4');
  assert.equal(evidence.ethics_gate.human_decision, 'HUMAN_REVIEW_REQUIRED');
  assert.equal(evidence.checks.find((entry) => entry.id === 'honesty:named-review-record').status, 'FAIL');
});

test('a staged private path blocks the Step 3 machine gate', () => {
  const sample = inputs();
  sample.stagedFiles = ['private/ats-paste-test/resume/paste-test.txt'];
  const evidence = buildEvidence(sample);
  assert.equal(evidence.machine_result, 'FAIL');
  assert.equal(evidence.ethics_gate.privacy, 'FAIL');
  assert.equal(evidence.checks.find((entry) => entry.id === 'privacy:no-private-staged').status, 'FAIL');
});

test('an invented ATS summary count fails reconciliation', () => {
  const sample = inputs();
  sample.atsPositive = clone(sample.atsPositive);
  sample.atsPositive.summary.fields.passed += 1;
  const evidence = buildEvidence(sample);
  assert.equal(evidence.machine_result, 'FAIL');
  assert.equal(evidence.ethics_gate.honesty, 'FAIL');
  assert.equal(evidence.checks.find((entry) => entry.id === 'honesty:ats-positive-reconciles').status, 'FAIL');
});

test('a controlled factor mislabeled as an external record fails honesty', () => {
  const sample = inputs();
  sample.gateFixture = clone(sample.gateFixture);
  sample.gateFixture.cases[0].role.liveness.source = 'record';
  const evidence = buildEvidence(sample);
  assert.equal(evidence.machine_result, 'FAIL');
  assert.equal(evidence.ethics_gate.honesty, 'FAIL');
  assert.equal(evidence.checks.find((entry) => entry.id === 'honesty:controlled-input-labels').status, 'FAIL');
});
