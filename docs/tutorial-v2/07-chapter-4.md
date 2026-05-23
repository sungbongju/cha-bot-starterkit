# 4장. 스타터킷 받아오기 — `git clone`

> 3분 정도 걸립니다. 명령어 두 줄이면 끝납니다.

---

## 4.1 왜 clone인가 — "원본은 안 망가집니다"

### 4.1.1 무엇을 하는가

GitHub에 올라가 있는 봇 스타터킷을 **내 컴퓨터로 통째로 복사**해 옵니다.

- GitHub 주소: <https://github.com/sungbongju/cha-bot-starter-kit>
- 이 안에 봇이 돌아가는 데 필요한 모든 코드/설정이 들어있습니다.
- 이걸 받아서 **내 마음대로 수정**해 내 봇을 만듭니다.

### 4.1.2 "원본 망가지지 않나요?" — 학생이 가장 무서워하는 질문

> **`git clone`은 도서관에서 책을 빌려와 복사기에 복사하는 것과 같습니다.**
>
> - 도서관의 원본 책(GitHub 원본 저장소)은 **절대 안 바뀝니다**.
> - 복사본은 **내 책상(내 컴퓨터)**에만 있습니다.
> - 내가 복사본에 낙서를 하든 찢든, 도서관 책에는 영향이 없습니다.

즉 `git clone` 명령어는 **다운로드만** 합니다. 원본 저장소에 그 어떤 영향도 주지 않습니다.

> 💡 나중에 (7장) 내가 수정한 내용을 **내 GitHub 계정에 새로 만든 저장소**에 올립니다. 원본에는 안 올라갑니다.
>
> 박교수님께서 명확히 말씀하신 방침: **"포크는 하지 맙시다"** — clone 받아서 새 저장소 만들고, 그쪽으로 push하는 방식으로 진행합니다.

> 📌 **[참고] clone vs fork vs download**
>
> | 방법 | 무엇 | 우리 선택 |
> |---|---|---|
> | `git clone` | 명령어로 복사. 수정 내역 추적 가능 | ⭐ 사용 |
> | fork | GitHub 웹사이트에서 "Fork" 클릭. 원본과 영구 연결 | ❌ 사용 안 함 (박교수님 방침) |
> | Download ZIP | GitHub에서 압축 파일로 다운로드. Git 정보 없음 | ❌ 사용 안 함 (이후 push 불가) |

---

## 4.2 `C:\dev`로 이동

새 CMD(Command Prompt) 창을 엽니다 (3장에서 한 것과 같음).

```cmd
cd C:\dev
```

엔터를 누르면 프롬프트가 이렇게 바뀝니다:

```
C:\dev>
```

> 💡 `cd`는 **change directory** — 폴더를 옮긴다는 뜻입니다.

만약 `C:\dev` 폴더가 없다고 나오면 [2장](./04-chapter-2.md)으로 돌아가 폴더부터 만드세요.

---

## 4.3 `git clone` 실행

다음 명령어를 그대로 복사해서 붙여넣습니다:

```cmd
git clone https://github.com/sungbongju/cha-bot-starter-kit.git my-bot
```

> 💡 CMD에서 붙여넣기는 **우클릭** 또는 **Ctrl+V**입니다.

### 4.3.1 명령어 해석

- `git clone` → 깃허브 저장소 복사해 오기
- `https://github.com/...` → 복사할 저장소 주소
- `my-bot` → 내 컴퓨터에서 폴더 이름을 뭘로 할지 (원하면 다른 이름도 OK, 예: `chacha-bot`, `daekun-bot`)

### 4.3.2 기대 출력

엔터를 누르면 이런 출력이 흘러갑니다 (몇 초~30초 소요):

```
Cloning into 'my-bot'...
remote: Enumerating objects: 234, done.
remote: Counting objects: 100% (234/234), done.
remote: Compressing objects: 100% (180/180), done.
remote: Total 234 (delta 65), reused 200 (delta 45), pack-reused 0
Receiving objects: 100% (234/234), 2.34 MiB | 5.20 MiB/s, done.
Resolving deltas: 100% (65/65), done.
```

(숫자는 다를 수 있습니다. 마지막에 빨간 에러가 안 뜨면 성공.)

### 4.3.3 자주 만나는 에러

> ⚠ **여기서 학생들이 자주 막힙니다**:
>
> - **`fatal: destination path 'my-bot' already exists`** → 이미 같은 이름 폴더가 있습니다. `my-bot2` 등 다른 이름으로 다시 시도하거나, 기존 폴더를 삭제하세요.
> - **`Could not resolve host: github.com`** → 인터넷 연결을 확인하세요. 학교 와이파이가 GitHub을 차단할 수도 있습니다 (이럴 땐 핸드폰 핫스팟으로 재시도).

---

## 4.4 받은 폴더로 이동해서 내용 확인

```cmd
cd my-bot
```

프롬프트가 이렇게 바뀝니다:

```
C:\dev\my-bot>
```

이제 폴더 안에 무엇이 들어있는지 확인합니다:

```cmd
dir
```

다음과 비슷한 출력이 나오면 성공입니다:

