# gangwon-yesan-jaebaejeong

강원특별자치도교육청 문화체육특수교육과 **예산 재배정 엑셀 정리·검토 스킬**.
사용자가 제공한 자료만으로 지역청별·학교급별·설립유형별·부문별 세부내역·검토표 시트를
지정 순서로 생성하고, 총액과 각 합계 일치를 2회 이상 검증합니다.

> ⚠️ **개인정보 주의**: 학교명·교사명·연락처·금액 등 실제 자료를 이 저장소에 커밋하지 마세요.
> **private 저장소** 사용을 권장합니다. 이 스킬에는 규칙·서식·검증 로직만 들어 있습니다.

## 구성
```
gangwon-yesan-jaebaejeong/
├── SKILL.md          # Claude Code / Claude.ai 진입점
├── AGENTS.md         # Codex 등 에이전트 진입점(SKILL.md로 연결)
├── README.md
├── references/       # 01~07 세부 규칙
├── scripts/
│   ├── reallocation_lib.py   # 지역순서·정규화·정렬·검증·서식 헬퍼
│   ├── recalc.py             # 수식 재계산·오류검출(LibreOffice)
│   └── office/soffice.py     # 샌드박스용 soffice 래퍼
└── assets/           # (선택) 데이터 제거한 서식 참고본
```

## 요구사항
- Python 3.10+, `openpyxl`, `pandas`
- 수식 재계산 시 LibreOffice(`soffice`)
```bash
pip install openpyxl pandas
```

## 사용법

### 1) Claude Code / Claude.ai
- 프로젝트의 스킬 디렉터리(예: `.claude/skills/`)에 이 폴더를 두거나 프로젝트에 업로드하면
  `SKILL.md`의 이름·설명으로 자동 트리거됩니다.
- "첨부 자료로 재배정 엑셀 만들어줘. 내 자료만 쓰고 지역청은 지정 순서로." 처럼 요청.

### 2) Codex(OpenAI) 및 기타 에이전트
- 저장소 루트의 `AGENTS.md`가 진입점입니다. 에이전트가 `AGENTS.md → SKILL.md → references/` 순으로 읽습니다.
- Codex CLI에서 이 저장소를 작업 디렉터리로 두면 `AGENTS.md`를 자동 인식합니다.

### 3) 검증(필수)
```bash
python scripts/recalc.py 2026_사업명_재배정내역_정리본.xlsx
# status: success / total_errors: 0 확인
```

## 핵심 원칙
- 제공 자료만 사용, 임의 추가·추정·검색 금지
- 지역청 지정 순서 준수, 없는 지역청 제외
- 국립·공립·사립 구분(국립은 공립에 합산하지 않음)
- 합계는 수식, 총합 일치, 원/천원 단위 확인
- 2회 이상 검토로 오류 0

## 깃허브 저장(예시)
```bash
git init
git add .
git commit -m "예산 재배정 스킬 초기 커밋"
git branch -M main
git remote add origin https://github.com/<계정>/gangwon-yesan-jaebaejeong.git
git push -u origin main   # private 저장소 권장
```
