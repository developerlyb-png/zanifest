"use client";

import DashboardMain from "@/components/dashboard/DashboardMain";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import UserDetails from "@/components/ui/UserDetails";
import React, { useEffect } from "react";
import { GetServerSidePropsContext } from "next";
import { verify } from "jsonwebtoken";

function DashboardPage() {

  /* ================= AUTO LOGOUT (30 min idle) ================= */
 
useEffect(() => {
  let timer: NodeJS.Timeout;

  const logoutUser = async () => {
    try {
      // ✅ API call same as button
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      // 🔥 force reload after logout
      window.location.href = "/login";
    } catch (err) {
      console.error("Auto logout error:", err);
    }
  };

  const resetTimer = () => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      logoutUser();
    }, 30 * 60 * 1000); // 30 minutes
  };

  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keydown", resetTimer);
  window.addEventListener("click", resetTimer);
  window.addEventListener("scroll", resetTimer);
  window.addEventListener("touchstart", resetTimer);

  resetTimer();

  return () => {
    clearTimeout(timer);
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

/* ================= SERVER SIDE AUTH ================= */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req } = context;

  const token = req.cookies.userToken;
  const absExp = req.cookies.abs_exp; // 🔥 ADD THIS

  console.log("USER COOKIE:", req.cookies);

  // ❌ no token or no expiry
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
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
}