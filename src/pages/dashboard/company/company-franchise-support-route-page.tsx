import FranchiseAppBar from "@/components/feature-specific/company-franchise/franchise-app-bar";
import FranchiseSupportChatPanel from "@/components/feature-specific/support-chat/franchise-support-chat-panel";
import { useParams } from "react-router-dom";

export default function CompanyFranchiseSupportRoutePage() {
  const { franchiseID } = useParams();
  const id = franchiseID ? Number(franchiseID) : NaN;

  return (
    <div className="flex flex-col m-10 gap-8">
      <FranchiseAppBar />
      <FranchiseSupportChatPanel franchiseId={Number.isFinite(id) ? id : undefined} />
    </div>
  );
}
