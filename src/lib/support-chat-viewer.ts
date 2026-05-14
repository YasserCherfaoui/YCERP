import type { RootState } from "@/app/store";
import type {
  FranchiseChatSenderActor,
} from "@/models/data/franchise-chat-message.model";

export type FranchiseChatViewerIdentity =
  | { role: "franchise_administrator"; id: number }
  | { role: "user"; id: number }
  | { role: "administrator"; id: number };

type ViewerBranches = {
  franchiseUser: RootState["franchise"]["user"];
  user: RootState["user"]["user"];
  administrator: RootState["auth"]["user"];
};

/**
 * Canonical identity used for bubble alignment + read-cursor scoping per browser profile.
 */
export function resolveFranchiseChatViewerFromBranches(
  pathname: string,
  { franchiseUser, user, administrator }: ViewerBranches,
): FranchiseChatViewerIdentity | null {
  if (pathname.startsWith("/myFranchise")) {
    if (franchiseUser?.ID != null) {
      return { role: "franchise_administrator", id: franchiseUser.ID };
    }
    if (user?.ID != null) {
      return { role: "user", id: user.ID };
    }
  }

  if (pathname.startsWith("/company")) {
    if (administrator?.ID != null) {
      return { role: "administrator", id: administrator.ID };
    }
    if (user?.ID != null) {
      return { role: "user", id: user.ID };
    }
  }

  if (pathname.includes("/moderator")) {
    if (user?.ID != null) {
      return { role: "user", id: user.ID };
    }
    if (administrator?.ID != null) {
      return { role: "administrator", id: administrator.ID };
    }
  }

  return null;
}

export function resolveFranchiseChatViewer(
  pathname: string,
  state: RootState,
): FranchiseChatViewerIdentity | null {
  return resolveFranchiseChatViewerFromBranches(pathname, {
    franchiseUser: state.franchise.user,
    user: state.user.user,
    administrator: state.auth.user,
  });
}

export function franchiseChatViewerStorageTag(v: FranchiseChatViewerIdentity): string {
  return `${v.role}:${v.id}`;
}

export function franchiseChatMessageIsFromViewerIdentity(
  m: {
    sender_actor: FranchiseChatSenderActor;
    sender_actor_id: number;
  },
  v: FranchiseChatViewerIdentity,
): boolean {
  return (
    (v.role === "franchise_administrator" &&
      m.sender_actor === "franchise_administrator" &&
      m.sender_actor_id === v.id) ||
    (v.role === "user" && m.sender_actor === "user" && m.sender_actor_id === v.id) ||
    (v.role === "administrator" &&
      m.sender_actor === "administrator" &&
      m.sender_actor_id === v.id)
  );
}

export function isFranchiseChatMessageFromViewer(
  m: {
    sender_actor: FranchiseChatSenderActor;
    sender_actor_id: number;
  },
  pathname: string,
  state: RootState,
): boolean {
  const v = resolveFranchiseChatViewer(pathname, state);
  if (!v) return false;
  return franchiseChatMessageIsFromViewerIdentity(m, v);
}

