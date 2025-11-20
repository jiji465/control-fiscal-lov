import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Deadline {
  id: string;
  user_id?: string;
  client_id: string;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  recurrence: "none" | "monthly" | "quarterly" | "semiannual" | "annual";
  type: "obligation" | "tax";
  notes?: string;
  responsible?: string;
  weekend_handling?: string;
  original_due_date?: string;
  created_at: string;
  updated_at: string;
}

type DeadlineWithClient = Deadline & { clients: { id: string; name: string } | null };

export function useDeadlines() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ["deadlines"],
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
      return data as unknown as DeadlineWithClient[];
    },
  });

  const createDeadline = useMutation({
    mutationFn: async (deadline: Omit<Deadline, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("obligations")
        .insert([deadline])
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      return data as unknown as DeadlineWithClient;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData<DeadlineWithClient[]>(["deadlines"], (oldData) => {
        if (!oldData) return [newData];
        return [...oldData, newData].sort((a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
      });
      toast({ title: "Prazo criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar prazo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDeadline = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deadline> & { id: string }) => {
      const { data, error } = await supabase
        .from("obligations")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      return data as unknown as DeadlineWithClient;
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData<DeadlineWithClient[]>(["deadlines"], (oldData) => {
        if (!oldData) return [updatedData];
        return oldData.map((item) => (item.id === updatedData.id ? updatedData : item));
      });
      toast({ title: "Prazo atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar prazo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDeadline = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("obligations").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<DeadlineWithClient[]>(["deadlines"], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((item) => item.id !== deletedId);
      });
      toast({ title: "Prazo excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir prazo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    deadlines,
    isLoading,
    createDeadline,
    updateDeadline,
    deleteDeadline,
  };
}
