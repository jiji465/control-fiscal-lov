import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClientForm } from "@/components/forms/ClientForm";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, isLoading } = useClients();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.document.includes(searchTerm)
  );

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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
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
            <div key={client.id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <h3 className="font-semibold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.document}</p>
              </CardHeader>
              <CardContent className="space-y-2">
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
                <p className="text-xs text-muted-foreground mt-2">
                  Cliente desde {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                <div className="pt-4">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 w-full">
                    Ver Detalhes
                  </button>
                </div>
              </CardContent>
            </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
