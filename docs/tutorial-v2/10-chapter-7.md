# 7장. GitHub에 내 봇 올리기 — `git push`

> 약 15분. 본인 GitHub 계정에 새 레포(repository, 저장소)를 만들고, 봇 코드를 그 레포에 업로드(push)합니다.

---

## 7.1 왜 새 레포에 올리는가

### 7.1.1 현재 상황

지금까지의 흐름을 정리하면:

```
[원본 스타터킷 레포]
github.com/sungbongju/cha-bot-starter-kit
   │
   │ git clone (4장)
   ▼
[내 컴퓨터]
C:\dev\my-bot   ← 여기서 작업 (5·6장)
```

지금 내 컴퓨터의 `my-bot` 폴더는 **원본 스타터킷 레포에 연결되어 있습니다.** 만약 그대로 `git push` 하면 원본 레포를 수정하려고 시도 → **권한이 없어 실패**합니다 (GitHub이 자동 차단).

### 7.1.2 우리가 가야 할 길

```
[내 GitHub 계정에 새 레포]    ← 이 장에서 만듭니다
github.com/내ID/내봇이름
        ▲
        │ git push (7장)
        │
[내 컴퓨터: C:\dev\my-bot]
```

> 💡 박교수님 말씀: **"포크로는 하지 맙시다."** → clone + 새 레포 + push가 정답 (fork는 원본과 영구 연결돼 나중에 복잡해짐).

---

## 7.2 GitHub에 새 레포 만들기

### 7.2.1 브라우저에서

1. <https://github.com/new> 접속 (로그인 안 되어있으면 먼저 로그인)
2. 입력 폼:

   ```
   Repository name *   :  내가-원하는-이름
                          (영문/숫자/하이픈 OK, 한글·공백 X)
                          예: my-vrm-bot, ai-bot-1, jisoo-bot

   Description (옵션)  :  My first VRM bot
   ```

3. **Public** 선택 (학생 추천 — Vercel 무료 플랜과 호환)
4. ⚠ **아래 체크박스 3개 모두 OFF 유지**:

   ```
   ☐ Add a README file              ← 절대 체크하지 마세요
   ☐ Add .gitignore                 ← 절대 체크하지 마세요
   ☐ Choose a license               ← 절대 체크하지 마세요
   ```

5. 초록색 **Create repository** 버튼 클릭

### 7.2.2 만들어진 레포 URL 확인

생성 직후 페이지 주소가 이렇게 보입니다:

```
https://github.com/내ID/내봇이름
```

