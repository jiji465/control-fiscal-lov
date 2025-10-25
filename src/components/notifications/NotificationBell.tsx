import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useObligations } from "@/hooks/useObligations";
import { useTaxes } from "@/hooks/useTaxes";
import { useInstallments } from "@/hooks/useInstallments";
import { differenceInDays, isToday } from "date-fns";

export function NotificationBell() {
  const { obligations } = useObligations();
  const { taxes } = useTaxes();
  const { installments } = useInstallments();

  const upcomingItems = [
    ...obligations.filter((item) => {
      const daysUntilDue = differenceInDays(new Date(item.due_date), new Date());
      return item.status !== "completed" && daysUntilDue >= 0 && daysUntilDue <= 7;
    }),
    ...taxes.filter((item) => {
      const daysUntilDue = differenceInDays(new Date(item.due_date), new Date());
      return item.status !== "paid" && daysUntilDue >= 0 && daysUntilDue <= 7;
    }),
    ...installments.filter((item) => {
      const daysUntilDue = differenceInDays(new Date(item.due_date), new Date());
      return item.status !== "paid" && daysUntilDue >= 0 && daysUntilDue <= 7;
    }),
  ];

  const count = upcomingItems.length;

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          variant="destructive"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}
