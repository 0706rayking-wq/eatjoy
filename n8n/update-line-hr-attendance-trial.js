'use strict';

const fs = require('node:fs');
const path = require('node:path');

const workflowPath = path.join(__dirname, 'line-hr-attendance-trial.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

const recognitionPrompt = `You are classifying and reading a Taiwanese restaurant handwritten work shift / attendance sheet. Return valid JSON ONLY, with no markdown, code fences, or prose.

Use exactly this structure:
{
  "is_attendance_sheet": boolean,
  "sheet_type": "內場" | "外場／洗滌" | "未知",
  "departments": string[],
  "header_sequence": string[],
  "date": string | null,
  "employees": [
    {
      "name": string | null,
      "department": "內場" | "外場" | "洗滌" | null,
      "shifts": [{"start": string | null, "end": string | null}],
      "off_or_unclear": boolean,
      "needs_review": boolean,
      "review_reason": string | null
    }
  ],
  "warnings": string[],
  "confidence": number
}

Mandatory classification gate:
1. Set is_attendance_sheet=true ONLY when one visible printed table header row contains one of these consecutive work-time sequences:
   - 內場: 上班, 下班, 上班, 下班
   - 外場／洗滌: 上班1, 下班1, 上班2, 下班2
   - Three-shift variant: 上班1, 下班1, 上班2, 下班2, 上班3, 下班3
2. Copy one complete visible sequence verbatim into header_sequence. Full-width digits such as １, ２, ３ are acceptable as the same printed numbers.
3. Do not infer headers from handwritten times, employee rows, another document, or the expected template.
4. If no complete allowed sequence is clearly visible, set is_attendance_sheet=false, header_sequence to only the labels actually visible, date=null, employees=[], and stop.
5. A title, date, names, grid, or handwritten times is never sufficient without one allowed printed header sequence.

Extraction rules when and only when is_attendance_sheet=true:
1. Read EVERY printed employee row across every repeated 姓名 block, in visual order. Never omit a row because it has a slash, blank times, changed day off, or unclear handwriting.
2. Set sheet_type=內場 for the unnumbered header. Set sheet_type=外場／洗滌 for the numbered header. Record visible section labels such as 外場 or 洗滌 in departments and on each employee when clear; otherwise use null and add a warning.
3. Preserve printed Chinese names exactly. Never substitute a similar-looking character. If a name cannot be read confidently, use null and explain its row/location.
4. A slash, 改休, 休, or blank schedule means shifts=[] and off_or_unclear=true.
5. Convert readable times to 24-hour HH:mm. Examples: 930=>09:30, 15=>15:00, 2030=>20:30, 2145=>21:45.
6. Each numbered 上班/下班 pair is one shift. Preserve one, two, or three complete shifts in chronological order. Never merge split shifts.
7. If a cell contains overwritten, stacked, crossed-out, or multiple possible times, use the clearly final uncrossed value only. If the final value or pairing is uncertain, keep null where needed and set needs_review=true with a precise reason. Never invent a third shift.
8. Set needs_review=true when the name, department, date, time, correction, or start/end pairing is uncertain.
9. confidence must be between 0 and 1.`;

const normalizeCode = `const candidates = [
  $json.text,
  $json.content?.parts?.map((part) => part?.text).filter(Boolean).join('\\n'),
  $json.content?.text,
  $json.response?.text,
  $json.output
];
let raw = candidates.find((value) => typeof value === 'string' && value.trim());
if (!raw && typeof $json.content === 'string') raw = $json.content;
if (!raw) throw new Error('Gemini回傳缺少文字內容');
let cleaned = raw.replace(/^\\uFEFF/, '').replace(/^\\x60\\x60\\x60(?:json)?\\s*/i, '').replace(/\\x60\\x60\\x60\\s*$/i, '').trim();
const firstBrace = cleaned.indexOf('{');
const lastBrace = cleaned.lastIndexOf('}');
if (firstBrace >= 0 && lastBrace > firstBrace) cleaned = cleaned.slice(firstBrace, lastBrace + 1);
let schedule;
try { schedule = JSON.parse(cleaned); } catch (error) { throw new Error('Gemini回傳不是有效JSON'); }
if (typeof schedule === 'string') schedule = JSON.parse(schedule);

const fullWidthDigits = { '１': '1', '２': '2', '３': '3' };
const normalizeHeader = (value) => String(value || '')
  .replace(/[１２３]/g, (digit) => fullWidthDigits[digit])
  .replace(/\\s+/g, '');
const headers = Array.isArray(schedule.header_sequence)
  ? schedule.header_sequence.map(normalizeHeader)
  : [];
const allowedHeaderSequences = [
  ['上班', '下班', '上班', '下班'],
  ['上班1', '下班1', '上班2', '下班2'],
  ['上班1', '下班1', '上班2', '下班2', '上班3', '下班3']
];
const hasAllowedHeaderSequence = allowedHeaderSequences.some((requiredHeaders) =>
  headers.some((_, index) =>
    requiredHeaders.every((header, offset) => headers[index + offset] === header)
  )
);
if (schedule.is_attendance_sheet !== true || !hasAllowedHeaderSequence) return [];
if (!schedule.date || !Array.isArray(schedule.employees)) throw new Error('下班條缺少日期或員工資料');

schedule.sheet_type = ['內場', '外場／洗滌'].includes(schedule.sheet_type)
  ? schedule.sheet_type
  : (headers.some((header) => /[123]$/.test(header)) ? '外場／洗滌' : '內場');
schedule.departments = Array.isArray(schedule.departments)
  ? [...new Set(schedule.departments.map((value) => String(value || '').trim()).filter(Boolean))]
  : [];
schedule.employees = schedule.employees.map((employee) => ({
  ...employee,
  shifts: Array.isArray(employee?.shifts) ? employee.shifts.slice(0, 3) : []
}));
return [{ json: schedule }];`;

const recognitionNode = workflow.nodes.find((node) => node.name === '辨識下班條');
const normalizeNode = workflow.nodes.find((node) => node.name === '整理辨識結果');
const lineResponseNode = workflow.nodes.find((node) => node.name === '回傳LINE人事群');
if (!recognitionNode || !normalizeNode || !lineResponseNode) {
  throw new Error('Attendance workflow nodes were not found');
}

recognitionNode.parameters.text = recognitionPrompt;
normalizeNode.parameters.jsCode = normalizeCode;
lineResponseNode.parameters.jsonBody = `{{ (() => { const isFrontWash = $('整理辨識結果').first().json.sheet_type === '外場／洗滌'; const lineMessages = ($json.lineMessages || []).slice(0, 5).map(text => isFrontWash ? String(text).replace('店別：南港內場', '店別：南港外場／洗滌') : String(text)); return { to: $('僅處理下班條照片').first().json.event.source.groupId, messages: lineMessages.map(text => ({ type: 'text', text })) }; })() }}`;
fs.writeFileSync(workflowPath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
console.log(workflowPath);
