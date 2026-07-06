// 강원특별자치도교육청 "모두가 빛나는 강원교육" BI 디자인 라이브러리
const pptxgen = require("pptxgenjs");
const pptx = new pptxgen();
pptx.defineLayout({ name: "GW", width: 13.333, height: 7.5 });
pptx.layout = "GW";

const F = "Malgun Gothic";
const A = "assets/";
// ===== BI 공식 컬러 (BI 매뉴얼 추출) =====
const NAVY = "064976";   // 워드마크 남색
const STAR = "F89D0E";   // 워드마크 '빛' 오렌지
const SKY = "50B5EB", PINK = "F132A3", VIOLET = "5C64B7", YELLOW = "FAB10A", ORANGE = "F46717";
const BLACK = "231F20", GRAY = "A7A6A6", TXT = "3A3A3C", MUT = "77787B";
// 12% 틴트
const SKY_T="EDF7FD", PINK_T="FEEBF6", VIOLET_T="EFF0F8", YELLOW_T="FEF7E6", ORANGE_T="FEEFE7", NAVY_T="E6EDF1";
// 비전 5대 지향 컬러 (비전 체계도 라벨색)
const V_NAVY="144E76", V_TEAL="00AAA9", V_GREEN="358D29", V_RED="F13E56", V_ORG="F46917";

const CX = 13.333, CY = 7.5, MID = CX/2;

// 에셋 원본 비율 (w/h)
const R = {
  sig_symbol_typo: 1865/297, sig_h: 1731/595, sig_v1: 561/666, sig_v2: 350/788,
  wordmark_1line: 1712/365, wordmark_2line: 1029/617,
  emblem_color: 729/778, emblem_navy: 754/753, emblem_orange: 754/753,
  symbol: 556/595, symbol_centered: 1, sig_main: 819/877, sig_sub: 680/724,
  vision_flower: 1803/1747, vision_pill: 1563/167, jipyo_pill: 1563/168,
};
function img(s, name, opts){ // h 기준 배치
  const h = opts.h, w = h * R[name];
  const x = (opts.cx !== undefined) ? opts.cx - w/2 : opts.x;
  s.addImage({ path: A + name + ".png", x, y: opts.y, w, h, objectName: opts.objectName || name });
  return { w, h, x };
}
function T(s, txt, o){ s.addText(txt, Object.assign({ fontFace: F, color: TXT }, o)); }

