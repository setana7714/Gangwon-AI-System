const config = window.SURVEY_CONFIG || {};
const surveyData = window.SURVEY_DATA || {};
const storageKey = surveyData.storageKey || "gw-art-survey-responses";

const state = {
  respondentType: "",
  discipline: "",
  answers: {}
};

const form = document.querySelector("#surveyForm");
const questionList = document.querySelector("#questionList");
const completePanel = document.querySelector("#completePanel");
const respondentTypeGroup = document.querySelector("#respondentTypeGroup");
const disciplineGroup = document.querySelector("#disciplineGroup");
const studentFields = document.querySelector("#studentFields");
const textQuestionList = document.querySelector("#textQuestionList");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const currentQuestionText = document.querySelector("#currentQuestionText");
const totalQuestionText = document.querySelector("#totalQuestionText");
const formError = document.querySelector("#formError");
const surveyPeriod = document.querySelector("#surveyPeriod");
const submitButton = form.querySelector("button[type=\"submit\"]");

document.querySelector("#agencyName").textContent = surveyData.agencyName || "강원특별자치도교육청";
document.querySelector("#surveyTitle").textContent = config.title || surveyData.surveyTitle || document.title;
document.querySelector("#surveyLead").textContent = surveyData.surveyLead || "";
document.querySelector("#disciplineHint").textContent = surveyData.disciplineHint || "";
document.querySelector("#privacyNotice").textContent = surveyData.privacyNotice || "";
document.querySelector("#completeTitle").textContent = surveyData.completionTitle || "응답이 제출되었습니다.";
document.querySelector("#completeMessage").textContent = surveyData.completionMessage || "";

function createButton(value) {
  return `<button type="button" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`;
}

function renderStaticControls() {
  respondentTypeGroup.innerHTML = (surveyData.respondentTypes || []).map(createButton).join("");
  disciplineGroup.innerHTML = (surveyData.disciplines || []).map(createButton).join("");
  studentFields.innerHTML = (surveyData.studentFields || []).map((field) => `
    <label>${escapeHtml(field.label)}
      <select name="${escapeHtml(field.name)}">
        <option value="">${escapeHtml(field.placeholder || "선택")}</option>
        ${(field.options || []).map((option) => `<option>${escapeHtml(option)}</option>`).join("")}
      </select>
    </label>
  `).join("");
  textQuestionList.innerHTML = (surveyData.textQuestions || []).map((item) => `
    <label>${escapeHtml(item.label)}
      <textarea name="${escapeHtml(item.name)}" rows="5" placeholder="${escapeHtml(item.placeholder || "")}"></textarea>
    </label>
  `).join("");
}

function getQuestions() {
  const list = [...(surveyData.commonQuestions || [])];
  if (state.respondentType === "지도교사") list.push(...(surveyData.teacherQuestions || []));
  if (state.discipline) list.push(...((surveyData.disciplineQuestions || {})[state.discipline] || []));
  return list.map((text, index) => ({ id: `q${index + 1}`, text, number: index + 1 }));
}

function pruneAnswers(questions) {
  const validIds = new Set(questions.map((q) => q.id));
  Object.keys(state.answers).forEach((id) => {
    if (!validIds.has(id)) delete state.answers[id];
  });
}

