const config = window.SURVEY_CONFIG || {};
const surveyData = window.SURVEY_DATA || {};
const storageKey = surveyData.storageKey || "gw-art-survey-responses";
let responses = [];
let charts = {};

function localRows() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function loadRemoteRows() {
  return new Promise((resolve) => {
    if (!config.appsScriptUrl) {
      resolve([]);
      return;
    }
    const cb = `surveyCallback_${Date.now()}`;
    const script = document.createElement("script");
    window[cb] = (data) => {
      resolve(Array.isArray(data.responses) ? data.responses : []);
      script.remove();
      delete window[cb];
    };
    script.onerror = () => resolve([]);
    script.src = `${config.appsScriptUrl}?callback=${cb}`;
    document.body.appendChild(script);
  });
}

function countBy(field, values) {
  return values.map((value) => responses.filter((row) => row[field] === value).length);
}

function questionIds() {
  const ids = new Set();
  responses.forEach((row) => Object.keys(row.answers || {}).forEach((id) => ids.add(id)));
  return [...ids].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}

function averageFor(id) {
  const values = responses.map((row) => Number(row.answers?.[id])).filter(Boolean);
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function positiveRateFor(id) {
  const values = responses.map((row) => Number(row.answers?.[id])).filter(Boolean);
  if (!values.length) return 0;
  return Math.round((values.filter((value) => value >= 4).length / values.length) * 100);
}

function drawChart(id, type, labels, data, label) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), {
    type,
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: ["#1d4ed8", "#0891b2", "#22c55e", "#f59e0b", "#64748b"],
        borderColor: "#ffffff",
        borderWidth: type === "bar" ? 0 : 3,
        borderRadius: type === "bar" ? 8 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: type !== "bar", labels: { boxWidth: 12, usePointStyle: true } } },
      scales: type === "bar" ? {
        y: { beginAtZero: true, max: label.includes("긍정") ? 100 : undefined, grid: { color: "#e5edf7" } },
        x: { grid: { display: false } }
      } : {}
    }
  });
}

function render() {
  const typeLabels = surveyData.respondentTypes || ["학생", "학부모", "지도교사"];
  const disciplineLabels = surveyData.disciplines || ["무용", "음악", "미술"];
  document.querySelector("#totalCount").textContent = responses.length;
  document.querySelector("#studentCount").textContent = countBy("respondentType", ["학생"])[0];
  document.querySelector("#parentCount").textContent = countBy("respondentType", ["학부모"])[0];
  document.querySelector("#teacherCount").textContent = countBy("respondentType", ["지도교사"])[0];

  const qIds = questionIds();
  drawChart("typeChart", "doughnut", typeLabels, countBy("respondentType", typeLabels), "응답 수");
  drawChart("disciplineChart", "doughnut", disciplineLabels, countBy("discipline", disciplineLabels), "응답 수");
  drawChart("averageChart", "bar", qIds, qIds.map(averageFor), "문항 평균");
  drawChart("positiveChart", "bar", qIds, qIds.map(positiveRateFor), "긍정 응답률(%)");

  document.querySelector("#commentRows").innerHTML = responses.map((row) => `
    <tr>
      <td>${formatDate(row.submittedAt)}</td>
      <td>${row.respondentType || ""}</td>
      <td>${row.discipline || ""}</td>
      <td>${escapeHtml(row.positiveComment || "")}</td>
      <td>${escapeHtml(row.improvementComment || "")}</td>
      <td>${escapeHtml(row.futureComment || "")}</td>
    </tr>
  `).join("");
  renderQr();
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("ko-KR");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

async function refreshRows() {
  const remote = await loadRemoteRows();
  const merged = [...remote, ...localRows()];
  const byId = new Map(merged.map((row) => [row.id || `${row.submittedAt}-${Math.random()}`, row]));
  responses = [...byId.values()].sort((a, b) => String(a.submittedAt).localeCompare(String(b.submittedAt)));
  document.querySelector("#status").textContent = config.appsScriptUrl ? "구글시트와 브라우저 저장 응답을 함께 불러왔습니다." : "브라우저 저장 응답만 표시 중입니다. config.js에 Apps Script 주소를 넣으면 전체 응답을 불러옵니다.";
  document.querySelector("#status").className = "status good";
  render();
}

function rowsForExcel() {
  const ids = questionIds();
  return responses.map((row) => {
    const base = {
      제출일시: formatDate(row.submittedAt),
      응답자구분: row.respondentType,
      분야: row.discipline,
      학교급: row.schoolLevel,
      성별: row.gender
    };
    ids.forEach((id) => { base[id] = row.answers?.[id] || ""; });
    base["좋았던 점"] = row.positiveComment || "";
    base["보완점"] = row.improvementComment || "";
    base["내년 대회 바람"] = row.futureComment || "";
    return base;
  });
}

function exportExcel() {
  const ids = questionIds();
  const stats = ids.map((id) => ({
    문항: id,
    문항내용: findQuestionText(id),
    평균: averageFor(id),
    "긍정응답률(%)": positiveRateFor(id)
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rowsForExcel()), "전체응답");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(stats), "문항별통계");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rowsForExcel().filter((r) => r.응답자구분 === "학생")), "학생응답");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rowsForExcel().filter((r) => r.응답자구분 === "학부모")), "학부모응답");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rowsForExcel().filter((r) => r.응답자구분 === "지도교사")), "지도교사응답");
  XLSX.writeFile(workbook, "2026_강원학생예술실기대회_설문결과.xlsx");
}

