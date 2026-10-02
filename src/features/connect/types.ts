export type ConnectBusiness = {
  id: string;
  name: string;
  waba_id: string;
  phone_number_id: string;
  member_email: string;
  email_to: string;
  telegram_chat_id: string;
  route_label: string;
  enabled: number;
  last_checked_at: number | null;
  created_at: number;
  updated_at: number;
};

export type ConnectEvent = {
  id: string;
  business_id: string;
  message_type: string;
  received_at: number;
  route_label: string;
  status: "new" | "in_progress" | "done";
  business_name: string;
  deliveries: string | null;
};

export type ConnectEnvironment = {
  APP_DB: D1Database;
  CONNECT_META_APP_SECRET?: string;
  CONNECT_META_VERIFY_TOKEN?: string;
  CONNECT_META_ACCESS_TOKEN?: string;
  CONNECT_META_GRAPH_API_VERSION?: string;
  CONNECT_TELEGRAM_BOT_TOKEN?: string;
  CONNECT_WORKFLOWS?: string;
  AUTH_EMAIL_FROM: string;
  AUTH_EMAIL: {
    send(message: { from: string; to: string; subject: string; text: string }): Promise<unknown>;
  };
};