// ===== 공통: 본문 헤더/푸터 =====
let pageNo = 0;
function header(s, title, sub, tag){
  img(s, "sig_symbol_typo", { x: 0.55, y: 0.34, h: 0.30 });
  if (tag) T(s, tag, { x: 9.2, y: 0.34, w: 3.55, h: 0.3, fontSize: 10, color: GRAY, align: "right" });
  T(s, title, { x: 0.55, y: 0.82, w: 10.5, h: 0.62, fontSize: 25, bold: true, color: NAVY });
  if (sub) T(s, sub, { x: 0.57, y: 1.44, w: 11.5, h: 0.34, fontSize: 12, color: MUT });
}
function footer(s){
  pageNo++;
  T(s, "강원특별자치도교육청 문화체육특수교육과", { x: 0, y: 7.06, w: CX, h: 0.3, fontSize: 9, color: GRAY, align: "center" });
  T(s, String(pageNo+2), { x: 12.5, y: 7.06, w: 0.55, h: 0.3, fontSize: 9, color: GRAY, align: "right" });
}
function chip(s, x, y, d, color, txt, fs){
  s.addShape("ellipse", { x, y, w: d, h: d, fill: { color } });
  T(s, txt, { x, y, w: d, h: d, fontSize: fs || 13, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
}

// ============================================================
// S1. 표지 A — 화이트 클린 (엠블럼 중심)
// ============================================================
(() => {
  const s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  img(s, "wordmark_1line", { x: 0.55, y: 0.45, h: 0.34 });
  T(s, "2026학년도", { x: 10.3, y: 0.47, w: 2.45, h: 0.32, fontSize: 12, color: MUT, align: "right" });
  img(s, "emblem_color", { cx: MID, y: 1.15, h: 2.35 });
  T(s, "제목을 입력하세요", { x: 1.5, y: 3.8, w: 10.33, h: 0.85, fontSize: 36, bold: true, color: NAVY, align: "center" });
  T(s, "부제목 또는 보고 개요를 입력하세요", { x: 2.5, y: 4.75, w: 8.33, h: 0.42, fontSize: 15, color: MUT, align: "center" });
  // 5색 점 장식 (심벌 컬러)
  const dots = [SKY, VIOLET, PINK, ORANGE, YELLOW];
  dots.forEach((c, i) => s.addShape("ellipse", { x: MID - 0.62 + i * 0.26, y: 5.42, w: 0.1, h: 0.1, fill: { color: c } }));
  T(s, "강원특별자치도교육청 문화체육특수교육과", { x: 3.17, y: 5.85, w: 7, h: 0.42, fontSize: 15, bold: true, color: BLACK, align: "center" });
  T(s, "2026. 00. 00.", { x: 5.17, y: 6.32, w: 3, h: 0.35, fontSize: 12, color: GRAY, align: "center" });
})();

// ============================================================
// S2. 표지 B — 네이비 임팩트형
// ============================================================
(() => {
  const s = pptx.addSlide();
  s.background = { color: NAVY };
  // 우측 화이트 원판 + 심벌
  s.addShape("ellipse", { x: 8.05, y: 1.32, w: 4.86, h: 4.86, fill: { color: "FFFFFF" } });
  img(s, "symbol_centered", { cx: 10.48, y: 2.05, h: 3.4 });
  // 좌측 타이틀
  T(s, [
    { text: "모두가 ", options: { color: "FFFFFF" } },
    { text: "빛", options: { color: YELLOW } },
    { text: "나는 강원교육", options: { color: "FFFFFF" } },
  ], { x: 0.95, y: 1.7, w: 7, h: 0.5, fontSize: 17, bold: true, charSpacing: 2 });
  T(s, "제목을 입력하세요", { x: 0.92, y: 2.35, w: 7.0, h: 1.7, fontSize: 40, bold: true, color: "FFFFFF", lineSpacing: 52 });
  T(s, "부제목 또는 발표 개요를 입력하세요", { x: 0.95, y: 4.15, w: 6.6, h: 0.4, fontSize: 14, color: "BFD5E3" });
  s.addShape("roundRect", { x: 0.95, y: 5.55, w: 4.5, h: 0.78, rectRadius: 0.39, fill: { color: "FFFFFF" }, line: { type: "none" } });
  T(s, "강원특별자치도교육청  문화체육특수교육과", { x: 1.05, y: 5.55, w: 4.3, h: 0.78, fontSize: 12.5, bold: true, color: NAVY, align: "center", valign: "middle" });
  T(s, "2026. 00. 00.", { x: 5.7, y: 5.55, w: 2.2, h: 0.78, fontSize: 12, color: "BFD5E3", valign: "middle" });
})();

// ============================================================
// S3. 목차 — 5색 카드 그리드
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "목차", null, "CONTENTS");
  const items = [
    ["01", "추진 배경 및 근거", "관련 법령·기본계획·전년도 성과", SKY, SKY_T],
    ["02", "현황 및 진단", "주요 지표·실태 분석·시사점", VIOLET, VIOLET_T],
    ["03", "추진 목표 및 방향", "비전 체계·중점 과제 설정", PINK, PINK_T],
    ["04", "세부 추진 계획", "과제별 추진 내용·일정·방법", ORANGE, ORANGE_T],
    ["05", "예산 및 행정사항", "소요 예산·협조 사항", YELLOW, YELLOW_T],
    ["06", "기대 효과", "정성·정량 기대 성과", NAVY, NAVY_T],
  ];
  const gw = 5.96, gh = 1.5, gx = 0.55, gy = 1.9, gapx = 0.36, gapy = 0.32;
  items.forEach((it, i) => {
    const x = gx + (i % 2) * (gw + gapx), y = gy + Math.floor(i / 2) * (gh + gapy);
    s.addShape("roundRect", { x, y, w: gw, h: gh, rectRadius: 0.12, fill: { color: it[4] }, line: { type: "none" } });
    chip(s, x + 0.3, y + 0.39, 0.72, it[3], it[0], 15);
    T(s, it[1], { x: x + 1.28, y: y + 0.26, w: gw - 1.5, h: 0.42, fontSize: 16.5, bold: true, color: BLACK });
    T(s, it[2], { x: x + 1.28, y: y + 0.74, w: gw - 1.5, h: 0.38, fontSize: 11, color: MUT });
  });
  footer(s);
})();

