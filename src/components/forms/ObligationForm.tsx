import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";
import { useObligations } from "@/hooks/useObligations";
import { useClients } from "@/hooks/useClients";
import { useTaxTypes } from "@/hooks/useTaxTypes";
import { useInstallments } from "@/hooks/useInstallments";
import { addMonths, format } from "date-fns";

export function ObligationForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [taxTypeId, setTaxTypeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "monthly" | "quarterly" | "semiannual" | "annual">("none");
  const [notes, setNotes] = useState("");
  const [responsible, setResponsible] = useState("");
  const [hasInstallments, setHasInstallments] = useState(false);
  const [installmentCount, setInstallmentCount] = useState("1");
  
  const { createObligation } = useObligations();
  const { clients } = useClients();
  const { taxTypes } = useTaxTypes();
  const { createInstallment } = useInstallments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const obligation = await createObligation.mutateAsync({
      title,
      description: description || undefined,
      client_id: clientId,
      tax_type_id: taxTypeId || undefined,
      due_date: dueDate,
      status: "pending",
      recurrence,
      notes: notes || undefined,
      responsible: responsible || undefined,
    });

    // Criar parcelas se necessário
    if (hasInstallments && installmentCount && parseInt(installmentCount) > 1) {
      const totalInstallments = parseInt(installmentCount);
      
      for (let i = 1; i <= totalInstallments; i++) {
        const installmentDueDate = format(addMonths(new Date(dueDate), i - 1), "yyyy-MM-dd");
        await createInstallment.mutateAsync({
          obligation_id: obligation.id,
          installment_number: i,
          total_installments: totalInstallments,
          due_date: installmentDueDate,
          status: "pending",
        });
      }
    }

    // Reset form
    setTitle("");
    setDescription("");
    setClientId("");
    setTaxTypeId("");
    setDueDate("");
    setRecurrence("none");
    setNotes("");
    setResponsible("");
    setHasInstallments(false);
    setInstallmentCount("1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Obrigação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Obrigação Fiscal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: DCTF - Declaração de Débitos"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição detalhada da obrigação"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Input
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Nome do responsável pela obrigação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionais sobre esta obrigação"
              rows={2}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasInstallments"
                checked={hasInstallments}
                onCheckedChange={(checked) => setHasInstallments(checked as boolean)}
              />
              <Label htmlFor="hasInstallments" className="font-normal cursor-pointer">
                Dividir em parcelas
              </Label>
            </div>

            {hasInstallments && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="installmentCount">Número de Parcelas</Label>
                <Input
                  id="installmentCount"
                  type="number"
                  min="2"
                  max="12"
                  value={installmentCount}
                  onChange={(e) => setInstallmentCount(e.target.value)}
                  placeholder="Ex: 3"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createObligation.isPending}>
              {createObligation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Obrigação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
