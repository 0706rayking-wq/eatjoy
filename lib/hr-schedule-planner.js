function minuteTime(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})(?::00)?$/);
  if (!match) return '';
  if (Number(match[1]) > 23 || Number(match[2]) > 59) return '';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function timeMinutes(value) {
  const normalized = minuteTime(value);
  if (!normalized) return null;
  const [hours, minutes] = normalized.split(':').map(Number);
  return hours * 60 + minutes;
}

function parseShiftOption(option) {
  const label = String(option?.label || '').trim();
  const match = label.match(/\((\d{1,2}:\d{2})\s*[~～\-]\s*(\d{1,2}:\d{2})\)/);
  if (!option?.value || !match || !minuteTime(match[1]) || !minuteTime(match[2])) return null;
  return {
    value: String(option.value),
    label,
    start: minuteTime(match[1]),
    end: minuteTime(match[2])
  };
}

function normalizeSegments(record) {
  const shifts = Array.isArray(record?.scheduledShifts) ? record.scheduledShifts : [];
  if (shifts.length < 1 || shifts.length > 3) return null;
  const segments = shifts.map((shift) => ({
    start: minuteTime(shift?.start),
    end: minuteTime(shift?.end)
  }));
  return segments.every((segment) => segment.start && segment.end) ? segments : null;
}

function chooseShift(segment, options) {
  // Current authorization requires an exact, unique shift for every segment.
  // A later end time or a duplicate label with another ID is not a match.
  const candidates = options.filter((option) => option.start === segment.start && option.end === segment.end);
  if (candidates.length === 0) {
    return { status: 'manual', reason: `找不到${segment.start}-${segment.end}精確班別` };
  }
  if (candidates.length > 1) return { status: 'manual', reason: `${segment.start}-${segment.end}有重複班別` };
  return { status: 'ready', shift: candidates[0] };
}

function planSchedule(records, rawOptions) {
  const seen = new Set();
  const options = (Array.isArray(rawOptions) ? rawOptions : []).map(parseShiftOption).filter((option) => {
    if (!option) return false;
    const key = JSON.stringify([option.value, option.label, option.start, option.end]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return records.map((record) => {
    const segments = normalizeSegments(record);
    if (!segments) return { ...record, status: 'manual', reason: '下班條須有一至三段完整時段' };
    const selected = [];
    for (let index = 0; index < segments.length; index += 1) {
      const result = chooseShift(segments[index], options);
      if (result.status !== 'ready') return { ...record, status: 'manual', reason: result.reason };
      selected.push(result.shift);
    }
    return { ...record, status: 'ready', selectedShifts: selected };
  });
}

module.exports = { minuteTime, parseShiftOption, planSchedule, timeMinutes };
