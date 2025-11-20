
import { useState, useMemo } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";

export interface CalendarItem {
  id: string;
  type: "obligation" | "tax" | "installment";
  status: string;
  due_date: string;
  title: string;
  description?: string;
  notes?: string;
  recurrence?: string;
  responsible?: string;
  original_due_date?: string;
  displayTitle: string;
  displayClient: { id: string; name: string } | null;
  installment_number?: number;
  total_installments?: number;
}

export function useCalendarLogic() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<"all" | "obligation" | "tax" | "installments">("all");
  const { deadlines } = useDeadlines();
  const { installments } = useInstallments();

  const allItems = useMemo(() => {
    const normalizedDeadlines = deadlines.map((d) => ({
      ...d,
      displayTitle: d.title,
      displayClient: d.clients,
    }));

    const normalizedInstallments = installments.map((i: any) => ({
      ...i,
      type: "installment",
      displayTitle: `Parcela ${i.installment_number}/${i.total_installments}${i.obligations?.title ? ` - ${i.obligations.title}` : ""}`,
      displayClient: i.obligations?.clients,
    }));

    return [...normalizedDeadlines, ...normalizedInstallments];
  }, [deadlines, installments]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filter === "all") return true;
      if (filter === "obligation") return item.type === "obligation";
      if (filter === "tax") return item.type === "tax";
      if (filter === "installments") return item.type === "installment";
      return true;
    });
  }, [allItems, filter]);

  const itemsByDate = useMemo(() => {
    return filteredItems.reduce((acc: Record<string, CalendarItem[]>, item: any) => {
      const dueDate = item.due_date;
      if (!dueDate) return acc;

      if (!acc[dueDate]) {
        acc[dueDate] = [];
      }
      acc[dueDate].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const weeks = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      weeks.push(days);
      days = [];
    }
    return weeks;
  }, [currentDate]);

  const counts = useMemo(() => ({
    obligation: filteredItems.filter((i) => i.type === "obligation").length,
    tax: filteredItems.filter((i) => i.type === "tax").length,
    installment: filteredItems.filter((i) => i.type === "installment").length,
    pending: filteredItems.filter((i) => i.status === "pending").length,
    completed: filteredItems.filter((i) => i.status === "completed" || i.status === "paid").length,
    overdue: filteredItems.filter((i) => i.status === "overdue").length,
    total: allItems.length,
  }), [filteredItems, allItems]);

  return {
    currentDate,
    setCurrentDate,
    filter,
    setFilter,
    itemsByDate,
    calendarWeeks,
    counts,
    allItems, // exposed for debug if needed
  };
}
