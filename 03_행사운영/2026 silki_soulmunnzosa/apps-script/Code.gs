const SHEET_NAME = "responses";

function doPost(e) {
  const payload = e.parameter.payload ? JSON.parse(e.parameter.payload) : {};
  appendResponse_(payload);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const rows = readResponses_();
  const body = JSON.stringify({ responses: rows });
  if (e.parameter.callback) {
    return ContentService.createTextOutput(`${e.parameter.callback}(${body});`).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function appendResponse_(payload) {
  const sheet = getSheet_();
  ensureHeader_(sheet);
  sheet.appendRow([
    payload.id || Utilities.getUuid(),
    payload.submittedAt || new Date().toISOString(),
    payload.respondentType || "",
    payload.discipline || "",
    payload.schoolLevel || "",
    payload.gender || "",
    JSON.stringify(payload.answers || {}),
    JSON.stringify(payload.questionTexts || {}),
    payload.positiveComment || "",
    payload.improvementComment || "",
    payload.futureComment || ""
  ]);
}

function readResponses_() {
  const sheet = getSheet_();
  ensureHeader_(sheet);
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1);
  return rows.filter((row) => row[0]).map((row) => ({
    id: row[0],
    submittedAt: row[1],
    respondentType: row[2],
    discipline: row[3],
    schoolLevel: row[4],
    gender: row[5],
    answers: parseJson_(row[6], {}),
    questionTexts: parseJson_(row[7], {}),
    positiveComment: row[8],
    improvementComment: row[9],
    futureComment: row[10]
  }));
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(["id", "submittedAt", "respondentType", "discipline", "schoolLevel", "gender", "answers", "questionTexts", "positiveComment", "improvementComment", "futureComment"]);
}

function parseJson_(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}