```
 C:\dev\my-bot 디렉터리

2026-05-23  오후 03:15    <DIR>          .
2026-05-23  오후 03:15    <DIR>          ..
2026-05-23  오후 03:15    <DIR>          api
2026-05-23  오후 03:15    <DIR>          docs
2026-05-23  오후 03:15                89 index.html
2026-05-23  오후 03:15    <DIR>          public
2026-05-23  오후 03:15             2,341 package.json
2026-05-23  오후 03:15    <DIR>          server
2026-05-23  오후 03:15    <DIR>          src
2026-05-23  오후 03:15               412 vercel.json
2026-05-23  오후 03:15               198 vite.config.js
2026-05-23  오후 03:15             1,823 README.md
```

### 4.4.1 꼭 있어야 하는 것

- ✅ `api/` 폴더 (Vercel serverless 함수)
- ✅ `public/` 폴더 (정적 파일 — 6장에서 여기에 avatar.vrm을 넣습니다)
- ✅ `src/` 폴더 (React 코드)
- ✅ `package.json` 파일 (프로젝트 정보 + 부품 목록)

이 4개가 보이면 clone 성공입니다.

### 4.4.2 `server/` 폴더가 보이면?

> 💡 `dir` 출력에 `server/` 폴더가 끼어있을 수 있습니다. 이건 **원본 프로젝트(interview-bot)에서 넘어온 잔재**입니다. 지금 단계에서는 무시하셔도 됩니다 — 봇 실행에 영향이 없습니다. 나중에 정리될 예정.

---

## 4.5 확인하기

CMD에서 아래 한 줄로 한번에 확인:

```cmd
cd C:\dev\my-bot && dir package.json
```

`package.json` 파일이 보이면 성공:

```
2026-05-23  오후 03:15             2,341 package.json
```

"파일을 찾을 수 없습니다"가 뜨면 clone이 안 된 것 — [4.3](#43-git-clone-실행)부터 다시 시도하세요.

### 4.5.1 검증 표

| 항목 | 기대 결과 |
|---|---|
| `cd C:\dev\my-bot` | 프롬프트가 `C:\dev\my-bot>`로 변경 |
| `dir` 출력 | `api/`, `public/`, `src/`, `package.json` 모두 보임 |
| `dir package.json` | 파일 1개가 정상 출력됨 |

---

## 4.6 🛟 자주 묻는 질문

**Q. 폴더 이름을 `my-bot` 말고 다른 걸로 해도 되나요?**
> 네. `cha-bot`, `daekun-bot`, `my-first-bot` 무엇이든 OK. 단 **영어 + 하이픈만 사용** (한글/공백 금지). 이후 자습서의 `my-bot` 부분을 본인 폴더명으로 바꿔 읽으세요.

**Q. clone 받은 폴더를 통째로 옮겨도 되나요?**
> 됩니다. `C:\dev\my-bot` → `D:\projects\my-bot`으로 잘라내기/붙여넣기 해도 작동합니다. Git이 추적 정보를 폴더 안에 같이 보관하기 때문입니다.

**Q. 인터넷 없이도 clone 받을 수 있나요?**
> 안 됩니다. `git clone`은 GitHub 서버에서 다운로드하는 것이라 인터넷이 꼭 필요합니다. 한 번 받은 다음에는 인터넷 없이 작업 가능 (단, `npm install`은 또 인터넷이 필요).

**Q. clone 받았는데 GitHub 원본이 업데이트되면 어떻게 받나요?**
> `cd C:\dev\my-bot` 한 다음 `git pull` 하시면 최신 업데이트가 합쳐집니다. 단, 본인이 수정한 코드와 충돌이 있을 수 있으니 그건 다음 챕터들에서 다룹니다.

**Q. 원본 저장소를 정말 안 건드리는 게 확실한가요?**
> 100% 확실합니다. `git clone`은 GitHub 입장에서는 단순히 "파일 받아가" 요청입니다. GitHub 원본을 수정하려면 본인 GitHub 계정으로 **로그인**해서 `git push` 명령어를 직접 쳐야 하는데, 우리는 그 단계에서 본인 **새 저장소**를 따로 만듭니다 (7장).

**Q. Mac/Linux 사용자입니다.**
> 동일합니다. 터미널 열고:
> ```bash
> cd ~/dev
> git clone https://github.com/sungbongju/cha-bot-starter-kit.git my-bot
> cd my-bot
> ls
> ```
> Windows의 `dir` 대신 `ls`를 쓴다는 것만 다릅니다.

**Q. GitHub Desktop 같은 GUI 앱을 써도 되나요?**
> 됩니다. 단 이 자습서는 명령어 기준이라 GUI 설명은 따로 없습니다. 명령어가 더 빠르고 확실합니다.

---

## 4.7 이 장에서 배운 것 — 요약

| 항목 | 핵심 |
|---|---|
| `git clone` | GitHub 저장소를 내 컴퓨터로 복사 (다운로드만, 원본 안 바뀜) |
| 비유 | 도서관에서 책 빌려와 복사기에 복사 |
| 폴더 위치 | `C:\dev\my-bot\` |
| 필수 폴더/파일 | `api/`, `public/`, `src/`, `package.json` |
| 박교수님 방침 | fork 대신 clone + 새 레포 + push |

---

📍 **현재 위치**: 4장 / 8장

[← 이전: 제2부 도입](./06-part2-intro.md) | [다음 → 5장. 로컬에서 봇 띄우기](./08-chapter-5.md)
