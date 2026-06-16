import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const CONFIG_DIR  = join(homedir(), '.ai-appliances')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')

export async function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return {}
  try {
    return JSON.parse(await readFile(CONFIG_PATH, 'utf8'))
  } catch {
    return {}
  }
}

export async function saveConfig(data) {
  await mkdir(CONFIG_DIR, { recursive: true })
  await writeFile(CONFIG_PATH, JSON.stringify(data, null, 2))
}
