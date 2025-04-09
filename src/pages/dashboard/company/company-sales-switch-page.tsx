import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { Card, CardContent } from "@/components/ui/card";

import { Building, Store } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function () {
  const navigate = useNavigate();
  const company = useSelector((state: RootState) => state.company.company);
  return (
    <div className="flex flex-col   w-screen h-screen p-4">
        <div className="flex gap-2 items-center">
            <AppBarBackButton destination="Menu" />
            <p>{company?.company_name} &gt; Sales Menu</p>
        </div>
      <div className="flex flex-col  justify-center  items-center w-full h-full gap-4">
        <h2 className="text-3xl font-bold text-center">
          Welcome to {company?.company_name} 💼
        </h2>
        <h2 className="text-l italic text-center">
          Monitor your sales just by one click 🎯
        </h2>
        <div className="w-full flex justify-center gap-4">
          {carouselItems.map((item, index) => (
            <Card
              onClick={() => navigate(item.href)}
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
    </div>
  );
}

const carouselItems = [
  {
    label: "Algiers",
    icon: Store,
    href: "algiers",
  },
  {
    label: "Warehouse",
    icon: Building,
    href: "warehouse",
  },
];
