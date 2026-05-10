import { RootState } from "@/app/store";
import FranchiseSupportChatPanel from "@/components/feature-specific/support-chat/franchise-support-chat-panel";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function FranchiseSupportChatPage() {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);

  if (!franchise?.ID) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4 mx-auto">
      <Button variant="outline" asChild className="w-fit">
        <Link to="/myFranchise">Back to menu</Link>
      </Button>
      <FranchiseSupportChatPanel franchiseId={franchise.ID} />
    </div>
  );
}
