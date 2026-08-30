'use strict';

const fs = require('node:fs');
const path = require('node:path');

const workflowPath = path.join(__dirname, 'line-hr-attendance-trial.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

const recognitionPrompt = `You are classifying and reading a Taiwanese restaurant handwritten work shift / attendance sheet. Return valid JSON ONLY, with no markdown, code fences, or prose.

Use exactly this structure:
{
  "is_attendance_sheet": boolean,
  "sheet_type": "內場" | "外場／洗滌" | "行政／洗滌" | "未知",
  "departments": string[],
  "header_sequence": string[],
  "date": string | null,
  "employees": [
    {
      "name": string | null,
      "department": "內場" | "外場" | "行政" | "洗滌" | null,
      "shifts": [{"start": string | null, "end": string | null}],
      "off_or_unclear": boolean,
      "late_marked": boolean,
      "changed_to_off": boolean,
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
2. Determine the sheet and employee departments from visible titles and section stickers:
   - Set sheet_type=行政／洗滌 when the title or stickers show 行政 and/or 洗滌.
   - Set sheet_type=外場／洗滌 for an 外場 sheet, including an unnumbered 上班/下班 header.
   - Otherwise set sheet_type=內場 for the unnumbered header.
   - A small sticker reading 行政 or 洗滌 is a section marker, not an employee name. It applies to the employee rows after it until the next section sticker. Set each employee.department to that section.
   - Record every visible section label in departments. If a row's section truly cannot be determined, use null and add a warning.
3. Preserve printed Chinese names exactly. Never substitute a similar-looking character. In particular, distinguish 羿 from 翠 and 蕙 from 慧. If a name cannot be read confidently, use null and explain its row/location.
4. Red handwritten annotations have fixed meanings and are not uncertainty by themselves:
   - 紅筆「遲」means the employee was late. Set late_marked=true, preserve every readable shift time, and do NOT set needs_review merely because of this annotation.
   - 紅筆「改休」means the employee changed to a day off. Set changed_to_off=true, shifts=[], off_or_unclear=true, and do NOT set needs_review merely because of this annotation.
   - For all other rows set late_marked=false and changed_to_off=false.
5. A slash, 休, or blank schedule means shifts=[] and off_or_unclear=true.
6. Convert readable times to 24-hour HH:mm. Examples: 930=>09:30, 15=>15:00, 2030=>20:30, 2145=>21:45.
7. Each numbered 上班/下班 pair is one shift. Preserve one, two, or three complete shifts in chronological order. Never merge split shifts.
8. A clear start and end time may be written across non-adjacent time columns. If their chronological pairing is still unambiguous, keep the complete shift and set needs_review=false; column placement alone is not a review reason.
9. An unnumbered four-column sheet may squeeze six handwritten times into those four cells by stacking two times in a cell. When exactly six chronological times are clear, sort them chronologically and return three pairs: time1-time2, time3-time4, time5-time6. Example: 10, 14, 14:30, 16, 16:30, 20 => 10:00-14:00, 14:30-16:00, 16:30-20:00. Do not treat the fifth time as the second shift's clock-out.
10. Distinguish similar handwritten hour digits such as 17 from 19 by inspecting the original strokes; never change 17:45 to 19:45 merely from context.
11. If a cell contains overwritten, stacked, crossed-out, or multiple possible times, use the clearly final uncrossed value only. If the final value or pairing is genuinely uncertain, keep null where needed and set needs_review=true with a precise reason. Never invent a third shift unless six clear chronological times are visible.
12. Set needs_review=true only when the name, department, date, time, correction, or start/end pairing is genuinely uncertain after applying the fixed red-annotation rules above.
13. confidence must be between 0 and 1.`;

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

schedule.departments = Array.isArray(schedule.departments)
  ? [...new Set(schedule.departments.map((value) => String(value || '').trim()).filter(Boolean))]
  : [];
const hasFrontDepartment = schedule.departments.some((value) => value.includes('外場'));
const hasKitchenDepartment = schedule.departments.some((value) => value.includes('內場'));
const hasAdminDepartment = schedule.departments.some((value) => value.includes('行政'));
const hasWashDepartment = schedule.departments.some((value) => /洗滌|洗碗/.test(value));
schedule.sheet_type = hasAdminDepartment || hasWashDepartment
  ? '行政／洗滌'
  : hasFrontDepartment
  ? '外場／洗滌'
  : (['內場', '外場／洗滌', '行政／洗滌'].includes(schedule.sheet_type)
    ? schedule.sheet_type
    : (headers.some((header) => /[123]$/.test(header)) ? '外場／洗滌' : '內場'));
schedule.employees = schedule.employees.map((employee) => {
  const reviewReason = String(employee?.review_reason || '').trim();
  const shifts = Array.isArray(employee?.shifts) ? employee.shifts.slice(0, 3) : [];
  const hasCompleteShift = shifts.length > 0 && shifts.every((shift) => shift?.start && shift?.end);
  const lateMarked = employee?.late_marked === true || /(?:紅筆|marked).*?(?:遲|late)|(?:遲|late).*?(?:紅筆|red)/i.test(reviewReason);
  const changedToOff = employee?.changed_to_off === true || /改休|changed?\s+to\s+(?:a\s+)?day\s+off/i.test(reviewReason);
  const hasGenuineUncertainty = /不清|難辨|無法|unclear|illegible|ambiguous|uncertain|cannot|can't|overwrit|crossed|multiple possible/i.test(reviewReason);
  const annotationOnlyReview = !hasGenuineUncertainty && (lateMarked || changedToOff);
  return {
    ...employee,
    department: employee?.department
      || (hasFrontDepartment ? '外場' : null)
      || (hasAdminDepartment && !hasWashDepartment ? '行政' : null)
      || (hasWashDepartment && !hasAdminDepartment ? '洗滌' : null),
    shifts: changedToOff ? [] : shifts,
    off_or_unclear: changedToOff ? true : employee?.off_or_unclear === true,
    late_marked: lateMarked,
    changed_to_off: changedToOff,
    needs_review: annotationOnlyReview && (changedToOff || hasCompleteShift)
      ? false
      : employee?.needs_review === true,
    review_reason: annotationOnlyReview ? null : (employee?.review_reason || null)
  };
});
return [{ json: schedule }];`;

const recognitionNode = workflow.nodes.find((node) => node.name === '辨識下班條');
const normalizeNode = workflow.nodes.find((node) => node.name === '整理辨識結果');
const lineResponseNode = workflow.nodes.find((node) => node.name === '回傳LINE人事群');
const explanationNode = workflow.nodes.find((node) =>
  ['寫入正常人員NUEIP說明', '寫入當日部門全部打卡說明'].includes(node.name)
);
const scheduleSplitNode = workflow.nodes.find((node) => node.name === '逐一處理正常人員班表');
if (!recognitionNode || !normalizeNode || !lineResponseNode || !explanationNode || !scheduleSplitNode) {
  throw new Error('Attendance workflow nodes were not found');
}

recognitionNode.parameters.text = recognitionPrompt;
normalizeNode.parameters.jsCode = normalizeCode;
lineResponseNode.parameters.jsonBody = `={{ (() => { const isFrontWash = $('整理辨識結果').first().json.sheet_type === '外場／洗滌'; const lineMessages = ($json.lineMessages || []).slice(0, 5).map(text => isFrontWash ? String(text).replace('店別：南港內場', '店別：南港外場／洗滌') : String(text)); return { to: $('僅處理下班條照片').first().json.event.source.groupId, messages: lineMessages.map(text => ({ type: 'text', text })) }; })() }}`;
explanationNode.name = '寫入當日部門全部打卡說明';
explanationNode.position = [1120, 0];
explanationNode.parameters.jsonBody = `={{ { action: 'sync_department_explanations', mode: 'commit', schedule: $json } }}`;
const comparisonNode = workflow.nodes.find((node) => node.name === 'NUEIP每日出勤比對');
comparisonNode.position = [1344, 0];
lineResponseNode.position = [1568, -112];
scheduleSplitNode.position = [1568, 112];
scheduleSplitNode.parameters.jsCode = `const input = $input.first().json;
const normalRecords = Array.isArray(input.normalRecords) ? input.normalRecords : [];
return [{ json: { normalRecords } }];`;
const scheduleCommitNode = workflow.nodes.find((node) => node.name === '寫入正常人員NUEIP班表');
scheduleCommitNode.position = [1792, 112];

workflow.connections['整理辨識結果'] = {
  main: [[{ node: '寫入當日部門全部打卡說明', type: 'main', index: 0 }]]
};
workflow.connections['寫入當日部門全部打卡說明'] = {
  main: [[{ node: 'NUEIP每日出勤比對', type: 'main', index: 0 }]]
};
workflow.connections['NUEIP每日出勤比對'] = {
  main: [[
    { node: '回傳LINE人事群', type: 'main', index: 0 },
    { node: '逐一處理正常人員班表', type: 'main', index: 0 }
  ]]
};
delete workflow.connections['寫入正常人員NUEIP說明'];
fs.writeFileSync(workflowPath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
console.log(workflowPath);
