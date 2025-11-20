import { useState } from "react";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/forms/ClientForm";
import { useClients, Client } from "@/hooks/useClients";
import { ClientDetailsDialog } from "@/components/clients/ClientDetailsDialog";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [regimeFilter, setRegimeFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { clients, isLoading, deleteClient } = useClients();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.document.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegime =
      regimeFilter === "all" || client.tax_regime === regimeFilter;

    return matchesSearch && matchesRegime;
  });

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setDetailsOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setEditOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedClient) {
      await deleteClient.mutateAsync(selectedClient.id);
      setDeleteOpen(false);
      setSelectedClient(null);
    }
  };

  const taxRegimeLabels: Record<string, string> = {
    simples_nacional: "Simples Nacional",
    lucro_presumido: "Lucro Presumido",
    lucro_real: "Lucro Real",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus clientes e suas informações
          </p>
        </div>
        <ClientForm />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CNPJ ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={regimeFilter} onValueChange={setRegimeFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filtrar por regime" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os regimes</SelectItem>
            <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
            <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
            <SelectItem value="lucro_real">Lucro Real</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              Nenhum cliente encontrado
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-all">
              <CardHeader className="space-y-2">
                <h3 className="font-semibold text-lg">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.document}</p>
                {client.tax_regime && (
                  <p className="text-xs px-2 py-1 rounded-md bg-muted w-fit">
                    {taxRegimeLabels[client.tax_regime]}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {client.email && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Email:</span> {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Telefone:</span> {client.phone}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Cliente desde {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleViewDetails(client)}
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(client)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(client)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ClientDetailsDialog
        client={selectedClient}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <ClientEditDialog
        client={selectedClient}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteConfirmation
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Excluir Cliente"
        itemName={selectedClient?.name || ""}
      />
    </div>
  );
}
