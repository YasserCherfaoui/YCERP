import { RootState } from "@/app/store";
import AddProductVariantForm from "@/components/feature-specific/company-products/add-product-variant-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import AddProductForm from "./add-product-form";
import PrintProductsLabelsDialog from "./print-products-labels-dialog";

export default function () {
  const navigate = useNavigate();
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  if (pathname.includes("moderator")) {
    company = useSelector((state: RootState) => state.user.company);
  }
  const lastLocation = pathname.substring(0, pathname.lastIndexOf("/"));

  if (!company) return;
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button onClick={() => navigate(lastLocation)}>
          <ArrowLeft />
          Back to Menu
        </Button>
        <span className="text-2xl">{company.company_name} &gt; Products</span>
      </div>
      <div className="flex gap-2">

        <AddProductForm />
        <AddProductVariantForm />
        <PrintProductsLabelsDialog />

      </div>
    </div>
  );
}