// ============================================================
// S4. 섹션 간지
// ============================================================
(() => {
  const s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  // 대형 틴트 원 (꽃잎 모티프) 우측
  s.addShape("ellipse", { x: 8.6, y: -1.6, w: 8, h: 8, fill: { color: SKY_T } });
  s.addShape("ellipse", { x: 11.15, y: 4.4, w: 4.4, h: 4.4, fill: { color: YELLOW_T } });
  img(s, "symbol", { x: 10.05, y: 2.15, h: 2.5 });
  T(s, "01", { x: 0.9, y: 1.85, w: 3.5, h: 1.55, fontSize: 88, bold: true, color: SKY });
  T(s, "추진 배경 및 근거", { x: 0.95, y: 3.5, w: 8, h: 0.75, fontSize: 32, bold: true, color: NAVY });
  T(s, "섹션 요약 문장을 입력하세요. 해당 장에서 다룰 핵심 내용을 한 줄로 안내합니다.", { x: 0.97, y: 4.4, w: 7.6, h: 0.4, fontSize: 13, color: MUT });
  const dots = [SKY, VIOLET, PINK, ORANGE, YELLOW];
  dots.forEach((c, i) => s.addShape("ellipse", { x: 0.98 + i * 0.24, y: 5.15, w: 0.09, h: 0.09, fill: { color: c } }));
  footer(s);
})();

// ============================================================
// S5. 본문 기본형 — 개조식 불릿 + 강조 카드
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "추진 배경", "관련 근거와 추진 필요성을 개조식으로 정리", "01  추진 배경");
  const sec = (y, color, head, bullets) => {
    s.addShape("ellipse", { x: 0.6, y: y + 0.03, w: 0.3, h: 0.3, fill: { color } });
    T(s, head, { x: 1.02, y, w: 6.8, h: 0.38, fontSize: 16, bold: true, color: NAVY });
    T(s, bullets.map(b => ({ text: b, options: { bullet: { characterCode: "2219", indent: 14 }, breakLine: true } })),
      { x: 1.05, y: y + 0.44, w: 6.9, h: bullets.length * 0.4, fontSize: 12.5, color: TXT, lineSpacing: 21 });
  };
  sec(1.95, SKY, "추진 근거", [
    "「문화예술교육 지원법」 제○조 및 동법 시행령",
    "2026 강원교육 기본계획 ○○ 영역 ○○ 과제",
    "○○○○ 운영 계획(문화체육특수교육과-0000, 2026.00.00.)",
  ]);
  sec(3.75, VIOLET, "추진 필요성", [
    "학교 예술교육 격차 해소 및 보편적 문화 향유 기회 확대 필요",
    "지역 간 교육 여건 차이를 고려한 맞춤형 지원 체계 요구",
    "학생·교원 수요 조사 결과 ○○ 분야 지원 확대 요청 다수",
  ]);
  // 우측 강조 카드 (네이비)
  s.addShape("roundRect", { x: 8.45, y: 1.95, w: 4.3, h: 4.55, rectRadius: 0.14, fill: { color: NAVY }, line: { type: "none" } });
  T(s, "핵심 목표", { x: 8.85, y: 2.35, w: 3.5, h: 0.35, fontSize: 13, bold: true, color: "9FC3DB", charSpacing: 2 });
  T(s, "212교", { x: 8.85, y: 2.8, w: 3.5, h: 0.9, fontSize: 46, bold: true, color: YELLOW });
  T(s, "도내 지원 대상 학교", { x: 8.85, y: 3.75, w: 3.5, h: 0.35, fontSize: 12.5, color: "FFFFFF" });
  s.addShape("line", { x: 8.85, y: 4.35, w: 3.4, h: 0, line: { color: "2A6B96", width: 1 } });
  T(s, [
    { text: "일상이 예술이 되는 교실,", options: { breakLine: true } },
    { text: "예술로 깊어지는 강원교육", options: {} },
  ], { x: 8.85, y: 4.6, w: 3.5, h: 0.8, fontSize: 13.5, bold: true, color: "FFFFFF", lineSpacing: 22 });
  T(s, "모두가 빛나는 강원교육", { x: 8.85, y: 5.75, w: 3.5, h: 0.32, fontSize: 11, color: "9FC3DB" });
  footer(s);
})();

