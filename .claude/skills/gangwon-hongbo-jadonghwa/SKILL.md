---
name: gangwon-hongbo-jadonghwa
description: 강원특별자치도교육청 문화체육특수교육과 장학사 업무용 홍보물 자동 생성 스킬. 계획서·보도자료·행사자료 1개(HWPX/PDF/텍스트)를 원본으로, 카드뉴스(7컷), 릴스 대본, 쇼츠 대본, 썸네일 문구, SNS 게시글, 해시태그를 한 번에 생성한다. '홍보물 만들어줘', '카드뉴스 만들어줘', '카드뉴스 7컷', '릴스 대본', '쇼츠 대본', 'SNS 홍보', '홍보 자동화', '행사 홍보물', '○○ 페스티벌 홍보', '보도자료로 카드뉴스' 등의 키워드가 나오면 반드시 이 스킬을 사용할 것. 계획서·보도자료가 이미 업로드된 상태에서 홍보물을 요청해도 이 스킬을 사용한다. 카드뉴스 이미지는 강원교육청 신규 BI(모두가 빛나는 강원교육) 색상·엠블럼으로 렌더링하며, 출력은 홍보콘텐츠 마크다운 + 카드 PNG이다. 계획서 작성 자체는 gyehoekseo-writer, 보도자료 본문은 bodojaryo-writer, 공문은 gongmun-writer를 사용한다.
---

# 강원교육청 홍보 자동화 (gangwon-hongbo-jadonghwa)

하나의 원본(계획서·보도자료)에서 여러 홍보 산출물을 만든다.
**Single Source, Multi-Output** — 원본 1개 → 카드뉴스·대본·SNS 일괄 생성.

## 산출물

1. **카드뉴스 7컷** — 문구 + 실제 이미지(PNG). 두 모드:
   - `story`(감성형): 딥 네이비 무대 배경 + 스포트라이트, 훅→여운 서사
   - `admin`(행정형): 크림 배경 + 네이비 텍스트, 정보 전달
2. **릴스 대본**(15초) / **쇼츠 대본**(30초) — 자막 중심(무내레이션+BGM)
3. **썸네일 문구**(3안) · **SNS 게시글** · **해시태그**

## ⚠️ 반드시 지킬 규칙 (개인정보)

- 홍보물에는 **개인정보를 절대 넣지 않는다**: 지도교사·학생·심사위원·담당자
  실명, 개인 휴대전화, 직통번호 금지.
- 문의처는 **부서명 + 대표번호**만 표기 (예: 문화체육특수교육과 033-258-5381).
- 원본에 여러 버전이 있으면 **최신 확정본**(예: '세부운영계획')만 사용한다.
  폐기된 일정(변경 전 날짜·장소)은 홍보에 쓰지 않는다.
- 확인되지 않은 사실은 넣지 말고 `[확인 필요]`로 표시한다.

## 작업 절차

### 1단계 · 핵심 사실 추출
원본(HWPX/PDF/텍스트)에서 다음을 뽑는다. 표지 슬로건·개요·일정표 우선.

- 행사명(정식), 슬로건/부제
- 일정(날짜·요일·부문·시간), 장소
- 규모(참가 팀·학교 수, 대상 학교급)
- 부문 구성, 문의처(부서·대표번호)

### 2단계 · 콘텐츠 생성
`references/card_content_guide.md`(카드 7컷 서사·문구)와
`references/video_sns_guide.md`(릴스·쇼츠·썸네일·SNS·해시태그)를 읽고 작성한다.

- 카드뉴스 문구는 두 모드 각각 `examples/cards_story_sample.json`,
  `examples/cards_admin_sample.json` 스키마에 맞춰 `cards_story.json`,
  `cards_admin.json`으로 저장한다.
- 대본·썸네일·SNS·해시태그는 하나의 마크다운(`홍보콘텐츠.md`)으로 정리한다.

### 3단계 · 카드 이미지 렌더
```bash
python3 scripts/render_cards.py cards_story.json --outdir out_story --size 1080
python3 scripts/render_cards.py cards_admin.json --outdir out_admin --size 1080
```
- 출력: `out_story/card_1.png … card_7.png` (인스타 정사각 1080×1080)
- 폰트(NanumMyeongjo/NanumGothic)는 스크립트가 자동 확보하며, 실패 시
  Noto Serif/Sans CJK KR로 대체된다.
- BI 엠블럼(`assets/emblem_color.png`)이 모든 카드 우하단에 자동 삽입된다.
- 긴 문구는 자동으로 글자 크기가 맞춰져 프레임을 넘지 않는다.

### 4단계 · 정리·전달
- 결과물: `홍보콘텐츠.md` + `out_story/*.png` + (필요 시) `out_admin/*.png`
- 파일을 출력 폴더에 모으고 사용자에게 전달한다.
- 영상(릴스·쇼츠)은 대본까지 자동화하고, 실제 편집은 Canva 무료 플랜에서
  자막형으로 마무리하도록 안내한다(무료 요소만 쓰면 워터마크 없음).

## cards.json 스키마

```json
{
  "mode": "story",                     // "story" | "admin"
  "event": {
    "title_label": "상단 공통 라벨(행사명)",
    "date_line": "2026. 7. 13.(월) – 7. 16.(목)",
    "place_line": "강릉아트센터 소·대공연장"
  },
  "cards": [
    { "main": ["중앙 큰 문구 1줄", "2줄"], "sub": "보조 한 줄", "spotlight": true }
    // 7개 권장. main은 1~2줄 권장(3줄 이상이면 자동 축소)
  ]
}
```
- `spotlight`는 story 모드에서만 효과(표지·마무리 컷 등 강조용).
- admin 모드는 spotlight 무시.

## 참고 파일

- `references/card_content_guide.md` — 카드 7컷 서사 구조·문구 톤(행정형/감성형)
- `references/video_sns_guide.md` — 릴스·쇼츠·썸네일·SNS·해시태그 작성 규칙
- `examples/cards_story_sample.json`, `examples/cards_admin_sample.json` — 입력 예시
- `assets/emblem_color.png` — 신규 BI 컬러 엠블럼(로고), `assets/sig_h.png` — 가로 시그니처

## 의존성

- Python: `cairosvg`, `Pillow` (`requirements.txt` 참조)
- 시스템: `fontconfig`(fc-list/fc-cache), 인터넷 접근 시 나눔폰트 자동 설치.
  오프라인이면 Noto CJK 사전 설치 권장.
