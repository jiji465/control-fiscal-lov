import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Obligation {
  id: string;
  user_id?: string;
  client_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  recurrence: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
  amount?: number;
  notes?: string;
  responsible?: string;
  created_at: string;
  updated_at: string;
}

export function useObligations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: obligations = [], isLoading } = useQuery({
    queryKey: ["obligations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obligations")
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as (Obligation & { clients: { id: string; name: string } | null; })[];
    },
  });

  const createObligation = useMutation({
    mutationFn: async (obligation: Omit<Obligation, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("obligations")
        .insert([obligation])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obligations"] });
      toast({ title: "Obrigação criada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar obrigação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateObligation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Obligation> & { id: string }) => {
      const { data, error } = await supabase
        .from("obligations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obligations"] });
      toast({ title: "Obrigação atualizada com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar obrigação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteObligation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("obligations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obligations"] });
      toast({ title: "Obrigação excluída com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir obrigação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    obligations,
    isLoading,
    createObligation,
    updateObligation,
    deleteObligation,
  };
}
