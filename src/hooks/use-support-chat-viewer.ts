import { RootState } from "@/app/store";
import type { FranchiseSupportChatUIMessage } from "@/hooks/use-franchise-support-chat";
import {
  franchiseChatMessageIsFromViewerIdentity,
  resolveFranchiseChatViewerFromBranches,
} from "@/lib/support-chat-viewer";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

/**
 * Returns whether a message was sent by the currently logged-in viewer (for bubble alignment).
 */
export function useSupportChatIsOwnMessage(): (m: FranchiseSupportChatUIMessage) => boolean {
  const { pathname } = useLocation();
  const franchiseUser = useSelector((s: RootState) => s.franchise.user);
  const user = useSelector((s: RootState) => s.user.user);
  const administrator = useSelector((s: RootState) => s.auth.user);

  const viewer = useMemo(
    () =>
      resolveFranchiseChatViewerFromBranches(pathname, {
        franchiseUser,
        user,
        administrator,
      }),
    [pathname, franchiseUser?.ID, user?.ID, administrator?.ID],
  );

  return useMemo(() => {
    if (!viewer) return () => false;
    return (m: FranchiseSupportChatUIMessage) =>
      franchiseChatMessageIsFromViewerIdentity(
        {
          sender_actor: m.sender_actor,
          sender_actor_id: m.sender_actor_id,
        },
        viewer,
      );
  }, [viewer]);
}
