# 1장. 시작하기 전에 갖춰야 할 것

> 본격 시작 전에 **3개 계정 가입 + 1개 파일 준비**만 해두시면 됩니다. 총 15~20분.

---

## 1.1 한눈에 보는 준비물

| # | 준비물 | 필요해지는 시점 | 비용 | 예상 시간 |
|---|---|---|---|---|
| 1 | **GitHub 계정** | 4장, 7장 | 무료 | 3분 |
| 2 | **Vercel 계정** | 8장 | 무료 (GitHub 계정으로 가입) | 1분 |
| 3 | **Node.js + Git 설치** | 3장부터 | 무료 | 5~15분 |
| 4 | **VRM 파일 (.vrm)** | 6장 | 무료 | 5~30분 |

각 항목을 어떻게 준비하는지 1.2~1.5에서 안내합니다.

---

## 1.2 GitHub(깃허브) 계정 만들기 — 약 3분

### 1.2.1 GitHub이 무엇인가

**GitHub(깃허브)** = 코드를 저장하는 인터넷 사이트. 비유하자면 **"구글 드라이브의 코드 전용 버전"** 입니다. 전 세계 개발자들이 코드를 올리고 공유하는 표준 플랫폼.

### 1.2.2 가입 단계

1. <https://github.com/signup> 접속
2. 이메일 주소 입력 → **Continue**
3. 비밀번호 설정 → **Continue**
4. 사용자명 입력 (영문/숫자, 다른 사람과 겹치면 안 됨)
   - 예: `kimchulsoo`, `mybot2026`, `jisoo-park`
   - 🎯 **이게 본인의 GitHub ID**입니다. 자습서 곳곳에서 계속 사용합니다.
5. 이메일 인증 코드 → 입력
6. "How will you primarily use GitHub?" → **Personal** 또는 **Student** 선택
7. 가입 완료.

### 1.2.3 확인하기

본인 프로필 페이지가 이 주소로 열리면 정상:

```
https://github.com/본인ID
```

→ 이 URL을 기억해두세요. 7장에서 다시 사용합니다.

> 💡 **이미 GitHub 계정 있으세요?** 좋습니다. 이 단계는 건너뛰셔도 됩니다.

> 📌 **[참고] 학교 이메일로 가입하면 좋은 점**
>
> `@cha.ac.kr` 같은 학교 이메일로 가입하면 나중에 **GitHub Student Pack(학생 특전)**을 신청할 수 있습니다. GitHub Copilot 무료 사용, 다양한 도구 무료 제공 등 혜택이 있습니다.

---

## 1.3 Vercel(버셀) 계정 만들기 — 약 1분

### 1.3.1 Vercel이 무엇인가

**Vercel(버셀)** = 내 봇을 인터넷에 무료로 띄워주는 서비스. 실리콘밸리에 본사를 둔 검증된 회사이며, 개인 프로젝트는 무료로 호스팅해줍니다.

### 1.3.2 가입 단계

1. <https://vercel.com/signup> 접속
2. **"Continue with GitHub"** 클릭 ⭐ 추천 (별도 비밀번호를 만들지 않아도 됩니다)
3. GitHub 인증 화면 → **Authorize Vercel** 클릭
4. (한국 사용자) 영문 이름 / 본인 정보 입력
5. **Hobby (개인용 무료)** 선택
6. 가입 완료.

### 1.3.3 확인하기

Vercel 대시보드가 열리고 우측 상단에 본인 GitHub 프로필 이미지가 보이면 OK:

```
https://vercel.com/dashboard
```

> 💡 GitHub로 가입하시면 Vercel과 GitHub이 자동 연결됩니다. 8장에서 본인 레포 import가 한 번에 됩니다.

> 📌 **[참고] "권한을 너무 많이 요구해서 무서워요"**
>
> Vercel이 요청하는 권한은 "코드 읽기 + 새 레포 import"입니다. 검증된 회사라 신뢰할 만하지만, 의심스러우시면 **레포 선택 권한**으로 제한 가능합니다 — 가입 화면의 "Only select repositories" 옵션을 선택하세요.

---

## 1.4 Node.js와 Git 미리 받아두기 — 약 5~15분

### 1.4.1 둘이 무엇인가

