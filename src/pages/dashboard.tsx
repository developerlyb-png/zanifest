import DashboardMain from "@/components/dashboard/DashboardMain";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import React, { useEffect, useRef } from "react";
import UserDetails from "@/components/ui/UserDetails";

import { GetServerSidePropsContext } from "next";
import { verify } from "jsonwebtoken";

function DashboardPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {

    const logoutUser = async () => {
      try {
        await fetch("/api/users/logout", {
          method: "POST",
          credentials: "include",
        });

        window.location.replace("/login"); // redirect
      } catch (err) {
        console.error("Auto logout error:", err);
      }
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        logoutUser();
      }, 30 * 60 * 1000); // 🔥 30 MIN
    };

    // 🔥 user activity detect
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    resetTimer(); // start timer

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };

  }, []);
  return (
    <div>
      <UserDetails />
      <Navbar />
      <DashboardMain />
      <Footer />
    </div>
  );
}

export default DashboardPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req } = context;

  const token = req.cookies.userToken;
  const absExp = req.cookies.abs_exp; // 🔥 ADD THIS

  console.log("SSR COOKIES:", req.cookies); // 🔍 debug

  // ❌ missing cookies
  if (!token || !absExp) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // 🔥 ABSOLUTE EXPIRY CHECK
  if (Date.now() > parseInt(absExp)) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    verify(token, process.env.JWT_SECRET!);
    return { props: {} };
  } catch (err) {
    console.error("JWT ERROR:", err); // 🔍 DEBUG

    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
}