function fallbackQuestionText(id) {
  const all = [
    ...(surveyData.commonQuestions || []),
    ...(surveyData.teacherQuestions || [])
  ];
  Object.values(surveyData.disciplineQuestions || {}).forEach((items) => all.push(...items));
  const index = Number(String(id).slice(1)) - 1;
  return all[index] || "";
}

function findQuestionText(id) {
  for (const row of responses) {
    if (row.questionTexts && row.questionTexts[id]) return row.questionTexts[id];
  }
  return fallbackQuestionText(id);
}

function analysisText() {
  const ids = questionIds();
  const total = responses.length;
  const best = ids.map((id) => ({ id, avg: averageFor(id), text: findQuestionText(id) })).sort((a, b) => b.avg - a.avg)[0];
  const positiveAverage = ids.length ? Math.round(ids.map(positiveRateFor).reduce((a, b) => a + b, 0) / ids.length) : 0;
  return [
    `본 조사는 ${config.eventName || "2026년 강원학생예술실기대회"} 참가 학생, 학부모, 지도교사를 대상으로 대회 운영 만족도와 개선 의견을 수렴하기 위해 실시하였다.`,
    `총 응답 수는 ${total}건이며, 분야별 응답은 무용 ${countBy("discipline", ["무용"])[0]}건, 음악 ${countBy("discipline", ["음악"])[0]}건, 미술 ${countBy("discipline", ["미술"])[0]}건으로 집계되었다.`,
    `전체 문항의 평균 긍정 응답률은 ${positiveAverage}%로 나타났으며, 대회가 학생의 예술적 성장과 발표 경험 확대에 긍정적으로 기여했다는 의견을 확인할 수 있다.`,
    best ? `가장 높은 평균을 보인 문항은 '${best.text}'이며 평균 ${best.avg}점으로 분석되었다.` : "응답이 누적되면 문항별 강점 분석이 자동 반영된다.",
    "서술형 의견은 대회 안내, 현장 진행, 발표 환경, 심사 신뢰도, 학생 성장 지원을 중심으로 정리되며, 향후 대회에서는 분야별 특성을 고려한 동선, 대기 공간, 시간 운영의 세부 보완이 필요하다."
  ];
}

async function exportHwpx() {
  try {
    const template = await loadHwpxTemplate();
    const zip = await JSZip.loadAsync(template);
    const sectionXml = await zip.file("Contents/section0.xml").async("string");
    const contentXml = await zip.file("Contents/content.hpf").async("string");
    const reportLines = buildReportLines();
    zip.file("mimetype", "application/hwp+zip", { compression: "STORE" });
    zip.file("Contents/section0.xml", replaceReportPlaceholder(sectionXml, reportLines));
    zip.file("Contents/content.hpf", updateHwpxMetadata(contentXml));
    zip.file("Preview/PrvText.txt", reportLines.join("\r\n"));
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      mimeType: "application/hwp+zip"
    });
    downloadBlob(blob, "2026_강원학생예술실기대회_설문분석보고서.hwpx");
  } catch (error) {
    document.querySelector("#status").textContent = `HWPX 생성 실패: ${error.message} GitHub Pages 또는 로컬 웹서버에서 실행해 주세요.`;
    document.querySelector("#status").className = "status error";
  }
}

async function loadHwpxTemplate() {
  const response = await fetch("./report-template.hwpx");
  if (!response.ok) {
    throw new Error("HWPX 템플릿 파일을 불러오지 못했습니다.");
  }
  return response.arrayBuffer();
}

