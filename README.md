# 🤖 cha-bot-starterkit

> **2026 비즈모델 경진대회 16팀**용 봇 스타터킷.
> **코드 한 줄도 안 건드리고** 본인 봇 만들기.

| | |
|---|---|
| 🎨 **3D 아바타** | VRoid 캐릭터 (본인이 만든 거 그냥 올리면 됨) |
| 💬 **AI 채팅** | 미들턴 Gemma4 — **무료 공유 (학생 비용 0원)** |
| 🗣 **음성** | STT/TTS 자동 작동 |
| 📚 **나만의 지식** | 웹페이지에서 청크 추가 → 봇이 우리 팀 답변 |
| 💛 **카카오 공유** | 친구에게 봇 자랑하기 |

---

## ⚡ 만들기 5단계 (1시간)

### 1️⃣ 사전 준비

- [Node.js](https://nodejs.org/) + [Git](https://git-scm.com/downloads) 설치
- GitHub / Vercel / 카카오디벨로퍼 계정 가입
- **본인 팀 번호** (01~16) — 운영자에게 받음

### 2️⃣ 레포 복사 + 푸시

#### 2-1. GitHub에서 빈 레포 만들기 (웹 브라우저)

1. https://github.com/new 접속 (본인 계정 로그인)
2. **Repository name**: `my-bot` (원하는 이름)
3. **Public** 선택
4. **체크박스 모두 OFF** (README/.gitignore/license 다 끄기 — 푸시 충돌 방지)
5. **Create repository** 클릭
6. 생성된 페이지에서 URL 확인: `https://github.com/[본인]/my-bot.git`

#### 2-2. 로컬에서 클론 + 푸시 (CMD)

```cmd
cd C:\projects
mkdir my-bot
cd my-bot
git clone https://github.com/sungbongju/cha-bot-starterkit.git .
rmdir /s /q .git
git init -b main
git add . && git commit -m "내 봇 시작"
git remote add origin https://github.com/[본인]/my-bot.git
git push -u origin main
```

> ⚠️ `git remote add` 명령의 URL은 **2-1에서 만든 본인 레포** URL입니다. `sungbongju/cha-bot-starterkit.git` 이 아님.

> 💡 처음 `git push` 시 GitHub 로그인 창이 뜹니다. 브라우저에서 인증하면 자동 푸시.

### 3️⃣ Vercel 배포

[vercel.com](https://vercel.com) → **New Project** → 본인 레포 → **Environment Variables** 추가:

| Name | Value |
|---|---|
| `TEAM_ID` | `03` (본인 팀 번호) |
| `VITE_KAKAO_JS_KEY` | 카카오 JS 키 (Step 4에서) |

**Deploy** → 3분 후 배포 URL 발급.

### 4️⃣ 카카오 SDK

[Kakao Developers](https://developers.kakao.com/) → 앱 생성 → JS 키 복사:
1. **플랫폼 → Web** : 본인 Vercel URL 등록
2. **카카오 로그인 ON** + Redirect URI (`Vercel URL/oauth`)
3. **동의 항목**: 닉네임 필수
4. Vercel env `VITE_KAKAO_JS_KEY` 교체 + **Redeploy**

### 5️⃣ RAG 청크 추가 (본인 봇 지식)

```
https://middleton.p-e.kr/finbot/team/[본인팀번호]/rag
```

웹페이지에서 JSONL 파일 업로드 → 끝.

청크 예시 (`chunks.jsonl`):
```jsonl
{"id":"q1","question":"안녕","answer":"안녕! 나는 분개해 봇이야."}
{"id":"q2","question":"분개가 뭐야","answer":"거래를 차변과 대변으로 나누는 거예요."}
```

> 💡 ChatGPT/Claude에 "내 봇 주제로 청크 50개 JSONL 만들어줘" 부탁하면 자동 생성됩니다.

---

## 🎨 본인 아바타 만들기 (선택)

1. [VRoid Studio](https://vroid.com/en/studio) 설치 (무료)
2. 캐릭터 만들기 → **Export as VRM**
3. 라이선스 모두 **Allow**
4. 파일명 `avatar.vrm`로 저장
5. `public/avatar.vrm` 위치에 복사 → `git push`

> VRoid 안 만들면 placeholder 아바타 표시.

---

## 📖 자세한 자습서

[**docs/tutorial.html**](docs/tutorial.html) — 11단계 그림 자습서

---

## 🆘 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| 아바타 자리에 placeholder | `public/avatar.vrm` 없음 → 추가 |
| 채팅 안 됨 | Vercel env `TEAM_ID` 확인 |
| 카카오 로그인 에러 | 카카오 디벨로퍼에서 Web 도메인 등록 + 로그인 활성화 |
| RAG 청크 안 보임 | 본인 팀 번호 (TEAM_ID) 와 URL 팀번호 일치 확인 |

---

## 🙏 만든 사람

- **백엔드 + 스타터킷**: 성봉주 + Claude (Anthropic)
- **VRM 렌더링**: [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)

MIT License.
