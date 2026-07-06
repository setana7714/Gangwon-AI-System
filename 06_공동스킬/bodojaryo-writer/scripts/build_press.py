#!/usr/bin/env python3
"""
강원특별자치도교육청 보도자료(HWPX) 생성 스크립트
— 2026 신규 BI(모두가 빛나는 강원교육) 서식 기반

사용법:
    python build_press.py press.json 출력경로.hwpx

press.json 구조:
{
  "date": "2026. 7. 17.(금)",                      # 배포일 — (요일) 생략 시 자동 계산
  "chief_line": "문화체육특수교육과장 : 이인범  ☎ 033) 258-5370",
  "inquiry": "자료문의 : ☎ 258-5382  문화교육담당 장학관 ○○○  담당자 ○○○",
  "headline": "2026 ○○○ 성황리 개최",              # □ ... □ 는 자동으로 붙음
  "subtitle": "부제 문구",                          # “ ” 는 자동으로 붙음
  "paragraphs": [
    ["lv1", "강원특별자치도교육청(교육감 강삼영)은 ... 개최했다."],
    ["lv2", "하위 세부 내용"],
    ["lv1", "..."]
  ],
  "attachment": "붙임  행사 사진 2매.  끝."
}

paragraph 유형: lv1(□ 휴먼명조 14pt) / lv2(◦ 휴먼명조 13pt)
기호(□, ◦)는 자동으로 붙으므로 텍스트에 포함하지 말 것.
"""
import sys, os, json, re, shutil, zipfile, tempfile, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(HERE, "..", "assets", "press-template.hwpx")

PH = {
    "date":       "2026. 00. 00.(요일)",
    "chief":      "문화체육특수교육과장 : 홍길동  ☎ 033) 258-0000",
    "inquiry":    "자료문의 : ☎ 258-0000  0000담당 장학관 000  담당자 000",
    "headline":   "□ 보도자료 표제를 입력합니다 □",
    "subtitle":   "\u201c보도자료 부제를 입력합니다\u201d",
    "attachment": "붙임  행사 사진 2매.  끝.",
    "lv1":        "□ 전문·본문 문단(휴먼명조 14포인트)",
    "lv2":        "◦ 하위 문단(휴먼명조 13포인트)",
}
PREFIX = {"lv1": "□ ", "lv2": "◦ "}
WEEKDAY = "월화수목금토일"


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def auto_weekday(date_str):
    """'2026. 7. 17.' → '2026. 7. 17.(금)' — (요일) 이미 있으면 그대로"""
    if "(" in date_str:
        return date_str
    m = re.match(r"\s*(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*$", date_str)
    if not m:
        return date_str
    y, mo, d = map(int, m.groups())
    wd = WEEKDAY[datetime.date(y, mo, d).weekday()]
    return f"{y}. {mo}. {d}.({wd})"


def top_paragraphs(sec_xml):
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


def set_text(pxml, text):
    """문단의 첫 <hp:t>를 text로 교체"""
    return re.sub(r"<hp:t>[^<]*</hp:t>", "<hp:t>%s</hp:t>" % esc(text), pxml, count=1)


def build(plan_path, out_path):
    plan = json.load(open(plan_path, encoding="utf-8"))
    work = tempfile.mkdtemp()
    with zipfile.ZipFile(TEMPLATE) as z:
        z.extractall(work)
    sec_path = os.path.join(work, "Contents", "section0.xml")
    xml = open(sec_path, encoding="utf-8").read()

    # ── 1. 고정부 문자열 치환 (표 셀 내부 포함) ──
    fixed = {
        PH["date"]:       auto_weekday(plan.get("date", PH["date"])),
        PH["chief"]:      plan.get("chief_line", PH["chief"]),
        PH["inquiry"]:    plan.get("inquiry", PH["inquiry"]),
        PH["headline"]:   "□ %s □" % plan.get("headline", "표제"),
        PH["subtitle"]:   "\u201c%s\u201d" % plan.get("subtitle", "부제"),
        PH["attachment"]: plan.get("attachment", PH["attachment"]),
    }
    for old, new in fixed.items():
        xml = xml.replace("<hp:t>%s</hp:t>" % old, "<hp:t>%s</hp:t>" % esc(new))

    # ── 2. 본문 프로토타입 확보 후 문단 조립 ──
    paras = top_paragraphs(xml)
    texts = [para_text(p[2]) for p in paras]

    def find(target):
        for i, t in enumerate(texts):
            if t.strip() == target:
                return i
        raise RuntimeError("프로토타입 문단을 찾을 수 없음: %r" % target)

    i_lv1, i_lv2 = find(PH["lv1"]), find(PH["lv2"])
    proto = {"lv1": paras[i_lv1][2], "lv2": paras[i_lv2][2]}

    body = []
    for kind, text in plan.get("paragraphs", []):
        if kind not in proto:
            raise RuntimeError("알 수 없는 문단 유형: %r (lv1/lv2만 허용)" % kind)
        body.append(set_text(proto[kind], PREFIX[kind] + text))

    # 프로토타입 두 문단 자리를 본문으로 교체
    xml = xml[: paras[i_lv1][0]] + "".join(body) + xml[paras[i_lv2][1]:]

    open(sec_path, "w", encoding="utf-8").write(xml)

    # ── 3. 재패키징 (mimetype 우선·STORED) ──
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


if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
