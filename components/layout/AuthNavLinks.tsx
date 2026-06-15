"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthNavLinks() {
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

  if (isLoading || !isLoggedIn) {
    return null;
  }

  return (
    <>
      <a
        href="/horses/new"
        className="rounded-full px-4 py-2 text-[#5B3A29] hover:bg-[#FFFAF2]"
      >
        Add Horse
      </a>

      <a
        href="/breeding-planner"
        className="rounded-full px-4 py-2 text-[#5B3A29] hover:bg-[#FFFAF2]"
      >
        Breeding Planner
      </a>
    </>
  );
}