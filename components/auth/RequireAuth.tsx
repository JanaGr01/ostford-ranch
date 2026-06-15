"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RequireAuthProps = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    return (
      <div className="rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
        <p className="text-[#7A6A5A]">Checking login...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-3xl bg-[#FFFAF2] p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Login required</h1>

        <p className="mt-3 text-[#7A6A5A]">
          You need to sign in to manage Ostford Ranch records.
        </p>

        <a
          href="/login"
          className="mt-6 inline-block rounded-full bg-[#5B3A29] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3f281c]"
        >
          Go to Login
        </a>
      </div>
    );
  }

  return <>{children}</>;
}