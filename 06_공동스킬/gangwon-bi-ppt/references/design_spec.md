# 모델 슬라이드 상세 설계 명세 (단위: inch, 슬라이드 13.333 × 7.5)

## 공통 요소
- **본문 헤더**: sig_symbol_typo x0.55 y0.34 h0.30 / 우측 태그 9.2~12.75 y0.34 10pt GRAY right
  / 제목 x0.55 y0.82 25pt B NAVY / 부제 x0.57 y1.44 12pt MUT(77787B)
- **푸터**: "강원특별자치도교육청 문화체육특수교육과" y7.06 9pt GRAY center + 쪽번호 x12.5 right
- **콘텐츠 영역**: y1.95 ~ 6.5
- **번호 칩**: ellipse d0.66~0.72, 5색 순환(SKY→VIOLET→PINK→ORANGE→YELLOW→NAVY), 백색 굵은 숫자
- **5색 점 장식**: d0.1, 간격 0.26, SKY VIOLET PINK ORANGE YELLOW 순

## 슬라이드별 핵심 좌표

### 1. 표지A (화이트)
wordmark_1line x0.55 y0.45 h0.34 | emblem_color 중앙 y1.15 h2.35
제목 y3.8 36pt B NAVY center | 부제 y4.75 15pt | 5색점 y5.42 | 기관명 y5.85 15pt B | 날짜 y6.32

### 2. 표지B (네이비 064976 배경)
백색 원판 x8.05 y1.32 d4.86 + symbol_centered cx10.48 y2.05 h3.4
좌측: BI 슬로건 17pt(빛=YELLOW) y1.7 → 제목 40pt B 백색 y2.35 → 부제 y4.15 BFD5E3
→ 백색 알약(roundRect r0.39) x0.95 y5.55 w4.5 h0.78 안에 기관명 NAVY

### 3. 목차
카드 w5.96 h1.5, 2열×3행, 시작 x0.55 y1.9, 간격 x0.36 y0.32, 틴트 배경+칩 d0.72

### 4. 섹션 간지
SKY_T 원 x8.6 y-1.6 d8 + YELLOW_T 원 x11.15 y4.4 d4.4 (블리드) + symbol x10.05 y2.15 h2.5
장번호 88pt B SKY x0.9 y1.85 | 장제목 32pt B NAVY y3.5 | 요약 13pt y4.4 | 5색점 y5.15

### 5. 개조식 불릿 + 강조카드
섹션헤드: 컬러 원 d0.3 + 16pt B NAVY, 불릿 12.5pt lineSpacing21 (y1.95 / y3.75 2개 섹션)
우측 NAVY 카드 x8.45 y1.95 w4.3 h4.55: 라벨 13pt 9FC3DB → 대형수치 46pt YELLOW → 흰 구분선(2A6B96) → 슬로건

### 6. 2단 비교
카드 w5.55 h4.55: 좌 NAVY_T(x0.55) · 우 SKY_T(x7.23), 중앙 chevron x6.28 y3.85 w0.78 SKY

### 7. 3카드
w3.86 h4.55, x0.55 시작 gap0.35, 틴트배경+칩+제목 16.5pt B+불릿 11.5pt

### 8. 4단계 프로세스
원 d1.75 y2.35, gap=(13.333-1.1-7)/3, 원 안 STEP 라벨 12pt B 백색(y+0.5)
아래 제목 15.5pt B NAVY, 설명 11.5pt, 사이 chevron C9CDD2 | 하단 NAVY_T 안내 카드 y5.75 h0.78

### 9. 데이터 강조
좌 NAVY 대형카드 x0.55 w4.35 h4.55(수치 60pt YELLOW) | 우 2×2 백색카드 w3.69 h2.14 gx5.2 gap0.25/0.27, 수치 33pt B 5색

### 10. 표
x0.55 w12.23 colW [1.5, 5.53, 1.9, 1.8, 1.5], 헤더 NAVY 백색, 교차행 NAVY_T, 테두리 D8DBDF 0.75pt

### 11. 타임라인
기준선 y4.19 x1.0~12.3 D8DBDF 2.5pt, 노드 d0.28 백테두리, 월 라벨 위 13.5pt B(YELLOW는 C98A00로 대체), 내용 아래 11pt

### 12. 5대 지향 꽃잎 (네이티브 편집형)
중심 (6.67, 4.25), 꽃잎 d2.5 각도 -90/-18/54/126/198°, 반경 세로1.62·가로×1.55
꽃잎: 틴트 채움 + 지향 라벨색 텍스트(위 11.5pt/아래 16pt B)
중앙: 백색 원 d1.9(테두리 E2E4E8) + symbol_centered h1.44

### 13. 비전 체계도
vision_flower x0.7 y1.95 h4.6 | 편집 알약 x6.4 w6.35 h0.72 r0.36:
외곽선 1.75pt(비전 2F4BA7·지표 F2527A·과제 064976) + 좌측 라벨 알약 w1.55 채움 + 본문 15pt B center

### 14. 메시지 강조
SKY_T 원 좌상 블리드 + YELLOW_T 우하 블리드 | wordmark_1line 중앙 y2.0 h1.0
메시지 21pt B y3.55 center | 슬로건 14pt y4.3 | 5색점 y5.15

### 15·16. BI 라이브러리
백색 카드(테두리 E2E4E8) + 이미지 중앙 + 라벨 9.5pt GRAY 하단 — 복사용 원본 전시

### 17. 마무리A (회전)
symbol_centered cx6.67 y1.05 h2.9 **objectName="SPIN_SYMBOL"** ← inject_spin.py 대상
"감사합니다" 34pt B NAVY y4.35 (별도 텍스트박스 = 삭제 가능) | 슬로건 13pt y5.35 | 기관명 y6.5

### 18. 마무리B (네이비 정적)
백색 원 d3.5 중앙 y1.0 + symbol_centered h2.66 | 감사합니다 32pt 백색 y4.85 | 슬로건(빛=YELLOW) y5.75

## 회전 애니메이션 파라미터
- presetID 8(Spin) / emph / repeatCount indefinite / animRot by 21600000(=360°) / dur 8000ms 권장
- 슬라이드 진입 시 자동 시작(onBegin), PowerPoint·Keynote 재생 지원, LibreOffice 정적 표시
