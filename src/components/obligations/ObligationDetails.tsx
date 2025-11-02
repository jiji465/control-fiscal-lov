import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Obligation } from "@/hooks/useObligations";
import { useInstallments } from "@/hooks/useInstallments";
import { format, isWeekend, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Building2, User, Repeat, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ObligationDetailsProps {
  obligation: Obligation & { 
    clients?: { id: string; name: string } | null; 
    tax_types?: { id: string; name: string } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  completed: { label: "Concluída", variant: "default" as const },
  overdue: { label: "Atrasada", variant: "destructive" as const },
};

const recurrenceLabels = {
  none: "Não se repete",
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};

const installmentStatusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  paid: { label: "Pago", variant: "default" as const },
  overdue: { label: "Atrasado", variant: "destructive" as const },
};

export function ObligationDetails({ obligation, open, onOpenChange }: ObligationDetailsProps) {
  const { installments } = useInstallments();
  const obligationInstallments = installments.filter(i => i.obligation_id === obligation.id);
  
  const isWeekendDue = obligation.due_date ? isWeekend(new Date(obligation.due_date)) : false;
  const suggestedDate = isWeekendDue && obligation.due_date
    ? addDays(new Date(obligation.due_date), new Date(obligation.due_date).getDay() === 6 ? 2 : 1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-2xl">{obligation.title}</DialogTitle>
            <Badge variant={statusConfig[obligation.status].variant}>
              {statusConfig[obligation.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {obligation.description && (
            <div>
              <p className="text-muted-foreground">{obligation.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {obligation.clients && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Cliente</p>
                  <p className="text-sm text-muted-foreground">{obligation.clients.name}</p>
                </div>
              </div>
            )}

            {obligation.due_date && (
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Vencimento</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(obligation.due_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  {isWeekendDue && (
                    <div className="flex items-center gap-1 mt-1 text-warning">
                      <AlertTriangle className="h-3 w-3" />
                      <p className="text-xs">
                        Cai no final de semana
                        {suggestedDate && ` - Sugestão: ${format(suggestedDate, "dd/MM/yyyy")}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {obligation.responsible && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Responsável</p>
                  <p className="text-sm text-muted-foreground">{obligation.responsible}</p>
                </div>
              </div>
            )}

            {obligation.recurrence !== "none" && (
              <div className="flex items-start gap-3">
                <Repeat className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Recorrência</p>
                  <p className="text-sm text-muted-foreground">{recurrenceLabels[obligation.recurrence]}</p>
                </div>
              </div>
            )}

            {obligation.tax_types && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tipo de Imposto</p>
                  <p className="text-sm text-muted-foreground">{obligation.tax_types.name}</p>
                </div>
              </div>
            )}
          </div>

          {obligation.notes && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Observações</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{obligation.notes}</p>
            </div>
          )}

          {obligationInstallments.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Parcelas ({obligationInstallments.length})</p>
              <div className="space-y-2">
                {obligationInstallments.map((installment) => {
                  const installmentWeekend = isWeekend(new Date(installment.due_date));
                  
                  return (
                    <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Parcela {installment.installment_number}/{installment.total_installments}
                          </span>
                          {installment.status === 'paid' && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(installment.due_date), "dd/MM/yyyy")}
                          {installmentWeekend && (
                            <AlertTriangle className="h-3 w-3 text-warning" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={installmentStatusConfig[installment.status].variant}>
                          {installmentStatusConfig[installment.status].label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {obligation.completed_at && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Concluída</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(obligation.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