| 도구 | 역할 |
|---|---|
| **Node.js(노드)** | 내 컴퓨터에서 자바스크립트를 실행하는 발전기 |
| **Git(깃)** | 분산 버전 관리 시스템 — 코드를 GitHub과 주고받는 도구 |

둘 다 봇 개발의 필수품입니다. **이미 깔려있을 수도 있습니다** — 3장에서 먼저 확인부터 합니다. 여기서는 **미리 다운로드 페이지만 열어두는 단계**입니다.

### 1.4.2 미리 다운로드 받아두기

- **Node.js**: <https://nodejs.org/> → 좌측 **"LTS"** 큰 버튼 클릭 (Long Term Support, 장기 지원 버전)
- **Git for Windows**: <https://git-scm.com/downloads> → Windows 클릭

📥 두 파일 다운로드 후:

1. Node.js 설치 파일 더블클릭 → "Next, Next, Install" (모든 옵션 기본값 OK)
2. Git 설치 파일 더블클릭 → 마찬가지 (기본값 강력 추천 — 특히 **"Git Credential Manager"** 옵션은 켜져있어야 합니다. 7장에서 GitHub 인증에 필요)

### 1.4.3 LTS와 Current의 차이

> 📌 **[참고] "Current(최신) 누르면 안 되나요?"**
>
> **Current**는 최신 실험 버전이라 가끔 호환성 문제가 발생합니다. **LTS(Long Term Support)**는 안정 버전이라 학습용으로 안전합니다. 우리 봇은 Node 18 이상이면 모두 동작합니다.

### 1.4.4 확인하기 (자세한 건 3장에서)

CMD(Command Prompt) 창에서:

```cmd
git --version
node --version
npm --version
```

모두 버전 번호가 나오면 OK. 자세한 절차는 [3장](./05-chapter-3.md)에서.

> 💡 **회사/학교 PC라 설치 권한이 없으세요?** 시스템 관리자에게 "Node.js 22.x LTS + Git for Windows 설치"를 요청하시거나, 본인 노트북에서 진행하세요.

---

## 1.5 VRM(Virtual Reality Model) 파일 준비 — 약 5~30분

### 1.5.1 VRM이 무엇인가

**VRM(Virtual Reality Model)** = 3D 캐릭터 파일 (`.vrm` 확장자). 한 파일 안에 모델·뼈대·표정·라이선스 정보가 모두 들어있어 웹에서 바로 띄울 수 있습니다. 봉주 봇의 **얼굴**이 됩니다.

### 1.5.2 옵션 A — VRoid Hub에서 무료 다운로드 ⭐ 가장 쉬움 (5분)

1. <https://hub.vroid.com/en/> 접속
2. 우측 상단 **Sign Up** → GitHub 또는 Twitter 계정으로 가입 (Pixiv 계정도 OK)
3. 메인에서 마음에 드는 캐릭터 클릭
4. ⚠ **라이선스 확인 필수**: 우측 패널에서 다음 항목이 ✅인지 확인:
   - "사용 허락" (Allow Use)
   - "재배포 OK" (Allow Redistribution) — GitHub에 공개로 올릴 거면 중요
5. 우측 **Download** 버튼 → `.vrm` 파일 저장
6. 파일을 **바탕화면**에 두면 6장에서 쉽게 사용 가능

> 💡 라이선스가 헷갈리시면 다음 페이지의 "Pixiv 공식 AvatarSample" 시리즈가 안전합니다:
> <https://hub.vroid.com/en/users/2287322741607496883>

### 1.5.3 옵션 B — VRoid Studio로 직접 만들기 (30분~1시간)

1. <https://vroid.com/en/studio>에서 다운로드 (~300MB)
2. 설치 후 실행 → **신규 캐릭터 만들기** → Sample Female/Male 선택
3. 슬라이더로 얼굴/머리/옷 커스터마이즈
4. 좌측 상단 **☰** → **Export** → **Export as VRM**
5. 라이선스 화면에서:

   ```
   Avatar Permission:    Everyone        ⭐
   Commercial Usage:     Allow            ⭐
   Modification:         Allow            ⭐
   Redistribution:       Allow            ⭐
   Credit Notation:      Required (그대로)
   ```

6. **avatar.vrm**이라는 이름으로 바탕화면에 저장

