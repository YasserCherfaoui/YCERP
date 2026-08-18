import { RootState } from "@/app/store";
import { getOrderTickets } from "@/services/issue-service";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { useSelector } from "react-redux";

interface OrderTicketsIconProps {
  className?: string;
  size?: number;
}

export default function OrderTicketsIcon({ className }: OrderTicketsIconProps) {
  const company = useSelector((state: RootState) => state.company.company);

  const { data: orderTickets } = useQuery({
    queryKey: ["order-tickets-count", company?.ID],
    queryFn: () => getOrderTickets(company?.ID),
    enabled: !!company,
  });

  const unsolvedCount =
    orderTickets?.data?.filter(
      (ticket) => !ticket.support_replies || ticket.support_replies.length === 0
    ).length || 0;

  return (
    <div className="relative flex items-center justify-center">
      <Ticket className={cn("h-8 w-8 sm:h-12 sm:w-12", className)} aria-hidden />
      {unsolvedCount > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
          {unsolvedCount > 99 ? "99+" : unsolvedCount}
        </span>
      ) : null}
    </div>
  );
}
