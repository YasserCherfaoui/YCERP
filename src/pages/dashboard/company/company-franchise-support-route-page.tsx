import FranchiseAppBar from "@/components/feature-specific/company-franchise/franchise-app-bar";
import FranchiseSupportChatMessengerShell from "@/components/feature-specific/support-chat/franchise-support-chat-messenger-shell";
import FranchiseSupportChatPanel from "@/components/feature-specific/support-chat/franchise-support-chat-panel";
import { useParams } from "react-router-dom";

export default function CompanyFranchiseSupportRoutePage() {
  const { franchiseID } = useParams();
  const id = franchiseID ? Number(franchiseID) : NaN;
  const fid = Number.isFinite(id) ? id : NaN;

  return (
    <div className="flex flex-col m-10 gap-8">
      <FranchiseAppBar />
      <FranchiseSupportChatMessengerShell
        position="inline"
        open
        defaultSize="expanded"
        subtitle="Chat with franchises"
      >
        <FranchiseSupportChatPanel franchiseId={fid > 0 ? fid : undefined} />
      </FranchiseSupportChatMessengerShell>
    </div>
  );
}
