import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Tax {
  id: string;
  user_id?: string;
  client_id: string;
  tax_type_name: string;
  description?: string;
  amount?: number;
  due_date: string;
  paid_at?: string;
  status: "pending" | "paid" | "overdue";
  recurrence: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
  responsible?: string;
  notes?: string;
  weekend_handling: "advance" | "postpone" | "next_business_day";
  original_due_date?: string;
  created_at: string;
  updated_at: string;
}

export function useTaxes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: taxes = [], isLoading } = useQuery({
    queryKey: ["taxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("taxes")
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as (Tax & { clients: { id: string; name: string } | null })[];
    },
  });

  const createTax = useMutation({
    mutationFn: async (tax: Omit<Tax, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("taxes")
        .insert([tax])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      toast({ title: "Imposto criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar imposto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTax = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tax> & { id: string }) => {
      const { data, error } = await supabase
        .from("taxes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      toast({ title: "Imposto atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar imposto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTax = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("taxes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      toast({ title: "Imposto excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir imposto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    taxes,
    isLoading,
    createTax,
    updateTax,
    deleteTax,
  };
}
