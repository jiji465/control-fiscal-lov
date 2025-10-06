import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockObligations } from "@/lib/mockData";
import { statusConfig } from "@/lib/statusConfig";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const obligationsByDate = mockObligations.reduce((acc, obligation) => {
    const dateKey = format(obligation.dueDate, "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(obligation);
    return acc;
  }, {} as Record<string, typeof mockObligations>);

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
              const obligations = obligationsByDate[dateKey] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={`min-h-24 p-2 border rounded-lg ${
                    isToday ? "bg-primary/5 border-primary" : "border-border"
                  } ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {obligations.slice(0, 2).map((obligation) => {
                      const config = statusConfig[obligation.status];
                      return (
                        <div
                          key={obligation.id}
                          className={`text-xs p-1 rounded ${config.bgColor} ${config.color} truncate`}
                        >
                          {obligation.title}
                        </div>
                      );
                    })}
                    {obligations.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{obligations.length - 2} mais
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
