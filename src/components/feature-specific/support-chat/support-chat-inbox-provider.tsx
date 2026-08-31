import { RootState } from "@/app/store";
import { useSupportChatInbox } from "@/hooks/use-support-chat-inbox";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

type Props = {
  /** Company scope for HQ/moderator inbox; omit on franchise portal. */
  companyId?: number;
};

/**
 * Opens the support-chat inbox WebSocket once per authenticated shell so unread badges update via push.
 */
export default function SupportChatInboxProvider({ companyId }: Props) {
  const location = useLocation();
  const user = useSelector((s: RootState) => s.user.user);
  const franchiseUser = useSelector((s: RootState) => s.franchise.user);

  const isFranchisePortal = location.pathname.startsWith("/myFranchise");
  const isModerator = location.pathname.startsWith("/moderator");
  const isCompany = location.pathname.startsWith("/company");

  const enabled =
    Boolean(localStorage.getItem("token")) &&
    (isFranchisePortal ? Boolean(franchiseUser?.ID) : isCompany || isModerator) &&
    !(user?.role === "orders_manager" || user?.role === "franchise_moderator");

  useSupportChatInbox({
    enabled,
    companyId: isFranchisePortal ? undefined : companyId,
  });

  return null;
}
