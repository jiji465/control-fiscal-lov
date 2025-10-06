import { FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AlertsCard } from "@/components/dashboard/AlertsCard";
import { mockObligations } from "@/lib/mockData";

export default function Dashboard() {
  const totalObligations = mockObligations.length;
  const completedObligations = mockObligations.filter((o) => o.status === "completed").length;
  const overdueObligations = mockObligations.filter((o) => o.status === "overdue").length;
  const pendingObligations = mockObligations.filter(
    (o) => o.status === "pending" || o.status === "in_progress"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral das obrigações e impostos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Obrigações"
          value={totalObligations}
          description="Cadastradas no sistema"
          icon={FileText}
          variant="default"
        />
        <StatsCard
          title="Concluídas"
          value={completedObligations}
          description={`${Math.round((completedObligations / totalObligations) * 100)}% do total`}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Atrasadas"
          value={overdueObligations}
          description="Requerem atenção imediata"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatsCard
          title="Em Andamento"
          value={pendingObligations}
          description="Pendentes e em progresso"
          icon={Clock}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsCard obligations={mockObligations} />
        
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Resumo por Status</h3>
            <div className="space-y-3">
              {[
                { label: "Pendentes", value: mockObligations.filter(o => o.status === "pending").length, color: "bg-pending" },
                { label: "Em Andamento", value: mockObligations.filter(o => o.status === "in_progress").length, color: "bg-warning" },
                { label: "Concluídas", value: completedObligations, color: "bg-success" },
                { label: "Atrasadas", value: overdueObligations, color: "bg-destructive" },
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
