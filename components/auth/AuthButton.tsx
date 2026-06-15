"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthButton() {
  const router = useRouter();
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

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push("/login");
    router.refresh();
  }

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="rounded-full px-4 py-2 text-[#5B3A29] hover:bg-[#FFFAF2]"
      >
        Login
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full px-4 py-2 text-[#5B3A29] hover:bg-[#FFFAF2]"
    >
      Logout
    </button>
  );
}