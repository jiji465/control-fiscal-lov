import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ObligationCard } from "@/components/obligations/ObligationCard";
import { ObligationForm } from "@/components/forms/ObligationForm";
import { useObligations } from "@/hooks/useObligations";
import { ObligationStatus } from "@/types";

export default function Obligations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ObligationStatus | "all">("all");
  const { obligations, isLoading } = useObligations();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const filteredObligations = obligations.filter((obligation) => {
    const matchesSearch =
      obligation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obligation.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || obligation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Obrigações Fiscais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as obrigações acessórias e impostos
          </p>
        </div>
        <div className="flex gap-2">
          <ObligationForm />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por título, cliente ou imposto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ObligationStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="overdue">Atrasada</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredObligations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma obrigação encontrada com os filtros selecionados
            </p>
          </div>
        ) : (
          filteredObligations.map((obligation) => (
            <ObligationCard 
              key={obligation.id} 
              obligation={obligation} 
            />
          ))
        )}
      </div>
    </div>
  );
}
