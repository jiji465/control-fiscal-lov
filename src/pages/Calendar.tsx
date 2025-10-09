import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isWeekend, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useObligations } from "@/hooks/useObligations";
import { useInstallments } from "@/hooks/useInstallments";

const statusColors = {
  pending: "bg-pending/20 text-pending border-pending/30",
  in_progress: "bg-warning/20 text-warning border-warning/30",
  completed: "bg-success/20 text-success border-success/30",
  overdue: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { obligations, isLoading } = useObligations();
  const { installments } = useInstallments();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Combinar obrigações e parcelas por data
  const itemsByDate = [...obligations, ...installments].reduce((acc, item) => {
    const dueDate = 'due_date' in item ? item.due_date : null;
    if (!dueDate) return acc;
    
    const dateKey = format(new Date(dueDate), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    
    const isWeekendDay = isWeekend(new Date(dueDate));
    acc[dateKey].push({ ...item, isWeekendDue: isWeekendDay });
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agenda Fiscal</h1>
        <p className="text-muted-foreground mt-1">
          Visualize todos os vencimentos em calendário
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold p-2">
                {day}
              </div>
            ))}
            
            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const items = itemsByDate[dateKey] || [];
              const isToday = isSameDay(day, new Date());
              const isWeekendDay = isWeekend(day);

              return (
                <div
                  key={day.toString()}
                  className={`min-h-28 p-2 border rounded-lg transition-colors ${
                    isToday ? "bg-primary/5 border-primary" : "border-border"
                  } ${!isSameMonth(day, currentDate) ? "opacity-50" : ""} ${
                    isWeekendDay ? "bg-muted/30" : ""
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 flex items-center justify-between ${isToday ? "text-primary" : ""}`}>
                    <span>{format(day, "d")}</span>
                    {isWeekendDay && items.length > 0 && (
                      <AlertTriangle className="h-3 w-3 text-warning" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {items.slice(0, 3).map((item) => {
                      const isInstallment = 'installment_number' in item;
                      const status = item.status || 'pending';
                      const title = isInstallment 
                        ? `Parcela ${item.installment_number}/${item.total_installments}` 
                        : item.title;
                      
                      return (
                        <div
                          key={item.id}
                          className={`text-xs p-1.5 rounded border truncate ${statusColors[status as keyof typeof statusColors]}`}
                        >
                          {title}
                        </div>
                      );
                    })}
                    {items.length > 3 && (
                      <div className="text-xs text-muted-foreground font-medium">
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
