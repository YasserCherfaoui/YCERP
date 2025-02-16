import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import AddProductForm from "./add-product-form";


export default function () {
  const navigate = useNavigate();
  const company = useSelector((state: RootState) => state.company.company);

  if (!company) return;
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft />
          Back to Menu
        </Button>
        <span className="text-2xl">{company.company_name} &gt; Products</span>
      </div>
      <div className="flex gap-2">
        <AddProductForm />
      </div>
    </div>
  );
}
