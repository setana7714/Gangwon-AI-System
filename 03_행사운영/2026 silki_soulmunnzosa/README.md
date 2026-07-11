# 2026년 강원학생예술실기대회 설문 웹 프로그램

## 구성

- `index.html`: 학생, 학부모, 지도교사용 설문 화면
- `admin.html`: Chart.js 대시보드, 엑셀 다운로드, HWPX 보고서 다운로드, QR 코드 생성
- `survey-data.js`: 설문 문항, 응답자 구분, 분야, 척도, 서술형 문항 설정
- `report-template.hwpx`: 한글 2022에서 생성한 HWPX 보고서 템플릿
- `config.js`: 배포 주소, Google Apps Script 주소, 관리자 암호 설정
- `apps-script/Code.gs`: Google Sheets에 응답을 저장하고 대시보드로 불러오는 백엔드

## 운영 구조

GitHub Pages는 정적 웹사이트만 호스팅하므로 응답 저장 기능이 없습니다. 여러 사람이 휴대폰과 컴퓨터로 응답하려면 아래처럼 운영합니다.

1. GitHub Pages: 설문 화면 배포
2. Google Apps Script: 응답 접수 API
3. Google Sheets: 응답 데이터 저장소

## Google Sheets 백엔드 설정

1. Google Sheets 새 문서를 만듭니다.
2. `확장 프로그램 > Apps Script`를 엽니다.
3. `apps-script/Code.gs` 내용을 붙여넣습니다.
4. `배포 > 새 배포 > 웹 앱`을 선택합니다.
5. 실행 권한은 본인, 접근 권한은 `모든 사용자`로 설정합니다.
6. 배포 후 생성되는 웹 앱 URL을 복사합니다.
7. `config.js`의 `appsScriptUrl`에 붙여넣습니다.

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소로 올립니다.
2. GitHub 저장소의 `Settings > Pages`에서 `Deploy from a branch`를 선택합니다.
3. Branch는 `main`, 폴더는 `/root`를 선택합니다.
4. 발급된 Pages 주소를 `config.js`의 `publicUrl`에 입력합니다.
5. 다시 커밋하고 푸시합니다.

## 관리자

- 기본 관리자 암호는 `config.js`의 `adminPasscode`입니다.
- 실제 운영 전 반드시 변경하세요.
- HWPX 보고서는 `report-template.hwpx`를 불러와 내부 `Contents/section0.xml`의 본문만 교체하는 방식으로 생성합니다.
- `admin.html`을 파일로 직접 열면 브라우저 보안 정책 때문에 HWPX 템플릿을 읽지 못할 수 있습니다. GitHub Pages 배포 주소 또는 로컬 웹서버에서 실행하세요.

## 다른 설문으로 바꾸는 방법

화면 구조, 제출 기능, 관리자 기능은 그대로 두고 `survey-data.js`만 수정하면 됩니다.

1. `surveyTitle`, `surveyLead`, `completionMessage`를 새 설문에 맞게 바꿉니다.
2. `respondentTypes`, `studentFields`, `disciplines`가 필요 없거나 다르면 항목 이름만 바꿉니다.
3. 객관식 척도는 `scale`에서 수정합니다.
4. 공통 만족도 문항은 `commonQuestions` 배열의 문장만 바꿉니다.
5. 분야별 추가 문항은 `disciplineQuestions`의 분야 이름과 문장만 바꿉니다.
6. 지도교사용 추가 문항은 `teacherQuestions` 배열에서 수정합니다.
7. 서술형 문항은 `textQuestions`의 `label`, `placeholder`만 바꿉니다.

예를 들어 180초 영화제, 하모니 페스티벌, 교사 연수, 학생 만족도 설문으로 바꿀 때는 `survey-data.js`의 설문 제목과 문항 배열만 교체하면 됩니다. `app.js`, `admin.js`, `apps-script/Code.gs`는 응답 저장 형식을 유지하므로 보통 수정하지 않습니다.

## 가정통신문용 문구

2026년 강원학생예술실기대회 운영 성과를 확인하고 향후 대회를 더욱 내실 있게 준비하기 위해 만족도 및 개선 의견 조사를 실시합니다. 학생, 학부모, 지도교사께서는 아래 QR 코드 또는 설문 주소로 접속하여 응답해 주시기 바랍니다. 본 설문은 이름을 수집하지 않으며, 응답 내용은 통계 분석과 개선방안 마련에만 활용됩니다.

설문 주소: `config.js`의 `publicUrl` 값

QR 코드는 `admin.html`에서 생성하여 다운로드할 수 있습니다.
