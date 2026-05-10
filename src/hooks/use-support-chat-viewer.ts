import { RootState } from "@/app/store";
import type { FranchiseSupportChatUIMessage } from "@/hooks/use-franchise-support-chat";
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

  return useMemo(() => {
    if (pathname.startsWith("/myFranchise")) {
      if (franchiseUser?.ID != null) {
        return (m: FranchiseSupportChatUIMessage) =>
          m.sender_actor === "franchise_administrator" && m.sender_actor_id === franchiseUser.ID;
      }
      if (user?.ID != null) {
        return (m: FranchiseSupportChatUIMessage) =>
          m.sender_actor === "user" && m.sender_actor_id === user.ID;
      }
    }

    if (pathname.startsWith("/company")) {
      if (administrator?.ID != null) {
        return (m: FranchiseSupportChatUIMessage) =>
          m.sender_actor === "administrator" && m.sender_actor_id === administrator.ID;
      }
      if (user?.ID != null) {
        return (m: FranchiseSupportChatUIMessage) =>
          m.sender_actor === "user" && m.sender_actor_id === user.ID;
      }
    }

    if (pathname.includes("/moderator")) {
      if (user?.ID != null) {
        return (m: FranchiseSupportChatUIMessage) =>
          m.sender_actor === "user" && m.sender_actor_id === user.ID;
      }
      if (administrator?.ID != null) {
        return (m: FranchiseSupportChatUIMessage) =>
          m.sender_actor === "administrator" && m.sender_actor_id === administrator.ID;
      }
    }

    return () => false;
  }, [pathname, franchiseUser?.ID, user?.ID, administrator?.ID]);
}

