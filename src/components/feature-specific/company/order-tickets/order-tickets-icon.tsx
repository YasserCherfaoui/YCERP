import { RootState } from "@/app/store";
import { getOrderTickets } from "@/services/issue-service";
import { useQuery } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { useSelector } from "react-redux";

interface OrderTicketsIconProps {
    size?: number;
}

export default function OrderTicketsIcon({ size = 48 }: OrderTicketsIconProps) {
    const company = useSelector((state: RootState) => state.company.company);
    
    const {data: orderTickets} = useQuery({
        queryKey: ["order-tickets-count", company?.ID],
        queryFn: () => getOrderTickets(company?.ID),
        enabled: !!company,
    }); 
    
    const unsolvedCount = orderTickets?.data?.filter(
        (ticket) => !ticket.support_replies || ticket.support_replies.length === 0
    ).length || 0;
    
    return (
        <div className="flex items-center justify-center relative">
            <Ticket size={size} />
            {unsolvedCount > 0 && (
                <div className="rounded-full bg-red-500 text-white p-2 w-6 h-6 flex items-center justify-center text-sm font-bold absolute -top-2 -right-2">
                    {unsolvedCount}
                </div>
            )}
        </div>
    );
}