function buildReportLines() {
  const ids = questionIds();
  const total = responses.length;
  const eventName = config.eventName || "2026년 강원학생예술실기대회";
  const typeLabels = surveyData.respondentTypes || ["학생", "학부모", "지도교사"];
  const disciplineLabels = surveyData.disciplines || ["무용", "음악", "미술"];
  const typeCounts = countBy("respondentType", typeLabels);
  const disciplineCounts = countBy("discipline", disciplineLabels);
  const percent = (count) => total ? Math.round((count / total) * 1000) / 10 : 0;
  const averageOf = (values) => values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : 0;
  const questionStats = ids.map((id) => ({
    id,
    text: findQuestionText(id),
    average: averageFor(id),
    positiveRate: positiveRateFor(id)
  }));
  const validQuestionStats = questionStats.filter((item) => item.average > 0);
  const rankedByAverage = [...validQuestionStats].sort((a, b) => b.average - a.average);
  const rankedByPositive = [...validQuestionStats].sort((a, b) => b.positiveRate - a.positiveRate);
  const totalAverage = averageOf(validQuestionStats.map((item) => item.average));
  const positiveAverage = validQuestionStats.length ? Math.round(averageOf(validQuestionStats.map((item) => item.positiveRate))) : 0;
  const bestAverage = rankedByAverage[0];
  const weakestAverage = rankedByAverage[rankedByAverage.length - 1];
  const bestPositive = rankedByPositive[0];
  const weakestPositive = rankedByPositive[rankedByPositive.length - 1];
  const comments = responses.filter((row) => row.positiveComment || row.improvementComment || row.futureComment);
  const reportComments = comments.slice(0, 20);

  const lines = [
    `${eventName} 설문 결과보고서`,
    "",
    "1. 조사 개요",
    `본 보고서는 ${eventName} 운영 결과를 확인하고 향후 대회 운영 개선 자료로 활용하기 위해 실시한 만족도 및 개선 의견 조사 결과를 정리한 것이다.`,
    `분석 대상은 관리자 대시보드에 집계된 총 ${total}건의 응답이며, 응답자 구분, 참가 분야, 문항별 평균, 긍정 응답률, 서술형 의견을 종합하여 작성하였다.`,
    "",
    "2. 응답 현황",
    `전체 응답 수: ${total}건`,
    "응답자 구분 차트 수치"
  ];

  typeLabels.forEach((label, index) => {
    lines.push(`- ${label}: ${typeCounts[index]}건(${percent(typeCounts[index])}%)`);
  });

  lines.push("참가 분야 차트 수치");
  disciplineLabels.forEach((label, index) => {
    lines.push(`- ${label}: ${disciplineCounts[index]}건(${percent(disciplineCounts[index])}%)`);
  });

  lines.push("", "3. 만족도 종합 분석");
  if (validQuestionStats.length) {
    lines.push(`문항별 평균 차트 기준 전체 평균: ${totalAverage}점`);
    lines.push(`긍정 응답률 차트 기준 전체 평균: ${positiveAverage}%`);
    if (bestAverage) lines.push(`평균 점수가 가장 높은 문항: ${bestAverage.id}. ${bestAverage.text} / 평균 ${bestAverage.average}점`);
    if (weakestAverage && weakestAverage !== bestAverage) lines.push(`평균 점수가 가장 낮은 문항: ${weakestAverage.id}. ${weakestAverage.text} / 평균 ${weakestAverage.average}점`);
    if (bestPositive) lines.push(`긍정 응답률이 가장 높은 문항: ${bestPositive.id}. ${bestPositive.text} / 긍정 응답률 ${bestPositive.positiveRate}%`);
    if (weakestPositive && weakestPositive !== bestPositive) lines.push(`긍정 응답률이 가장 낮은 문항: ${weakestPositive.id}. ${weakestPositive.text} / 긍정 응답률 ${weakestPositive.positiveRate}%`);
  } else {
    lines.push("응답이 누적되면 문항별 평균과 긍정 응답률이 자동으로 반영된다.");
  }

  lines.push("", "4. 문항별 세부 통계");
  if (questionStats.length) {
    questionStats.forEach((item) => {
      lines.push(`${item.id}. ${item.text}`);
      lines.push(`   - 문항 평균: ${item.average}점`);
      lines.push(`   - 긍정 응답률: ${item.positiveRate}%`);
    });
  } else {
    lines.push("현재 집계된 문항 응답이 없어 세부 통계를 산출하지 않았다.");
  }

  lines.push("", "5. 서술형 의견 정리");
  if (comments.length) {
    lines.push(`서술형 의견은 총 ${comments.length}건이 입력되었으며, 보고서에는 최대 20건의 주요 응답을 수록하였다.`);
    reportComments.forEach((row, index) => {
      lines.push(`${index + 1}. [${row.respondentType || "구분 없음"}/${row.discipline || "분야 없음"}]`);
      lines.push(`   - 좋았던 점: ${row.positiveComment || "-"}`);
      lines.push(`   - 보완점: ${row.improvementComment || "-"}`);
      lines.push(`   - 내년 대회 바람: ${row.futureComment || "-"}`);
    });
  } else {
    lines.push("현재 서술형 의견 응답은 없으며, 향후 응답이 누적되면 주요 의견이 자동으로 반영된다.");
  }

  lines.push("", "6. 종합 검토 의견");
  if (total && validQuestionStats.length) {
    lines.push(`대시보드 통계 기준 전체 문항 평균은 ${totalAverage}점, 평균 긍정 응답률은 ${positiveAverage}%로 집계되었다.`);
    lines.push("평균 점수와 긍정 응답률이 높은 문항은 향후 운영에서도 강점 요소로 유지하고, 상대적으로 낮게 나타난 문항과 서술형 보완 의견은 차기 대회 세부 운영 계획 수립 시 우선 검토할 필요가 있다.");
  } else {
    lines.push("현재 응답 데이터가 충분하지 않아 종합 검토 의견은 제한적으로 작성하였다. 실제 응답이 누적된 후 보고서를 다시 생성하면 대시보드 통계가 자동 반영된다.");
  }

  lines.push("", "7. 향후 활용", "본 결과보고서는 대회 운영 성과 확인, 차기 대회 개선 과제 도출, 교육청 내부 보고 및 학교 현장 안내 자료 작성의 기초 자료로 활용할 수 있다.");

  return lines;
}
function replaceReportPlaceholder(sectionXml, lines) {
  const paragraphs = lines.map((line, index) => hwpxParagraph(line || " ", index + 1)).join("");
  const placeholderParagraph = /<hp:p\b[^>]*>[\s\S]*?<hp:t>__REPORT_BODY__<\/hp:t>[\s\S]*?<\/hp:p>/;
  if (!placeholderParagraph.test(sectionXml)) {
    throw new Error("HWPX 템플릿에서 보고서 본문 위치를 찾지 못했습니다.");
  }
  return sectionXml.replace(placeholderParagraph, paragraphs);
}

