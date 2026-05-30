import { format } from 'date-fns';

// Maps a date to its 0-based weekday index (0=Mon, 1=Tue, ..., 6=Sun).
// Uses 3-letter abbreviations to avoid the ambiguity bug where 'T' matched
// both Tuesday (index 1) and Thursday (index 3).
export const getWeekdayIndex = (date: Date): number => {
  const day = format(date, 'EEE');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.indexOf(day);
};
