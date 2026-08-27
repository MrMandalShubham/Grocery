"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

import { supabase } from "@/lib/supabase";

type Role = "B2C" | "B2B";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: any;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("B2C");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user?.user_metadata?.role) {
        setRole(session.user.user_metadata.role as Role);
      }
    });

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user?.user_metadata?.role) {
        setRole(session.user.user_metadata.role as Role);
      } else {
        setRole("B2C"); // Fallback for logged out users
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, user }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
}
