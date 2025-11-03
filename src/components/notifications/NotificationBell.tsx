
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useDeadlines } from "@/hooks/useDeadlines";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NotificationBell() {
  const { deadlines } = useDeadlines();

  // Get deadlines due in next 7 days
  const upcomingDeadlines = deadlines.filter((obl) => {
    const daysUntilDue = differenceInDays(new Date(obl.due_date), new Date());
    return daysUntilDue >= 0 && daysUntilDue <= 7 && obl.status !== "completed";
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {upcomingDeadlines.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {upcomingDeadlines.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Vencimentos Próximos</h4>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum vencimento nos próximos 7 dias
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((obl) => {
                const daysUntilDue = differenceInDays(new Date(obl.due_date), new Date());
                return (
                  <div key={obl.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm line-clamp-1">{obl.title}</p>
                      <Badge variant={daysUntilDue <= 2 ? "destructive" : "secondary"} className="text-xs">
                        {daysUntilDue === 0 ? "Hoje" : `${daysUntilDue}d`}
                      </Badge>
                    </div>
                    {obl.clients && (
                      <p className="text-xs text-muted-foreground">
                        Cliente: {obl.clients.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Vence: {format(new Date(obl.due_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    {obl.responsible && (
                      <p className="text-xs text-muted-foreground">
                        Responsável: {obl.responsible}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
