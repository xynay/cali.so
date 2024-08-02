import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

let cachedDate: dayjs.Dayjs | null = null;
let cachedTimezone: string | null = null;

export function getDate(timezone = 'Asia/Shanghai'): dayjs.Dayjs {
  if (cachedDate && cachedTimezone === timezone) {
    return cachedDate;
  }
  cachedDate = dayjs().tz(timezone);
  cachedTimezone = timezone;
  return cachedDate;
}