import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useObligations, Obligation } from "@/hooks/useObligations";
import { useClients } from "@/hooks/useClients";
import { useTaxTypes } from "@/hooks/useTaxTypes";

interface ObligationEditFormProps {
  obligation: Obligation & { 
    clients?: { id: string; name: string } | null; 
    tax_types?: { id: string; name: string } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ObligationEditForm({ obligation, open, onOpenChange }: ObligationEditFormProps) {
  const [title, setTitle] = useState(obligation.title);
  const [description, setDescription] = useState(obligation.description || "");
  const [clientId, setClientId] = useState(obligation.client_id);
  const [taxTypeId, setTaxTypeId] = useState(obligation.tax_type_id || "");
  const [dueDate, setDueDate] = useState(obligation.due_date);
  const [recurrence, setRecurrence] = useState<"none" | "monthly" | "quarterly" | "semiannual" | "annual">(obligation.recurrence);
  const [amount, setAmount] = useState(obligation.amount?.toString() || "");
  const [notes, setNotes] = useState(obligation.notes || "");
  const [responsible, setResponsible] = useState(obligation.responsible || "");
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed" | "overdue">(obligation.status);
  
  const { updateObligation, deleteObligation } = useObligations();
  const { clients } = useClients();
  const { taxTypes } = useTaxTypes();

  useEffect(() => {
    if (open) {
      setTitle(obligation.title);
      setDescription(obligation.description || "");
      setClientId(obligation.client_id);
      setTaxTypeId(obligation.tax_type_id || "");
      setDueDate(obligation.due_date);
      setRecurrence(obligation.recurrence);
      setAmount(obligation.amount?.toString() || "");
      setNotes(obligation.notes || "");
      setResponsible(obligation.responsible || "");
      setStatus(obligation.status);
    }
  }, [open, obligation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateObligation.mutateAsync({
      id: obligation.id,
      title,
      description: description || undefined,
      client_id: clientId,
      tax_type_id: taxTypeId || undefined,
      due_date: dueDate,
      status,
      recurrence,
      amount: amount ? parseFloat(amount) : undefined,
      notes: notes || undefined,
      responsible: responsible || undefined,
      completed_at: status === "completed" ? new Date().toISOString() : undefined,
    });

    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir esta obrigação? Esta ação não pode ser desfeita.")) {
      await deleteObligation.mutateAsync(obligation.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Obrigação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxType">Tipo de Imposto</Label>
              <Select value={taxTypeId} onValueChange={setTaxTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {taxTypes.map((taxType) => (
                    <SelectItem key={taxType.id} value={taxType.id}>
                      {taxType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="overdue">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recurrence">Recorrência</Label>
              <Select value={recurrence} onValueChange={(value: any) => setRecurrence(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não se repete</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="semiannual">Semestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Input
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-between pt-4 border-t">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteObligation.isPending}
            >
              {deleteObligation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateObligation.isPending}>
                {updateObligation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