// ============================================================
// S6. 2단 비교 — 현황 → 개선
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "현황 진단 및 개선 방향", "현재 상황과 개선 방향을 좌우로 대비", "02  현황 진단");
  const card = (x, bg, dot, head, items) => {
    s.addShape("roundRect", { x, y: 1.95, w: 5.55, h: 4.55, rectRadius: 0.14, fill: { color: bg }, line: { type: "none" } });
    s.addShape("ellipse", { x: x + 0.42, y: 2.36, w: 0.26, h: 0.26, fill: { color: dot } });
    T(s, head, { x: x + 0.82, y: 2.28, w: 4, h: 0.4, fontSize: 17, bold: true, color: NAVY });
    T(s, items.map(t => ({ text: t, options: { bullet: { characterCode: "2219", indent: 14 }, breakLine: true } })),
      { x: x + 0.45, y: 3.0, w: 4.75, h: 3.2, fontSize: 12.5, color: TXT, lineSpacing: 26 });
  };
  card(0.55, NAVY_T, GRAY, "현황 및 한계", [
    "지역별 예술강사 배치 편차 발생",
    "소규모 학교 프로그램 선택권 제한",
    "악기·기자재 노후화 및 유휴 자원 방치",
    "성과 관리 지표 부재로 환류 곤란",
  ]);
  card(7.23, SKY_T, SKY, "개선 방향", [
    "권역별 순회 지원 체계 구축",
    "찾아가는 예술교육 프로그램 확대",
    "악기뱅크 운영으로 자원 재배치",
    "만족도·참여율 기반 성과 지표 도입",
  ]);
  // 중앙 화살표
  s.addShape("chevron", { x: 6.28, y: 3.85, w: 0.78, h: 0.72, fill: { color: SKY } });
  footer(s);
})();

// ============================================================
// S7. 핵심 과제 3카드
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "중점 추진 과제", "3대 핵심 과제 중심 구성", "03  추진 목표");
  const cards = [
    [SKY, SKY_T, "1", "학교 예술교육 내실화", ["예술강사 지원 212교 운영", "교육과정 연계 프로그램 개발", "교원 역량 강화 연수 운영"]],
    [VIOLET, VIOLET_T, "2", "문화 향유 기회 확대", ["찾아가는 공연·전시 운영", "학생 예술 동아리 지원", "지역 문화기관 연계 체험"]],
    [ORANGE, ORANGE_T, "3", "예술교육 기반 구축", ["악기뱅크 2.0 확대 운영", "유휴 악기 재배치 시스템", "성과 관리·환류 체계 정착"]],
  ];
  const w = 3.86, gap = 0.35, x0 = 0.55;
  cards.forEach((c, i) => {
    const x = x0 + i * (w + gap);
    s.addShape("roundRect", { x, y: 1.95, w, h: 4.55, rectRadius: 0.14, fill: { color: c[1] }, line: { type: "none" } });
    chip(s, x + 0.38, y = 2.34, 0.66, c[0], c[2], 16);
    T(s, c[3], { x: x + 0.38, y: 3.2, w: w - 0.76, h: 0.75, fontSize: 16.5, bold: true, color: BLACK, lineSpacing: 23 });
    T(s, c[4].map(t => ({ text: t, options: { bullet: { characterCode: "2219", indent: 12 }, breakLine: true } })),
      { x: x + 0.4, y: 4.1, w: w - 0.78, h: 2.1, fontSize: 11.5, color: TXT, lineSpacing: 23 });
  });
  footer(s);
})();

