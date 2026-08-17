#!/usr/bin/env node

/**
 * Extract a PDF's text and test named resume fields against a local expectation
 * record. This is the automated form of Chapter 13's paste test.
 *
 * Usage:
 *   node scripts/resumes/ats-parse-test.mjs <resume.pdf> \
 *     --expect <expected-fields.json> --out-dir <directory>
 *
 * Exit codes:
 *   0  every required field and order check passed
 *   1  extraction completed but one or more checks failed
 *   2  input, expectation-contract, parser, or write failure
 *
 * The harness verifies a parser floor, not compatibility with every ATS. A
 * human still decides whether the extracted text is adequate to send.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument, version as pdfjsVersion } from 'pdfjs-dist/legacy/build/pdf.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const GENERATOR_PATH = path.join(path.dirname(SCRIPT_PATH), 'generate-pdf.mjs');
const ALLOWED_CATEGORIES = new Set(['name', 'title', 'date', 'heading']);
const ALLOWED_MATCH_MODES = new Set(['contains', 'line', 'line-contains']);

function usage() {
  console.error(`Usage:
  npm run resumes:paste-test -- <resume.pdf|resume.md> [--out-dir <directory>]
  npm run resumes:paste-test -- <resume.pdf|resume.md> --expect <expected-fields.json> [--out-dir <directory>]

Without --expect: generic parser inspection, with human review required.
With --expect: evidence-backed per-field and order PASS/FAIL verification.
Default output: private/ats-paste-test/<input-name>/`);
}

export function normalizeForMatch(value) {
  return String(value)
    .normalize('NFKC')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('en-US');
}

function nthIndex(haystack, needle, occurrence) {
  let from = 0;
  let found = -1;
  for (let current = 1; current <= occurrence; current += 1) {
    found = haystack.indexOf(needle, from);
    if (found < 0) return -1;
    from = found + needle.length;
  }
  return found;
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

export function validateManifest(manifest) {
  assertObject(manifest, 'Expectation manifest');
  if (manifest.schema_version !== '1.0.0') {
    throw new Error('Expectation manifest schema_version must be "1.0.0"');
  }
  if (!String(manifest.document_id || '').trim()) {
    throw new Error('Expectation manifest requires document_id');
  }
  if (!String(manifest.source_markdown || '').trim()) {
    throw new Error('Expectation manifest requires source_markdown');
  }
  if (!Array.isArray(manifest.fields) || manifest.fields.length === 0) {
    throw new Error('Expectation manifest requires a non-empty fields array');
  }

  const ids = new Set();
  for (const [index, field] of manifest.fields.entries()) {
    assertObject(field, `fields[${index}]`);
    if (!String(field.id || '').trim()) throw new Error(`fields[${index}] requires id`);
    if (ids.has(field.id)) throw new Error(`Duplicate field id "${field.id}"`);
    ids.add(field.id);
    if (!ALLOWED_CATEGORIES.has(field.category)) {
      throw new Error(`Field "${field.id}" category must be name, title, date, or heading`);
    }
    if (!String(field.expected || '').trim()) {
      throw new Error(`Field "${field.id}" requires a non-empty expected value`);
    }
    if (!ALLOWED_MATCH_MODES.has(field.match ?? 'contains')) {
      throw new Error(`Field "${field.id}" match must be "contains", "line", or "line-contains"`);
    }
    const occurrence = field.occurrence ?? 1;
    if (!Number.isInteger(occurrence) || occurrence < 1) {
      throw new Error(`Field "${field.id}" occurrence must be a positive integer`);
    }
    if (!Number.isInteger(field.source_line) || field.source_line < 1) {
      throw new Error(`Field "${field.id}" source_line must be a positive integer`);
    }
  }

  if (!Array.isArray(manifest.order_checks) || manifest.order_checks.length === 0) {
    throw new Error('Expectation manifest requires a non-empty order_checks array');
  }
  const orderIds = new Set();
  for (const [index, check] of manifest.order_checks.entries()) {
    assertObject(check, `order_checks[${index}]`);
    if (!String(check.id || '').trim()) throw new Error(`order_checks[${index}] requires id`);
    if (orderIds.has(check.id)) throw new Error(`Duplicate order check id "${check.id}"`);
    orderIds.add(check.id);
    if (!Array.isArray(check.fields) || check.fields.length < 2) {
      throw new Error(`Order check "${check.id}" requires at least two field ids`);
    }
    for (const fieldId of check.fields) {
      if (!ids.has(fieldId)) {
        throw new Error(`Order check "${check.id}" references unknown field "${fieldId}"`);
      }
    }
  }
}

export function verifyManifestProvenance(manifest, sourceMarkdown) {
  const sourceLines = sourceMarkdown.split(/\r?\n/);
  const failures = [];
  for (const field of manifest.fields) {
    const sourceLine = sourceLines[field.source_line - 1];
    const expected = normalizeForMatch(field.expected);
    if (sourceLine == null || !normalizeForMatch(sourceLine).includes(expected)) {
      failures.push(`${field.id} expected "${field.expected}" at ${manifest.source_markdown}:${field.source_line}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`Expectation/source contract drift:\n- ${failures.join('\n- ')}`);
  }
}

export function evaluateManifest(extractedText, manifest) {
  const normalizedText = normalizeForMatch(extractedText);
  let lineOffset = 0;
  const normalizedLines = extractedText
    .split(/\r?\n/)
    .map((line) => normalizeForMatch(line))
    .filter(Boolean)
    .map((line) => {
      const entry = { text: line, index: lineOffset };
      lineOffset += line.length + 1;
      return entry;
    });
  const fieldResults = manifest.fields.map((field) => {
    const occurrence = field.occurrence ?? 1;
    const match = field.match ?? 'contains';
    const expected = normalizeForMatch(field.expected);
    let observedIndex;
    if (match === 'line') {
      observedIndex = normalizedLines.filter((line) => line.text === expected)[occurrence - 1]?.index ?? -1;
    } else if (match === 'line-contains') {
      const line = normalizedLines.filter((entry) => entry.text.includes(expected))[occurrence - 1];
      observedIndex = line ? line.index + line.text.indexOf(expected) : -1;
    } else {
      observedIndex = nthIndex(normalizedText, expected, occurrence);
    }
    return {
      id: field.id,
      category: field.category,
      expected: field.expected,
      match,
      occurrence,
      required: field.required !== false,
      status: observedIndex >= 0 ? 'PASS' : 'FAIL',
      observed_index: observedIndex >= 0 ? observedIndex : null,
      evidence: {
        expected_record: `${manifest.source_markdown}:${field.source_line}`,
        observed_record: 'paste-test.txt',
      },
    };
  });

  const byId = new Map(fieldResults.map((result) => [result.id, result]));
  const orderResults = manifest.order_checks.map((check) => {
    const results = check.fields.map((id) => byId.get(id));
    const missing = results.filter((result) => result.observed_index == null).map((result) => result.id);
    const positions = results.map((result) => result.observed_index);
    const strictlyIncreasing = missing.length === 0 && positions.every((position, index) => (
      index === 0 || position > positions[index - 1]
    ));
    return {
      id: check.id,
      fields: check.fields,
      status: strictlyIncreasing ? 'PASS' : 'FAIL',
      observed_positions: positions,
      reason: missing.length > 0
        ? `missing fields: ${missing.join(', ')}`
        : strictlyIncreasing ? 'fields appear in the declared order' : 'fields are present but out of order',
      evidence: { observed_record: 'paste-test.txt' },
    };
  });

  const requiredFields = fieldResults.filter((result) => result.required);
  const passedFields = requiredFields.filter((result) => result.status === 'PASS').length;
  const passedOrders = orderResults.filter((result) => result.status === 'PASS').length;
  const pass = passedFields === requiredFields.length && passedOrders === orderResults.length;

  return {
    verdict: pass ? 'PASS' : 'FAIL',
    summary: {
      fields: { passed: passedFields, total: requiredFields.length },
      order_checks: { passed: passedOrders, total: orderResults.length },
    },
    fields: fieldResults,
    order_checks: orderResults,
  };
}

function appendItem(line, value) {
  if (!value) return line;
  if (!line) return value;
  const noSpaceBefore = /^[,.;:!?%)]/.test(value);
  const noSpaceAfter = /[(\/]$/.test(line);
  return `${line}${noSpaceBefore || noSpaceAfter ? '' : ' '}${value}`;
}

export async function extractPdfText(pdfPath) {
  const bytes = new Uint8Array(await readFile(pdfPath));
  const loadingTask = getDocument({
    data: bytes,
    enableScripting: false,
    isEvalSupported: false,
  });
  const document = await loadingTask.promise;
  const pages = [];
  const pageMetrics = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const textItems = content.items.filter((item) => 'str' in item);
      const yPositions = textItems
        .map((item) => Number(item.transform?.[5]))
        .filter(Number.isFinite);
      const lines = [];
      let line = '';
      let previousY = null;
      let previousHeight = 0;
      for (const item of textItems) {
        const y = Number(item.transform?.[5]);
        const height = Math.abs(Number(item.height ?? item.transform?.[3] ?? 0));
        const lineChanged = line
          && Number.isFinite(y)
          && Number.isFinite(previousY)
          && Math.abs(y - previousY) > Math.max(1, Math.min(height || 1, previousHeight || 1) * 0.5);
        if (lineChanged) {
          lines.push(line);
          line = '';
        }
        line = appendItem(line, item.str.trim());
        if (item.hasEOL) {
          if (line) lines.push(line);
          line = '';
          previousY = null;
          previousHeight = 0;
        } else {
          previousY = Number.isFinite(y) ? y : previousY;
          previousHeight = height || previousHeight;
        }
      }
      if (line) lines.push(line);
      pages.push(lines.join('\n'));
      pageMetrics.push({
        page: pageNumber,
        text_items: textItems.length,
        extracted_lines: lines.length,
        explicit_eol_items: textItems.filter((item) => item.hasEOL).length,
        vertical_order_reversals: yPositions.slice(1).filter((y, index) => y > yPositions[index] + 1).length,
      });
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  return { text: `${pages.join('\n\n')}\n`, pageCount: pages.length, pageMetrics };
}

const HEADING_ALIASES = {
  summary: ['summary', 'profile', 'professional summary', 'objective'],
  skills: ['skills', 'technical skill', 'technical skills', 'core competencies'],
  education: ['education', 'academic background'],
  experience: ['experience', 'work experience', 'employment', 'employment history', 'work history'],
  projects: ['projects', 'project experience', 'selected projects'],
  certifications: ['certifications', 'licenses and certifications'],
};

export function inspectExtractedText(extracted) {
  const text = extracted.text;
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const normalizedLines = lines.map(normalizeForMatch);
  const replacementCharacters = (text.match(/\uFFFD/g) || []).length;
  const privateUseCharacters = (text.match(/[\uE000-\uF8FF]/g) || []).length;
  const controlCharacters = (text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g) || []).length;
  const datePattern = /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b|\b(?:19|20)\d{2}\b/i;
  const detectedHeadingCategories = Object.entries(HEADING_ALIASES)
    .filter(([, aliases]) => normalizedLines.some((line) => aliases.includes(line)))
    .map(([category]) => category);
  const verticalOrderReversals = extracted.pageMetrics
    .reduce((sum, page) => sum + page.vertical_order_reversals, 0);

  const checks = [
    {
      id: 'page-tree',
      status: extracted.pageCount > 0 ? 'PASS' : 'FAIL',
      observed: extracted.pageCount,
      rule: 'PDF exposes at least one page',
    },
    {
      id: 'text-layer',
      status: text.trim().length > 0 ? 'PASS' : 'FAIL',
      observed: text.length,
      rule: 'PDF exposes non-empty text',
    },
    {
      id: 'replacement-characters',
      status: replacementCharacters === 0 ? 'PASS' : 'FAIL',
      observed: replacementCharacters,
      rule: 'No Unicode replacement characters',
    },
    {
      id: 'control-characters',
      status: controlCharacters === 0 ? 'PASS' : 'FAIL',
      observed: controlCharacters,
      rule: 'No unexpected control characters',
    },
    {
      id: 'private-use-characters',
      status: privateUseCharacters === 0 ? 'PASS' : 'REVIEW',
      observed: privateUseCharacters,
      rule: 'Private-use glyphs require visual review',
    },
    {
      id: 'line-structure',
      status: lines.length > 1 ? 'PASS' : 'REVIEW',
      observed: lines.length,
      rule: 'Extraction preserves more than one readable line',
    },
    {
      id: 'text-item-order',
      status: verticalOrderReversals === 0 ? 'PASS' : 'REVIEW',
      observed: verticalOrderReversals,
      rule: 'No upward jumps in PDF text-item order',
    },
  ];
  const parserFloor = checks.some((check) => check.status === 'FAIL') ? 'FAIL' : 'PASS';

  return {
    parser_floor: parserFloor,
    checks,
    inventory: {
      nonempty_lines: lines.length,
      characters: text.length,
      heading_categories_detected: detectedHeadingCategories,
      date_like_lines: lines.filter((line) => datePattern.test(line)).length,
      contact_signal_counts: {
        email: (text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi) || []).length,
        url: (text.match(/\b(?:https?:\/\/|www\.)\S+/gi) || []).length,
        phone_like: (text.match(/(?:\+?\d[\d ().-]{7,}\d)/g) || []).length,
      },
      bullet_lines: lines.filter((line) => /^[•·▪◦*-]\s*/.test(line)).length,
    },
    page_metrics: extracted.pageMetrics,
    boundary: {
      verified: 'parser mechanics, text presence, character integrity, and text-item geometry checks',
      heuristic: 'heading categories, date-like lines, contact signals, and bullet lines',
      not_verified: 'correct identity, complete titles/dates, semantic resume quality, visual adequacy, or compatibility with every ATS',
    },
  };
}

