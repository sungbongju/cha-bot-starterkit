# 8장. Vercel로 인터넷 배포

> 이 장에서 봉주 봇이 **진짜 인터넷에 뜹니다.** 친구에게 URL을 보내면 누구나 접속 가능. 약 10분.

---

## 8.1 왜 Vercel인가

**Vercel** = 정적 웹사이트 + 서버리스 함수(serverless functions) 호스팅 무료 서비스.

```
[내 GitHub 레포]   ────→  [Vercel]   ────→   [인터넷에 라이브]
  코드 변경 push                          https://my-bot.vercel.app
        ↑
        └── Vercel이 GitHub와 연결되어 있어서
            push할 때마다 자동으로 다시 빌드 + 배포
```

### 8.1.1 Vercel의 장점

- 무료 (개인 프로젝트, 트래픽 한도 넉넉)
- GitHub 연결 → push 자동 배포
- Vite/React 같은 모던 프레임워크 자동 감지
- HTTPS(보안 통신) 자동 적용
- 서버리스 함수 (`api/*.js`) 자동 배포

### 8.1.2 다른 옵션

Netlify, Cloudflare Pages, GitHub Pages 등도 가능합니다. 이 자습서는 Vercel 기준으로 진행합니다 — 박교수님 카톡에서 권장하신 서비스이기도 합니다.

> 📌 **[참고] "서버리스(serverless)"가 뭔가요?**
>
> 직역하면 "서버 없는"이지만 실제로는 **"서버 관리 안 해도 되는"**이라는 뜻. 평소에는 비활성 상태로 있다가, 누가 함수를 호출할 때만 자동으로 잠깐 켜져서 실행하고 다시 꺼집니다. 24시간 켜두는 전통적 서버와 달리, 호출량이 적으면 비용도 거의 없습니다. 우리 봇의 `api/` 폴더가 여기에 해당.

---

## 8.2 Vercel 가입 (이미 했으면 스킵)

