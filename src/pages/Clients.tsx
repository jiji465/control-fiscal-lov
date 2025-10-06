import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockClients } from "@/lib/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = mockClients.filter(
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
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
            <Card key={client.id} className="hover:shadow-md transition-shadow">
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
                  Cliente desde {format(client.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                </p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
