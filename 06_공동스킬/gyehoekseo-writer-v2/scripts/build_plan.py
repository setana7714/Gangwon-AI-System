#!/usr/bin/env python3
"""
강원특별자치도교육청 계획서(HWPX) 생성 스크립트
— 2026 신규 BI(모두가 빛나는 강원교육) 파랑 양식 기반 (2026. 7. 입력검증 개정판)

사용법:
    python build_plan.py plan.json 출력경로.hwpx

plan.json 구조:
{
  "title": "2026 ○○사업 운영 계획",   # 표지·본문 제목 (동일 적용)
  "date": "2026. 7.",                  # 표지 날짜 (월까지만)
  "sections": [
    {"numeral": "Ⅰ", "title": "근 거",
     "items": [["check", "교육부 고시 제○호(2026. ○. ○.)"]]},
    {"numeral": "Ⅳ", "title": "추진 개요",
     "items": [["lv1", "사업명: ○○"], ["lv2", "대상: ○○"],
               ["lv3", "세부내용"], ["lv4", "참고사항"]]}
  ]
}

item 유형: check(✔) / lv1(□) / lv2(○) / lv3(―) / lv4(※)
기호는 자동으로 붙으므로 텍스트에 기호를 포함하지 말 것.

안전장치(2026. 7. 개정):
- 인자·JSON 오류 시 traceback 대신 사용법·원인 안내
- 알 수 없는 item 유형 → 위치(섹션·순번)와 허용 유형을 명시하고 중단
- title/date 미입력, sections 비어 있음 → 경고 출력 (생성은 진행)
- date 형식이 '2026. 7.' 꼴이 아니면 경고 (생성은 진행)
"""
import sys, os, json, re, shutil, zipfile, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(HERE, "..", "assets", "report-template.hwpx")

# 템플릿 내 플레이스홀더 텍스트 (정확 일치)
PH = {
    "check": "휴먼명조 13포인트(문단 위 10)",
    "lv1":   "□ 헤드라인M 14포인트(문단 위 15)",
    "lv2":   "○ 휴먼명조 13포인트(문단 위 10)",
    "lv3":   "― 휴먼명조 13포인트(문단 위 6)",
    "lv4":   "※ 휴먼명조 13포인트(문단 위 3)",
}
PREFIX = {"lv1": "□ ", "lv2": "○ ", "lv3": "― ", "lv4": "※ "}
KINDS = "check(✔) / lv1(□) / lv2(○) / lv3(―) / lv4(※)"

WARNINGS = []


def warn(msg):
    WARNINGS.append(msg)


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def top_paragraphs(sec_xml):
    """최상위 <hp:p> 블록 (시작, 끝, 원문) 목록 — 중첩된 꼬리말 내부 문단 제외"""
    out, depth, start = [], 0, None
    for m in re.finditer(r"<hp:p[ >]|</hp:p>", sec_xml):
        if m.group(0).startswith("<hp:p"):
            if depth == 0:
                start = m.start()
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                end = sec_xml.find(">", m.start()) + 1
                out.append((start, end, sec_xml[start:end]))
    return out


def para_text(pxml):
    return "".join(re.findall(r"<hp:t>([^<]*)</hp:t>", pxml))


def set_texts(pxml, texts):
    """문단 내 <hp:t>를 texts 순서대로 교체 (texts 소진 후 run은 유지)"""
    it = iter(texts)

    def rep(m):
        try:
            return "<hp:t>%s</hp:t>" % esc(next(it))
        except StopIteration:
            return m.group(0)

    return re.sub(r"<hp:t>[^<]*</hp:t>", rep, pxml)


def validate(plan):
    """생성 전 입력 검증 — 치명 오류는 즉시 중단, 경미한 문제는 경고 수집"""
    title = plan.get("title")
    if not (isinstance(title, str) and title.strip()):
        warn("title 미입력 → 표지·본문 제목이 '제 목'으로 남음. 반드시 수정할 것")
    date = plan.get("date")
    if not (isinstance(date, str) and date.strip()):
        warn("date 미입력 → 표지 날짜가 비어 있음. '2026. 7.' 형식으로 넣을 것")
    elif not re.match(r"\s*\d{4}\.\s*\d{1,2}\.\s*$", date):
        warn("date 형식 확인 필요: %r — 표지 날짜는 월까지만 '2026. 7.' 형식 권장" % date)

    sections = plan.get("sections")
    if not isinstance(sections, list):
        sys.exit("plan.json 오류: sections는 배열이어야 함 (현재: %s)" % type(sections).__name__)
    if not sections:
        warn("sections가 비어 있음 — 표지만 있고 본문이 없는 문서가 생성됨")

    for si, sec in enumerate(sections, 1):
        if not isinstance(sec, dict):
            sys.exit("sections %d번째 항목이 객체가 아님: %r" % (si, sec))
        for key in ("numeral", "title"):
            if not (isinstance(sec.get(key), str) and sec[key].strip()):
                sys.exit("sections %d번째 섹션에 %r 누락 — 예: {\"numeral\": \"Ⅰ\", \"title\": \"근 거\"}" % (si, key))
        for ii, entry in enumerate(sec.get("items", []), 1):
            if not (isinstance(entry, (list, tuple)) and len(entry) == 2):
                sys.exit("섹션 %s(%s)의 items %d번째 형식 오류: %r — [\"lv1\", \"내용\"] 꼴이어야 함"
                         % (sec["numeral"], sec["title"].strip(), ii, entry))
            kind, text = entry
            if kind not in PH:
                sys.exit("섹션 %s(%s)의 items %d번째 유형 %r 은 없음 — 허용 유형: %s"
                         % (sec["numeral"], sec["title"].strip(), ii, kind, KINDS))
            if not isinstance(text, str):
                sys.exit("섹션 %s(%s)의 items %d번째 내용이 문자열이 아님: %r"
                         % (sec["numeral"], sec["title"].strip(), ii, text))
            if text and text.lstrip()[:1] in "✔□○―※◦":
                warn("섹션 %s items %d번째 내용이 기호로 시작함(%r…) — 기호는 자동 부착되므로 중복 여부 확인"
                     % (sec["numeral"], ii, text.lstrip()[:2]))


