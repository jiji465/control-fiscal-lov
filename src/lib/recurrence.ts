// src/lib/recurrence.ts

import { addDays, addMonths, addQuarters, isWeekend, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDate } from 'date-fns';
import { holidays } from './holidays';

// Interfaces para a configuração de recorrência
export interface RecurrenceRule {
  type: 'monthly' | 'quarterly' | 'custom_days' | 'daily_interval';
  interval?: number; // Para 'monthly' e 'daily_interval'
  days?: number[];   // Para 'custom_days' (ex: dias 15 e 30)
}

// Interface para um item que pode ser recorrente
export interface RecurrableItem {
  id: string;
  due_date: string; // Formato YYYY-MM-DD (data de início da recorrência)
  recurrence?: RecurrenceRule;
  weekend_handling?: 'postpone';
}

const holidaysSet = new Set(holidays.map(h => h.date));

/**
 * Verifica se uma data é um feriado.
 */
function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return holidaysSet.has(dateStr);
}

/**
 * Ajusta uma data para o próximo dia útil.
 */
function adjustToNextBusinessDay(date: Date): Date {
  let adjustedDate = new Date(date);
  while (isWeekend(adjustedDate) || isHoliday(adjustedDate)) {
    adjustedDate = addDays(adjustedDate, 1);
  }
  return adjustedDate;
}

/**
 * Gera as ocorrências de um item recorrente para um intervalo de datas (normalmente um mês).
 */
export function generateRecurrencesForPeriod(
  item: RecurrableItem,
  periodStart: Date,
  periodEnd: Date
): { date: string; parentId: string }[] {
  if (!item.recurrence) return [];

  const occurrences: Date[] = [];
  const initialDueDate = parseISO(item.due_date);

  switch (item.recurrence.type) {
    case 'monthly': {
      let currentDate = initialDueDate;
      while (currentDate <= periodEnd) {
        if (currentDate >= periodStart) {
          occurrences.push(new Date(currentDate));
        }
        currentDate = addMonths(currentDate, item.recurrence.interval || 1);
      }
      break;
    }
    case 'quarterly': {
      let quarterlyDate = initialDueDate;
      while (quarterlyDate <= periodEnd) {
        if (quarterlyDate >= periodStart) {
          occurrences.push(new Date(quarterlyDate));
        }
        quarterlyDate = addQuarters(quarterlyDate, 1);
      }
      break;
    }
    case 'daily_interval': {
        let dailyDate = initialDueDate;
        while(dailyDate <= periodEnd) {
            if (dailyDate >= periodStart) {
                occurrences.push(new Date(dailyDate));
            }
            dailyDate = addDays(dailyDate, item.recurrence.interval || 1);
        }
        break;
    }
    case 'custom_days': {
      const daysInPeriod = eachDayOfInterval({ start: periodStart, end: periodEnd });
      daysInPeriod.forEach(day => {
        if (item.recurrence?.days?.includes(getDate(day))) {
          occurrences.push(day);
        }
      });
      break;
    }
  }

  // Ajusta as datas se necessário e formata a saída
  return occurrences.map(d => {
    const finalDate = item.weekend_handling === 'postpone' ? adjustToNextBusinessDay(d) : d;
    return {
      date: finalDate.toISOString().split('T')[0],
      parentId: item.id,
    };
  });
}
