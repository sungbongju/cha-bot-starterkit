# cha-bot-starterkit (Team Edition)

> 박교수님 **2026 비즈모델 경진대회** 16팀용 봇 스타터킷.
> 학생 **코드 수정 0곳**으로 본인 팀 봇 운영 — 클론 → Vercel 환경변수 2개 설정 → 끝.

브라우저 사이드 VRoid VRM 아바타 + 스트리밍 채팅(SSE) + 음성(STT/TTS) +
**팀별 격리된 서버 사이드 RAG** + 카카오 로그인/공유.

Built on React 19 + Vite 8 + Three.js + [@pixiv/three-vrm](https://github.com/pixiv/three-vrm).
LLM 백엔드: **미들턴 서버 Gemma4** (OpenAI 키 불필요, 16팀 공유 무료).

---

## ✨ 학생이 받는 것

| Feature | Status |
|---|---|
| 3D VRoid VRM 아바타 렌더링 | ✅ (본인 `.vrm` 드롭만 하면 됨) |
| 스트리밍 SSE 채팅 (토큰 단위 타이핑 효과) | ✅ |
| 문장 단위 TTS 큐 + 병렬 pre-fetch | ✅ |
| 3가지 모드: 대면(FTF) / 음성(STS) / 텍스트(TTT) | ✅ |
| 봇 음성 중 ESC 인터럽트 | ✅ |
| 카메라 캡처 (FTF 모드에서 비전 LLM 입력) | ✅ |
| 카카오 로그인 + 공유 | ✅ |
| **팀별 격리 RAG (서버 사이드)** | ✅ |
| RAG 청크 추가 웹 페이지 | ✅ (SSH 불필요) |
| 라이트/다크 테마 토글 | ✅ |

---

## 🚀 Quick Start

### 사전 준비

- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/downloads)
- GitHub 계정, Vercel 계정, 카카오 디벨로퍼 계정
- 본인 팀 번호 (01 ~ 16) — 박교수님께 받음

### 1. 클론

```bash
git clone https://github.com/sungbongju/cha-bot-starterkit.git my-bot
cd my-bot
rm -rf .git
git init -b main
```

### 2. (선택) 로컬에서 확인

```bash
npm install
npm run dev
# http://localhost:5173 — 아바타 화면 확인
```

> 채팅은 Vercel 배포 후에만 동작 (Middleton 백엔드 호출).

### 3. 본인 GitHub 레포에 푸시

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/my-bot.git
git push -u origin main
```

### 4. Vercel 배포

[vercel.com](https://vercel.com) → New Project → 본인 레포 Import.
**Environment Variables** 에 다음 2개 설정:

| Name | Value |
|---|---|
| `TEAM_ID` | 본인 팀 번호 두 자리 (예: `03`) |
| `VITE_KAKAO_JS_KEY` | 카카오 디벨로퍼에서 발급한 JavaScript 키 |

Deploy 클릭 → 2~3분 후 배포 URL 발급.

### 5. 카카오 설정

카카오 디벨로퍼 콘솔에서:
- 플랫폼: Web → 사이트 도메인에 Vercel URL 추가
- 카카오 로그인 활성화 + Redirect URI 등록
- 동의항목: 닉네임, 이메일

### 6. RAG 청크 추가 (본인 봇 페르소나 만들기)

웹 페이지에서 직접 추가:

```
https://middleton.p-e.kr/finbot/team/{TEAM_ID}/rag
```

JSONL 형식으로 청크 입력 → API 키 (박교수님께 받음) → 저장.

### 7. 아바타 교체

[VRoid Studio](https://vroid.com/en/studio) 에서 본인 캐릭터 만들기 → VRM 익스포트
→ `public/avatar.vrm` 으로 저장 → git push → Vercel 자동 재배포.

---

## 📖 자세한 자습서

**[docs/tutorial.html](docs/tutorial.html)** — 11단계 자습서 (박교수님 자습서 형식 그대로)

박교수님 자습서 ([bizmodel-bots-2026](https://github.com/sdkparkforbi/bizmodel-bots-2026)) 와의 차이는 Step 3, 4, 8 세 단계뿐:
- **Step 3**: 클론 URL이 `cha-bot-starterkit` (이 레포)
- **Step 4**: OpenAI 키 불필요 / `TEAM_ID` env 추가
- **Step 8**: SSH + 스크립트 대신 웹 페이지로 RAG 관리

---

## 📁 프로젝트 구조

```
cha-bot-starterkit/
├─ index.html                 entry HTML + Kakao SDK init
├─ vite.config.js
├─ vercel.json                SPA fallback
├─ .env.example               env template
│
├─ public/
│  └─ avatar.vrm              ⭐ 본인 VRM 여기 (없으면 placeholder)
│
├─ src/
│  ├─ main.jsx                React entry
│  ├─ App.jsx                 메인 — VRM + 채팅 + STT + TTS orchestration
│  ├─ lib/
│  │  ├─ api.js               session + auth
│  │  └─ stt.js               MicRecorder
│  └─ components/
│     ├─ VRMAvatar.jsx        Three.js + three-vrm 렌더러 + 립싱크
│     ├─ AvatarPanel.jsx      아바타 + 카메라 + 모드 토글 + 시작/종료
│     ├─ ChatPanel.jsx        채팅 메시지 + 입력 + 마이크
│     └─ AuthModal.jsx        카카오/이메일 로그인 모달
│
├─ api/                       Vercel serverless 함수 (Middleton 프록시)
│  ├─ chat-stream.js          SSE LLM 스트림 → /api/team/{TEAM_ID}/chat-stream
│  ├─ chat.js                 배치 LLM (fallback)
│  ├─ tts.js                  text → audio
│  ├─ stt.js                  audio → text
│  └─ school-api.js           로그인/회원/세션 (Middleton finbot)
│
└─ docs/
   └─ tutorial.html           학생용 11-step 자습서
