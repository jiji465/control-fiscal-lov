
import { useState } from "react";
import { CalendarIcon, Building2, AlertTriangle, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isWeekend, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useInstallments } from "@/hooks/useInstallments";
import { useToast } from "@/hooks/use-toast";
import { InstallmentEditForm } from "@/components/forms/InstallmentEditForm";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";

interface InstallmentCardProps {
  installment: any;
}

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  completed: { label: "Concluído", variant: "default" as const },
  paid: { label: "Concluído", variant: "default" as const },
  overdue: { label: "Atrasado", variant: "destructive" as const },
};

export function InstallmentCard({ installment }: InstallmentCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const config = statusConfig[installment.status as keyof typeof statusConfig];
  const { updateInstallment, deleteInstallment } = useInstallments();
  const { toast } = useToast();
  const isWeekendDue = isWeekend(new Date(installment.due_date));
  const isOverdue = isPast(new Date(installment.due_date)) && installment.status === "pending";

  const handleStatusChange = async (newStatus: "pending" | "completed" | "overdue") => {
    try {
      await updateInstallment.mutateAsync({
        id: installment.id,
        status: newStatus,
        paid_at: newStatus === "completed" ? new Date().toISOString() : null,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstallment.mutateAsync(installment.id);
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir parcela",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 bg-card/50">
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-medium text-foreground leading-tight">
                Parcela {installment.installment_number}/{installment.total_installments}
              </h3>
              {installment.obligations?.title && (
                <p className="text-sm text-muted-foreground mt-1">
                  {installment.obligations.title}
                </p>
              )}
            </div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        </div>
        
        <div className="p-6 pt-0 space-y-2 pb-3">
          {installment.obligations?.clients && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{installment.obligations.clients.name}</span>
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
        </div>

        <div className="flex items-center p-6 pt-3 border-t gap-2">
          {installment.status === "pending" && (
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 flex-1"
              onClick={() => handleStatusChange("completed")}
              disabled={updateInstallment.isPending}
            >
              Marcar como Concluído
            </button>
          )}
          {(installment.status === "paid" || installment.status === "completed") && (
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 flex-1"
              onClick={() => handleStatusChange("pending")}
              disabled={updateInstallment.isPending}
            >
              Reverter para Pendente
            </button>
          )}
          
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <InstallmentEditForm
        installment={installment}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteConfirmation
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        itemName={`Parcela ${installment.installment_number}/${installment.total_installments}`}
        clientName={installment.obligations?.clients?.name}
        dueDate={format(new Date(installment.due_date), "dd/MM/yyyy", { locale: ptBR })}
      />
    </>
  );
}