// ============================================================
// S8. 4단계 프로세스
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "추진 절차", "단계별 추진 프로세스", "04  세부 계획");
  const steps = [
    [SKY, "STEP 1", "계획 수립", "기본계획 수립\n대상교 수요 조사"],
    [VIOLET, "STEP 2", "공모·선정", "사업 공모 안내\n심사 및 대상 확정"],
    [PINK, "STEP 3", "운영 지원", "예산 교부\n컨설팅·모니터링"],
    [ORANGE, "STEP 4", "평가 환류", "성과 보고회\n차년도 계획 반영"],
  ];
  const d = 1.75, y = 2.35, gap = (CX - 1.1 - 4 * d) / 3;
  steps.forEach((st, i) => {
    const x = 0.55 + i * (d + gap);
    s.addShape("ellipse", { x, y, w: d, h: d, fill: { color: st[0] } });
    T(s, st[1], { x, y: y + 0.5, w: d, h: 0.35, fontSize: 12, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    T(s, st[2], { x: x - 0.4, y: y + d + 0.3, w: d + 0.8, h: 0.4, fontSize: 15.5, bold: true, color: NAVY, align: "center" });
    T(s, st[3], { x: x - 0.45, y: y + d + 0.78, w: d + 0.9, h: 0.85, fontSize: 11.5, color: MUT, align: "center", lineSpacing: 18 });
    if (i < 3) s.addShape("chevron", { x: x + d + gap / 2 - 0.19, y: y + d / 2 - 0.16, w: 0.36, h: 0.32, fill: { color: "C9CDD2" } });
  });
  // 하단 안내 카드
  s.addShape("roundRect", { x: 0.55, y: 5.75, w: 12.23, h: 0.78, rectRadius: 0.12, fill: { color: NAVY_T }, line: { type: "none" } });
  T(s, [
    { text: "추진 기간  ", options: { bold: true, color: NAVY } },
    { text: "2026. 3. ~ 2027. 2.  |  단계별 세부 일정은 여건에 따라 조정 가능", options: { color: TXT } },
  ], { x: 1.0, y: 5.75, w: 11.4, h: 0.78, fontSize: 12.5, valign: "middle" });
  footer(s);
})();

// ============================================================
// S9. 데이터 강조형
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "주요 현황 지표", "핵심 수치 중심의 데이터 슬라이드", "02  현황 진단");
  // 좌측 네이비 대형 카드
  s.addShape("roundRect", { x: 0.55, y: 1.95, w: 4.35, h: 4.55, rectRadius: 0.14, fill: { color: NAVY }, line: { type: "none" } });
  T(s, "총 지원 예산", { x: 0.95, y: 2.42, w: 3.5, h: 0.35, fontSize: 13, bold: true, color: "9FC3DB", charSpacing: 2 });
  T(s, [
    { text: "377", options: { fontSize: 60, bold: true, color: YELLOW } },
    { text: " 백만원", options: { fontSize: 16, color: "FFFFFF" } },
  ], { x: 0.95, y: 2.9, w: 3.6, h: 1.15 });
  s.addShape("line", { x: 0.95, y: 4.35, w: 3.45, h: 0, line: { color: "2A6B96", width: 1 } });
  T(s, [
    { text: "전년 대비 12% 증액", options: { breakLine: true, color: "FFFFFF" } },
    { text: "예술교육 기반 확충 중점 투자", options: { color: "9FC3DB" } },
  ], { x: 0.95, y: 4.6, w: 3.5, h: 0.85, fontSize: 12.5, lineSpacing: 22 });
  // 우측 2x2 수치 카드
  const stats = [
    [SKY, "212", "교", "지원 대상 학교"],
    [VIOLET, "35", "교", "악기뱅크 참여교"],
    [PINK, "1,847", "명", "프로그램 참여 학생"],
    [ORANGE, "94.2", "%", "사업 만족도"],
  ];
  const w = 3.69, h = 2.14, gx = 5.2, gy = 1.95;
  stats.forEach((st, i) => {
    const x = gx + (i % 2) * (w + 0.25), y = gy + Math.floor(i / 2) * (h + 0.27);
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: "FFFFFF" }, line: { color: "E2E4E8", width: 1 } });
    T(s, [
      { text: st[1], options: { fontSize: 33, bold: true, color: st[0] } },
      { text: " " + st[2], options: { fontSize: 13, color: MUT } },
    ], { x: x + 0.34, y: y + 0.36, w: w - 0.6, h: 0.72 });
    T(s, st[3], { x: x + 0.36, y: y + 1.28, w: w - 0.6, h: 0.35, fontSize: 12.5, color: TXT });
  });
  footer(s);
})();

