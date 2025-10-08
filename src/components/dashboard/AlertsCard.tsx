import { AlertCircle, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Obligation } from "@/hooks/useObligations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertsCardProps {
  obligations: (Obligation & { clients?: { id: string; name: string } | null; tax_types?: { id: string; name: string } | null })[];
}

const statusConfig = {
  pending: { label: "Pendente", badgeVariant: "secondary" as const },
  in_progress: { label: "Em Andamento", badgeVariant: "default" as const },
  completed: { label: "Concluída", badgeVariant: "default" as const },
  overdue: { label: "Atrasada", badgeVariant: "destructive" as const },
};

export function AlertsCard({ obligations }: AlertsCardProps) {
  const today = new Date();
  const upcomingObligations = obligations
    .filter((o) => o.status !== "completed")
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Próximos Vencimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingObligations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma obrigação pendente
            </p>
          ) : (
            upcomingObligations.map((obligation) => {
              const daysUntilDue = Math.ceil(
                (new Date(obligation.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              const config = statusConfig[obligation.status];

              return (
                <div
                  key={obligation.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {obligation.title}
                      </p>
                      <Badge variant={config.badgeVariant} className="shrink-0">
                        {config.label}
                      </Badge>
                    </div>
                    {obligation.clients && (
                      <p className="text-xs text-muted-foreground">
                        {obligation.clients.name}
                      </p>
                    )}
                    {obligation.responsible && (
                      <div className="flex items-center gap-1 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {obligation.responsible}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(obligation.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      {daysUntilDue >= 0 && (
                        <span className="text-xs text-muted-foreground">
                          • {daysUntilDue === 0 ? "Hoje" : `${daysUntilDue} dias`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
