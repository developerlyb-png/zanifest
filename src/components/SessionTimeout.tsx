"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SessionTimeout() {
  const router = useRouter();

  useEffect(() => {
    let timeout: any;

    const logout = async () => {
      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout failed", err);
      }

      alert("Session expired");

      // 🔥 AUTO REFRESH + REDIRECT
      window.location.href = "/login";
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, 60 * 1000); // 1 min
    };

    const events = ["mousemove", "keypress", "click", "scroll"];

    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [router]);

  return null;
}