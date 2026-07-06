#!/usr/bin/env python3
"""
계획서 HWPX 표 삽입 스크립트 v2 (2026. 7. 병합 버그 수정판)
build_plan.py 텍스트본의 자리표시(@@TBL_…@@)를 실제 표로 교체한다.

★ v2 핵심 수정: 셀 병합 정상화
  python-hwpx의 table.merge_cells()는 '덮인 셀'을 제거하지 않아
  행의 colSpan 합이 colCnt를 초과 → 한글이 표를 '손상'으로 인식(편집 불가·파일 삭제).
  v2는 (1) 덮인 셀을 remove()로 제거하고 (2) 마스터에 set_span(rowSpan,colSpan)을
  적용해, 각 행 colSpan 합 = colCnt가 되도록 보장한다.

── 워크플로우 ─────────────────────────────────────────────
 1) plan.json 항목에 자리표시를 lv2로 넣는다: ["lv2", "@@TBL_SCHEDULE@@"]
 2) python build_plan.py plan.json 텍스트본.hwpx
 3) tables.json 작성 후:
        python insert_tables.py 텍스트본.hwpx tables.json 최종.hwpx

── tables.json 구조 (자리표시 → 표 정의) ─────────────────
{
  "@@TBL_BUDGET@@": {
    "widths": [16, 62, 18],
    "header": ["사업항목", "산출내역", "지출금액"],
    "rows":   [["간담회비", "…산출근거…", "270,000"],
               ["합    계", "", "270,000"]],
    "merges": [[2, 0, 2, 1]],   # [시작행,시작열,끝행,끝열] — 끝 좌표 포함
    "shade_header": true
  }
}
※ merges 좌표는 '원본 그리드' 기준(끝 좌표 포함). 병합 후 덮인 셀에 넣은 텍스트는 무시된다.
※ 표 셀 글자는 자리표시 문단의 charPr을 승계. 정렬(가운데 등)은 한글에서 표 선택 후 일괄 조정 가능.
"""
import sys, os, json
from hwpx.document import HwpxDocument

HEAD_SHADE = "#FBE4D5"      # 원본 헤더 살구톤
LINE_COLOR = "#595959"      # 표 테두리(진회색)
LINE_WIDTH = "0.12 mm"


def merge_rect(tbl, r1, c1, r2, c2, warnings, ph):
    """올바른 병합: 덮인 셀 제거 후 마스터에 span 부여."""
    try:
        covered = []
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                if (r, c) == (r1, c1):
                    continue
                covered.append(tbl.cell(r, c))   # 제거 전에 참조 먼저 수집
        master = tbl.cell(r1, c1)
        for cell in covered:
            cell.remove()
        master.set_span(r2 - r1 + 1, c2 - c1 + 1)   # (rowSpan, colSpan)
    except Exception as e:
        warnings.append("병합 실패 %s [%d,%d,%d,%d]: %s" % (ph, r1, c1, r2, c2, e))


def build(in_path, spec_path, out_path):
    if not os.path.exists(in_path):
        sys.exit("입력 HWPX를 찾을 수 없음: %s" % in_path)
    if not os.path.exists(spec_path):
        sys.exit("tables.json을 찾을 수 없음: %s" % spec_path)
    try:
        spec = json.load(open(spec_path, encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit("tables.json 파싱 실패 — JSON 문법 확인: %s" % e)

    doc = HwpxDocument.open(in_path)
    sec = doc.sections[0]
    line_bf = doc.ensure_border_fill(
        border_color=LINE_COLOR, border_width=LINE_WIDTH,
        active_borders=["left", "right", "top", "bottom"])

    def find_para(needle):
        for p in sec.paragraphs:
            if needle in (p.text or ""):
                return p
        return None

    warnings = []
    for ph, t in spec.items():
        p = find_para(ph)
        if p is None:
            warnings.append("자리표시 없음 → 건너뜀: %s" % ph)
            continue
        header = t.get("header", [])
        rows = t.get("rows", [])
        widths = t.get("widths")
        ncol = len(widths) if widths else (len(header) or (len(rows[0]) if rows else 1))
        nrow = (1 if header else 0) + len(rows)
        if nrow == 0 or ncol == 0:
            warnings.append("빈 표 정의 → 건너뜀: %s" % ph)
            continue

        cpr = p.runs[0].char_pr_id_ref if p.runs else None
        p.clear_text()
        tbl = p.add_table(nrow, ncol, border_fill_id_ref=line_bf, char_pr_id_ref=cpr)
        if widths:
            tbl.set_column_widths(widths)

        r0 = 0
        if header:
            for c, h in enumerate(header):
                tbl.set_cell_text(0, c, str(h))
                if t.get("shade_header"):
                    tbl.set_cell_shading(0, c, HEAD_SHADE)
            r0 = 1
        for ri, row in enumerate(rows):
            for c, v in enumerate(row):
                tbl.set_cell_text(r0 + ri, c, str(v))

        # 병합(있으면) — 텍스트 입력 후 수행
        for mg in t.get("merges", []):
            if len(mg) != 4:
                warnings.append("merges 형식 오류 %s: %r ([r1,c1,r2,c2])" % (ph, mg))
                continue
            merge_rect(tbl, mg[0], mg[1], mg[2], mg[3], warnings, ph)
        tbl.mark_dirty()

    doc.save_to_path(out_path)

    # ── 그리드 정합 자체 검증 (각 행 colSpan 합 == colCnt) ──
    import zipfile, re
    s = zipfile.ZipFile(out_path).read('Contents/section0.xml').decode('utf-8')
    for tm in re.finditer(r'<hp:tbl\b[^>]*colCnt="(\d+)"[^>]*>(.*?)</hp:tbl>', s, re.S):
        cc = int(tm.group(1))
        for ri, row in enumerate(re.findall(r'<hp:tr>(.*?)</hp:tr>', tm.group(2), re.S)):
            ssum = sum(int(x) for x in re.findall(r'colSpan="(\d+)"', row))
            if ssum != cc:
                warnings.append("⚠️ 그리드 불일치: 어떤 표 %d행 colSpan합=%d ≠ colCnt=%d" % (ri, ssum, cc))

    print("OK:", out_path)
    if warnings:
        print("\n⚠ 확인 필요 항목 (%d건):" % len(warnings))
        for i, w in enumerate(warnings, 1):
            print("  %d. %s" % (i, w))
    else:
        print("그리드 정합 검증: 전 표 정상")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit("사용법: python insert_tables.py 입력.hwpx tables.json 출력.hwpx")
    build(sys.argv[1], sys.argv[2], sys.argv[3])
