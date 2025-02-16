import { RootState } from "@/app/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector } from "react-redux";

export default function () {
    const currentUser = useSelector((state: RootState)=> state.auth.user);
    return <Avatar>
        {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
        <AvatarFallback>
            {currentUser?.full_name?.charAt(0)}
        </AvatarFallback>
    </Avatar>
}