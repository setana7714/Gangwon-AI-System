# gangwon-hongbo-jadonghwa

강원특별자치도교육청 문화체육특수교육과 **홍보 자동화 스킬**.
계획서·보도자료 1개(HWPX/PDF/텍스트)를 원본으로 카드뉴스(7컷)·릴스 대본·
쇼츠 대본·썸네일 문구·SNS 게시글·해시태그를 한 번에 만든다.
카드뉴스 이미지는 신규 BI(모두가 빛나는 강원교육) 색상·엠블럼으로 렌더링한다.

> **개인정보 보호**: 홍보물에는 지도교사·학생·심사위원·담당자 실명과
> 직통번호를 넣지 않는다. 문의는 부서명 + 대표번호만. 개인정보가 담긴
> 원본(HWPX/PDF)은 이 저장소에 커밋하지 말 것(`.gitignore`로 기본 차단).

## 폴더 구조

```
gangwon-hongbo-jadonghwa/
├── SKILL.md                     # 스킬 본체(트리거·절차·규칙)
├── README.md
├── requirements.txt
├── scripts/
│   └── render_cards.py          # cards.json → 카드 PNG 렌더
├── references/
│   ├── card_content_guide.md    # 카드 7컷 서사·문구 가이드
│   └── video_sns_guide.md       # 릴스·쇼츠·썸네일·SNS·해시태그 가이드
├── assets/
│   ├── emblem_color.png         # 신규 BI 컬러 엠블럼(로고)
│   └── sig_h.png                # 가로 시그니처
└── examples/
    ├── cards_story_sample.json  # 감성형 7컷 입력 예시
    └── cards_admin_sample.json  # 행정형 7컷 입력 예시
```

## 설치

```bash
pip install -r requirements.txt
```

카드 렌더에는 한글 폰트가 필요하다. 스크립트가 NanumMyeongjo/NanumGothic을
자동 확보하며(인터넷 필요), 실패 시 시스템의 Noto Serif/Sans CJK KR로 대체한다.
오프라인 환경이면 Noto CJK 또는 나눔 폰트를 미리 설치해 둘 것.

## 빠른 실행

```bash
python3 scripts/render_cards.py examples/cards_story_sample.json --outdir out_story --size 1080
python3 scripts/render_cards.py examples/cards_admin_sample.json --outdir out_admin --size 1080
```

`out_story/card_1.png … card_7.png` (1080×1080)가 생성된다.

## 환경별 사용법

### 1) claude.ai (스킬 업로드)
1. 설정 → 스킬에서 기존 동명 스킬이 있으면 삭제
2. 이 폴더를 **SKILL.md가 최상위에 오도록** ZIP으로 압축해 업로드
   ```bash
   cd gangwon-hongbo-jadonghwa && zip -r ../gangwon-hongbo-jadonghwa.zip . -x '*/__pycache__/*'
   ```
3. 이후 "○○ 홍보물 만들어줘 / 카드뉴스 만들어줘"로 호출

### 2) Claude Code (Web/데스크톱)
저장소를 클론하면 Claude가 `SKILL.md`를 읽고 절차대로 수행한다.
```bash
git clone https://github.com/<계정>/gangwon-hongbo-jadonghwa.git
```
프로젝트 스킬로 인식시키려면 리포를 작업 폴더에 두거나
`.claude/skills/` 아래에 배치한다. 그다음 계획서/보도자료를 주고
"이걸로 홍보물 만들어줘"라고 지시.

### 3) Codex Web
스킬 자동 인식은 없으므로, 리포를 클론한 뒤 `SKILL.md`의 절차를 참고해
문구를 생성하고 `scripts/render_cards.py`를 직접 실행한다.
```bash
git clone https://github.com/<계정>/gangwon-hongbo-jadonghwa.git
cd gangwon-hongbo-jadonghwa && pip install -r requirements.txt
python3 scripts/render_cards.py examples/cards_story_sample.json --outdir out --size 1080
```

## 입력 스키마

`SKILL.md`의 "cards.json 스키마" 절 참조. 핵심: `mode`(story/admin),
`event`(title_label·date_line·place_line), `cards[]`(main·sub·spotlight).

## 라이선스·에셋

BI 엠블럼 등 에셋은 강원특별자치도교육청 BI 매뉴얼에 근거한 내부 업무용이다.
외부 배포·상업적 사용을 금한다.
