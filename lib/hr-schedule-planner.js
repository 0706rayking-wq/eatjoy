function minuteTime(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
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
  if (!option?.value || !match) return null;
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

function chooseShift(segment, options, isFinal) {
  const sameStart = options.filter((option) => option.start === segment.start);
  const candidates = isFinal
    ? sameStart
    : sameStart.filter((option) => option.end === segment.end);
  if (candidates.length === 0) {
    return { status: 'manual', reason: isFinal ? `找不到${segment.start}開始的班別` : `找不到${segment.start}-${segment.end}班別` };
  }

  if (!isFinal) {
    if (candidates.length > 1) return { status: 'manual', reason: `${segment.start}-${segment.end}有重複班別` };
    return { status: 'ready', shift: candidates[0] };
  }

  const targetEnd = timeMinutes(segment.end);
  const ranked = candidates.map((option) => ({
    option,
    distance: Math.abs(timeMinutes(option.end) - targetEnd)
  })).sort((left, right) => left.distance - right.distance);
  if (ranked.length > 1 && ranked[0].distance === ranked[1].distance) {
    return { status: 'manual', reason: `${segment.start}開始有多個同等接近的班別` };
  }
  return { status: 'ready', shift: ranked[0].option };
}

function planSchedule(records, rawOptions) {
  const seen = new Set();
  const options = (Array.isArray(rawOptions) ? rawOptions : []).map(parseShiftOption).filter((option) => {
    if (!option) return false;
    const key = `${option.label}|${option.start}|${option.end}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return records.map((record) => {
    const segments = normalizeSegments(record);
    if (!segments) return { ...record, status: 'manual', reason: '下班條須有一至三段完整時段' };
    const selected = [];
    for (let index = 0; index < segments.length; index += 1) {
      const result = chooseShift(segments[index], options, index === segments.length - 1);
      if (result.status !== 'ready') return { ...record, status: 'manual', reason: result.reason };
      selected.push(result.shift);
    }
    return { ...record, status: 'ready', selectedShifts: selected };
  });
}

module.exports = { minuteTime, parseShiftOption, planSchedule, timeMinutes };
