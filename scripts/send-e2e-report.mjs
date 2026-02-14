#!/usr/bin/env node

/**
 * Sends an HTML email report with inline E2E test screenshots via AWS SES.
 *
 * Usage (CI only):
 *   node scripts/send-e2e-report.mjs
 *
 * Environment variables:
 *   SES_SENDER    – verified SES sender email
 *   SES_RECIPIENT – recipient email
 *   AWS_REGION    – AWS region (default: eu-west-1)
 *   GITHUB_SHA    – commit SHA (set by GitHub Actions)
 *   GITHUB_REF_NAME – branch name (set by GitHub Actions)
 *   GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID – for run URL
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'

const SENDER = process.env.SES_SENDER
const RECIPIENT = process.env.SES_RECIPIENT || SENDER
const REGION = process.env.AWS_REGION || 'eu-west-1'
const RESULTS_JSON = process.env.RESULTS_JSON || 'e2e/test-results.json'
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || 'e2e/test-results'

if (!SENDER) {
  console.error('SES_SENDER env var is required')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 1. Parse Playwright JSON results
// ---------------------------------------------------------------------------
let results
try {
  results = JSON.parse(readFileSync(RESULTS_JSON, 'utf-8'))
} catch (err) {
  console.error(`Failed to read ${RESULTS_JSON}:`, err.message)
  process.exit(1)
}

const suites = results.suites || []
let totalTests = 0
let passed = 0
let failed = 0
let skipped = 0

function countTests(suite) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      totalTests++
      const status = test.status
      if (status === 'expected') passed++
      else if (status === 'unexpected') failed++
      else skipped++
    }
  }
  for (const child of suite.suites || []) {
    countTests(child)
  }
}
suites.forEach(countTests)

const allPassed = failed === 0
const statusLabel = allPassed ? 'PASS' : 'FAIL'
const shortSha = (process.env.GITHUB_SHA || 'local').slice(0, 7)
const branch = process.env.GITHUB_REF_NAME || 'local'
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : null

// ---------------------------------------------------------------------------
// 2. Collect screenshots
// ---------------------------------------------------------------------------
function findPngs(dir) {
  const pngs = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        pngs.push(...findPngs(fullPath))
      } else if (extname(entry.name).toLowerCase() === '.png') {
        pngs.push(fullPath)
      }
    }
  } catch {
    // directory may not exist
  }
  return pngs
}

const screenshots = findPngs(SCREENSHOTS_DIR)
console.log(`Found ${screenshots.length} screenshot(s) in ${SCREENSHOTS_DIR}`)

// ---------------------------------------------------------------------------
// 3. Build MIME email
// ---------------------------------------------------------------------------
const boundary = `----=_Part_${Date.now()}`
const cids = screenshots.map((_, i) => `screenshot-${i}@e2e-report`)

const statusColor = allPassed ? '#22c55e' : '#ef4444'
const statusEmoji = allPassed ? '&#9989;' : '&#10060;'

let screenshotHtml = ''
for (let i = 0; i < screenshots.length; i++) {
  const label = basename(screenshots[i], '.png')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  screenshotHtml += `
    <div style="margin-bottom:16px;">
      <p style="font-weight:600;margin:0 0 4px;">${label}</p>
      <img src="cid:${cids[i]}" style="max-width:100%;border:1px solid #e5e7eb;border-radius:6px;" />
    </div>`
}

const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f9fafb;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:${statusColor};color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:20px;">${statusEmoji} PoucherWeb E2E: ${passed}/${totalTests} passed</h1>
      <p style="margin:4px 0 0;opacity:0.9;font-size:14px;">${branch}@${shortSha}</p>
    </div>
    <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:600;">Passed</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#22c55e;">${passed}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:600;">Failed</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#ef4444;">${failed}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:600;">Skipped</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;">${skipped}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;">Total</td>
          <td style="padding:8px 12px;">${totalTests}</td>
        </tr>
      </table>
      ${runUrl ? `<p style="margin:0 0 16px;"><a href="${runUrl}" style="color:#2563eb;">View GitHub Actions run &rarr;</a></p>` : ''}
      ${screenshots.length > 0 ? `<h2 style="font-size:16px;margin:24px 0 12px;">Screenshots</h2>${screenshotHtml}` : '<p style="color:#6b7280;">No screenshots captured.</p>'}
    </div>
  </div>
</body>
</html>`

const subject = `[${statusLabel}] PoucherWeb E2E: ${passed}/${totalTests} passed (${branch}@${shortSha})`

// Build raw MIME message
let rawMessage = [
  `From: ${SENDER}`,
  `To: ${RECIPIENT}`,
  `Subject: ${subject}`,
  'MIME-Version: 1.0',
  `Content-Type: multipart/related; boundary="${boundary}"`,
  '',
  `--${boundary}`,
  'Content-Type: text/html; charset=UTF-8',
  'Content-Transfer-Encoding: 7bit',
  '',
  htmlBody,
].join('\r\n')

for (let i = 0; i < screenshots.length; i++) {
  const data = readFileSync(screenshots[i]).toString('base64')
  rawMessage += [
    '',
    `--${boundary}`,
    'Content-Type: image/png',
    'Content-Transfer-Encoding: base64',
    `Content-ID: <${cids[i]}>`,
    `Content-Disposition: inline; filename="${basename(screenshots[i])}"`,
    '',
    data.match(/.{1,76}/g).join('\r\n'),
  ].join('\r\n')
}

rawMessage += `\r\n--${boundary}--\r\n`

// ---------------------------------------------------------------------------
// 4. Send via SES
// ---------------------------------------------------------------------------
const ses = new SESClient({ region: REGION })

try {
  const result = await ses.send(
    new SendRawEmailCommand({
      RawMessage: { Data: Buffer.from(rawMessage) },
      Source: SENDER,
      Destinations: [RECIPIENT],
    })
  )
  console.log(`Email sent! MessageId: ${result.MessageId}`)
} catch (err) {
  console.error('Failed to send email:', err.message)
  process.exit(1)
}
