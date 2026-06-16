// Request pairing — device will show a 4-digit PIN on its display.
export async function requestPairing(ip) {
  try {
    const res = await fetch(`http://${ip}/pair/request`, {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}

// Submit PIN entered by user. Returns auth token string or null on failure.
export async function verifyPairing(ip, pin) {
  try {
    const res = await fetch(`http://${ip}/pair/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.token ?? null
  } catch {
    return null
  }
}

// Check device connectivity. Returns status object or null.
export async function checkDevice(ip, token) {
  try {
    const headers = token ? { 'X-AI-Appliances-Token': token } : {}
    const res = await fetch(`http://${ip}/status`, {
      headers,
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
