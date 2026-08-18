import type { ComponentType, KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface Props {
  item: {
    label: string;
    icon: LucideIcon | ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    badge?: number | string;
  };
}

export default function WideButton({ item }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="relative flex min-h-28 w-full min-w-0 cursor-pointer flex-col items-center justify-center transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-48"
    >
      {item.badge !== undefined && item.badge !== null && (
        <Badge
          variant="destructive"
          className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center px-1 text-xs"
        >
          {item.badge}
        </Badge>
      )}
      <CardContent className="flex flex-col items-center justify-center gap-2 p-3 sm:p-6">
        <item.icon className="h-8 w-8 shrink-0 sm:h-12 sm:w-12" aria-hidden />
        <h3 className="line-clamp-2 text-center text-xs font-semibold leading-tight sm:text-base lg:text-lg">
          {item.label}
        </h3>
      </CardContent>
    </Card>
  );
}
