"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionChecker() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/check-session", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          // ❌ session expired → redirect to login
          router.push("/adminlogin"); // or common login page
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };

    const interval = setInterval(checkSession, 30000); // every 30 sec

    return () => clearInterval(interval);
  }, []);

  return null;
}