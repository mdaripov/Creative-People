import type { Session } from "@supabase/supabase-js";

export type AppRole = "smm_specialist" | "manager";

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  updated_at: string;
}

export interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}