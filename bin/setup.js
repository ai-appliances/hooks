#!/usr/bin/env node

import { createInterface } from 'readline'
import { loadConfig, saveConfig } from '../src/lib/config.js'
import { discoverAibox } from '../src/lib/discover.js'
import { requestPairing, verifyPairing, checkDevice } from '../src/lib/device.js'
import { writeClaudeCodeHooks } from '../src/adapters/claude-code.js'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (prompt) => new Promise(r => rl.question(prompt, r))

const TOOLS = [
  { label: 'Claude Code', fn: writeClaudeCodeHooks },
  { label: 'OpenAI Codex', fn: null },
  { label: 'OpenCode',     fn: null },
]

async function resolveIp(savedIp) {
  process.stdout.write('Looking for device on network (aibox.local)... ')
  const found = await discoverAibox()
  if (found) {
    console.log(`found at ${found}`)
    return found
  }
  console.log('not found via mDNS')

  const defaultIp = savedIp || '192.168.1.100'
  const input = (await ask(`Enter device IP [${defaultIp}]: `)).trim()
  return input || defaultIp
}

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

  // Discover or ask for IP
  const ip = await resolveIp(config.ip)

  // Pairing flow
  console.log('\nStarting pairing...')
  process.stdout.write('Sending pair request to device... ')
  const requested = await requestPairing(ip)

  if (!requested) {
    console.log('failed')
    console.log('\nCould not reach the device.')
    console.log('Make sure device is powered on and connected to the same network.\n')
    rl.close()
    return
  }

  console.log('ok')
  console.log('\nA 4-digit PIN is now shown on the device display.')
  console.log('(Press MIC button on device to cancel)\n')

  let token = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    const raw  = (await ask(`Enter PIN: `)).trim()
    const pin  = raw.padStart(4, '0').slice(-4)

    process.stdout.write('Verifying... ')
    token = await verifyPairing(ip, pin)

    if (token) {
      console.log('✓ paired!')
      break
    }
    console.log('✗ wrong PIN')
    if (attempt === 3) {
      console.log('\nToo many failed attempts. Run setup again to get a new PIN.\n')
      rl.close()
      return
    }
  }

  // Write hooks
  process.stdout.write(`\nWriting ${TOOLS[toolIdx].label} hooks... `)
  await TOOLS[toolIdx].fn(ip, token)
  console.log('✓')

  // Persist config
  await saveConfig({ ip, token })

  console.log('\nDone! Restart your AI coding tool to apply hooks.')
  console.log(`Config saved to ~/.ai-appliances/config.json\n`)
  rl.close()
}

async function runStatus() {
  const config = await loadConfig()
  if (!config.ip) {
    console.log('\nNot configured — run: npx @ai-appliances/hooks setup\n')
    return
  }

  process.stdout.write(`\nChecking ${config.ip} ... `)
  const status = await checkDevice(config.ip, config.token)

  if (!status) {
    console.log('offline or unreachable')
  } else {
    console.log('online')
    console.log(`  Type:   ${status.type ?? 'unknown'}`)
    console.log(`  Paired: ${status.paired ? 'yes' : 'no'}`)
    console.log(`  Token:  ${config.token ?? '(none)'}`)
  }
  console.log()
}

const cmd = process.argv[2] || 'setup'
if      (cmd === 'setup')  runSetup().catch(e => { console.error(e.message); process.exit(1) })
else if (cmd === 'status') runStatus().catch(e => { console.error(e.message); process.exit(1) })
else {
  console.error(`Unknown command: ${cmd}`)
  console.error('Usage: npx @ai-appliances/hooks [setup|status]')
  process.exit(1)
}
