import { format, parseISO, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr);
};

export const getDatePresets = () => {
  const today = new Date();
  
  return {
    today: {
      from: format(today, 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    },
    last_week: {
      from: format(subDays(today, 7), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    },
    last_month: {
      from: format(subDays(today, 30), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    },
    this_month: {
      from: format(startOfMonth(today), 'yyyy-MM-dd'),
      to: format(endOfMonth(today), 'yyyy-MM-dd'),
    },
    last_3_months: {
      from: format(subMonths(today, 3), 'yyyy-MM-dd'),
      to: format(today, 'yyyy-MM-dd'),
    },
  };
};

export const calculateDuration = (clockIn: string, clockOut: string): number => {
  const [inHours, inMinutes] = clockIn.split(':').map(Number);
  const [outHours, outMinutes] = clockOut.split(':').map(Number);
  
  const totalMinutesIn = inHours * 60 + inMinutes;
  const totalMinutesOut = outHours * 60 + outMinutes;
  
  const durationMinutes = totalMinutesOut - totalMinutesIn;
  return durationMinutes / 60; // Return hours
};