```

---

## 🎨 커스터마이징 체크리스트

| 바꾸고 싶은 것 | 수정 위치 |
|---|---|
| **아바타 캐릭터** | `public/avatar.vrm` 교체 |
| **아바타 카메라 각도** | `src/components/VRMAvatar.jsx` (line 226-227) |
| **봇 첫 인사 문구** | `src/App.jsx` — `GREETING_TEXT` / `GREETING_TTS` 상수 |
| **페이지 제목 / favicon** | `index.html` |
| **채팅 패널 타이틀** | `<ChatPanel title="..." />` prop |
| **봇 페르소나 / 답변 스타일** | Middleton RAG 청크로 표현 (Step 6) |
| **STT 도메인 단어 prime** | Vercel env `WHISPER_PROMPT` (쉼표 구분 단어 목록) |

---

## 🛠 백엔드 (Middleton)

학생이 직접 운영할 필요 없음. 박교수님이 16팀 공유로 미리 세팅:

| Endpoint | 용도 |
|---|---|
| `/api/team/{id}/chat-stream` | SSE 스트리밍 채팅 (RAG + Gemma4) |
| `/api/team/{id}/chat` | 배치 채팅 (fallback) |
| `/whisper/v1/audio/transcriptions` | STT (faster-whisper-large-v3-turbo) |
| `/api/tts` | TTS (OmniVoice) |
| `/finbot/team/{id}/rag` | RAG 관리 웹 UI |

---

## 📜 라이선스

MIT.

아바타 VRM 파일은 본인이 추가하는 것의 **자체 라이선스** 를 따릅니다.
공개 배포 전 `allowRedistribution`, `commercialUsage`, `creditNotation` 메타데이터 확인 필수.

---

## 🙏 Credits

- **VRM 렌더링**: [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- **VRoid Studio**: [vroid.com/en/studio](https://vroid.com/en/studio)
- **Team Edition 백엔드 + 자습서**: 성봉주 + Claude (Anthropic)
- **박교수님 원본 자습서**: [bizmodel-bots-2026](https://github.com/sdkparkforbi/bizmodel-bots-2026)

---

## 🆘 트러블슈팅

| 증상 | 원인 |
|---|---|
| 아바타 자리에 placeholder | `public/avatar.vrm` 없음 → 추가 |
| 채팅 시 network error | `TEAM_ID` env 누락 또는 잘못된 팀 번호 |
| 카카오 로그인 안 됨 | `VITE_KAKAO_JS_KEY` 누락 또는 Redirect URI 미등록 |
| 마이크 버튼 무반응 | 브라우저 마이크 권한 차단 → 사이트 권한 확인 |
| 빌드 경고 "chunks larger than 500 kB" | 정상 (Three.js가 크기 때문) — 무시 |
| RAG 청크 추가 시 권한 오류 | 팀별 API 키 (박교수님께 받음) 잘못됨 |

이슈 → [GitHub Issues](https://github.com/sungbongju/cha-bot-starterkit/issues)
