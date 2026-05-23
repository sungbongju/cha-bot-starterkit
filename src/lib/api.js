// Minimal API helper for cha-bot-starter-kit
//
// This starter kit does not include auth/user accounts out of the box.
// Add your own auth later if needed (e.g. NextAuth, Clerk, Supabase Auth, etc.)
//
// What's here:
// - newSessionId / getSessionId : local conversation id (in localStorage)
// - saveChat                    : optional chat history logging (env-gated)

const SID_KEY = 'cha_bot_sid'

/** Start a new conversation. Returns a fresh session id and persists it. */
export function newSessionId() {
  const sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
  localStorage.setItem(SID_KEY, sid)
  return sid
}

/** Current session id (or null if none). */
export function getSessionId() {
  return localStorage.getItem(SID_KEY)
}

/**
 * Optional: persist a chat message to your own backend.
 *
 * No-op unless VITE_CHAT_LOG_ENDPOINT is set in .env (or Vercel env vars).
 * Fire-and-forget — never blocks the UI. Errors are swallowed.
 *
 * Endpoint should accept POST { sessionId, role, message, ragHits, ts }.
 */
export function saveChat(sessionId, role, message, ragHits = null) {
  const endpoint = import.meta.env.VITE_CHAT_LOG_ENDPOINT
  if (!endpoint || !sessionId) return
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      role,
      message,
      ragHits,
      ts: new Date().toISOString(),
    }),
    keepalive: true,
  }).catch(() => { /* fire-and-forget */ })
}
