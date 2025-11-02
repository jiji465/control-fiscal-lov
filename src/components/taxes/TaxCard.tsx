import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Edit, Trash2, User, FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WeekendBadge } from "@/components/shared/WeekendBadge";
import { useTaxes } from "@/hooks/useTaxes";
import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaxCardProps {
  tax: any;
  onEdit?: (tax: any) => void;
}

export function TaxCard({ tax, onEdit }: TaxCardProps) {
  const { updateTax, deleteTax } = useTaxes();
  const dueDate = parseISO(tax.due_date);
  const isOverdue = isPast(dueDate) && tax.status === "pending";

  const handleMarkAsCompleted = async () => {
    await updateTax.mutateAsync({
      id: tax.id,
      status: "completed",
      paid_at: new Date().toISOString(),
    });
  };

  const handleMarkAsPending = async () => {
    await updateTax.mutateAsync({
      id: tax.id,
      status: "pending",
      paid_at: null,
    });
  };

  const handleDelete = async () => {
    if (confirm("Deseja realmente excluir este imposto?")) {
      await deleteTax.mutateAsync(tax.id);
    }
  };

  const recurrenceLabels: Record<string, string> = {
    none: "Único",
    monthly: "Mensal",
    quarterly: "Trimestral",
    semiannual: "Semestral",
    annual: "Anual",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{tax.tax_type_name}</h3>
            {tax.clients && (
              <p className="text-sm text-muted-foreground truncate">
                {tax.clients.name}
              </p>
            )}
          </div>
          <StatusBadge status={isOverdue ? "overdue" : tax.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Vencimento:</span>
            <span className="font-medium">
              {format(dueDate, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>

          {tax.original_due_date && tax.original_due_date !== tax.due_date && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Data original:</span>
              <span className="text-xs">
                {format(parseISO(tax.original_due_date), "dd/MM/yyyy")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <WeekendBadge dueDate={tax.due_date} originalDate={tax.original_due_date} />
            {tax.recurrence !== "none" && (
              <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                🔁 {recurrenceLabels[tax.recurrence]}
              </span>
            )}
          </div>
        </div>

        {tax.responsible && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{tax.responsible}</span>
          </div>
        )}

        {tax.description && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mt-0.5" />
            <span className="line-clamp-2">{tax.description}</span>
          </div>
        )}

        <div>
          <div className="flex gap-2 pt-2 border-t">
            {tax.status === "pending" ? (
              <Button
                size="sm"
                variant="default"
                onClick={handleMarkAsCompleted}
                className="flex-1"
                disabled={updateTax.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Marcar como Concluído
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAsPending}
                className="flex-1"
                disabled={updateTax.isPending}
              >
                Marcar como Pendente
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(tax)}
              disabled={updateTax.isPending}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={deleteTax.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
