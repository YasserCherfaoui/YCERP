export type FranchiseChatSenderActor =
  | "franchise_administrator"
  | "user"
  | "administrator";

/** REST response shape (embedded gorm.Model → capital ID/CreatedAt). */
export interface FranchiseChatMessageRecord {
  ID: number;
  CreatedAt: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  franchise_id: number;
  sender_actor: FranchiseChatSenderActor;
  sender_actor_id: number;
  sender_name: string;
  sender_email: string;
  body: string;
}

/** WebSocket broadcast payload (`gin.H`). */
export interface FranchiseChatMessageEventData {
  id: number;
  franchise_id: number;
  sender_actor: FranchiseChatSenderActor;
  sender_actor_id: number;
  sender_name: string;
  sender_email: string;
  body: string;
  created_at: string;
}
