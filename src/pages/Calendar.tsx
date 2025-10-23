import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, getDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Landmark, Repeat, Star, AlertTriangle, Receipt, CreditCard } from "lucide-react";
import { useObligations, Obligation } from "@/hooks/useObligations";
import { useInstallments, Installment } from "@/hooks/useInstallments";
import { useTaxes, Tax } from "@/hooks/useTaxes";
import { holidays } from "@/lib/holidays";
import { generateRecurrencesForPeriod, RecurrableItem } from "@/lib/recurrence";

const statusColors = {
  pending: "bg-pending/10 text-pending border-pending/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-success/10 text-success border-success/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
  paid: "bg-success/10 text-success border-success/30",
};

const typeColors = {
  obligation: "border-l-4 border-l-blue-500",
  tax: "border-l-4 border-l-purple-500",
  installment: "border-l-4 border-l-green-500",
};

type CalendarItem = (Obligation | Tax | Installment) & { type: string; isRecurrence?: boolean; title?: string; client?: { name: string } | null; };

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState<"all" | "obligations" | "taxes" | "installments">("all");
  const { obligations } = useObligations();
  const { installments } = useInstallments();
  const { taxes } = useTaxes();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const holidaysMap = holidays.reduce((acc, holiday) => {
    acc[holiday.date] = holiday.name;
    return acc;
  }, {} as Record<string, string>);

  const recurringObligations = obligations.filter(o => o.recurrence);
  const nonRecurringObligations = obligations.filter(o => !o.recurrence);

  const recurringTaxes = taxes.filter(t => t.recurrence);
  const nonRecurringTaxes = taxes.filter(t => !t.recurrence);

  const recurrences = [
    ...recurringObligations.flatMap((o: RecurrableItem) => generateRecurrencesForPeriod(o, startDate, endDate)),
    ...recurringTaxes.flatMap((t: RecurrableItem) => generateRecurrencesForPeriod(t, startDate, endDate)),
  ];

  const allItems: CalendarItem[] = [
    ...nonRecurringObligations.map((o): CalendarItem => ({ ...o, type: 'obligation' })),
    ...nonRecurringTaxes.map((t): CalendarItem => ({ ...t, type: 'tax' })),
    ...installments.map((i): CalendarItem => ({ ...i, type: 'installment' })),
    ...recurrences.map(r => {
      const parent = [...recurringObligations, ...recurringTaxes].find(item => item.id === r.parentId) as Obligation | Tax | undefined;
      const type = 'tax_type_name' in parent! ? 'tax' : 'obligation';
      return {
        ...parent!,
        type,
        due_date: r.date,
        isRecurrence: true,
        id: `${parent!.id}-${r.date}`
      };
    })
  ];

  const filteredItems = allItems.filter(item => {
    if (filter === "all") return true;
    if (filter === "obligations") return item.type === "obligation";
    if (filter === "taxes") return item.type === "tax";
    if (filter === "installments") return item.type === "installment";
    return true;
  });

  const itemsByDate = filteredItems.reduce((acc: Record<string, CalendarItem[]>, item: CalendarItem) => {
    const dueDate = item.due_date;
    if (!dueDate) return acc;

    if (!acc[dueDate]) {
      acc[dueDate] = [];
    }
    
    let title = "";
    const client = null;

    if (item.type === 'installment') {
      const installment = item as Installment;
      title = `Parcela ${installment.installment_number}/${installment.total_installments}`;
    } else if (item.type === 'tax') {
      title = (item as Tax).tax_type_name;
    } else {
      title = (item as Obligation).title;
    }

    acc[dueDate].push({ ...item, title, client });

    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Agenda Fiscal</h1>
          <p className="text-muted-foreground mt-1">
            Visualize todos os vencimentos em um calendário mensal
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Obrigações</span>
          </div>
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Impostos</span>
          </div>
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Parcelamentos</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Feriado</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium">Final de Semana</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
          <Button 
            variant={filter === 'obligations' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('obligations')}
          >
            Obrigações
          </Button>
          <Button 
            variant={filter === 'taxes' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('taxes')}
          >
            Impostos
          </Button>
          <Button 
            variant={filter === 'installments' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('installments')}
          >
            Parcelamentos
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-medium">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoje
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px bg-border">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div
                key={day}
                className="bg-muted/50 p-3 text-center text-sm font-normal"
              >
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const items = itemsByDate[dayStr] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const dayOfWeek = getDay(day);
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isHoliday = holidaysMap[dayStr];

              return (
                <div
                  key={index}
                  role="gridcell"
                  aria-label={`
                    ${format(day, "d 'de' MMMM", { locale: ptBR })},
                    ${isHoliday ? isHoliday : ''},
                    ${isWeekend ? 'Fim de semana' : 'Dia de semana'}
                  `}
                  className={`min-h-[120px] bg-card p-2 transition-colors hover:bg-accent/5 ${
                    !isCurrentMonth ? "opacity-40" : ""
                  } ${isCurrentDay ? "ring-2 ring-primary ring-inset" : ""} ${
                    isWeekend ? "bg-muted/30" : ""
                  } ${isHoliday ? "bg-success/10" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-sm ${
                        isCurrentDay
                          ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center font-medium"
                          : "font-normal"
                      } ${isWeekend ? "text-muted-foreground" : ""}`}
                    >
                      {format(day, "d")}
                    </span>
                    {isHoliday ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : (
                      isWeekend && items.length > 0 && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )
                    )}
                  </div>

                  <div className="space-y-1">
                    {isHoliday && (
                      <div className="text-xs text-yellow-600 font-medium truncate">
                        {isHoliday}
                      </div>
                    )}
                    {items.slice(0, 3).map((item: CalendarItem) => (
                      <div
                        key={item.id}
                        className={`text-xs p-1.5 rounded border ${
                          statusColors[item.status as keyof typeof statusColors]
                        } ${
                          typeColors[item.type as keyof typeof typeColors]
                        } truncate`}
                      >
                        <div className="font-normal flex items-center gap-1">
                          {item.type === 'obligation' && <FileText className="h-2.5 w-2.5 inline" />}
                          {item.type === 'tax' && <Landmark className="h-2.5 w-2.5 inline" />}
                          {item.type === 'installment' && <Repeat className="h-2.5 w-2.5 inline" />}
                          {item.title}
                        </div>
                        {item.client && (
                          <div className="text-xs opacity-75 truncate">
                            {item.client.name}
                          </div>
                        )}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center font-normal">
                        +{items.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
