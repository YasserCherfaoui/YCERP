import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

interface Props {
  item: { 
    label: string; 
    icon: any; 
    href?: string;
    onClick?: () => void;
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
      className="flex flex-col h-48 w-48 justify-center items-center hover:bg-gray-100 hover:cursor-pointer hover:text-black "
    >
      <CardContent className="flex flex-col justify-center items-center gap-2">
        <item.icon size={48} />
        <h3 className="text-xl font-bold">{item.label}</h3>
      </CardContent>
    </Card>
  );
}
