# cha-bot-starter-kit

> A clean starter kit for building **VRoid VRM-based AI assistant bots** —
> browser-rendered 3D avatar, streaming chat, voice (STT/TTS), and three
> conversation modes (face-to-face / speech / text).

Built on React 19 + Vite 8 + Three.js + [@pixiv/three-vrm](https://github.com/pixiv/three-vrm).
**Zero ongoing avatar cost** (VRM runs in the browser — no HeyGen / LiveAvatar fees).

---

## ✨ What you get out of the box

| Feature | Status |
|---|---|
| 3D VRoid VRM avatar rendering | ✅ ready (drop in your `.vrm` file) |
| Auto lip-sync from TTS audio (RMS → 'aa' viseme) | ✅ |
| Auto blinking + warm idle expression + chest breathing | ✅ |
| Streaming SSE chat (token-by-token typing effect) | ✅ |
| Sentence-level TTS queue with **parallel pre-fetch** | ✅ |
| 3 modes: **FTF** (face-to-face) / **STS** (voice) / **TTT** (text) | ✅ |
| ESC interrupt for bot speech | ✅ |
| Camera capture for vision LLM (FTF mode) | ✅ |
| Echo guard (mic pauses during bot speech) | ✅ |
| Light / dark theme toggle | ✅ |
| Optional chat history logging (env-gated) | ✅ |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or later — [download](https://nodejs.org/)
- **Git** — [download](https://git-scm.com/downloads)

### 1. Clone and install

```bash
git clone https://github.com/sungbongju/cha-bot-starter-kit.git my-bot
cd my-bot
npm install
```

### 2. Add your VRM avatar

Put a `.vrm` file at `public/avatar.vrm`. Two easy ways:

- **Quickest** — download a free avatar from [VRoid Hub](https://hub.vroid.com)
  (filter by `License: Allow Redistribution`)
- **Custom** — make your own with the free
  [VRoid Studio](https://vroid.com/en/studio) desktop app
  (open a Sample Character → Export → Export VRM → save as `avatar.vrm`)

> Without this file, the avatar panel will show a friendly placeholder
> telling you exactly where to drop it.

### 3. Configure backend (optional)

Copy the env template:

```bash
cp .env.example .env
```

Edit `.env` and set `ONPREMISE_BASE_URL` + `ONPREMISE_API_KEY` to point at
your own LLM / STT / TTS server. The starter kit's Vercel serverless
functions (`/api/*.js`) proxy requests to this server.

If you skip this step, the UI still loads but chat / voice will fail
(no backend to talk to). The avatar still renders.

### 4. Run locally

```bash
npm run dev
```

Open <http://localhost:5173>. You should see your avatar (or the
placeholder if you didn't add one yet).

### 5. Deploy to Vercel

```bash
# Create a new repo on github.com first, then:
git remote set-url origin https://github.com/YOUR_USERNAME/my-bot.git
git push -u origin main
```

Then on [vercel.com](https://vercel.com): **New Project → Import** your
repo → add the same env vars under **Settings → Environment Variables**
→ Deploy.

---

## 📁 Project structure

```
cha-bot-starter-kit/
├─ index.html                 entry HTML
├─ vite.config.js
├─ vercel.json                SPA fallback
├─ .env.example               env template (no secrets committed)
│
├─ public/
│  ├─ avatar.vrm              ⭐ ADD YOUR VRM HERE (not committed in starter)
│  └─ og-thumbnail.png        social preview image
│
├─ src/
│  ├─ main.jsx                React entry
│  ├─ App.jsx                 main app — VRM + chat + STT + TTS orchestration
│  ├─ lib/
│  │  ├─ api.js               session id + optional chat logging
│  │  └─ stt.js               MicRecorder (getUserMedia + VAD + audio chunks)
│  └─ components/
│     ├─ VRMAvatar.jsx        ⭐ Three.js + three-vrm renderer + lip-sync
│     ├─ AvatarPanel.jsx      avatar + camera + mode toggles + start/stop
│     └─ ChatPanel.jsx        chat messages + input + mic
│
└─ api/                       Vercel serverless functions (backend proxies)
   ├─ chat-stream.js          SSE LLM stream proxy
   ├─ chat.js                 batch LLM proxy (fallback)
   ├─ tts.js                  text → audio proxy
   └─ stt.js                  audio → text proxy
```

---

## 🎨 Customization checklist

| Want to change... | Edit... |
|---|---|
| **Avatar character** | replace `public/avatar.vrm` |
| **Avatar camera angle** | `src/components/VRMAvatar.jsx` line 226-227 |
| **Bot greeting message** | `src/App.jsx` — `GREETING_TEXT` / `GREETING_TTS` constants |
| **Page title / favicon** | `index.html` |
| **Chat panel title** | pass `title="..."` prop to `<ChatPanel>` |
| **TTS pronunciation rules** | `src/App.jsx` — `normalizeTtsText()` |
| **Vision intent keywords** | `src/App.jsx` — `VISION_INTENT` regex |
| **Color / theme** | `src/index.css` + `*.module.css` files |
| **Backend endpoints** | `api/*.js` files + `.env` |

---

## 🧪 Testing locally without a backend

The frontend works standalone — VRM rendering, mode switching, theme
toggle, and the UI all function. Only the chat/voice features need a
backend.

For quick frontend-only testing:

```bash
npm run dev
# → see avatar, switch modes, toggle theme.
# Chat send button will return a 502/network error (no backend) but
# the UI doesn't crash.
```

---

## 🛠 Backend requirements

Your on-premise server should expose these endpoints (the Vercel
functions in `api/` proxy to them):

| Endpoint | Method | Body | Response |
|---|---|---|---|
| `/chat-stream` | POST | `{message, history, images?}` | SSE stream: `data: {"token":"..."}` |
| `/chat` | POST | `{message, history}` | `{reply, ttsReply}` |
| `/tts` | POST | `{text}` | audio (wav/mp3) |
| `/stt` | POST | audio Blob | `{text}` |

The included `api/*.js` files have the proxy logic — you may need to
adjust headers / paths to match your backend's URL scheme.

---

## 📜 License

MIT — see [LICENSE](LICENSE) (if present) or use freely.

Avatar files (`public/avatar.vrm` you add) follow **their own** VRM
license metadata. Always check `allowRedistribution`, `commercialUsage`,
and `creditNotation` fields before redistributing your bot publicly.

---

## 🙏 Credits

- **VRM rendering**: built on [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- **VRoid Studio**: [vroid.com/en/studio](https://vroid.com/en/studio)
- **Original VRM migration**: [차상현 (STARG-LEE)](https://github.com/STARG-LEE/cha-interview-bot-liveavatar)
- **Streaming + optimization layer**: sungbongju + Claude (Anthropic)

---

## 🆘 Stuck?

Common issues:

| Symptom | Likely cause |
|---|---|
| Avatar slot is empty | `public/avatar.vrm` missing → add one |
| Chat send fails with network error | Backend not configured → set env vars |
| Mic button does nothing | Browser blocked microphone → check site permissions |
| Camera doesn't appear in FTF mode | Browser blocked camera → check site permissions |
| Build warning "chunks larger than 500 kB" | Normal (Three.js is large); safe to ignore |
| TypeError: speak is not a function | VRM didn't finish loading → wait a few seconds |

Still stuck? Open an [issue](https://github.com/sungbongju/cha-bot-starter-kit/issues).