// ============================================================
// S10. 표 스타일
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "세부 추진 일정 및 예산", "표 기반 정리형", "04  세부 계획");
  const head = ["구분", "추진 내용", "시기", "예산(백만원)", "담당"].map(t =>
    ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: NAVY }, align: "center", valign: "middle" } }));
  const rows = [
    ["계획", "기본계획 수립 및 공문 시행", "2026. 3.", "-", "문화교육팀"],
    ["공모", "대상교 공모 및 심사·선정", "2026. 4.", "5", "문화교육팀"],
    ["운영", "학교별 프로그램 운영 지원", "2026. 5.~11.", "342", "대상교"],
    ["점검", "중간 점검 및 컨설팅", "2026. 8.", "10", "문화교육팀"],
    ["평가", "성과 보고회 및 정산", "2026. 12.", "20", "공동"],
  ];
  const body = rows.map((r, i) => r.map((c, j) => ({
    text: c, options: { align: j === 1 ? "left" : "center", valign: "middle", color: TXT,
      fill: { color: i % 2 ? NAVY_T : "FFFFFF" } } })));
  s.addTable([head, ...body], {
    x: 0.55, y: 2.0, w: 12.23, colW: [1.5, 5.53, 1.9, 1.8, 1.5],
    rowH: [0.52, 0.62, 0.62, 0.62, 0.62, 0.62],
    fontFace: F, fontSize: 12, border: { type: "solid", color: "D8DBDF", pt: 0.75 }, margin: 0.08,
  });
  T(s, "※ 예산은 편성(안) 기준이며 최종 배정액에 따라 조정될 수 있음", { x: 0.57, y: 6.1, w: 9, h: 0.3, fontSize: 10.5, color: GRAY });
  footer(s);
})();

// ============================================================
// S11. 타임라인
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "연간 추진 일정", "월별 타임라인형", "04  세부 계획");
  const y = 4.05;
  s.addShape("line", { x: 1.0, y: y + 0.14, w: 11.3, h: 0, line: { color: "D8DBDF", width: 2.5 } });
  const nodes = [
    [SKY, "3월", "기본계획 수립", "사업 공고"],
    [VIOLET, "4월", "대상교 선정", "예산 교부"],
    [PINK, "5~7월", "1학기 운영", "찾아가는 프로그램"],
    [ORANGE, "8월", "중간 점검", "컨설팅 실시"],
    [YELLOW, "9~11월", "2학기 운영", "성과 축적"],
    [NAVY, "12월", "성과 보고회", "정산·환류"],
  ];
  const gap = 11.3 / (nodes.length - 1);
  nodes.forEach((n, i) => {
    const x = 1.0 + i * gap;
    s.addShape("ellipse", { x: x - 0.14, y, w: 0.28, h: 0.28, fill: { color: n[0] }, line: { color: "FFFFFF", width: 2 } });
    T(s, n[1], { x: x - 0.9, y: y - 0.62, w: 1.8, h: 0.35, fontSize: 13.5, bold: true, color: n[0] === YELLOW ? "C98A00" : n[0], align: "center" });
    T(s, [
      { text: n[2], options: { bold: true, color: TXT, breakLine: true } },
      { text: n[3], options: { color: MUT } },
    ], { x: x - 0.95, y: y + 0.48, w: 1.9, h: 0.75, fontSize: 11, align: "center", lineSpacing: 17 });
  });
  T(s, "연중  |  홍보·모니터링·안전 관리 상시 운영", { x: 0.55, y: 5.9, w: 12.23, h: 0.35, fontSize: 12, color: MUT, align: "center" });
  footer(s);
})();

// ============================================================
// S12. 5대 지향 (비전 꽃잎 레이아웃 — 네이티브 도형)
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "5대 지향과 사업 연계", "비전 체계 꽃잎 모티프 — 도형·텍스트 모두 수정 가능", "03  추진 목표");
  const cx0 = 6.67, cy0 = 4.25, rr = 1.62, d = 2.5;
  const petals = [
    [SKY_T, V_NAVY, "삶의 뿌리", "강한 학력", -90],
    [VIOLET_T, V_GREEN, "모두의 성공", "빛나는 진로", -18],
    [YELLOW_T, V_ORG, "모두를 품는", "포용교육", 54],
    [PINK_T, V_RED, "좋은 세상을 위한", "미래교육", 126],
    [NAVY_T, V_TEAL, "함께 성장하는", "교육공동체", 198],
  ];
  petals.forEach(p => {
    const rad = p[4] * Math.PI / 180;
    const px = cx0 + rr * Math.cos(rad) * 1.55, py = cy0 + rr * Math.sin(rad);
    s.addShape("ellipse", { x: px - d / 2, y: py - d / 2, w: d, h: d, fill: { color: p[0] }, line: { type: "none" } });
    T(s, [
      { text: p[2] + "\n", options: { fontSize: 11.5, color: p[1] } },
      { text: p[3], options: { fontSize: 16, bold: true, color: p[1] } },
    ], { x: px - d / 2, y: py - 0.55, w: d, h: 1.1, align: "center", lineSpacing: 21 });
  });
  s.addShape("ellipse", { x: cx0 - 0.95, y: cy0 - 0.95, w: 1.9, h: 1.9, fill: { color: "FFFFFF" }, line: { color: "E2E4E8", width: 1 } });
  img(s, "symbol_centered", { cx: cx0, y: cy0 - 0.72, h: 1.44 });
  footer(s);
})();

