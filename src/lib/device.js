export async function registerDevice(ip, token) {
  try {
    const res = await fetch(`http://${ip}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function checkDevice(ip, token) {
  try {
    const res = await fetch(`http://${ip}/status`, {
      headers: { 'X-AI-Appliances-Token': token },
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}
