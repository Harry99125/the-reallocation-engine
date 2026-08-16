const EPSILON = 1e-9;

function nearlyEqual(actual, expected) {
  return typeof actual === 'number'
    && Number.isFinite(actual)
    && Math.abs(actual - expected) <= EPSILON;
}

function check(id, pass, expected, observed) {
  return {
    id,
    status: pass ? 'PASS' : 'FAIL',
    expected,
    observed,
  };
}

export function validateGateFixture(fixture) {
  if (!fixture || typeof fixture !== 'object') throw new Error('Gate fixture must be an object.');
  if (!Array.isArray(fixture.cases) || fixture.cases.length === 0) {
    throw new Error('Gate fixture must contain at least one case.');
  }

  const ids = new Set();
  for (const entry of fixture.cases) {
    if (!entry.id || ids.has(entry.id)) throw new Error(`Gate fixture has a missing or duplicate case id: ${entry.id || '(missing)'}`);
    ids.add(entry.id);
    if (!entry.role || !entry.expected) throw new Error(`Gate case ${entry.id} must define role and expected.`);
    for (const gate of ['liveness', 'timeline']) {
      const factor = entry.role[gate]?.factor;
      if (typeof factor !== 'number' || factor < 0 || factor > 1) {
        throw new Error(`Gate case ${entry.id} has invalid ${gate} factor; expected a number from 0 to 1.`);
      }
    }
    if (typeof entry.expected.composite !== 'number') throw new Error(`Gate case ${entry.id} must declare expected.composite.`);
  }
  return fixture;
}

export function runGateContract(score, fixture, implementation = 'candidate') {
  validateGateFixture(fixture);
  if (typeof score !== 'function') throw new Error('Gate contract requires a scoring function.');

  const cases = fixture.cases.map((entry) => {
    const role = JSON.parse(JSON.stringify(entry.role));
    const observed = score(role);
    const gateKeys = observed?.trace?.gates?.map((gate) => gate.factor) || [];
    const voteKeys = observed?.trace?.votes?.map((vote) => vote.factor) || [];
    const expectedGateKeys = ['liveness', 'timeline'];
    const expectedGateMultipliers = [entry.role.liveness.factor, entry.role.timeline.factor];
    const observedGateMultipliers = observed?.trace?.gates?.map((gate) => gate.multiplier) || [];

    const checks = [
      check('composite', nearlyEqual(observed?.composite, entry.expected.composite), entry.expected.composite, observed?.composite ?? null),
      check('gate-product', nearlyEqual(observed?.trace?.gate_product, entry.expected.gate_product), entry.expected.gate_product, observed?.trace?.gate_product ?? null),
      check('gates-stay-out-of-votes', !voteKeys.includes('liveness') && !voteKeys.includes('timeline'), 'liveness and timeline absent from weighted votes', voteKeys),
      check('gate-trace-shape', JSON.stringify(gateKeys) === JSON.stringify(expectedGateKeys), expectedGateKeys, gateKeys),
      check('gate-trace-values', JSON.stringify(observedGateMultipliers) === JSON.stringify(expectedGateMultipliers), expectedGateMultipliers, observedGateMultipliers),
    ];

    if (typeof entry.expected.recommendation === 'string') {
      checks.splice(1, 0, check(
        'recommendation',
        observed?.machine_recommendation === entry.expected.recommendation,
        entry.expected.recommendation,
        observed?.machine_recommendation ?? null,
      ));
    }

    if (entry.expected.closed_gate) {
      checks.push(check(
        'closed-gate-reason',
        typeof observed?.reason === 'string' && observed.reason.startsWith(`gated: ${entry.expected.closed_gate}`),
        `reason begins with gated: ${entry.expected.closed_gate}`,
        observed?.reason ?? null,
      ));
    }

    return {
      id: entry.id,
      purpose: entry.purpose,
      mutation_witness: entry.mutation_witness === true,
      status: checks.every((item) => item.status === 'PASS') ? 'PASS' : 'FAIL',
      expected: entry.expected,
      observed: {
        composite: observed?.composite ?? null,
        recommendation: typeof entry.expected.recommendation === 'string'
          ? observed?.machine_recommendation ?? null
          : 'NOT_ASSERTED_TEST_CONTROL',
        reason: typeof entry.expected.recommendation === 'string'
          ? observed?.reason ?? null
          : 'NOT_REPORTED_FOR_OPEN_CONTROL',
        gate_product: observed?.trace?.gate_product ?? null,
      },
      checks,
    };
  });

  const checks = cases.flatMap((entry) => entry.checks);
  return {
    implementation,
    verdict: cases.every((entry) => entry.status === 'PASS') ? 'PASS' : 'FAIL',
    summary: {
      cases_passed: cases.filter((entry) => entry.status === 'PASS').length,
      cases_total: cases.length,
      checks_passed: checks.filter((entry) => entry.status === 'PASS').length,
      checks_total: checks.length,
    },
    cases,
  };
}

