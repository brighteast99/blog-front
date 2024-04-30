import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/ko'

dayjs.extend(utc)
dayjs.locale('ko')
dayjs.extend(relativeTime)

export function getRelativeTimeFromNow(date: Date): string {
  return dayjs().to(dayjs(date).format('YYYY-MM-DD HH:mm:ss'))
}

export function isSameTime(date1: Date, date2: Date): Boolean {
  return dayjs(date1).isSame(dayjs(date2), 'milliseconds')
}
