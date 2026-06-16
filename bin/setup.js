#!/usr/bin/env node

import { createInterface } from 'readline'
import { randomUUID } from 'crypto'
import { loadConfig, saveConfig } from '../src/lib/config.js'
import { registerDevice, checkDevice } from '../src/lib/device.js'
import { writeClaudeCodeHooks } from '../src/adapters/claude-code.js'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (prompt) => new Promise(r => rl.question(prompt, r))

const TOOLS = [
  { label: 'Claude Code',   fn: writeClaudeCodeHooks },
  { label: 'OpenAI Codex', fn: null },
  { label: 'OpenCode',     fn: null },
]

async function runSetup() {
  console.log('\n@ai-appliances/hooks — setup\n')

  const config = await loadConfig()

  // Tool selection
  console.log('AI coding tool:')
  TOOLS.forEach((t, i) =>
    console.log(`  ${i + 1}) ${t.label}${t.fn ? '' : '  (coming soon)'}`)
  )
  const toolIdx = parseInt((await ask('Select [1]: ')).trim() || '1') - 1

  if (!TOOLS[toolIdx]?.fn) {
    console.log(`\n${TOOLS[toolIdx]?.label ?? 'Unknown'} is not yet supported.`)
    rl.close()
    return
  }

  // Device IP
  const defaultIp = config.ip || '192.168.1.100'
  const ipInput = (await ask(`\nDevice IP [${defaultIp}]: `)).trim()
  const ip = ipInput || defaultIp

  rl.close()

  // Token: reuse existing or generate new
  const token = config.token || randomUUID()

  // Register token with device
  process.stdout.write('\nRegistering with device... ')
  const ok = await registerDevice(ip, token)
  console.log(ok ? '✓' : '⚠  device unreachable — token saved locally, re-run setup when device is online')

  // Write hooks
  process.stdout.write(`Writing ${TOOLS[toolIdx].label} hooks... `)
  await TOOLS[toolIdx].fn(ip, token)
  console.log('✓')

  // Persist config
  await saveConfig({ ip, token })

  console.log('\nDone! Restart your AI coding tool to apply hooks.')
  console.log(`Config: ~/.ai-appliances/config.json\n`)
}

async function runStatus() {
  const config = await loadConfig()
  if (!config.ip || !config.token) {
    console.log('\nNot configured — run: npx @ai-appliances/hooks setup\n')
    return
  }
  process.stdout.write(`\nDevice ${config.ip} ... `)
  const online = await checkDevice(config.ip, config.token)
  console.log(online ? '✓ online' : '✗ offline')
  console.log(`Token: ${config.token}\n`)
}

const cmd = process.argv[2] || 'setup'
if      (cmd === 'setup')  runSetup().catch(e => { console.error(e.message); process.exit(1) })
else if (cmd === 'status') runStatus().catch(e => { console.error(e.message); process.exit(1) })
else {
  console.error(`Unknown command: ${cmd}`)
  console.error('Usage: npx @ai-appliances/hooks [setup|status]')
  process.exit(1)
}
