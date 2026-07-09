#!/usr/bin/env python3
"""
render_cards.py — 강원교육청 홍보 카드뉴스 렌더러

입력: cards.json (스키마는 examples/cards_sample.json 및 SKILL.md 참조)
출력: <outdir>/card_1.png ... card_N.png  (기본 1080x1080)

두 가지 모드:
  - story : 딥 네이비 무대 배경 + 스포트라이트 (감성형)
  - admin : 크림 배경 + 네이비 텍스트 (행정형, 정보 전달)

모든 카드 하단에 BI 엠블럼(assets/emblem_color.png)과 날짜·장소를 넣는다.
폰트는 NanumMyeongjo/NanumGothic을 우선 사용하고, 없으면 자동 설치를
시도하며, 실패 시 Noto Serif/Sans CJK KR로 대체한다.

사용:
  python3 render_cards.py cards.json --outdir ./out --size 1080
"""
import argparse, base64, json, os, subprocess, sys, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT = os.path.dirname(HERE)
EMBLEM = os.path.join(SKILL_ROOT, "assets", "emblem_color.png")

# ---- 팔레트 -----------------------------------------------------------------
PALETTES = {
    "story": {
        "bg_top": "#0b2f52", "bg_mid": "#072138", "bg_bot": "#04162a",
        "kicker": "#a9c2dc", "accent": "#e8886a",
        "main": "#ffffff", "sub": "#ffd98a",
        "foot_main": "#dfe9f2", "foot_sub": "#9db8d4",
        "rule": "#3a5573", "spotlight": True,
    },
    "admin": {
        "bg_top": "#faf9f5", "bg_mid": "#f4f1ea", "bg_bot": "#eee9df",
        "kicker": "#064976", "accent": "#cc785c",
        "main": "#064976", "sub": "#b8623f",
        "foot_main": "#1f2d3a", "foot_sub": "#5a6b7a",
        "rule": "#cbb9a6", "spotlight": False,
    },
}

def _emblem_b64(px=96):
    from PIL import Image
    import io
    im = Image.open(EMBLEM).convert("RGBA")
    w, h = im.size
    im2 = im.resize((px, int(h * px / w)), Image.LANCZOS)
    buf = io.BytesIO(); im2.save(buf, format="PNG", optimize=True)
    ratio = h / w
    return base64.b64encode(buf.getvalue()).decode(), ratio

def _have_font(name):
    try:
        out = subprocess.run(["fc-list"], capture_output=True, text=True).stdout
        return name.lower() in out.lower()
    except Exception:
        return False

def ensure_fonts():
    """나눔 폰트 확보. 반환: (serif_family, sans_family)."""
    if _have_font("NanumMyeongjo") and _have_font("NanumGothic"):
        return "NanumMyeongjo", "NanumGothic"
    # 다운로드 시도 (raw.githubusercontent 허용 환경)
    fonts = {
        "NanumGothic.ttf": "ofl/nanumgothic/NanumGothic-Regular.ttf",
        "NanumGothicBold.ttf": "ofl/nanumgothic/NanumGothic-Bold.ttf",
        "NanumMyeongjo.ttf": "ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf",
        "NanumMyeongjoBold.ttf": "ofl/nanummyeongjo/NanumMyeongjo-Bold.ttf",
    }
    dest = os.path.expanduser("~/.fonts")
    os.makedirs(dest, exist_ok=True)
    ok = True
    for fn, path in fonts.items():
        url = "https://raw.githubusercontent.com/google/fonts/main/" + path
        try:
            subprocess.run(["curl", "-sL", "-o", os.path.join(dest, fn), url],
                           check=True, timeout=60)
        except Exception:
            ok = False
    subprocess.run(["fc-cache", "-f", dest], capture_output=True)
    if ok and _have_font("NanumMyeongjo"):
        return "NanumMyeongjo", "NanumGothic"
    # 최종 대체: Noto CJK (대부분 리눅스에 사전 설치)
    if _have_font("Noto Serif CJK KR"):
        return "Noto Serif CJK KR", "Noto Sans CJK KR"
    # 그래도 없으면 generic
    return "serif", "sans-serif"

def _esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

