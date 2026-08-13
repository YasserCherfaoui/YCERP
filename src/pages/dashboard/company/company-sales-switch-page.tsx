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
    <div className="flex min-h-[100dvh] w-full flex-col p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
            <AppBarBackButton destination="Menu" />
            <p className="truncate">{company?.company_name} &gt; Sales Menu</p>
        </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 py-8">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Welcome to {company?.company_name}
        </h2>
        <h2 className="text-center text-sm italic sm:text-base">
          Monitor your sales just by one click
        </h2>
        <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-4">
          {carouselItems.map((item, index) => (
            <Card
              onClick={() => navigate(item.href)}
              key={index}
              className="flex h-28 w-full cursor-pointer flex-col items-center justify-center hover:bg-gray-100 hover:text-black sm:h-48"
            >
              <CardContent className="flex flex-col items-center justify-center gap-2 p-3 sm:p-6">
                <item.icon className="h-8 w-8 sm:h-12 sm:w-12" />
                <h3 className="text-center text-sm font-bold sm:text-xl">{item.label}</h3>
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
