import { Card, CardContent } from "@/components/ui/card";

import { Building, Settings, Store, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function () {
    const navigate = useNavigate();
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4 px-4 py-8">
      <h2 className="text-center text-2xl font-bold sm:text-3xl">Welcome to YourERP 💼</h2>
      <h2 className="text-center text-sm italic sm:text-base">Monitor your sales, inventory and more just by one click 🎯</h2>
      <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {carouselItems.map((item, index) => (
          <Card
            onClick={()=> navigate(item.href)}
            key={index}
            className="flex h-28 w-full flex-col items-center justify-center hover:cursor-pointer hover:bg-gray-100 hover:text-black sm:h-48"
          >
            <CardContent className="flex flex-col items-center justify-center gap-2 p-3 sm:p-6">
              <item.icon className="h-8 w-8 sm:h-12 sm:w-12" />
              <h3 className="text-center text-sm font-bold sm:text-xl">{item.label}</h3>
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
