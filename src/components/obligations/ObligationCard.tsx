import { CalendarIcon, Building2, Repeat, CheckCircle2, User, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Obligation } from "@/hooks/useObligations";
import { format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ObligationDetails } from "./ObligationDetails";

interface ObligationCardProps {
  obligation: Obligation & { clients?: { id: string; name: string } | null; tax_types?: { id: string; name: string } | null };
}

const statusConfig = {
  pending: { label: "Pendente", badgeVariant: "secondary" as const },
  in_progress: { label: "Em Andamento", badgeVariant: "default" as const },
  completed: { label: "Concluída", badgeVariant: "default" as const },
  overdue: { label: "Atrasada", badgeVariant: "destructive" as const },
};

const recurrenceLabels = {
  none: "Não se repete",
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

export function ObligationCard({ obligation }: ObligationCardProps) {
  const config = statusConfig[obligation.status];
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isWeekendDue = obligation.due_date ? isWeekend(new Date(obligation.due_date)) : false;

  return (
    <>
      <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => setDetailsOpen(true)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{obligation.title}</h3>
          <Badge variant={config.badgeVariant}>{config.label}</Badge>
        </div>
        {obligation.description && (
          <p className="text-sm text-muted-foreground mt-1">{obligation.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-2 pb-3">
        {obligation.clients && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{obligation.clients.name}</span>
          </div>
        )}
        
        {obligation.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span>
                Vencimento: {format(new Date(obligation.due_date), "dd/MM/yyyy", { locale: ptBR })}
              </span>
              {isWeekendDue && (
                <div className="flex items-center gap-1 text-warning" title="Vence no final de semana">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs">FDS</span>
                </div>
              )}
            </div>
          </div>
        )}

        {obligation.responsible && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{obligation.responsible}</span>
          </div>
        )}

        {obligation.recurrence !== "none" && (
          <div className="flex items-center gap-2 text-sm">
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <span>{recurrenceLabels[obligation.recurrence]}</span>
          </div>
        )}

        {obligation.completed_at && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Concluída em {format(new Date(obligation.completed_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {obligation.tax_types && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {obligation.tax_types.name}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
          e.stopPropagation();
          setDetailsOpen(true);
        }}>
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
    
    <ObligationDetails 
      obligation={obligation} 
      open={detailsOpen} 
      onOpenChange={setDetailsOpen} 
    />
    </>
  );
}