def build_svg(card, ev, pal, serif, sans, emblem_b64, emblem_ratio):
    W = 380
    main_lines = card.get("main", [])
    sub = card.get("sub", "")
    spotlight = pal["spotlight"] and card.get("spotlight", False)

    # main 글자 크기: 줄 수(세로) + 최장 줄 길이(가로) 둘 다로 맞춤
    n = len(main_lines)
    base = 35 if n <= 2 else (29 if n == 3 else 24)
    longest = max((len(l) for l in main_lines), default=1)
    fit = 300.0 / max(longest, 1)          # 한글 명조볼드 ≈ 1em, 안전폭 300
    msize = max(18, min(base, fit))
    lh = msize + 8
    block_h = n * lh
    start_y = 150 - block_h / 2 + lh - 8  # 중앙 정렬 기준

    parts = []
    parts.append(f'<svg width="{W}" height="{W}" viewBox="0 0 {W} {W}" '
                 f'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">')
    parts.append('<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
                 f'<stop offset="0" stop-color="{pal["bg_top"]}"/>'
                 f'<stop offset="0.55" stop-color="{pal["bg_mid"]}"/>'
                 f'<stop offset="1" stop-color="{pal["bg_bot"]}"/></linearGradient></defs>')
    parts.append(f'<rect x="0" y="0" width="{W}" height="{W}" fill="url(#bg)"/>')

    if spotlight:
        parts.append('<polygon points="190,0 150,380 230,380" fill="#ffe1a3" opacity="0.05"/>')
        parts.append('<polygon points="190,0 168,380 212,380" fill="#ffe8b8" opacity="0.07"/>')
        parts.append('<polygon points="190,0 182,380 198,380" fill="#fff2d6" opacity="0.08"/>')
        for cx, cy, r, op in [(118,150,2.2,0.7),(262,128,1.6,0.55),(292,205,2.6,0.5),
                              (92,238,1.8,0.6),(248,286,2.0,0.55),(132,300,1.5,0.5)]:
            parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#ffd98a" opacity="{op}"/>')

    # kicker (상단 라벨)
    parts.append(f'<text x="190" y="57" text-anchor="middle" font-family="{sans}" '
                 f'font-weight="bold" font-size="14.5" letter-spacing="2.5" '
                 f'fill="{pal["kicker"]}">{_esc(ev["title_label"])}</text>')
    parts.append(f'<line x1="150" y1="74" x2="230" y2="74" stroke="{pal["accent"]}" stroke-width="1.5"/>')

    # main (여러 줄)
    y = start_y
    for line in main_lines:
        parts.append(f'<text x="190" y="{y:.0f}" text-anchor="middle" font-family="{serif}" '
                     f'font-weight="bold" font-size="{msize}" fill="{pal["main"]}">{_esc(line)}</text>')
        y += lh

    # sub (길면 자동 축소)
    if sub:
        ssize = max(12, min(17, 322.0 / max(len(sub), 1)))
        parts.append(f'<text x="190" y="{y+14:.0f}" text-anchor="middle" font-family="{serif}" '
                     f'font-size="{ssize:.1f}" fill="{pal["sub"]}">{_esc(sub)}</text>')

    # 하단 바
    parts.append(f'<line x1="40" y1="316" x2="340" y2="316" stroke="{pal["rule"]}" stroke-width="0.5"/>')
    parts.append(f'<text x="40" y="342" text-anchor="start" font-family="{sans}" '
                 f'font-weight="bold" font-size="13" fill="{pal["foot_main"]}">{_esc(ev["date_line"])}</text>')
    parts.append(f'<text x="40" y="360" text-anchor="start" font-family="{sans}" '
                 f'font-size="11.5" fill="{pal["foot_sub"]}">{_esc(ev["place_line"])}</text>')

    # 로고 (우하단, 고정 크기·위치)
    ew = 66; eh = ew * emblem_ratio
    parts.append(f'<image xlink:href="data:image/png;base64,{emblem_b64}" '
                 f'x="272" y="{370-eh:.0f}" width="{ew}" height="{eh:.0f}"/>')

    parts.append('</svg>')
    return "".join(parts)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cards_json")
    ap.add_argument("--outdir", default="./out")
    ap.add_argument("--size", type=int, default=1080)
    args = ap.parse_args()

    import cairosvg
    with open(args.cards_json, encoding="utf-8") as f:
        data = json.load(f)

    mode = data.get("mode", "story")
    pal = PALETTES.get(mode, PALETTES["story"])
    ev = data["event"]
    serif, sans = ensure_fonts()
    emblem_b64, ratio = _emblem_b64()
    os.makedirs(args.outdir, exist_ok=True)

    made = []
    for i, card in enumerate(data["cards"], start=1):
        svg = build_svg(card, ev, pal, serif, sans, emblem_b64, ratio)
        out = os.path.join(args.outdir, f"card_{i}.png")
        cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=out,
                         output_width=args.size, output_height=args.size)
        made.append(out)
    print(f"[render_cards] mode={mode} fonts=({serif},{sans}) -> {len(made)} cards")
    for m in made:
        print("  ", m)

if __name__ == "__main__":
    main()
