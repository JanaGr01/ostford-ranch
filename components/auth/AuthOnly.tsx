"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuthOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function AuthOnly({ children, fallback = null }: AuthOnlyProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      setIsLoggedIn(Boolean(data.session));
      setIsLoading(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}