function hwpxParagraph(text, index) {
  const vertpos = index * 1600;
  return `<hp:p id="${Date.now() + index}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0"><hp:run charPrIDRef="0"><hp:t>${escapeXml(text)}</hp:t></hp:run><hp:linesegarray><hp:lineseg textpos="0" vertpos="${vertpos}" vertsize="1000" textheight="1000" baseline="850" spacing="600" horzpos="0" horzsize="42520" flags="393216"/></hp:linesegarray></hp:p>`;
}

function updateHwpxMetadata(contentXml) {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  return contentXml
    .replace(/<opf:title>[\s\S]*?<\/opf:title>/, "<opf:title>2026년 강원학생예술실기대회 설문 분석 보고서</opf:title>")
    .replace(/<opf:meta name="ModifiedDate" content="text">[\s\S]*?<\/opf:meta>/, `<opf:meta name="ModifiedDate" content="text">${now}</opf:meta>`);
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char]));
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function publicUrl() {
  return config.publicUrl || location.href.replace(/admin\.html.*/, "index.html");
}

function renderQr() {
  const url = publicUrl();
  document.querySelector("#publicUrlText").textContent = url;
  if (window.QRCode) QRCode.toCanvas(document.querySelector("#qrCanvas"), url, { width: 180, margin: 1 });
}

function downloadQr() {
  const canvas = document.querySelector("#qrCanvas");
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "2026_강원학생예술실기대회_설문_QR.png";
  a.click();
}

document.querySelector("#unlock").addEventListener("click", () => {
  const loginStatus = document.querySelector("#loginStatus");
  if (document.querySelector("#passcode").value !== (config.adminPasscode || "")) {
    loginStatus.textContent = "관리자 암호가 맞지 않습니다.";
    loginStatus.hidden = false;
    return;
  }
  loginStatus.hidden = true;
  document.querySelector("#loginBox").hidden = true;
  document.querySelector("#dashboard").hidden = false;
  refreshRows();
});

document.querySelector("#passcode").addEventListener("keydown", (event) => {
  if (event.key === "Enter") document.querySelector("#unlock").click();
});

document.querySelector("#refresh").addEventListener("click", refreshRows);
document.querySelector("#downloadExcel").addEventListener("click", exportExcel);
document.querySelector("#downloadReport").addEventListener("click", exportHwpx);
document.querySelector("#downloadQr").addEventListener("click", downloadQr);