// ============================================================
// S13. 비전 체계도 (BI 매뉴얼 원본 + 편집형 조합)
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "강원교육 비전 체계", "좌: BI 매뉴얼 원본  |  우: 수정 가능한 편집형", "03  추진 목표");
  img(s, "vision_flower", { x: 0.7, y: 1.95, h: 4.6 });
  // 우측 편집형 pills
  const pill = (y, c, label, txt) => {
    s.addShape("roundRect", { x: 6.4, y, w: 6.35, h: 0.72, rectRadius: 0.36, fill: { color: "FFFFFF" }, line: { color: c, width: 1.75 } });
    s.addShape("roundRect", { x: 6.4, y, w: 1.55, h: 0.72, rectRadius: 0.36, fill: { color: c }, line: { type: "none" } });
    T(s, label, { x: 6.4, y, w: 1.55, h: 0.72, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });
    T(s, txt, { x: 8.05, y, w: 4.6, h: 0.72, fontSize: 15, bold: true, color: BLACK, align: "center", valign: "middle", margin: 0 });
  };
  pill(2.25, "2F4BA7", "비전", "모두가 빛나는 강원교육");
  pill(3.25, "F2527A", "지표", "모두의 학교 특별한 교육");
  pill(4.25, NAVY, "과제", "과제·목표를 입력하세요");
  T(s, "※ 알약형 도형은 텍스트·색상 수정 및 복사·추가 가능", { x: 6.45, y: 5.25, w: 6.2, h: 0.32, fontSize: 10.5, color: GRAY });
  T(s, "※ 좌측 체계도는 BI 매뉴얼 원본 이미지(교체·크기 조정 가능)", { x: 6.45, y: 5.6, w: 6.2, h: 0.32, fontSize: 10.5, color: GRAY });
  footer(s);
})();

// ============================================================
// S14. 메시지 강조형 (워드마크 캠페인)
// ============================================================
(() => {
  const s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  s.addShape("ellipse", { x: -2.3, y: -2.6, w: 5.6, h: 5.6, fill: { color: SKY_T } });
  s.addShape("ellipse", { x: 10.6, y: 4.7, w: 5.2, h: 5.2, fill: { color: YELLOW_T } });
  img(s, "wordmark_1line", { cx: MID, y: 2.0, h: 1.0 });
  T(s, "핵심 메시지를 입력하세요", { x: 2.17, y: 3.55, w: 9, h: 0.6, fontSize: 21, bold: true, color: BLACK, align: "center" });
  T(s, "일상이 예술이 되는 교실, 예술로 깊어지는 강원교육", { x: 2.67, y: 4.3, w: 8, h: 0.42, fontSize: 14, color: MUT, align: "center" });
  const dots = [SKY, VIOLET, PINK, ORANGE, YELLOW];
  dots.forEach((c, i) => s.addShape("ellipse", { x: MID - 0.62 + i * 0.26, y: 5.15, w: 0.1, h: 0.1, fill: { color: c } }));
  T(s, "강원특별자치도교육청 문화체육특수교육과", { x: 0, y: 6.55, w: CX, h: 0.35, fontSize: 11, color: GRAY, align: "center" });
})();

