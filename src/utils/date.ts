import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { GregorianDate, HijriDate, Language, TimeFormat } from '@/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// ─── Prayer Time Conversion ───────────────────────────────────────────────────

/**
 * Convert a "HH:MM" prayer time string from the Al Adhan API to a Unix millisecond timestamp.
 *
 * Key: the date must come from the prayer *location's* timezone (via dayjs.tz),
 * not the machine's local timezone — they can differ near midnight or across offsets.
 */
export function prayerTimeToTimestamp(timeStr: string, date: Date, tz: string): number {
  const dateStr = dayjs(date).tz(tz).format('YYYY-MM-DD');
  return dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', tz).valueOf();
}

// ─── Formatting ───────────────────────────────────────────────────────────────

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
];

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

export function formatHijriDate(hijri: HijriDate, language: Language): string {
  const monthNum = hijri.month.number;
  const monthName =
    language === 'ar'
      ? (HIJRI_MONTHS_AR[monthNum - 1] ?? hijri.month.ar)
      : (HIJRI_MONTHS_EN[monthNum - 1] ?? hijri.month.en);

  if (language === 'ar') {
    return `${hijri.day} ${monthName} ${hijri.year} هـ`;
  }
  return `${hijri.day} ${monthName} ${hijri.year} AH`;
}

export function formatGregorianDate(gregorian: GregorianDate, language: Language): string {
  const months = {
    en: ['January','February','March','April','May','June',
         'July','August','September','October','November','December'],
    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
         'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  };

  const weekdays = {
    en: { Sunday:'Sunday', Monday:'Monday', Tuesday:'Tuesday', Wednesday:'Wednesday',
          Thursday:'Thursday', Friday:'Friday', Saturday:'Saturday' },
    ar: { Sunday:'الأحد', Monday:'الاثنين', Tuesday:'الثلاثاء', Wednesday:'الأربعاء',
          Thursday:'الخميس', Friday:'الجمعة', Saturday:'السبت' },
  };

  const monthIdx = gregorian.month.number - 1;
  const monthName = months[language][monthIdx] ?? gregorian.month.en;
  const weekday = weekdays[language][gregorian.weekday.en as keyof typeof weekdays.en]
    ?? gregorian.weekday.en;

  if (language === 'ar') {
    return `${weekday}، ${gregorian.day} ${monthName} ${gregorian.year}`;
  }
  return `${weekday}, ${monthName} ${gregorian.day}, ${gregorian.year}`;
}

/**
 * Format a "HH:MM" prayer time string for display.
 * The time string is in the prayer location's local timezone (from the API).
 */
export function formatPrayerTime(timeStr: string, timeFormat: TimeFormat): string {
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr ?? '0', 10);
  const minute = String(parseInt(minuteStr ?? '0', 10)).padStart(2, '0');

  if (timeFormat === '24h') {
    return `${String(hour).padStart(2, '0')}:${minute}`;
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${period}`;
}

/**
 * Format a countdown duration (total seconds) as HH:MM:SS parts.
 */
export function formatCountdown(totalSeconds: number): { hours: number; minutes: number; seconds: number } {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { hours: h, minutes: m, seconds: s };
}
