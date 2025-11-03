
import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Receipt, CreditCard, AlertTriangle } from "lucide-react";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WeekendBadge } from "@/components/shared/WeekendBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

const statusColors = {
  pending: "bg-pending/10 text-pending-dark-foreground border-pending/30",
  in_progress: "bg-primary/10 text-primary-dark-foreground border-primary/30",
  completed: "bg-success/10 text-success-dark-foreground border-success/30",
  overdue: "bg-destructive/10 text-destructive-dark-foreground border-destructive/30",
  paid: "bg-success/10 text-success-dark-foreground border-success/30",
};

const typeColors = {
  obligation: "border-l-4 border-l-[hsl(var(--primary))]",
  tax: "border-l-4 border-l-[hsl(var(--chart-2))]",
  installment: "border-l-4 border-l-[hsl(var(--success))]",
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [selectedDayItems, setSelectedDayItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { deadlines, isLoading: deadlinesLoading } = useDeadlines();
  const { installments, isLoading: installmentsLoading } = useInstallments();

  const allItems = React.useMemo(() => [
    ...(deadlines || []),
    ...(installments || []).map((i: any) => ({ ...i, type: 'installment' })),
  ], [deadlines, installments]);

  const itemsByDate = React.useMemo(() => {
    return allItems.reduce((acc: any, item: any) => {
      const dueDate = item.due_date;
      if (!dueDate) return acc;
      if (!acc[dueDate]) {
        acc[dueDate] = [];
      }
      acc[dueDate].push(item);
      return acc;
    }, {});
  }, [allItems]);

  const generateCalendarGrid = () => {
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
  };

  const calendarWeeks = generateCalendarGrid();

  const handleDayClick = (day: Date, items: any[]) => {
    if (items.length === 1) {
      setSelectedItem(items[0]);
    } else if (items.length > 1) {
      setSelectedDayItems(items);
      setSelectedDate(day);
      setIsDayModalOpen(true);
    } else {
      setSelectedDate(day);
      setIsNewItemModalOpen(true);
    }
  };

  const groupedDayItems = selectedDayItems.reduce((acc, item) => {
    const type = item.type === 'tax' ? 'Impostos' : item.type === 'obligation' ? 'Obrigações' : 'Parcelamentos';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  if (deadlinesLoading || installmentsLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-semibold">Calendário</h1>
      <div className="border rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <h2 className="text-lg font-semibold">{format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</h2>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
        </div>
        <div className="grid grid-cols-7 bg-border -mt-px">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-foreground bg-muted/50 border-r border-b">{day}</div>
            ))}
            {calendarWeeks.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                    {week.map((day) => {
                        const dayStr = format(day, "yyyy-MM-dd");
                        const items = itemsByDate[dayStr] || [];
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isCurrentDay = isToday(day);
                        const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                        return (
                            <div
                                key={day.toISOString()} // Chave estável e única
                                onClick={() => handleDayClick(day, items)}
                                className={`min-h-[120px] bg-card p-2 border-b border-r cursor-pointer transition-colors hover:bg-muted/50 ${!isCurrentMonth ? "opacity-50" : ""} ${isCurrentDay ? "ring-2 ring-primary" : ""}`}
                            >
                                <span className={`font-medium ${isCurrentDay ? "text-primary" : ""}`}>{format(day, "d")}</span>
                                <div className="space-y-1 mt-1">
                                    {items.slice(0, 2).map((item: any) => (
                                        <div key={item.id} className={`p-1.5 text-xs rounded truncate ${typeColors[item.type as keyof typeof typeColors]}`}>
                                            {item.title || `Parcela de ${item.obligations?.title}`}
                                        </div>
                                    ))}
                                    {items.length > 2 && <div className="text-xs text-muted-foreground">+{items.length - 2} mais</div>}
                                </div>
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
      </div>

      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Itens do dia {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ''}</DialogTitle>
            <DialogDescription>
              Todos os itens agendados para esta data.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            <div className="space-y-4 pr-4">
              {Object.entries(groupedDayItems).map(([type, items]) => (
                <div key={type}>
                  <h3 className="font-semibold mb-2">{type}</h3>
                  <div className="space-y-2">
                    {(items as any[]).map((item: any) => (
                        <div key={item.id} className="p-3 rounded-md border bg-card flex justify-between items-center cursor-pointer hover:bg-muted/50" onClick={() => { setIsDayModalOpen(false); setSelectedItem(item); }}>
                            <span>{item.title || `Parcela de ${item.obligations?.title}`}</span>
                            <StatusBadge status={item.status} />
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedItem && !isDayModalOpen} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
            {selectedItem && (
                <>
                    <DialogHeader>
                        <DialogTitle>{selectedItem.title || `Parcela de ${selectedItem.obligations?.title}`}</DialogTitle>
                         <DialogDescription>
                            Detalhes do item.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Conteúdo do modal de detalhes aqui */}
                </>
            )}
        </DialogContent>
      </Dialog>

      <Dialog open={isNewItemModalOpen} onOpenChange={setIsNewItemModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Criar novo item para {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ''}</DialogTitle>
                <DialogDescription>
                  Selecione o tipo de item que deseja criar.
                </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4 pt-4">
                <Link to={`/deadlines/new?due_date=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}&type=obligation`} className="flex-1">
                    <Button variant="outline" className="w-full"><CalendarIcon className="h-4 w-4 mr-2" /> Obrigação</Button>
                </Link>
                <Link to={`/deadlines/new?due_date=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}&type=tax`} className="flex-1">
                    <Button variant="outline" className="w-full"><Receipt className="h-4 w-4 mr-2" /> Imposto</Button>
                </Link>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
