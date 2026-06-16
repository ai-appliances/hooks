import { lookup } from 'dns/promises'

// Try to find aibox.local via mDNS (works on macOS/Linux transparently).
// Returns IP string or null if not found.
export async function discoverAibox() {
  try {
    const { address } = await lookup('aibox.local', { family: 4 })
    return address
  } catch {
    return null
  }
}
