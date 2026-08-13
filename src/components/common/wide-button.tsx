import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

interface Props {
  item: { 
    label: string; 
    icon: any; 
    href?: string;
    onClick?: () => void;
    badge?: number | string;
  };
}
export default function ({ item }: Props) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigate(item.href);
    }
  };
  
  return (
    <Card
      onClick={handleClick}
      className="relative flex h-28 w-full min-w-0 flex-col items-center justify-center hover:cursor-pointer hover:bg-gray-100 hover:text-black sm:h-48"
    >
      {item.badge !== undefined && item.badge !== null && (
        <Badge
          variant="destructive"
          className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
        >
          {item.badge}
        </Badge>
      )}
      <CardContent className="flex flex-col items-center justify-center gap-2 p-3 sm:p-6">
        <item.icon className="h-8 w-8 sm:h-12 sm:w-12" />
        <h3 className="text-center text-sm font-bold leading-tight sm:text-xl">{item.label}</h3>
      </CardContent>
    </Card>
  );
}
