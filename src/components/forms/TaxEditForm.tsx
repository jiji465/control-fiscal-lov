import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";
import { format, isWeekend } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  tax_type_name: z.string().min(1, "Tipo de imposto é obrigatório"),
  description: z.string().optional(),
  due_date: z.date(),
  recurrence: z.enum(["none", "monthly", "quarterly", "semiannual", "annual"]),
  weekend_handling: z.enum(["advance", "postpone", "next_business_day"]),
  responsible: z.string().optional(),
  notes: z.string().optional(),
});

interface TaxEditFormProps {
  tax: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  onUpdate?: (id: string, data: any) => void;
}

export function TaxEditForm({ tax, open, onOpenChange, onSuccess, onUpdate }: TaxEditFormProps) {
  const { clients } = useClients();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: tax.client_id || "",
      tax_type_name: tax.tax_type_name || "",
      description: tax.description || "",
      due_date: new Date(tax.due_date),
      recurrence: tax.recurrence || "none",
      weekend_handling: tax.weekend_handling || "next_business_day",
      responsible: tax.responsible || "",
      notes: tax.notes || "",
    },
  });

  const selectedDate = form.watch("due_date");
  const weekendHandling = form.watch("weekend_handling");
  const showWeekendWarning = selectedDate && isWeekend(selectedDate);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let finalDueDate = values.due_date;

    if (isWeekend(finalDueDate)) {
      const dayOfWeek = finalDueDate.getDay();
      const newDate = new Date(finalDueDate);

      if (values.weekend_handling === "advance") {
        if (dayOfWeek === 0) newDate.setDate(newDate.getDate() - 2);
        if (dayOfWeek === 6) newDate.setDate(newDate.getDate() - 1);
      } else if (values.weekend_handling === "postpone") {
        if (dayOfWeek === 0) newDate.setDate(newDate.getDate() + 1);
        if (dayOfWeek === 6) newDate.setDate(newDate.getDate() + 2);
      } else {
        if (dayOfWeek === 0) newDate.setDate(newDate.getDate() + 1);
        if (dayOfWeek === 6) newDate.setDate(newDate.getDate() + 2);
      }

      finalDueDate = newDate;
    }

    await onUpdate(tax.id, {
      ...values,
      due_date: format(finalDueDate, "yyyy-MM-dd"),
      original_due_date: isWeekend(values.due_date) 
        ? format(values.due_date, "yyyy-MM-dd") 
        : null,
    });

    onSuccess?.();
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormLabel>Tipo de Imposto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: ICMS, ISS, IRPJ..." {...field} />
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
                <Input placeholder="Descrição do imposto" {...field} />
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
              <FormLabel>Data de Vencimento</FormLabel>
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
                      {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione uma data"}
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
          name="recurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recorrência</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Sem recorrência</SelectItem>
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

        {showWeekendWarning && (
          <>
            <FormField
              control={form.control}
              name="weekend_handling"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamento de Final de Semana</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="advance">Adiantar para sexta-feira</SelectItem>
                      <SelectItem value="postpone">Postergar para segunda-feira</SelectItem>
                      <SelectItem value="next_business_day">Próximo dia útil</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A data selecionada cai em um final de semana.
                {weekendHandling === "advance" && " Será ajustada para a sexta-feira anterior."}
                {weekendHandling === "postpone" && " Será ajustada para a segunda-feira seguinte."}
                {weekendHandling === "next_business_day" && " Será ajustada para o próximo dia útil."}
              </AlertDescription>
            </Alert>
          </>
        )}

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
                <Textarea placeholder="Observações adicionais..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Salvar Alterações
        </Button>
      </form>
    </Form>
  );

  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Imposto</DialogTitle>
            <DialogDescription>
              Faça alterações no imposto abaixo
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
