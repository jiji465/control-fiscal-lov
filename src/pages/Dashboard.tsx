
import { FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useInstallments } from "@/hooks/useInstallments";

export default function Dashboard() {
  const { deadlines, isLoading: isLoadingDeadlines } = useDeadlines();
  const { installments, isLoading: isLoadingInstallments } = useInstallments();

  const isLoading = isLoadingDeadlines || isLoadingInstallments;

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const allItems = [...deadlines, ...installments];

  const totalItems = allItems.length;
  const completedItems = allItems.filter((item) => item.status === "completed" || item.status === "paid").length;
  const overdueItems = allItems.filter((item) => item.status === "overdue").length;
  const pendingItems = allItems.filter(
    (item) => item.status === "pending" || item.status === "in_progress"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral de todos os prazos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Prazos"
          value={totalItems}
          description="Cadastrados no sistema"
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Concluídos"
          value={completedItems}
          description={`${Math.round((completedItems / totalItems) * 100)}% do total`}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Atrasados"
          value={overdueItems}
          description="Requerem atenção imediata"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="Pendentes"
          value={pendingItems}
          description="Aguardando conclusão"
          icon={Clock}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsCard items={allItems} />
        
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Resumo por Status</h3>
            <div className="space-y-3">
              {[
                { label: "Pendentes", value: allItems.filter(item => item.status === "pending").length, color: "bg-pending" },
                { label: "Em Andamento", value: allItems.filter(item => item.status === "in_progress").length, color: "bg-warning" },
                { label: "Concluídos", value: completedItems, color: "bg-success" },
                { label: "Atrasados", value: overdueItems, color: "bg-destructive" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
