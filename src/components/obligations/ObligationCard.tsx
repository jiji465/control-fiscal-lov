import { CalendarIcon, Building2, Repeat, CheckCircle2, User, AlertTriangle, Edit } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Obligation, useObligations } from "@/hooks/useObligations";
import { format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ObligationDetails } from "./ObligationDetails";
import { ObligationEditForm } from "@/components/forms/ObligationEditForm";

interface ObligationCardProps {
  obligation: Obligation & { clients?: { id: string; name: string } | null; };
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
  const [editOpen, setEditOpen] = useState(false);
  const { updateObligation } = useObligations();
  const isWeekendDue = obligation.due_date ? isWeekend(new Date(obligation.due_date)) : false;

  const handleQuickStatusChange = async (e: React.MouseEvent, newStatus: string) => {
    e.stopPropagation();
    await updateObligation.mutateAsync({
      id: obligation.id,
      status: newStatus as any,
      completed_at: newStatus === "completed" ? new Date().toISOString() : undefined,
    });
  };

  return (
    <>
      <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 cursor-pointer" onClick={() => setDetailsOpen(true)}>
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-medium text-foreground leading-tight">{obligation.title}</h3>
          <Badge variant={config.badgeVariant} className="font-normal">{config.label}</Badge>
        </div>
        {obligation.description && (
          <p className="text-sm text-muted-foreground font-normal mt-1">{obligation.description}</p>
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
      </CardContent>

      <CardFooter className="pt-3 border-t flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          {obligation.status === "pending" && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={(e) => handleQuickStatusChange(e, "in_progress")}
              >
                Iniciar
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={(e) => handleQuickStatusChange(e, "completed")}
              >
                Concluir
              </Button>
            </>
          )}
          {obligation.status === "in_progress" && (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={(e) => handleQuickStatusChange(e, "completed")}
            >
              Concluir
            </Button>
          )}
          {obligation.status === "completed" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => handleQuickStatusChange(e, "pending")}
            >
              Reabrir
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
    
    <ObligationDetails 
      obligation={obligation} 
      open={detailsOpen} 
      onOpenChange={setDetailsOpen} 
    />
    
    <ObligationEditForm
      obligation={obligation}
      open={editOpen}
      onOpenChange={setEditOpen}
    />
    </>
  );
}
