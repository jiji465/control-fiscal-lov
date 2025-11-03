
import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, isSameMonth, isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
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
  const [filter, setFilter] = useState<"all" | "obligation" | "tax" | "installments">("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [selectedDayItems, setSelectedDayItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { deadlines } = useDeadlines();
  const { installments } = useInstallments();

  const allItems = [
    ...deadlines,
    ...installments.map((i: any) => ({ ...i, type: 'installment' })),
  ];

  const filteredItems = allItems.filter(item => {
    if (filter === "all") return true;
    if (filter === "obligation") return item.type === "obligation";
    if (filter === "tax") return item.type === "tax";
    if (filter === "installments") return item.type === "installment";
    return true;
  });

  const itemsByDate = filteredItems.reduce((acc: any, item: any) => {
    const dueDate = item.due_date;
    if (!dueDate) return acc;

    if (!acc[dueDate]) {
      acc[dueDate] = [];
    }

    let title = "";
    let client = null;

    if (item.type === 'installment') {
      title = `Parcela ${item.installment_number}/${item.total_installments}`;
      if (item.obligations?.title) title += ` - ${item.obligations.title}`;
      client = item.obligations?.clients;
    } else {
      title = item.title;
      client = item.clients;
    }

    acc[dueDate].push({
      ...item,
      displayTitle: title,
      displayClient: client,
    });

    return acc;
  }, {});

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

  // Contadores para legendas
  const obligationCount = filteredItems.filter(i => i.type === 'obligation').length;
  const taxCount = filteredItems.filter(i => i.type === 'tax').length;
  const installmentCount = filteredItems.filter(i => i.type === 'installment').length;
  const pendingCount = filteredItems.filter(i => i.status === 'pending').length;
  const completedCount = filteredItems.filter(i => i.status === 'completed' || i.status === 'paid').length;
  const overdueCount = filteredItems.filter(i => i.status === 'overdue').length;

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
    const type = item.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

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

      {/* Legendas Dinâmicas com Contadores */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legendas de Tipo */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Por Tipo</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--primary))]" />
                  <span className="text-sm">Obrigações</span>
                  <Badge variant="secondary" className="ml-1">{obligationCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--chart-2))]" />
                  <span className="text-sm">Impostos</span>
                  <Badge variant="secondary" className="ml-1">{taxCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--success))]" />
                  <span className="text-sm">Parcelamentos</span>
                  <Badge variant="secondary" className="ml-1">{installmentCount}</Badge>
                </div>
              </div>
            </div>

            {/* Legendas de Status */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Por Status</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--warning))]" />
                  <span className="text-sm">Pendente</span>
                  <Badge variant="secondary" className="ml-1">{pendingCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--success))]" />
                  <span className="text-sm">Concluído/Pago</span>
                  <Badge variant="secondary" className="ml-1">{completedCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[hsl(var(--destructive))]" />
                  <span className="text-sm">Atrasado</span>
                  <Badge variant="secondary" className="ml-1">{overdueCount}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos ({allItems.length})
        </Button>
        <Button
          variant={filter === 'obligation' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('obligation')}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Obrigações ({obligationCount})
        </Button>
        <Button
          variant={filter === 'tax' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('tax')}
        >
          <Receipt className="h-4 w-4 mr-2" />
          Impostos ({taxCount})
        </Button>
        <Button
          variant={filter === 'installments' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('installments')}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Parcelamentos ({installmentCount})
        </Button>
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
                className="bg-muted/50 p-3 text-center text-sm font-medium text-foreground"
              >
                {day}
              </div>
            ))}

            {calendarWeeks.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const items = itemsByDate[dayStr] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const dayOfWeek = getDay(day);
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day, items)}
                    className={`min-h-[120px] bg-card p-2 transition-all hover:bg-accent/10 cursor-pointer ${
                      !isCurrentMonth ? "opacity-40" : ""
                    } ${isCurrentDay ? "ring-2 ring-primary ring-inset" : ""} ${
                      isWeekend ? "bg-muted/20" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-sm ${
                          isCurrentDay
                            ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                            : "font-normal text-foreground"
                        } ${isWeekend && !isCurrentDay ? "text-muted-foreground" : ""}`}
                      >
                        {format(day, "d")}
                      </span>
                      {isWeekend && items.length > 0 && (
                        <AlertTriangle className="h-3 w-3 text-warning" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {items.slice(0, 3).map((item: any) => (
                        <div
                          key={item.id}
                          className={`w-full text-left text-xs p-1.5 rounded border ${
                            statusColors[item.status as keyof typeof statusColors]
                          } ${
                            typeColors[item.type as keyof typeof typeColors]
                          } truncate hover:shadow-md transition-all`}
                        >
                          <div className="font-medium flex items-center gap-1">
                            {item.type === 'obligation' && <CalendarIcon className="h-2.5 w-2.5 inline" />}
                            {item.type === 'tax' && <Receipt className="h-2.5 w-2.5 inline" />}
                            {item.type === 'installment' && <CreditCard className="h-2.5 w-2.5 inline" />}
                            {item.displayTitle}
                          </div>
                          {item.displayClient && (
                            <div className="text-xs opacity-75 truncate mt-0.5">
                              {item.displayClient.name}
                            </div>
                          )}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div
                          key="show-more"
                          className="w-full text-xs text-muted-foreground text-center font-medium hover:text-foreground transition-colors"
                        >
                          +{items.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Item */}
      <Dialog open={!!selectedItem && !isDayModalOpen} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedItem.type === 'obligation' && <CalendarIcon className="h-5 w-5 text-primary" />}
                  {selectedItem.type === 'tax' && <Receipt className="h-5 w-5 text-[hsl(var(--chart-2))]" />}
                  {selectedItem.type === 'installment' && <CreditCard className="h-5 w-5 text-success" />}
                  {selectedItem.displayTitle}
                </DialogTitle>
                <DialogDescription>
                  Detalhes do item selecionado.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <StatusBadge status={selectedItem.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vencimento</p>
                    <p className="text-sm font-semibold">
                      {format(new Date(selectedItem.due_date), "dd/MM/yyyy")}
                    </p>
                    <WeekendBadge dueDate={selectedItem.due_date} originalDate={selectedItem.original_due_date} />
                  </div>
                </div>

                {selectedItem.displayClient && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                    <p className="text-sm font-semibold">{selectedItem.displayClient.name}</p>
                  </div>
                )}

                {selectedItem.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                    <p className="text-sm">{selectedItem.description}</p>
                  </div>
                )}

                {selectedItem.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Observações</p>
                    <p className="text-sm">{selectedItem.notes}</p>
                  </div>
                )}

                {selectedItem.responsible && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                    <p className="text-sm">{selectedItem.responsible}</p>
                  </div>
                )}

                {selectedItem.recurrence && selectedItem.recurrence !== 'none' && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recorrência</p>
                    <Badge variant="outline">
                      {selectedItem.recurrence === 'monthly' && 'Mensal'}
                      {selectedItem.recurrence === 'quarterly' && 'Trimestral'}
                      {selectedItem.recurrence === 'semiannual' && 'Semestral'}
                      {selectedItem.recurrence === 'annual' && 'Anual'}
                    </Badge>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal de Itens do Dia */}
      <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Itens do dia {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
            </DialogTitle>
            <DialogDescription>
              {selectedDayItems.length} itens encontrados para esta data.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mr-4 pr-5">
            <div className="space-y-4 py-4">
              {Object.entries(groupedDayItems).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
                    {type === 'obligation' && <CalendarIcon className="h-5 w-5 text-primary" />}
                    {type === 'tax' && <Receipt className="h-5 w-5 text-[hsl(var(--chart-2))]" />}
                    {type === 'installment' && <CreditCard className="h-5 w-5 text-success" />}
                    {type === 'obligation' ? 'Obrigações' : type === 'tax' ? 'Impostos' : 'Parcelamentos'}
                    <Badge variant="secondary">{items.length}</Badge>
                  </h3>
                  <div className="space-y-3">
                    {items.map((item: any) => (
                      <Card
                        key={item.id}
                        className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4"
                        style={{ borderColor: `hsl(var(--${type === 'obligation' ? 'primary' : type === 'tax' ? 'chart-2' : 'success'}))` }}
                        onClick={() => {
                          setIsDayModalOpen(false);
                          setSelectedItem(item);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.displayTitle}</h4>
                            {item.displayClient && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Cliente: {item.displayClient.name}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={item.status} variant="compact" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Item */}
      <Dialog open={isNewItemModalOpen} onOpenChange={setIsNewItemModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Criar novo item para {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ''}
            </DialogTitle>
            <DialogDescription>
              Selecione o tipo de item que deseja criar para esta data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Link to={`/deadlines/new?due_date=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}&type=obligation`} className="text-center p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border">
              <CalendarIcon className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="font-semibold text-sm">Obrigação</p>
            </Link>
            <Link to={`/deadlines/new?due_date=${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}&type=tax`} className="text-center p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border">
              <Receipt className="h-8 w-8 mx-auto text-[hsl(var(--chart-2))] mb-2" />
              <p className="font-semibold text-sm">Imposto</p>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
