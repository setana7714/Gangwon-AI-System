# hwp-hwpx-writer

교육청 업무용 한글 문서(HWP/HWPX)를 읽고, 분석하고, HWPX 형식으로 출력하는 공통 문서 처리 스킬이다.

## 사용 시나리오

- HWP 읽어서 내용 요약
- HWPX 읽어서 문서 구조 분석
- HWP 내용을 HWPX로 변환
- 기존 HWPX 문서 일부 문구 수정
- 공문 초안을 HWPX 파일로 생성
- 계획서 초안을 HWPX 파일로 생성
- 표가 포함된 문서를 HWPX로 생성

## 기본 원칙

- 원본 HWP/HWPX 문서는 절대 직접 수정하지 않는다.
- 출력은 기본적으로 HWPX 형식으로 생성한다.
- 제목, 본문, 표, 붙임, 글머리표 구조를 최대한 유지한다.
- 확인되지 않은 정보는 `[확인 필요]`로 표시한다.
- 파일 생성 후 열림 여부와 문서 무결성을 확인한다.
- 원본 문서 파일, 문서번호, 학교명, 개인정보, 민감정보는 GitHub에 저장하지 않는다.

## 구성

```text
hwp-hwpx-writer/
├── SKILL.md
├── README.md
├── references/
│   └── format-guide.md
├── examples/
│   └── .gitkeep
└── scripts/
    └── .gitkeep
```
