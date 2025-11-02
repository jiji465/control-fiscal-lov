import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { TaxForm } from "@/components/forms/TaxForm";
import { TaxEditForm } from "@/components/forms/TaxEditForm";
import { TaxCard } from "@/components/taxes/TaxCard";
import { useTaxes } from "@/hooks/useTaxes";
import { isPast, parseISO } from "date-fns";

export default function Taxes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<any>(null);
  const { taxes, isLoading } = useTaxes();

  const filteredTaxes = taxes.filter((tax) => {
    const matchesSearch =
      tax.tax_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tax.clients?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tax.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const actualStatus = isPast(parseISO(tax.due_date)) && tax.status === "pending" ? "overdue" : tax.status;
    const matchesStatus = statusFilter === "all" || actualStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: taxes.length,
    pending: taxes.filter((t) => t.status === "pending" && !isPast(parseISO(t.due_date))).length,
    completed: taxes.filter((t) => t.status === "paid" || t.status === "completed").length,
    overdue: taxes.filter((t) => t.status === "pending" && isPast(parseISO(t.due_date))).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impostos</h1>
          <p className="text-muted-foreground">
            Gerencie impostos e tributos dos seus clientes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Imposto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Imposto</DialogTitle>
              <DialogDescription>
                Adicione um novo imposto ou tributo ao sistema
              </DialogDescription>
            </DialogHeader>
            <TaxForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              impostos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tipo, cliente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="overdue">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTaxes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== "all"
                ? "Nenhum imposto encontrado com os filtros aplicados."
                : "Nenhum imposto cadastrado. Clique em 'Novo Imposto' para começar."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTaxes.map((tax) => (
            <TaxCard key={tax.id} tax={tax} onEdit={setEditingTax} />
          ))}
        </div>
      )}

      {editingTax && (
        <TaxEditForm
          tax={editingTax}
          open={!!editingTax}
          onOpenChange={(open) => !open && setEditingTax(null)}
        />
      )}
    </div>
  );
}