function parseArgs(argv) {
  const positional = [];
  let expectPath = null;
  let outDir = null;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--expect') expectPath = argv[++index];
    else if (arg.startsWith('--expect=')) expectPath = arg.slice('--expect='.length);
    else if (arg === '--out-dir') outDir = argv[++index];
    else if (arg.startsWith('--out-dir=')) outDir = arg.slice('--out-dir='.length);
    else if (arg.startsWith('--')) throw new Error(`Unknown option "${arg}"`);
    else positional.push(arg);
  }
  if (positional.length !== 1) throw new Error('Exactly one PDF or Markdown input is required');
  const inputPath = path.resolve(positional[0]);
  const extension = path.extname(inputPath).toLowerCase();
  if (!['.pdf', '.md'].includes(extension)) {
    throw new Error(`Unsupported input "${extension || '(no extension)'}"; use .pdf or .md`);
  }
  const safeName = path.basename(inputPath, extension)
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'resume';
  return {
    inputPath,
    inputType: extension === '.md' ? 'markdown' : 'pdf',
    expectPath: expectPath ? path.resolve(expectPath) : null,
    outDir: outDir ? path.resolve(outDir) : path.resolve('private', 'ats-paste-test', safeName),
  };
}

function isInside(filePath, directory) {
  const relative = path.relative(directory, filePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function renderMarkdownInput(inputPath, outputPath) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [GENERATOR_PATH, inputPath, outputPath], {
      cwd: process.cwd(),
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Markdown-to-PDF renderer exited ${code}${stderr.trim() ? `: ${stderr.trim()}` : ''}`));
    });
  });
}

function relativeDisplay(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  return relative && !relative.startsWith('..') ? relative : filePath;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function renderVerificationMarkdown(audit) {
  const output = [
    `# ATS paste-test audit — ${audit.document_id}`,
    '',
    `**Verdict: ${audit.verdict}**`,
    '',
    `PDF.js ${audit.parser.version} extracted ${audit.metrics.pages.value} page(s). Required fields: ${audit.summary.fields.passed}/${audit.summary.fields.total} PASS. Order checks: ${audit.summary.order_checks.passed}/${audit.summary.order_checks.total} PASS.`,
    '',
    '| Status | Category | Field | Expected record | Observed record |',
    '|---|---|---|---|---|',
  ];
  for (const field of audit.fields) {
    output.push(`| ${field.status} | ${field.category} | ${escapeCell(field.expected)} (${field.match}) | ${escapeCell(field.evidence.expected_record)} | ${field.evidence.observed_record}${field.observed_index == null ? ' (not found)' : ` @ normalized offset ${field.observed_index}`} |`);
  }
  output.push('', '## Order checks', '');
  for (const check of audit.order_checks) {
    output.push(`- **${check.status} — ${check.id}:** ${check.reason}.`);
  }
  const verificationBoundary = audit.verdict === 'PASS'
    ? '- The parser verified that all declared strings are present and ordered in this PDF extraction.'
    : '- The parser checked every declared string and order constraint; the FAIL rows above identify evidence that is missing or out of order.';
  output.push(
    '',
    '## Verified boundary',
    '',
    verificationBoundary,
    '- Expected values came from the named local Markdown lines; the harness checked that contract before parsing.',
    '- This does not certify compatibility with every ATS, semantic resume quality, factual truth of resume claims, or visual adequacy.',
    '- A named human must read `paste-test.txt` and decide adequacy.',
    '',
  );
  return output.join('\n');
}

export function renderInspectionMarkdown(audit) {
  const output = [
    `# ATS paste-test inspection — ${audit.document_id}`,
    '',
    `**Parser floor: ${audit.parser_floor}**`,
    '',
    `PDF.js ${audit.parser.version} extracted ${audit.metrics.pages.value} page(s) and ${audit.inventory.nonempty_lines} non-empty line(s).`,
    '',
    '## Deterministic checks',
    '',
    '| Status | Check | Observed | Rule |',
    '|---|---|---:|---|',
  ];
  for (const check of audit.checks) {
    output.push(`| ${check.status} | ${check.id} | ${check.observed} | ${escapeCell(check.rule)} |`);
  }
  output.push(
    '',
    '## Heuristic inventory — observations, not certification',
    '',
    `- Common heading categories detected: ${audit.inventory.heading_categories_detected.join(', ') || 'none detected'}.`,
    `- Date-like lines: ${audit.inventory.date_like_lines}.`,
    `- Contact signals: email ${audit.inventory.contact_signal_counts.email}; URL ${audit.inventory.contact_signal_counts.url}; phone-like ${audit.inventory.contact_signal_counts.phone_like}.`,
    `- Bullet-like lines: ${audit.inventory.bullet_lines}.`,
    '',
    '## Verified boundary',
    '',
    `- **Verified by script:** ${audit.boundary.verified}.`,
    `- **Heuristic only:** ${audit.boundary.heuristic}.`,
    `- **Not verified:** ${audit.boundary.not_verified}.`,
    '- Read `paste-test.txt`; only a named human can clear adequacy.',
    '',
  );
  return output.join('\n');
}

async function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    usage();
    throw error;
  }

  const repoRoot = path.resolve(process.cwd());
  const privateRoot = path.join(repoRoot, 'private');
  const sensitiveInput = !isInside(args.inputPath, repoRoot)
    || isInside(args.inputPath, privateRoot)
    || (args.expectPath && isInside(args.expectPath, privateRoot));
  if (sensitiveInput && !isInside(args.outDir, privateRoot)) {
    throw new Error('External/private inputs require --out-dir under private/');
  }

  await mkdir(args.outDir, { recursive: true });
  let pdfPath = args.inputPath;
  if (args.inputType === 'markdown') {
    pdfPath = path.join(args.outDir, 'rendered.pdf');
    await renderMarkdownInput(args.inputPath, pdfPath);
  }

  const extracted = await extractPdfText(pdfPath);
  const textPath = path.join(args.outDir, 'paste-test.txt');
  await writeFile(textPath, extracted.text, 'utf8');

  if (!args.expectPath) {
    const inspection = inspectExtractedText(extracted);
    const audit = {
      schema_version: '2.0.0',
      harness: 'ats-paste-test',
      mode: 'inspect',
      chapter: 13,
      document_id: path.basename(args.inputPath, path.extname(args.inputPath)),
      parser: { name: 'pdfjs-dist', version: pdfjsVersion, source_type: 'script-output' },
      inputs: {
        source: relativeDisplay(args.inputPath),
        source_type: args.inputType,
        inspected_pdf: relativeDisplay(pdfPath),
      },
      metrics: {
        pages: { value: extracted.pageCount, source_type: 'script-output', record: 'PDF page tree' },
      },
      ...inspection,
    };
    const jsonPath = path.join(args.outDir, 'inspection-audit.json');
    const markdownPath = path.join(args.outDir, 'inspection-audit.md');
    await writeFile(jsonPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
    await writeFile(markdownPath, renderInspectionMarkdown(audit), 'utf8');

    const deterministicPasses = audit.checks.filter((check) => check.status === 'PASS').length;
    const reviews = audit.checks.filter((check) => check.status === 'REVIEW').length;
    console.log(`ATS paste inspect: PARSER_FLOOR_${audit.parser_floor}`);
    console.log(`  input: ${args.inputType}${args.inputType === 'markdown' ? ' (rendered to PDF)' : ''}`);
    console.log(`  parser: pdfjs-dist ${pdfjsVersion}`);
    console.log(`  pages: ${extracted.pageCount}`);
    console.log(`  deterministic checks: ${deterministicPasses}/${audit.checks.length} PASS · ${reviews} REVIEW`);
    console.log(`  inventory (heuristic): ${audit.inventory.heading_categories_detected.length} heading categories · ${audit.inventory.date_like_lines} date-like lines · ${audit.inventory.bullet_lines} bullet-like lines`);
    console.log(`  artifacts: ${relativeDisplay(textPath)}, ${relativeDisplay(jsonPath)}, ${relativeDisplay(markdownPath)}`);
    process.exitCode = audit.parser_floor === 'PASS' ? 0 : 1;
    return;
  }

  const manifest = JSON.parse(await readFile(args.expectPath, 'utf8'));
  validateManifest(manifest);
  const sourcePath = path.resolve(process.cwd(), manifest.source_markdown);
  const sourceMarkdown = await readFile(sourcePath, 'utf8');
  verifyManifestProvenance(manifest, sourceMarkdown);
  const evaluation = evaluateManifest(extracted.text, manifest);
  const audit = {
    schema_version: '1.0.0',
    harness: 'ats-paste-test',
    mode: 'verify',
    chapter: 13,
    document_id: manifest.document_id,
    verdict: evaluation.verdict,
    parser: { name: 'pdfjs-dist', version: pdfjsVersion, source_type: 'script-output' },
    inputs: {
      source: relativeDisplay(args.inputPath),
      source_type: args.inputType,
      pdf: relativeDisplay(pdfPath),
      expectation_manifest: relativeDisplay(args.expectPath),
      source_markdown: manifest.source_markdown,
    },
    metrics: {
      pages: { value: extracted.pageCount, source_type: 'script-output', record: 'PDF page tree' },
      required_fields: { ...evaluation.summary.fields, source_type: 'script-output', record: 'fields results below' },
      order_checks: { ...evaluation.summary.order_checks, source_type: 'script-output', record: 'order_checks results below' },
    },
    ...evaluation,
    limitations: [
      'One parser is a conservative floor, not proof of compatibility with every ATS.',
      'String presence and order do not verify the truth or quality of resume claims.',
      'Visual adequacy requires human review.',
    ],
  };

  const jsonPath = path.join(args.outDir, 'paste-test-audit.json');
  const markdownPath = path.join(args.outDir, 'paste-test-audit.md');
  await writeFile(jsonPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  await writeFile(markdownPath, renderVerificationMarkdown(audit), 'utf8');

  console.log(`ATS paste test: ${audit.verdict}`);
  console.log(`  parser: pdfjs-dist ${pdfjsVersion}`);
  console.log(`  pages: ${extracted.pageCount}`);
  console.log(`  required fields: ${evaluation.summary.fields.passed}/${evaluation.summary.fields.total} PASS`);
  console.log(`  order checks: ${evaluation.summary.order_checks.passed}/${evaluation.summary.order_checks.total} PASS`);
  for (const field of evaluation.fields) {
    console.log(`  [${field.status}] ${field.category}:${field.id} (${field.match}) — ${field.expected}`);
  }
  for (const check of evaluation.order_checks) {
    console.log(`  [${check.status}] order:${check.id} — ${check.reason}`);
  }
  console.log(`  artifacts: ${relativeDisplay(textPath)}, ${relativeDisplay(jsonPath)}, ${relativeDisplay(markdownPath)}`);
  console.log('  human gate: read paste-test.txt; this harness does not certify every ATS');
  process.exitCode = audit.verdict === 'PASS' ? 0 : 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(SCRIPT_PATH);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`ATS paste test ERROR: ${error.message}`);
    process.exitCode = 2;
  });
}