본인만의 캐릭터를 갖는 만족감이 큰 옵션이지만, 시간이 더 필요합니다. **첫 도전은 옵션 A 추천**.

### 1.5.4 옵션 C — Booth에서 구매 ($5~$50)

<https://booth.pm>의 VRM 카테고리. 퀄리티 높은 작품이 많지만 일본어 사이트 + 유료. 진지한 봇을 만들 때 고려해보세요.

---

## 1.6 준비 완료 체크리스트

다음 항목이 모두 ✅이면 2장으로 가셔도 됩니다.

```
☐ GitHub 계정 만들었음 (https://github.com/본인ID 접속 가능)
☐ Vercel 계정 만들었음 (https://vercel.com/dashboard 접속 가능)
☐ Node.js + Git 다운로드 받음 (또는 설치까지 완료)
☐ VRM 파일 (.vrm) 바탕화면에 있음
```

모두 ✅이면 → [2장. 작업 공간 만들기](./04-chapter-2.md)로 가세요.

---

## 1.7 검증 표

| 항목 | 기대 결과 |
|---|---|
| 브라우저에서 `https://github.com/본인ID` 접속 | 본인 프로필 페이지가 보임 |
| 브라우저에서 `https://vercel.com/dashboard` 접속 | Vercel 대시보드가 보임 |
| 바탕화면에서 `.vrm` 파일 확인 | 파일 아이콘이 보임 |
| Node.js 설치 파일 (`.msi`) 다운로드됨 | 다운로드 폴더에 존재 |
| Git 설치 파일 (`.exe`) 다운로드됨 | 다운로드 폴더에 존재 |

---

## 1.8 🛟 자주 묻는 질문

**Q. GitHub 가입 시 한국 학교 이메일도 OK인가요?**
> 네, 모든 이메일 가능 (Gmail, Naver, 학교 이메일 등). 학교 이메일로 가입하면 나중에 GitHub Student Pack(학생 특전)을 신청할 수 있습니다.

**Q. Vercel 가입 시 GitHub 권한이 너무 많아 보입니다. 안전한가요?**
> Vercel은 실리콘밸리의 검증된 회사라 신뢰할 만합니다. 의심스러우면 **"Only select repositories"** 옵션으로 권한 범위를 제한할 수 있습니다.

**Q. Node.js 설치 시 LTS 말고 Current를 누르면 안 되나요?**
> Current는 최신 실험 버전이라 호환성 문제가 가끔 있습니다. **LTS(안정 버전)**가 안전합니다. 우리 봇은 Node 18 이상이면 동작합니다.

**Q. VRoid Hub에서 다운받은 파일이 `.vrm`이 아니라 `.png`예요.**
> 캐릭터 상세 페이지에서 **Download** 버튼을 눌러야 `.vrm`이 받아집니다. `.png` 다운로드는 미리보기 이미지일 뿐입니다.

**Q. 바탕화면에 두지 않고 다른 곳에 두면 안 되나요?**
> 됩니다. 단 6장의 명령어 예시들이 `Desktop` 기준이라 본인 경로로 바꿔야 합니다. 처음엔 바탕화면이 가장 쉽습니다.

**Q. 모바일 / 태블릿으로도 따라할 수 있나요?**
> 어렵습니다. 이 자습서는 Windows / Mac / Linux 데스크탑 기준입니다. 모바일은 코드 편집 / 터미널이 불편해 비추천.

**Q. Mac 사용자입니다.**
> 대부분 동일하지만 차이점:
> - Node.js / Git: Homebrew 추천 (`brew install node git`)
> - 터미널: Terminal.app 또는 iTerm2 (CMD 대신)
> - 경로: `~/dev/my-bot` (`C:\dev\` 대신)

---

## 1.9 이 장에서 배운 것 — 요약

| 준비물 | 확보 여부 |
|---|---|
| GitHub 계정 | ✅ |
| Vercel 계정 | ✅ |
| Node.js / Git 설치 파일 | ✅ (다운로드 완료) |
| VRM 파일 | ✅ (바탕화면에 위치) |

---

📍 **현재 위치**: 1장 / 8장

[← 이전: 제1부 도입](./02-part1-intro.md) | [다음 → 2장. 작업 공간 만들기](./04-chapter-2.md)
