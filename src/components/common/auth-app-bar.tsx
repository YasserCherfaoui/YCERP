import { useAppDispatch } from "@/app/hooks";
import { RootState } from "@/app/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/auth-slice";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ModeToggle } from "./mode-toggle";

export default function AuthAppBar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  // Migration: Update old default colors to new defaults
  const getUpdatedColor = (key: string, newDefault: string, oldDefault: string) => {
    const stored = localStorage.getItem(key);
    if (stored === oldDefault) {
      // Replace old default with new default
      localStorage.setItem(key, newDefault);
      return newDefault;
    }
    return stored || newDefault;
  };

  const [bgColor, setBgColor] = useState(() => 
    getUpdatedColor("custom-bg", "#000000", "#ffffff")
  );
  const [textColor, setTextColor] = useState(() => 
    getUpdatedColor("custom-text", "#ffffff", "#0a0a0a")
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--background", hexToHsl(bgColor));
    document.documentElement.style.setProperty("--foreground", hexToHsl(textColor));
    localStorage.setItem("custom-bg", bgColor);
    localStorage.setItem("custom-text", textColor);
  }, [bgColor, textColor]);

  const handleBgColorChange = (color: string) => setBgColor(color);
  const handleTextColorChange = (color: string) => setTextColor(color);
  const resetColors = () => {
    setBgColor("#000000");
    setTextColor("#ffffff");
    document.documentElement.style.removeProperty("--background");
    document.documentElement.style.removeProperty("--foreground");
    localStorage.removeItem("custom-bg");
    localStorage.removeItem("custom-text");
  };

  // Helper to convert hex to HSL string for CSS variable
  function hexToHsl(hex: string) {
    // Remove # if present
    hex = hex.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0,2), 16);
      g = parseInt(hex.substring(2,4), 16);
      b = parseInt(hex.substring(4,6), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `${h} ${s}% ${l}%`;
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

  // Hide the entire AuthAppBar on mobile devices
  if (isMobile) {
    return null;
  }

  return fullName ? (
    <div className="flex items-center justify-between p-4 w-1/2 m-auto">
      <div>Welcome, {fullName}</div>
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <ModeToggle />
        {/* Color pickers */}
        <div  className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs">
            BG
            <input
              type="color"
              value={bgColor}
              onChange={e => handleBgColorChange(e.target.value)}
              aria-label="Pick background color"
              className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
            />
          </label>
          <label className="flex items-center gap-1 text-xs">
            Text
            <input
              type="color"
              value={textColor}
              onChange={e => handleTextColorChange(e.target.value)}
              aria-label="Pick text color"
              className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
            />
          </label>
          <Button size="sm" variant="ghost" onClick={resetColors} className="text-xs px-2">Reset</Button>
        </div>
        {/* User dropdown */}
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


