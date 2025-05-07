import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/auth-slice";
import { LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AuthAppBar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  let fullName = user?.full_name;
  const { pathname } = useLocation();

  const isModerator = pathname.includes("moderator");
  const isMyFranchise = pathname.includes("myFranchise");
  if (isModerator) {
    const user = useSelector((state: RootState) => state.user.user);
    fullName = user?.full_name;
  }
  if (isMyFranchise) {
    const user = useSelector((state: RootState) => state.franchise.user);
    fullName = user?.full_name;
  }

  const handleLogout = () => {
    dispatch(logout());
    if (isModerator) {
      navigate("/moderator/login");
    } else {
      navigate("/login");
    }
    if (isMyFranchise) {
      navigate("/myFranchise");
    }
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
  };

  return fullName ? (
    <div className="flex items-center justify-between p-4 w-1/2 m-auto">
      <div>Welcome, {fullName}</div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  ) : null;
}
