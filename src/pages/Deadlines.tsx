
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
import { DeadlineCard } from "@/components/deadlines/DeadlineCard";
import { DeadlineForm } from "@/components/forms/DeadlineForm";
import { useDeadlines } from "@/hooks/useDeadlines";
import { useClients } from "@/hooks/useClients";

export default function Deadlines() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"obligation" | "tax" | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const { deadlines, isLoading } = useDeadlines();
  const { clients } = useClients();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const filteredDeadlines = deadlines.filter((deadline) => {
    const matchesSearch =
      deadline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deadline.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || deadline.status === statusFilter;
    const matchesType = typeFilter === "all" || deadline.type === typeFilter;
    const matchesClient = clientFilter === "all" || deadline.client_id === clientFilter;

    return matchesSearch && matchesStatus && matchesType && matchesClient;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prazos Fiscais</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as obrigações e impostos
          </p>
        </div>
        <div className="flex gap-2">
          <DeadlineForm />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por título ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
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
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "obligation" | "tax" | "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="obligation">Obrigação</SelectItem>
            <SelectItem value="tax">Imposto</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDeadlines.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              Nenhum prazo encontrado com os filtros selecionados
            </p>
          </div>
        ) : (
          filteredDeadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id}
              deadline={deadline}
            />
          ))
        )}
      </div>
    </div>
  );
}
