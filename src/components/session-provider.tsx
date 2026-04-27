"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/lib/auth";
import { getReadableAuthError } from "@/lib/auth-error";

interface SessionContextValue {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

async function loadProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, role, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

function buildFallbackProfile(session: Session): UserProfile {
  const firstName =
    typeof session.user.user_metadata?.first_name === "string"
      ? session.user.user_metadata.first_name
      : null;
  const lastName =
    typeof session.user.user_metadata?.last_name === "string"
      ? session.user.user_metadata.last_name
      : null;
  const avatarUrl =
    typeof session.user.user_metadata?.avatar_url === "string"
      ? session.user.user_metadata.avatar_url
      : null;
  const role =
    session.user.user_metadata?.role === "manager" ? "manager" : "smm_specialist";

  return {
    id: session.user.id,
    first_name: firstName,
    last_name: lastName,
    avatar_url: avatarUrl,
    role,
    updated_at: new Date().toISOString(),
  };
}

async function ensureProfile(session: Session) {
  const fallbackProfile = buildFallbackProfile(session);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: fallbackProfile.id,
        first_name: fallbackProfile.first_name,
        last_name: fallbackProfile.last_name,
        avatar_url: fallbackProfile.avatar_url,
        role: fallbackProfile.role,
      },
      {
        onConflict: "id",
      }
    )
    .select("id, first_name, last_name, avatar_url, role, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!active) return;

      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        let nextProfile = await loadProfile(nextSession.user.id);

        if (!nextProfile) {
          nextProfile = await ensureProfile(nextSession);
        }

        if (!active) return;

        setProfile(nextProfile ?? buildFallbackProfile(nextSession));
      } catch (error) {
        if (!active) return;

        setProfile(buildFallbackProfile(nextSession));
        toast.error(getReadableAuthError(error));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const initialize = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      await syncSession(initialSession);
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        void syncSession(nextSession);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, loading]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}