function renderQuestions() {
  const questions = getQuestions();
  pruneAnswers(questions);
  totalQuestionText.textContent = `${questions.length}개 만족도 문항`;
  questionList.innerHTML = questions.map((q) => `
    <article class="question-card">
      <div class="question-meta">
        <span>문항 ${q.number}</span>
        <span>${q.number} / ${questions.length}</span>
      </div>
      <p class="question-title">${escapeHtml(q.text)}</p>
      <div class="choice-row" data-question="${q.id}">
        ${(surveyData.scale || []).map((item) => `
          <button type="button" data-value="${item.value}" class="${state.answers[q.id] === item.value ? "active" : ""}">
            <span>${escapeHtml(item.label)}</span>
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");
  updateProgress();
}

function updateConditionalSections() {
  document.querySelectorAll(".conditional").forEach((section) => {
    section.hidden = section.dataset.showFor !== state.respondentType;
  });
}

function updateProgress() {
  const questions = getQuestions();
  const answered = questions.filter((q) => state.answers[q.id]).length;
  const total = questions.length;
  const percent = total ? Math.round((answered / total) * 100) : 0;
  const firstMissingIndex = questions.findIndex((q) => !state.answers[q.id]);
  const current = total ? (firstMissingIndex === -1 ? total : firstMissingIndex + 1) : 0;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${percent}% 완료`;
  currentQuestionText.textContent = total ? `현재 ${current}번 문항` : "문항 준비 중";
}

function selectSegment(group, value) {
  const field = group.dataset.field;
  state[field] = value;
  group.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.value === value);
  });
  updateConditionalSections();
  renderQuestions();
  clearError();
}

document.querySelectorAll(".segmented").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    selectSegment(group, button.dataset.value);
  });
});

questionList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-value]");
  if (!button) return;
  const row = button.closest("[data-question]");
  state.answers[row.dataset.question] = Number(button.dataset.value);
  row.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  updateProgress();
  clearError();
});

function readLocalResponses() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveLocalResponse(response) {
  const rows = readLocalResponses();
  rows.push(response);
  localStorage.setItem(storageKey, JSON.stringify(rows));
}

function postToAppsScript(response) {
  if (!config.appsScriptUrl) return;
  const formEl = document.createElement("form");
  formEl.method = "POST";
  formEl.action = config.appsScriptUrl;
  formEl.target = "submitFrame";
  formEl.style.display = "none";
  const input = document.createElement("input");
  input.name = "payload";
  input.value = JSON.stringify(response);
  formEl.appendChild(input);
  document.body.appendChild(formEl);
  formEl.submit();
  formEl.remove();
}


function parseKoreanDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;
  const parsed = new Date(`${dateValue}T${timeValue}:00+09:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatSurveyDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return "";
  const [year, month, day] = dateValue.split("-").map(Number);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(`${dateValue}T00:00:00+09:00`);
  const weekday = weekdays[date.getDay()];
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}.(${weekday}) ${timeValue}`;
}

function updateSurveyPeriodDisplay() {
  if (!surveyPeriod) return;
  const startText = formatSurveyDateTime(config.surveyStartDate, config.surveyStartTime || "09:00");
  const endText = formatSurveyDateTime(config.surveyEndDate, config.surveyEndTime || "18:00");
  surveyPeriod.textContent = startText && endText ? `설문 기간\n${startText} ~\n${endText}` : "";
}

function getSurveyPeriodStatus(now = new Date()) {
  const start = parseKoreanDateTime(config.surveyStartDate, config.surveyStartTime || "09:00");
  const end = parseKoreanDateTime(config.surveyEndDate, config.surveyEndTime || "18:00");
  if (!start || !end) return { canSubmit: true, message: "" };
  if (now < start) {
    return { canSubmit: false, message: "" };
  }
  if (now > end) {
    return { canSubmit: false, message: "설문이 종료되었습니다." };
  }
  return { canSubmit: true, message: "" };
}

function applySurveyPeriodState(now = new Date()) {
  const status = getSurveyPeriodStatus(now);
  submitButton.disabled = !status.canSubmit;
  if (status.message) {
    showError(status.message);
  } else if (formError.textContent === "설문이 종료되었습니다.") {
    clearError();
  }
  return status;
}
function validate() {
  if (!state.respondentType) return "응답자 구분을 선택해 주세요.";
  if (!state.discipline) return "참가 분야를 선택해 주세요.";
  if (state.respondentType === "학생") {
    for (const field of surveyData.studentFields || []) {
      if (!form.elements[field.name]?.value) return `${field.label}을(를) 선택해 주세요.`;
    }
  }
  const missing = getQuestions().filter((q) => !state.answers[q.id]);
  if (missing.length) return "모든 만족도 문항에 응답해 주세요.";
  return "";
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearError() {
  formError.textContent = "";
  formError.hidden = true;
}

function textValue(data, name) {
  return data.get(name) || "";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const periodStatus = applySurveyPeriodState();
  if (!periodStatus.canSubmit) return;
  const error = validate();
  if (error) {
    showError(error);
    return;
  }
  const data = new FormData(form);
  const response = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
    submittedAt: new Date().toISOString(),
    respondentType: state.respondentType,
    discipline: state.discipline,
    schoolLevel: state.respondentType === "학생" ? textValue(data, "schoolLevel") : "",
    gender: state.respondentType === "학생" ? textValue(data, "gender") : "",
    answers: { ...state.answers },
    questionTexts: Object.fromEntries(getQuestions().map((q) => [q.id, q.text])),
    positiveComment: textValue(data, "positiveComment"),
    improvementComment: textValue(data, "improvementComment"),
    futureComment: textValue(data, "futureComment")
  };
  saveLocalResponse(response);
  postToAppsScript(response);
  form.hidden = true;
  completePanel.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector("#newResponse").addEventListener("click", () => {
  location.reload();
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

updateSurveyPeriodDisplay();
renderStaticControls();
updateConditionalSections();
renderQuestions();
applySurveyPeriodState();



