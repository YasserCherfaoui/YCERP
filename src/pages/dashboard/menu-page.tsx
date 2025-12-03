import { Card, CardContent } from "@/components/ui/card";

import { Building, Settings, Store, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function () {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col  justify-center  items-center w-screen h-screen gap-4">
      <h2 className="text-3xl font-bold text-center">Welcome to YourERP 💼</h2>
      <h2 className="text-l italic text-center">Monitor your sales, inventory and more just by one click 🎯</h2>
      <div className="w-full flex justify-center gap-4">
        {carouselItems.map((item, index) => (
          <Card
            onClick={()=> navigate(item.href)}
            key={index}
            className="flex flex-col h-48 w-48 justify-center items-center hover:bg-gray-100 hover:cursor-pointer hover:text-black "
          >
            <CardContent className="flex flex-col justify-center items-center gap-2">
              <item.icon size={48} />
              <h3 className="text-xl font-bold">{item.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const carouselItems = [
  {
    label: "Companies",
    icon: Building,
    href: "/company"
  },
  {
    label: "Franchises",
    icon: Store,
    href: "/franchise"
  },
  {
    label: "Inventories",
    icon: Warehouse,
    href: "/inventory"
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings"
  },
];
