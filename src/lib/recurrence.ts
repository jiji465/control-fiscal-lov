import { addMonths, addQuarters, isWeekend, nextMonday, lastDayOfMonth } from 'date-fns';

export type Recurrence = {
  type: 'monthly' | 'quarterly' | 'custom';
  endDate: string;
  dayOfMonth: number;
  months?: number; // For custom recurrence
};

export type CalendarItem = {
  id: string;
  title: string;
  date: string;
  type: 'obligation' | 'tax' | 'holiday' | 'installment';
  recurrence?: Recurrence;
  amount?: number;
};

const adjustForWeekend = (date: Date): Date => {
  if (isWeekend(date)) {
    return nextMonday(date);
  }
  return date;
};

export const generateRecurrences = (item: CalendarItem, visibleStartDate: Date, visibleEndDate: Date): CalendarItem[] => {
  if (!item.recurrence) {
    return [];
  }

  const occurrences: CalendarItem[] = [];
  const { type, endDate, dayOfMonth } = item.recurrence;
  let currentDate = new Date(item.date);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate && currentDate <= visibleEndDate) {
    if (currentDate >= visibleStartDate) {
      let occurrenceDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth);

      // Handle last day of month logic
      if (dayOfMonth === 31) {
        occurrenceDate = lastDayOfMonth(currentDate);
      } else {
        occurrenceDate.setDate(dayOfMonth);
      }

      const adjustedDate = adjustForWeekend(occurrenceDate);

      if (adjustedDate >= visibleStartDate && adjustedDate <= visibleEndDate) {
          occurrences.push({
              ...item,
              id: `${item.id}-${currentDate.toISOString().split('T')[0]}`,
              date: adjustedDate.toISOString().split('T')[0],
              // Make it clear this is a generated instance
              title: `${item.title} (Recorrência)`,
          });
      }
    }

    // Move to the next period
    switch (type) {
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'quarterly':
        currentDate = addQuarters(currentDate, 1);
        break;
      case 'custom':
        if (item.recurrence.months) {
          currentDate = addMonths(currentDate, item.recurrence.months);
        } else {
          // If custom months is not defined, break the loop to avoid infinite loop.
          currentDate = new Date(finalDate.getTime() + 1);
        }
        break;
      default:
         // Break the loop if recurrence type is unknown
        currentDate = new Date(finalDate.getTime() + 1);
        break;
    }
  }

  return occurrences;
};