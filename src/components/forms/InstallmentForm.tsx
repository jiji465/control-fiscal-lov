import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/hooks/useClients";
import { useObligations } from "@/hooks/useObligations";
import { useInstallments } from "@/hooks/useInstallments";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { adjustDueDateForWeekend, WeekendHandling } from "@/lib/weekendUtils";

const installmentFormSchema = z.object({
  obligation_id: z.string().min(1, "Selecione uma obrigação"),
  installment_number: z.coerce.number().min(1, "Número da parcela deve ser maior que 0"),
  total_installments: z.coerce.number().min(1, "Total de parcelas deve ser maior que 0"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que 0"),
  due_date: z.date({ required_error: "Selecione a data de vencimento" }),
  weekend_handling: z.enum(["advance", "postpone", "next_business_day"]),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
});

type InstallmentFormValues = z.infer<typeof installmentFormSchema>;

interface InstallmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallmentForm({ open, onOpenChange }: InstallmentFormProps) {
  const { clients } = useClients();
  const { obligations } = useObligations();
  const { createInstallment } = useInstallments();

  const form = useForm<InstallmentFormValues>({
    resolver: zodResolver(installmentFormSchema),
    defaultValues: {
      installment_number: 1,
      total_installments: 1,
      weekend_handling: "next_business_day",
      status: "pending",
    },
  });

  const onSubmit = async (data: InstallmentFormValues) => {
    const adjustedDueDate = adjustDueDateForWeekend(data.due_date, data.weekend_handling as WeekendHandling);
    const originalDueDate = data.due_date;
    
    await createInstallment.mutateAsync({
      obligation_id: data.obligation_id,
      installment_number: data.installment_number,
      total_installments: data.total_installments,
      amount: data.amount,
      due_date: format(adjustedDueDate, "yyyy-MM-dd"),
      weekend_handling: data.weekend_handling,
      status: data.status,
    } as any);

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Parcela</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="obligation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obrigação *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma obrigação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {obligations.map((obligation) => (
                        <SelectItem key={obligation.id} value={obligation.id}>
                          {obligation.title}
                          {obligation.clients && ` - ${obligation.clients.name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installment_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Parcela *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Parcelas *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Parcela *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" placeholder="1500.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Vencimento *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weekend_handling"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamento de Final de Semana</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="next_business_day">Próximo dia útil</SelectItem>
                      <SelectItem value="advance">Antecipar para sexta-feira</SelectItem>
                      <SelectItem value="postpone">Postergar para segunda-feira</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="overdue">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createInstallment.isPending}>
                {createInstallment.isPending ? "Criando..." : "Criar Parcela"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