[1.3절](./03-chapter-1.md#13-vercel버셀-계정-만들기--약-1분)에서 이미 가입하셨으면 건너뛰셔도 됩니다. 다시 한번 요약:

1. <https://vercel.com/signup> 접속
2. **"Continue with GitHub"** 클릭 (가장 쉬움)
3. GitHub 권한 요청 → **Authorize Vercel** 클릭
4. 가입 완료 → Vercel 대시보드 진입

> 💡 GitHub로 가입하시면 별도 비밀번호를 만들지 않아도 되고, 다음 단계의 레포 연결도 자동입니다.

---

## 8.3 레포 import와 프로젝트 설정

### 8.3.1 새 프로젝트 만들기

1. <https://vercel.com/new> 접속
2. **"Import Git Repository"** 섹션에서 본인 레포(7장에서 만든 것) 찾기
   - 처음이면 "Vercel을 설치할 GitHub 계정" 권한 부여 화면이 뜹니다
   - **All repositories** 선택 (또는 본인이 만든 그 레포만 선택)
   - **Install** 버튼 클릭
3. 권한 받은 후 → 레포 목록에 본인 레포 이름이 보임
4. 본인 레포 옆 **Import** 버튼 클릭

### 8.3.2 설정 화면 (Configure Project)

```
Project Name:     my-vrm-bot   (자동 채워짐, 그대로 OK)
Framework Preset: Vite          ← 자동 감지됨, 그대로!
Root Directory:   ./            (그대로)

> Build and Output Settings  (펼치지 마세요, 기본값으로 OK)

> Environment Variables       (펼치지 마세요, 일단 비워둠)
```

→ **그대로 두고 아래 파란색 `Deploy` 버튼 클릭**.

> ⚠ **Framework Preset를 "Other"로 바꾸지 마세요.**
>
> Vite는 정확한 감지입니다. Other로 바꾸면 Build command 등을 직접 입력해야 해서 학생이 막힙니다.

> 💡 **환경변수를 비워둬도 OK인 이유**: 우리는 지금 **아바타 렌더링**만 검증합니다. 채팅/음성은 backend(백엔드) 서버 연결이 필요한데 그건 2차 자습서에서 다룹니다. 아바타는 정적 파일이라 환경변수 없이도 잘 뜹니다.

---

## 8.4 빌드 대기

Deploy를 누르면 Vercel이 자동으로:

1. GitHub에서 코드 받아옴 (clone)
2. `npm install` 실행 (의존성 설치)
3. `npm run build` 실행 (Vite 빌드)
4. 결과물 (`dist/` 폴더)을 자동 배포

### 8.4.1 빌드 진행 화면 (1~2분)

```
┌──────────────────────────────────────────┐
│ 🔵 Building...                            │
│                                           │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 30%     │
│                                           │
│ Build Logs (실시간):                       │
│   Cloning github.com/내ID/내봇이름...     │
│   Installing dependencies...              │
│     added 200 packages in 30s             │
│   Running "npm run build"                 │
│     vite v8.0.12 building...              │
│     ✓ 30 modules transformed              │
│     ✓ built in 318ms                      │
│   Uploading build outputs...              │
│                                           │
└──────────────────────────────────────────┘
```

→ 완료되면 화면이 **🎉 콘페티 애니메이션** + **"Congratulations"** 메시지로 바뀝니다.

---

## 8.5 라이브 URL 확인

배포 완료 화면에서 본인 봇의 미리보기 스크린샷과 URL이 보입니다:

```
🎉 Your project has been deployed.

Visit: https://my-vrm-bot-xxxxxxxx.vercel.app
       [Visit] [Continue to Dashboard]
```

→ **그 URL 클릭** = 본인 봇이 인터넷에 뜸 🎉

### 8.5.1 URL 형식

- 기본: `https://[프로젝트이름]-[랜덤문자열].vercel.app`
- 추후 본인 도메인 연결도 가능 (Settings → Domains)

---

## 8.6 동작 점검 — 되는 것과 안 되는 것

### 8.6.1 ✅ 확인할 것들 (되어야 정상)

1. **페이지 로딩** → 헤더, 아바타 패널, 채팅 패널이 보임
2. **아바타 로딩 표시** → "아바타 불러오는 중…" 스피너가 잠깐 보이다 사라짐
3. **아바타 렌더링** → 6장에서 넣은 캐릭터가 등장
4. **아이들 애니메이션** → 눈 깜빡임, 미세한 호흡, 시선 추적
5. **모드 토글** → 📷 / 🎙 버튼 클릭 시 모드 바뀜 (FTF / STS / TTT)
6. **테마 토글** → 🌙/☀️ 버튼 클릭 시 라이트/다크 모드 전환

### 8.6.2 ⚠ 동작 안 하는 것 (정상)

- **"상담 시작" 버튼** 누르면 → 채팅 시도 → **네트워크 에러**
  - 이유: backend 서버 (`ONPREMISE_BASE_URL` 환경변수) 미설정
  - 정상입니다. 2차 자습서에서 backend 연결.

> 📌 **[참고] 모드 약어 설명**
>
> - **FTF** = Face-to-Face (얼굴 보면서 대화, 카메라 + 음성)
> - **STS** = Speech-to-Speech (음성만)
> - **TTT** = Text-to-Text (텍스트 채팅)
>
> 1차 자습서에서는 토글 동작까지만 확인합니다. 실제 대화는 2차 자습서에서 backend 연결 후.

---

## 8.7 친구에게 자랑하기

URL을 복사해서 카톡으로 보내세요:

```
야 내가 만든 AI 봇이야 ㅎㅎ
https://my-vrm-bot-xxxxxxxx.vercel.app
```

→ 친구가 그 URL을 누르면 봉주 봇이 뜹니다. **인터넷 어디서든**.

---

## 8.8 다음 push부터는 자동 배포

이제 봉주가 코드 수정 후 GitHub에 push하면:

```
[로컬 수정]
git add ...
git commit -m "..."
git push
        ↓
[GitHub 자동 알림 → Vercel]
        ↓
[Vercel 자동 빌드 → 자동 배포]
        ↓
[1~2분 후 사이트 자동 업데이트]
```

→ Vercel 사이트에 가지 않아도 자동입니다. 매우 편합니다.

### 8.8.1 검증 표

| 항목 | 기대 결과 |
|---|---|
| Vercel 대시보드 | 본인 프로젝트가 목록에 보임 |
| 라이브 URL 접속 | 캐릭터가 보이고 움직임 |
| 모드/테마 토글 | 클릭 시 화면이 바뀜 |
| 친구 카톡 테스트 | 친구 폰에서도 정상 표시 |

---

## 8.9 🛟 자주 묻는 질문

**Q. 빌드가 실패했어요. 빨간색 에러가 뜹니다.**
> Vercel 화면 "Build Logs" 펼쳐서 빨간 줄(대문자 ERROR 또는 ✗ 표시) 찾아보세요. 가장 흔한 원인:
> - `npm install` 실패 → `package.json`의 의존성 문제. 로컬에서 `npm install`이 잘 됐는지 확인.
> - `npm run build` 실패 → 코드 에러. 로컬에서 `npm run build` 직접 돌려서 같은 에러를 재현하고 수정.
> - 환경변수 누락 → 빌드에 꼭 필요한 `VITE_*` 변수가 없을 때. `.env.example` 참고.

**Q. 배포는 성공했는데 URL 열면 404 / 화이트 스크린이 뜹니다.**
> 브라우저 콘솔(F12) → Console 탭에서 빨간 에러 확인.
> 보통 `vercel.json`의 SPA fallback 설정 문제. 우리 스타터킷에는 이미 잘 들어가 있어 문제 없을 것입니다.

**Q. 아바타가 안 뜨고 "👋 아바타가 비어있어요" 메시지가 떠요.**
> `public/avatar.vrm`이 Git에 들어가지 않은 것입니다. 7장의 `git add → commit → push` 다시 점검:
> ```cmd
> git status                # avatar.vrm이 untracked로 나오면 안 들어간 것
> git ls-tree HEAD public   # avatar.vrm이 목록에 없으면 commit이 안 된 것
> ```
> `avatar.vrm` 추가 후 다시 commit + push → Vercel 자동 재배포.

**Q. 환경변수는 언제 추가하나요?**
> Backend 서버 연결할 때 (2차 자습서). 지금은 비워둬도 아바타까지는 잘 뜹니다. 추가하려면:
> Vercel 대시보드 → 본인 프로젝트 → Settings → Environment Variables → Add new

**Q. 도메인(예: mybot.com)으로 바꾸고 싶어요.**
> Settings → Domains → Add → 본인 도메인 입력. 단 도메인은 별도 구매 필요 (Vercel은 호스팅만, 도메인 등록은 namecheap/cloudflare/가비아 등). 처음엔 `vercel.app` 무료 URL 그대로 쓰는 것을 추천.

**Q. 친구에게 보낼 URL을 더 짧게 / 예쁘게 만들고 싶어요.**
> Vercel은 무료 플랜에서도 `https://[원하는이름].vercel.app`으로 변경 가능:
> Project → Settings → Domains → vercel.app 도메인 클릭 → "Edit" → 다른 이름 입력. 단 다른 사람이 안 쓴 이름이어야 합니다.

**Q. 무료 플랜 한도는 얼마나 되나요?**
> Hobby 플랜(개인용 무료):
> - 월 100 GB 대역폭
> - 빌드 시간 월 6000분
> - 서버리스 함수 호출 월 100만 번
>
> 학생/교수님 개인 봇 용도로는 충분합니다. 트래픽 폭증 시에만 유료 고려.

**Q. 사이트를 비공개(특정 사람만 볼 수 있게) 하고 싶어요.**
> Vercel Pro 플랜($20/월)에서 Password Protection 기능 제공. 무료에선 불가. 대안: 코드에 간단한 로그인 추가 (Auth0, Clerk 등).

---

## 8.10 이 장에서 배운 것 — 요약

| 항목 | 핵심 |
|---|---|
| Vercel import | <vercel.com/new> → 본인 레포 선택 → Deploy |
| 자동 감지 | Framework Preset = Vite (그대로 두기) |
| 빌드 과정 | clone → `npm install` → `npm run build` → 배포 |
| 라이브 URL | `https://[이름]-[랜덤].vercel.app` |
| 자동 배포 | 이후 `git push`만 하면 Vercel이 자동 재배포 |
| 정상 동작 | 아바타·애니메이션·토글 |
| 정상이지만 안 됨 | 채팅 (backend 미설정 — 2차 자습서) |

---

📍 **현재 위치**: 8장 / 8장

[← 이전: 7장. GitHub에 내 봇 올리기](./10-chapter-7.md) | [다음 → 에필로그](./12-epilogue.md)
