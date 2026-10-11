export function parseFlexibleDate(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const input = String(value).trim().replace(/^['"]|['"]$/g, "");

  // Unix timestamps in seconds or milliseconds.
  if (/^\d{13}$/.test(input)) {
    const d = new Date(Number(input));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{10}$/.test(input)) {
    const d = new Date(Number(input) * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Excel serial dates from CSV exports (e.g. 46277.1204976852).
  // Excel's conventional date origin is 1899-12-30; the fractional
  // portion represents time-of-day.
  if (/^\d{4,6}(?:\.\d+)?$/.test(input)) {
    const serial = Number(input);
    if (Number.isFinite(serial) && serial >= 20000 && serial <= 80000) {
      const d = new Date(new Date(1899, 11, 30).getTime() + Math.round(serial * 86400000));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  // Compact YYYYMMDD.
  const compact = input.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return makeDate(+compact[1], +compact[2], +compact[3]);

  // ISO-like dates and date-times, with either T or a space between date/time.
  const iso = input.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?\s*(Z|[+-]\d{2}:?\d{2})?)?$/i);
  if (iso) {
    const zone = iso[8];
    if (zone) {
      const parsed = new Date(input.replace(/^(\d{4}-\d{2}-\d{2})\s+/, "$1T"));
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const millis = iso[7] ? Number(`0.${iso[7]}`) * 1000 : 0;
    return makeDate(+iso[1], +iso[2], +iso[3], +(iso[4] || 0), +(iso[5] || 0), +(iso[6] || 0), millis);
  }

  // Indonesian/common DMY formats: 11/10/2026, 11-10-2026 13:45, 11.10.2026.
  const dmy = input.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?:[ T,]+(.+))?$/);
  if (dmy) {
    let year = +dmy[3];
    if (year < 100) year += year < 50 ? 2000 : 1900;
    const timePart = (dmy[4] || "").trim();
    let hour = 0, minute = 0, second = 0;
    if (timePart) {
      const tm = timePart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?\s*(AM|PM)?$/i);
      if (tm) {
        hour = +tm[1]; minute = +tm[2]; second = +(tm[3] || 0);
        const ap = (tm[4] || "").toUpperCase();
        if (ap === "PM" && hour < 12) hour += 12;
        if (ap === "AM" && hour === 12) hour = 0;
      }
    }
    return makeDate(year, +dmy[2], +dmy[1], hour, minute, second);
  }

  // Fallback for browser-supported formats, ISO timestamps, and timezone values.
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function makeDate(year, month, day, hour = 0, minute = 0, second = 0, millis = 0) {
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;
  const d = new Date(year, month - 1, day, hour, minute, second, millis);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return Number.isNaN(d.getTime()) ? null : d;
}
