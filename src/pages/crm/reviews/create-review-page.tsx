import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CreateReviewDialog from "./create-review-dialog";

export default function CreateReviewPage() {
  const navigate = useNavigate();
  const { companyID } = useParams<{ companyID: string }>();
  const [searchParams] = useSearchParams();

  const close = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const phone = searchParams.get("customer_phone");
    const base = companyID ? `/company/${companyID}/crm/customers` : "/moderator/crm/customers";
    navigate(phone ? `${base}/${phone}` : base, { replace: true });
  };

  return <CreateReviewDialog open onOpenChange={(open) => !open && close()} />;
}
