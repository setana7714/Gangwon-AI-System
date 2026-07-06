#!/usr/bin/env python3
"""PPTX 도형 무한 회전(스핀) 애니메이션 주입기.

사용법:
    python inject_spin.py <slide_xml_path> <shape_name> [duration_ms]

- slide_xml_path : unpack.py로 푼 슬라이드 XML 경로 (예: unpacked/ppt/slides/slide17.xml)
- shape_name     : 회전시킬 도형의 name (PptxGenJS에서는 objectName으로 지정)
- duration_ms    : 1회전 시간(기본 8000ms). 짧을수록 빨리 돕니다.

동작: 슬라이드 진입 시 자동 시작, 무한 반복(repeatCount=indefinite), 시계방향 360°.
주의: 대상 도형은 회전 중심이 어긋나지 않도록 정중앙 정렬된 이미지
      (assets/symbol_centered.png) 사용을 권장.
"""
import sys

TIMING = (
'<p:timing><p:tnLst><p:par>'
'<p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
'<p:seq concurrent="1" nextAc="seek">'
'<p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
'<p:par><p:cTn id="3" fill="hold">'
'<p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst>'
'<p:childTnLst><p:par><p:cTn id="4" fill="hold">'
'<p:stCondLst><p:cond delay="0"/></p:stCondLst>'
'<p:childTnLst><p:par>'
'<p:cTn id="5" presetID="8" presetClass="emph" presetSubtype="0" repeatCount="indefinite" fill="hold" nodeType="withEffect">'
'<p:stCondLst><p:cond delay="0"/></p:stCondLst>'
'<p:childTnLst>'
'<p:animRot by="21600000">'
'<p:cBhvr><p:cTn id="6" dur="{DUR}" fill="hold"/>'
'<p:tgtEl><p:spTgt spid="{SPID}"/></p:tgtEl>'
'<p:attrNameLst><p:attrName>r</p:attrName></p:attrNameLst>'
'</p:cBhvr></p:animRot>'
'</p:childTnLst></p:cTn></p:par></p:childTnLst>'
'</p:cTn></p:par></p:childTnLst>'
'</p:cTn></p:par></p:childTnLst></p:cTn>'
'<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst>'
'</p:seq></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>'
)

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    path, name = sys.argv[1], sys.argv[2]
    dur = sys.argv[3] if len(sys.argv) > 3 else "8000"
    xml = open(path, encoding="utf-8").read()
    if "<p:timing>" in xml:
        print("이미 timing 노드가 존재합니다. 중복 주입을 건너뜁니다."); sys.exit(0)
    key = f'name="{name}"'
    if key not in xml:
        print(f'도형 "{name}" 을(를) 찾을 수 없습니다.'); sys.exit(1)
    spid = xml.split(key)[0].rsplit('id="', 1)[1].split('"')[0]
    xml = xml.replace("</p:sld>", TIMING.replace("{SPID}", spid).replace("{DUR}", dur) + "</p:sld>")
    open(path, "w", encoding="utf-8").write(xml)
    print(f"OK: spid={spid}, {dur}ms/회전, 무한 반복 주입 완료")

if __name__ == "__main__":
    main()