→ **이 URL을 메모해두세요.** [7.4](#74-원격-주소를-내-레포로-변경)에서 사용합니다.

### 7.2.3 ⚠ 자주 막히는 함정 — README 체크 실수

> 📌 **[참고] "Add a README file" 옵션을 무심코 체크하면**
>
> GitHub이 README.md를 가진 레포를 미리 만듭니다. 그러면 우리 로컬 코드와 **역사 충돌**이 나서 push가 거부됩니다.
>
> **해결**: 그 레포를 삭제하고 다시 만드세요 (체크박스 다 끄고).
> - 레포 페이지 → 우측 **Settings** → 맨 아래 스크롤 → **Danger Zone** → **Delete this repository** → 레포 이름을 입력해 확인
> - 그리고 위 7.2.1을 다시.
>
> 그게 귀찮다면 강제 푸시(`git push --force`)도 가능하지만, 첫 학습 단계에선 권장하지 않습니다.

---

## 7.3 로컬 변경 사항 commit

### 7.3.1 왜 commit이 필요한가

6장에서 추가한 `avatar.vrm` 파일은 아직 Git의 **"공식 기록"**에 들어가지 않은 상태입니다. 먼저 기록해야 push할 수 있습니다.

### 7.3.2 새 CMD 창에서

> 💡 `npm run dev`가 도는 창은 그대로 두고 **새 창** 하나 열기. 시작 메뉴 → `cmd` → 엔터.

```cmd
cd C:\dev\my-bot
```

### 7.3.3 현재 상태 확인

```cmd
git status
```

**기대 출력**:

```
Untracked files:
        public/avatar.vrm

Changes not staged for commit:
        modified:   package-lock.json
```

- **Untracked**: Git이 아직 모르는 새 파일 (`avatar.vrm`)
- **modified**: Git이 알지만 내용이 바뀐 파일 (`package-lock.json` — `npm install` 때문)

이 두 파일을 Git이 추적하도록 만들어야 합니다.

### 7.3.4 🎓 Git의 3단계 — 잊지 마세요

```
[작업 폴더]      [임시 영역]       [Git 저장소]      [GitHub]
my-bot/  ──→   Staging   ──→   Repository   ──→   Remote
파일 변경        git add          git commit         git push
```

**비유 — 온라인 쇼핑**:

- `git add` = **장바구니에 담기**
- `git commit` = **결제 (확정)**
- `git push` = **배송 (GitHub 도착)**

### 7.3.5 파일을 stage 영역에 담기

```cmd
git add public/avatar.vrm package-lock.json
```

→ 출력 없음 (조용히 성공). 확인:

```cmd
git status
```

**기대 출력**:

```
Changes to be committed:
        new file:   public/avatar.vrm
        modified:   package-lock.json
```

→ `Changes to be committed` 아래에 두 파일이 보이면 OK.

### 7.3.6 commit 만들기

```cmd
git commit -m "feat: add my avatar"
```

**기대 출력**:

```
[main xxxxxxx] feat: add my avatar
 2 files changed, ...
 create mode 100644 public/avatar.vrm
```

→ `create mode 100644 public/avatar.vrm` 줄이 보이면 `avatar.vrm`이 정식으로 기록된 것입니다.

> 💡 `-m "..."`는 commit 메시지입니다. 한국어도 가능 (`"내 아바타 추가"`). 본인이 알아볼 수 있는 짧은 설명.

---

## 7.4 원격 주소를 내 레포로 변경

### 7.4.1 현재 원격 주소 확인

```cmd
git remote -v
```

**기대 출력** (지금은 원본을 가리킴):

```
origin  https://github.com/sungbongju/cha-bot-starter-kit.git (fetch)
origin  https://github.com/sungbongju/cha-bot-starter-kit.git (push)
```

### 7.4.2 내 새 레포 주소로 변경

[7.2.2](#722-만들어진-레포-url-확인)에서 메모해둔 본인 레포 URL을 넣으세요:

```cmd
git remote set-url origin https://github.com/내ID/내봇이름.git
```

**예시** (본인 ID와 레포 이름으로 바꾸세요):

```cmd
git remote set-url origin https://github.com/sungbongju/VRM-Avatar-Bot.git
```

→ 출력 없음 (조용히 성공).

### 7.4.3 잘 바뀌었는지 확인

```cmd
git remote -v
```

**기대 출력** (이제 내 레포를 가리킴):

```
origin  https://github.com/내ID/내봇이름.git (fetch)
origin  https://github.com/내ID/내봇이름.git (push)
```

→ 본인 ID와 본인 레포 이름으로 바뀌어 있어야 OK.

> 📌 **[참고] `origin`이 뭔가요?**
>
> `origin`은 "기본 원격 저장소"라는 관례적 별명입니다. 우체국으로 비유하면, "내 편지가 항상 도착할 기본 우체국 주소"를 `origin`이라는 짧은 이름으로 부르는 것. `git remote set-url`은 그 주소를 새 우체국(내 레포)으로 바꾸는 명령.

---

## 7.5 push

```cmd
git push -u origin main
```

→ 17MB `avatar.vrm` 업로드라 10~30초 걸립니다. 처음이면 **GitHub 인증 화면이 자동으로 뜹니다**.

### 7.5.1 🔐 인증 화면 — 처음 push할 때만 한 번

Git for Windows에는 **Git Credential Manager (GCM, 깃 자격 관리자)**가 포함되어 있어 첫 push 시 알아서 인증을 처리합니다:

```
1. 까만 CMD 창에서 잠깐 멈춤
   ↓
2. 브라우저 새 창이 자동으로 뜸 → "Sign in to GitHub"
   ↓
3. (이미 로그인되어 있으면 건너뜀) GitHub 계정으로 로그인
   ↓
4. "Authorize Git Credential Manager" 권한 요청 → Authorize 클릭
   ↓
5. "You're all set" 메시지 → 브라우저 탭 닫아도 OK
   ↓
6. CMD 창으로 자동 복귀 → push 진행 → 성공!
```

**한 번만 하면** GCM이 토큰을 저장해 이후 push는 자동.

### 7.5.2 push 성공 출력

```
Enumerating objects: 180, done.
Counting objects: 100% (180/180), done.
Compressing objects: 100% (90/90), done.
Writing objects: 100% (180/180), 17.71 MiB | 1.50 MiB/s, done.
Total 180 (delta 85), reused 180 (delta 85)
remote: Resolving deltas: 100% (85/85), done.
To https://github.com/내ID/내봇이름.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

→ 마지막 줄 **`branch 'main' set up to track 'origin/main'`**이 보이면 성공 ✅

---

## 7.6 GitHub 페이지에서 확인

브라우저에서 본인 레포 URL을 새로고침:

```
https://github.com/내ID/내봇이름
```

이런 게 보여야 정상:

```
📂 api          (Vercel serverless functions)
📂 docs         (자습서)
📂 public       (avatar.vrm 포함된 정적 파일)
📂 src          (React 코드)
📄 README.md    (스타터킷 README)
📄 package.json
📄 vercel.json
... 등등
```

→ ✅ **봉주 봇 코드가 GitHub에 올라갔습니다!** 다음 장에서 Vercel에 연결하면 인터넷에 라이브로 뜹니다.

### 7.6.1 검증 표

| 항목 | 기대 결과 |
|---|---|
| `git status` | `nothing to commit, working tree clean` |
| `git remote -v` | 두 줄 모두 본인 GitHub 레포 URL |
| `git log --oneline -1` | 가장 최근 commit이 `feat: add my avatar` |
| 브라우저: 본인 레포 페이지 | `public/avatar.vrm` 파일이 보임 |

---

## 7.7 🛟 자주 묻는 질문

**Q. push 했는데 `error: failed to push some refs to ...` 에러가 떴어요.**
> README/gitignore/license 체크를 실수로 했을 가능성이 큽니다. [7.2.3](#723--자주-막히는-함정--readme-체크-실수) 박스 참고. 가장 깨끗한 해결은 레포 삭제 후 재생성.

**Q. 브라우저 인증 창이 안 뜨고 `Username for 'https://github.com':`이 나와요.**
> Git Credential Manager(GCM)가 없는 것입니다. 두 가지 해결:
> 1. **(쉬움)** Git for Windows 재설치 (git-scm.com에서 최신 받기, 설치 중 "Use Git Credential Manager" 옵션 켜기)
> 2. **(번거로움)** Personal Access Token(PAT) 발급: github.com → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate → 권한 "repo" 체크 → 생성된 토큰(`ghp_...`) 복사. push 시 Username = 본인 ID, Password = 그 토큰.
>
> ⚠ **비밀번호 자리에 GitHub 계정 비밀번호 넣으면 안 됨** (GitHub가 2021년부터 password 인증 차단). PAT 토큰이 정답.

**Q. `.env` 파일이 GitHub에 같이 올라가지 않을까 걱정돼요.**
> 안 올라갑니다. `.gitignore`에 `.env`가 등록되어 있어 Git이 자동 무시합니다. 확인하려면:
> ```cmd
> git check-ignore .env
> ```
> `.env` 한 줄이 출력되면 안전. (출력 없으면 위험 — 셋업 다시 확인)

**Q. `.env.example`은 GitHub에 올라가는데 괜찮나요?**
> 괜찮습니다. `.env.example`은 **템플릿 (빈 양식)**이라 실제 키가 없습니다. 다른 사람이 "어떤 환경변수가 필요한지" 알 수 있게 해주는 가이드 역할이므로 공개해야 정상.

**Q. 17MB avatar.vrm이 push가 너무 오래 걸려요.**
> 인터넷 속도에 따라 30초~2분 걸립니다. 100MB 미만이면 GitHub 무료 플랜에서 OK. 100MB 넘으면 Git LFS(Large File Storage) 별도 셋업 필요.

**Q. push 했는데 GitHub 페이지에 안 보여요.**
> 브라우저 새로고침(F5) 해보세요. GitHub UI 캐시 때문에 잠깐 안 보일 수 있습니다.

**Q. Mac/Linux 사용자입니다.**
> 명령어 동일합니다. 인증은 보통 SSH 키 또는 PAT 사용. macOS는 Keychain이 자동 캐시.

---

## 7.8 이 장에서 배운 것 — 요약

| 항목 | 핵심 |
|---|---|
| 새 레포 만들기 | github.com/new → 체크박스 3개 모두 OFF 유지 |
| Git 3단계 | `git add`(장바구니) → `git commit`(결제) → `git push`(배송) |
| `git status` 두 가지 상태 | `Untracked`(신규), `modified`(수정됨) |
| `git remote set-url origin` | 원본 주소를 내 레포 주소로 변경 |
| 첫 push 인증 | GCM이 자동 처리 (브라우저 창 → Authorize) |
| 봉주 함정 | README 체크 → 충돌. 해결은 레포 삭제 후 재생성 |

---

📍 **현재 위치**: 7장 / 8장

[← 이전: 6장. 내 아바타 넣기](./09-chapter-6.md) | [다음 → 8장. Vercel로 인터넷 배포](./11-chapter-8.md)
