# gyehoekseo-writer-v2

강원특별자치도교육청 문화체육특수교육과 계획서(운영계획·행사계획·연수계획 등) 자동 생성 스킬 **v2**.
출력은 HWPX(한글). 텍스트 본문은 `scripts/build_plan.py`, 표는 `scripts/insert_tables.py`로 만든다.

> 구 `gyehoekseo-writer`(v1)는 보존용. 신규 작업은 이 v2를 사용한다.

## v2 변경 이력 (2026. 7.)

- **표 병합 버그 수정 (핵심)**: v1은 셀 병합 시 '덮인 셀'을 제거하지 않아 행의 colSpan 합이
  열 수(colCnt)를 초과했다. 이 때문에 한글이 표를 '손상'으로 인식해 **편집 불가·파일 자동 삭제**가
  발생했다. v2는 덮인 셀을 제거하고 마스터 셀에 span을 부여해 각 행 colSpan 합 = colCnt를
  보장하며, 생성 직후 그리드 정합을 자동 검증한다.
- **섹션 번호 로마자↔아라비아 선택**: `plan.json`의 `numeral`에 `"Ⅰ"~"Ⅶ"` 또는 `"1"~"6"`을
  넣는 대로 뱃지에 출력(스크립트 수정 불필요). 모니터링·협의회 계획 등 1.·2. 체계 문서에 유용.
- **표 삽입 워크플로우 신설**: 자리표시(`@@TBL_…@@`) → 실제 표 교체. 테두리·헤더 음영·열너비·병합 지원.
- **표지 긴 제목·문단 테두리(선) 증식 방지** 주의 명문화.

## 사용법

```bash
# 1) 텍스트 본문
python scripts/build_plan.py plan.json 텍스트본.hwpx
# 2) 표 삽입 (표가 있을 때만)
python scripts/insert_tables.py 텍스트본.hwpx tables.json 최종.hwpx
```

- `plan.json`: 제목·날짜·섹션(numeral/title/items) 정의. 표 자리는 `["lv2", "@@TBL_이름@@"]`.
- `tables.json`: 자리표시 이름 → `{widths, header, rows, merges, shade_header}`.
- 표 병합 `merges`: `[시작행,시작열,끝행,끝열]`(끝 좌표 포함).
- 의존성: `pip install python-hwpx --break-system-packages` (표 삽입 시). 텍스트 생성은 표준 라이브러리만 사용.

## 파일 구성

```
gyehoekseo-writer-v2/
├─ SKILL.md                     # 스킬 규칙·서식 기준
├─ assets/report-template.hwpx  # 2026 신규 BI 표지·본문 양식 (수정 금지, 복사 후 사용)
├─ references/structure-guide.md
└─ scripts/
   ├─ build_plan.py             # plan.json → 텍스트 본문 HWPX
   └─ insert_tables.py          # tables.json → 표 삽입 (병합 정상화·그리드 자동검증)
```

## 상세 문서 서식 기준

- 서체(2026. 7. 확정): 섹션 헤더 HY헤드라인M 16pt / □ 헤드라인M 14pt / 나머지 휴먼명조 13pt
- 신규 BI 색상: 네이비 `#005078`, BI 블루 `#1BA8E1` (문서 양식용) — 로고 실측 남색 `064976`은 용도 구분
- 자세한 내용은 `SKILL.md` 참조.