// ============================================================
// S15. BI 에셋 라이브러리 (복사용)
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "BI 에셋 라이브러리", "필요한 로고를 복사(Ctrl+C)하여 다른 슬라이드에 활용 — 모두 투명 배경 PNG", "APPENDIX");
  const cell = (x, y, w, h, name, label, ih) => {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: "FFFFFF" }, line: { color: "E2E4E8", width: 1 } });
    img(s, name, { cx: x + w / 2, y: y + (h - 0.34 - ih) / 2, h: ih });
    T(s, label, { x, y: y + h - 0.36, w, h: 0.3, fontSize: 9.5, color: MUT, align: "center" });
  };
  // 1행: 가로형 시그니처
  cell(0.55, 1.9, 6.0, 1.42, "sig_symbol_typo", "대표 시그니처 (심벌+타이포)", 0.52);
  cell(6.75, 1.9, 6.03, 1.42, "wordmark_1line", "타이포그래피 단독 (1행)", 0.66);
  // 2행
  cell(0.55, 3.5, 2.9, 2.9, "emblem_color", "엠블럼 (기본)", 1.9);
  cell(3.63, 3.5, 2.9, 2.9, "emblem_navy", "엠블럼 (남색 단색)", 1.85);
  cell(6.71, 3.5, 2.9, 2.9, "emblem_orange", "엠블럼 (주황 단색)", 1.85);
  cell(9.79, 3.5, 2.99, 2.9, "symbol", "심벌 단독", 1.9);
  footer(s);
})();

// ============================================================
// S16. BI 에셋 라이브러리 II
// ============================================================
(() => {
  const s = pptx.addSlide();
  header(s, "BI 에셋 라이브러리 II", "조합 변형·흑백·세로형 — 복사하여 활용", "APPENDIX");
  const cell = (x, y, w, h, name, label, ih) => {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.1, fill: { color: "FFFFFF" }, line: { color: "E2E4E8", width: 1 } });
    img(s, name, { cx: x + w / 2, y: y + (h - 0.34 - ih) / 2, h: ih });
    T(s, label, { x, y: y + h - 0.36, w, h: 0.3, fontSize: 9.5, color: MUT, align: "center" });
  };
  cell(0.55, 1.9, 3.94, 2.2, "sig_v1", "세로 조합 1", 1.55);
  cell(4.69, 1.9, 3.94, 2.2, "sig_v2", "세로 조합 2", 1.6);
  cell(8.84, 1.9, 3.94, 2.2, "wordmark_2line", "타이포그래피 (2행)", 1.35);
  cell(0.55, 4.3, 3.94, 2.2, "sig_main", "대표 시그니처 (세로)", 1.7);
  cell(4.69, 4.3, 3.94, 2.2, "sig_sub", "시그니처 (흑백)", 1.7);
  cell(8.84, 4.3, 3.94, 2.2, "sig_h", "가로 조합 변경", 1.15);
  footer(s);
})();

// ============================================================
// S17. 마무리 A — 회전 심벌 + 감사합니다 (애니메이션)
// ============================================================
(() => {
  const s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  img(s, "symbol_centered", { cx: MID, y: 1.05, h: 2.9, objectName: "SPIN_SYMBOL" });
  T(s, "감사합니다", { x: 4.17, y: 4.35, w: 5, h: 0.85, fontSize: 34, bold: true, color: NAVY, align: "center" });
  T(s, "일상이 예술이 되는 교실, 예술로 깊어지는 강원교육", { x: 3.17, y: 5.35, w: 7, h: 0.4, fontSize: 13, color: MUT, align: "center" });
  T(s, "강원특별자치도교육청 문화체육특수교육과", { x: 0, y: 6.5, w: CX, h: 0.35, fontSize: 11, color: GRAY, align: "center" });
})();

// ============================================================
// S18. 마무리 B — 네이비 임팩트형 (정적 대안)
// ============================================================
(() => {
  const s = pptx.addSlide();
  s.background = { color: NAVY };
  s.addShape("ellipse", { x: MID - 1.75, y: 1.0, w: 3.5, h: 3.5, fill: { color: "FFFFFF" } });
  img(s, "symbol_centered", { cx: MID, y: 1.42, h: 2.66 });
  T(s, "감사합니다", { x: 4.17, y: 4.85, w: 5, h: 0.8, fontSize: 32, bold: true, color: "FFFFFF", align: "center" });
  T(s, [
    { text: "모두가 ", options: { color: "BFD5E3" } },
    { text: "빛", options: { color: YELLOW } },
    { text: "나는 강원교육", options: { color: "BFD5E3" } },
  ], { x: 4.17, y: 5.75, w: 5, h: 0.4, fontSize: 14, bold: true, align: "center", charSpacing: 2 });
  T(s, "강원특별자치도교육청 문화체육특수교육과", { x: 0, y: 6.6, w: CX, h: 0.35, fontSize: 10.5, color: "7FA8C2", align: "center" });
})();

pptx.writeFile({ fileName: "gw_bi_library.pptx" }).then(() => console.log("done"));
