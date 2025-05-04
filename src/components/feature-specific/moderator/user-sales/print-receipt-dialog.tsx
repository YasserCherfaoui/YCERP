import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sale } from "@/models/data/sale.model";
import { Printer } from "lucide-react";


interface Props {
    sale: Sale;
}

export default function({}: Props) {
    return <Dialog>
        <DialogTrigger asChild>
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
                <Printer /> 
                Print Receipt
            </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            </DialogHeader>
        </DialogContent>
    </Dialog>
}