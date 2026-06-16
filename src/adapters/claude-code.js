import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const MARKER       = 'X-AI-Appliances-Token'
const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json')

function buildHooks(ip, token) {
  const h = `${MARKER}: ${token}`
  const c = `curl -s --connect-timeout 2 --max-time 3 -X POST http://${ip}/emotion -H '${h}'`

  // Static body — no shell variables, use single quotes
  const sc = (state) => `${c} -d '{"state":"${state}","from":"claude"}' || true`

  // Dynamic body — includes $TOOL shell variable, escape inner quotes
  const dc = (state) =>
    `${c} -d "{\\"state\\":\\"${state}\\",\\"tool\\":\\"$TOOL\\",\\"from\\":\\"claude\\"}" || true`

  const parseInput = [
    'INPUT=$(cat)',
    `TOOL=$(printf '%s' "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_name','unknown'))" 2>/dev/null || echo unknown)`,
  ].join('; ')

  return {
    UserPromptSubmit: [{
      hooks: [{ type: 'command', command: sc('thinking') }],
    }],

    PreToolUse: [{
      hooks: [{
        type: 'command',
        command: [
          parseInput,
          dc('thinking'),
          // Attention timer: if PostToolUse doesn't fire within 10 s (non-Bash tool),
          // the device is waiting for user approval
          `if [ "$TOOL" != "Bash" ]; then echo attn > /tmp/claude_attn; (sleep 10 && [ -f /tmp/claude_attn ] && ${sc('attention')}) & fi`,
        ].join('; '),
      }],
    }],

    PostToolUse: [{
      hooks: [{
        type: 'command',
        command: [
          parseInput,
          'rm -f /tmp/claude_attn',
          dc('idle'),
        ].join('; '),
      }],
    }],

    Stop: [{
      hooks: [{
        type: 'command',
        // Every 10th exchange triggers celebrate (confetti + happy face),
        // then auto-clears after 8 s
        command: [
          'C=$(cat /tmp/claude_stop_count 2>/dev/null || echo 0)',
          'C=$((C+1))',
          'echo $C > /tmp/claude_stop_count',
          `if [ $((C % 10)) -eq 0 ]; then ${sc('celebrate')}; (sleep 8 && ${sc('clear')}) & else ${sc('idle')}; fi`,
        ].join('; '),
      }],
    }],
  }
}

export async function writeClaudeCodeHooks(ip, token) {
  let settings = {}
  if (existsSync(SETTINGS_PATH)) {
    settings = JSON.parse(await readFile(SETTINGS_PATH, 'utf8'))
  }
  if (!settings.hooks) settings.hooks = {}

  const fresh = buildHooks(ip, token)

  for (const [event, entries] of Object.entries(fresh)) {
    const existing = settings.hooks[event] || []
    // Remove previous ai-appliances entries (by token marker)
    // and also any old manual hooks pointing to the same device IP
    const kept = existing.filter(entry => {
      const cmd = entry.hooks?.map(h => h.command || '').join(' ') ?? ''
      return !cmd.includes(MARKER) && !cmd.includes(`${ip}/emotion`)
    })
    settings.hooks[event] = [...kept, ...entries]
  }

  await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}
