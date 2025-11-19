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
      className="flex flex-col h-48 w-48 justify-center items-center hover:bg-gray-100 hover:cursor-pointer hover:text-black relative"
    >
      {item.badge !== undefined && item.badge !== null && (
        <Badge
          variant="destructive"
          className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
        >
          {item.badge}
        </Badge>
      )}
      <CardContent className="flex flex-col justify-center items-center gap-2">
        <item.icon size={48} />
        <h3 className="text-xl font-bold">{item.label}</h3>
      </CardContent>
    </Card>
  );
}