def build(plan_path, out_path):
    if not os.path.exists(plan_path):
        sys.exit("plan.json 파일을 찾을 수 없음: %s" % plan_path)
    try:
        plan = json.load(open(plan_path, encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit("plan.json 파싱 실패 — JSON 문법을 확인할 것: %s" % e)

    validate(plan)

    work = tempfile.mkdtemp()
    with zipfile.ZipFile(TEMPLATE) as z:
        z.extractall(work)
    sec_path = os.path.join(work, "Contents", "section0.xml")
    xml = open(sec_path, encoding="utf-8").read()

    paras = top_paragraphs(xml)
    texts = [para_text(p[2]) for p in paras]

    def find(pred, what):
        for i, t in enumerate(texts):
            if pred(t):
                return i
        raise RuntimeError("양식에서 기준 문단을 찾을 수 없음(%s) — report-template.hwpx 변경 여부 확인" % what)

    i_dept = find(lambda t: t.strip() == "강원특별자치도교육청 문화체육특수교육과", "부서명")
    proto = {
        "section_first": paras[find(lambda t: t.startswith(" Ⅰ "), "섹션Ⅰ")][2],  # 위 14pt
        "section":       paras[find(lambda t: t.startswith(" Ⅱ "), "섹션Ⅱ")][2],  # 위 22pt
        "check":         paras[find(lambda t: t.startswith("✔"), "체크항목")][2],
    }
    for k in ("lv1", "lv2", "lv3", "lv4"):
        proto[k] = paras[find(lambda t: t.strip() == PH[k], k)][2]

    # ---- 고정부(표지~부서명) 치환 ----
    head = xml[: paras[i_dept][1]]
    tail = xml[paras[-1][1]:]
    title = plan.get("title", "제 목")
    date = plan.get("date", "2026.   .")
    head = head.replace("<hp:t>운영 계획</hp:t>", "<hp:t>%s</hp:t>" % esc(title), 1)
    head = head.replace("<hp:t>2026.   .</hp:t>", "<hp:t>%s</hp:t>" % esc(date), 1)
    head = head.replace("<hp:t>제 목</hp:t>", "<hp:t>%s</hp:t>" % esc(title), 1)

    # ---- 본문 섹션 조립 ----
    body = []
    for si, sec in enumerate(plan.get("sections", [])):
        src = proto["section_first"] if si == 0 else proto["section"]
        body.append(set_texts(src, [" %s " % sec["numeral"], "  %s" % sec["title"]]))
        for kind, text in sec.get("items", []):
            if kind == "check":
                body.append(set_texts(proto["check"], ["✔ ", text]))
            else:
                body.append(set_texts(proto[kind], [PREFIX[kind] + text]))

    open(sec_path, "w", encoding="utf-8").write(head + "".join(body) + tail)

    # ---- 재패키징 (mimetype 우선·STORED) ----
    if os.path.exists(out_path):
        os.remove(out_path)
    files = []
    for root, _, names in os.walk(work):
        for n in names:
            files.append(os.path.relpath(os.path.join(root, n), work).replace(os.sep, "/"))
    files.sort(key=lambda p: (p != "mimetype", p))
    with zipfile.ZipFile(out_path, "w") as z:
        for p in files:
            comp = zipfile.ZIP_STORED if p == "mimetype" else zipfile.ZIP_DEFLATED
            z.write(os.path.join(work, p), p, compress_type=comp)
    shutil.rmtree(work)
    print("OK:", out_path)

    if WARNINGS:
        print("\n⚠ 확인 필요 항목 (%d건):" % len(WARNINGS))
        for i, w in enumerate(WARNINGS, 1):
            print("  %d. %s" % (i, w))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit("사용법: python build_plan.py plan.json 출력경로.hwpx")
    build(sys.argv[1], sys.argv[2])