// Deliberately wrong implementation used only as a mutation sentinel. It adds
// liveness and timeline as votes, so a closed gate can leave a nonzero result.
// The real contract suite must reject it or the suite is not meaningful.
export function scoreWithGateAsVoteMutation(role) {
  const contributions = [
    { factor: 'sponsorship', value: role.sponsorship?.p ?? 0, weight: 0.35, source: role.sponsorship?.source || 'record' },
    { factor: 'fit', value: role.fit?.p ?? 0, weight: 0.30, source: role.fit?.source || 'model-judgment' },
    { factor: 'role_quality', value: role.role_quality?.p ?? 0, weight: 0.0, source: role.role_quality?.source || 'record' },
    // Deliberate structural bug: gates are added as unit-coefficient votes.
    // The coefficient is arithmetic identity, not a claimed calibration.
    { factor: 'liveness', value: role.liveness?.factor ?? 1, weight: 1, source: role.liveness?.source || 'chapter-contract-control' },
    { factor: 'timeline', value: role.timeline?.factor ?? 1, weight: 1, source: role.timeline?.source || 'chapter-contract-control' },
  ];
  const composite = contributions.reduce((sum, item) => sum + item.value * item.weight, 0);
  const recommendation = composite >= 0.30 ? 'Apply' : composite >= 0.20 ? 'Consider' : 'Skip';

  return {
    composite: Number(composite.toFixed(4)),
    recommendation,
    machine_recommendation: recommendation,
    reason: `mutated formula: liveness and timeline counted as weighted votes (${composite.toFixed(3)})`,
    trace: {
      votes: contributions.map((item) => ({
        ...item,
        contribution: Number((item.value * item.weight).toFixed(4)),
      })),
      vote_sum: Number(composite.toFixed(4)),
      gates: [],
      gate_product: null,
      arithmetic: contributions.map((item) => `${item.value}·${item.weight}`).join(' + '),
    },
  };
}

export function assessGateHarness(productionScore, fixture) {
  const production = runGateContract(productionScore, fixture, 'production-role-scorer');
  const mutation = runGateContract(scoreWithGateAsVoteMutation, fixture, 'deliberate-gate-as-vote-mutation');
  const witnessIds = fixture.cases.filter((entry) => entry.mutation_witness).map((entry) => entry.id);
  const witnesses = witnessIds.map((id) => {
    const result = mutation.cases.find((entry) => entry.id === id);
    return {
      id,
      mutation_status: result?.status ?? 'MISSING',
      expected: result?.expected ?? null,
      mutation_observed: result?.observed ?? null,
      failed_checks: result?.checks.filter((item) => item.status === 'FAIL').map((item) => item.id) ?? [],
    };
  });
  const mutationCaught = mutation.verdict === 'FAIL'
    && witnesses.length > 0
    && witnesses.every((entry) => entry.mutation_status === 'FAIL'
      && entry.mutation_observed?.composite !== 0
      && entry.mutation_observed?.recommendation !== 'Skip');
  const machineResult = production.verdict === 'PASS' && mutationCaught ? 'PASS' : 'FAIL';

  return {
    machine_result: machineResult,
    human_decision: 'HUMAN_REVIEW_REQUIRED',
    production,
    deliberate_break: {
      mutation: 'liveness and timeline changed from multipliers to weighted votes',
      expected_contract_result: 'FAIL',
      observed_contract_result: mutation.verdict,
      detection: mutationCaught ? 'PASS' : 'FAIL',
      witnesses,
      full_result: mutation,
    },
  };
}
