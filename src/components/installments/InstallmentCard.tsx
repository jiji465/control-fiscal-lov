import { CalendarIcon, Building2, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isWeekend, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useInstallments } from "@/hooks/useInstallments";
import { useToast } from "@/hooks/use-toast";

interface InstallmentCardProps {
  installment: any;
}

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  paid: { label: "Pago", variant: "default" as const },
  overdue: { label: "Atrasado", variant: "destructive" as const },
};

export function InstallmentCard({ installment }: InstallmentCardProps) {
  const config = statusConfig[installment.status as keyof typeof statusConfig];
  const { updateInstallment } = useInstallments();
  const { toast } = useToast();
  const isWeekendDue = isWeekend(new Date(installment.due_date));
  const isOverdue = isPast(new Date(installment.due_date)) && installment.status === "pending";

  const handleStatusChange = async (newStatus: "pending" | "paid" | "overdue") => {
    try {
      await updateInstallment.mutateAsync({
        id: installment.id,
        status: newStatus,
        paid_at: newStatus === "paid" ? new Date().toISOString() : null,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-all duration-200 bg-card/50">
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-medium text-foreground leading-tight">
              Parcela {installment.installment_number}/{installment.total_installments}
            </h3>
            {installment.obligation && (
              <p className="text-sm text-muted-foreground mt-1">
                {installment.obligation.title}
              </p>
            )}
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 pb-3">
        {installment.obligation?.clients && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{installment.obligation.clients.name}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <span>
              Vencimento: {format(new Date(installment.due_date), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {isWeekendDue && (
              <div className="flex items-center gap-1 text-warning" title="Vence no final de semana">
                <AlertTriangle className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            R$ {parseFloat(installment.amount.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {installment.paid_at && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Pago em {format(new Date(installment.paid_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {isOverdue && (
          <div className="flex items-center gap-2 text-sm text-destructive font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>Parcela atrasada!</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t flex gap-2">
        {installment.status === "pending" && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => handleStatusChange("paid")}
              disabled={updateInstallment.isPending}
            >
              Marcar como Pago
            </Button>
          </>
        )}
        {installment.status === "paid" && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => handleStatusChange("pending")}
            disabled={updateInstallment.isPending}
          >
            Reverter para Pendente
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
