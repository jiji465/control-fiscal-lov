import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { useTaxes } from "@/hooks/useTaxes";
import { adjustDueDateForWeekend, isWeekend } from "@/lib/weekendUtils";
import { format, parseISO } from "date-fns";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  tax_type_name: z.string().min(1, "Tipo de imposto é obrigatório"),
  description: z.string().optional(),
  due_date: z.string().min(1, "Data de vencimento é obrigatória"),
  recurrence: z.enum(["none", "monthly", "quarterly", "semiannual", "annual"]),
  responsible: z.string().optional(),
  notes: z.string().optional(),
  weekend_handling: z.enum(["advance", "postpone", "next_business_day"]),
});

interface TaxFormProps {
  onSuccess?: () => void;
}

export function TaxForm({ onSuccess }: TaxFormProps) {
  const { clients } = useClients();
  const { createTax } = useTaxes();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recurrence: "none",
      weekend_handling: "next_business_day",
    },
  });

  const watchedDueDate = form.watch("due_date");
  const watchedWeekendHandling = form.watch("weekend_handling");

  const dueDateIsWeekend = watchedDueDate && isWeekend(parseISO(watchedDueDate));
  const adjustedDate = watchedDueDate && dueDateIsWeekend
    ? adjustDueDateForWeekend(parseISO(watchedDueDate), watchedWeekendHandling)
    : null;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const dueDate = parseISO(values.due_date);
    const originalDueDate = isWeekend(dueDate) ? values.due_date : null;
    const adjustedDueDate = isWeekend(dueDate)
      ? format(adjustDueDateForWeekend(dueDate, values.weekend_handling), "yyyy-MM-dd")
      : values.due_date;

    await createTax.mutateAsync({
      client_id: values.client_id,
      tax_type_name: values.tax_type_name,
      description: values.description,
      due_date: adjustedDueDate,
      original_due_date: originalDueDate,
      status: "pending",
      recurrence: values.recurrence,
      responsible: values.responsible,
      notes: values.notes,
      weekend_handling: values.weekend_handling,
    });

    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tax_type_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Imposto *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: ICMS, ISS, PIS, COFINS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição do imposto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Vencimento *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {dueDateIsWeekend && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta data cai em um final de semana.
              {adjustedDate && (
                <span className="font-semibold">
                  {" "}Será ajustada para {format(adjustedDate, "dd/MM/yyyy")}.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

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
                  <SelectItem value="advance">Antecipar para sexta-feira</SelectItem>
                  <SelectItem value="postpone">Adiar para segunda-feira</SelectItem>
                  <SelectItem value="next_business_day">Próximo dia útil (padrão)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recorrência</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Único</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="semiannual">Semestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Nome do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createTax.isPending}>
          {createTax.isPending ? "Criando..." : "Criar Imposto"}
        </Button>
      </form>
    </Form>
  );
}
