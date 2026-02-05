"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import styles from "@/styles/components/Auth/Login.module.css";
import Image from "next/image";

export default function Agentlogin() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setLoading(true);

    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    }

    try {
      const res = await fetch("/api/agent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userName,
          password,
        }),
      });

      const data = await res.json();
      // 🔁 HANDLE BACKEND REDIRECT (🔥 ADD THIS BLOCK)
      if (data.redirect) {
        router.replace(data.redirect);
        return;
      }
      if (!res.ok) {
        setError(true);
        alert(data.message || "Login failed");
        return;
      }

      // ✅ AUTH COOKIE
      document.cookie = `agentToken=${data.token}; path=/; max-age=86400`;
      localStorage.setItem("agentName", data.agent?.name || "");

      // 🔥 NEW: CHECK TRAINING STATUS FROM BACKEND
      const meRes = await fetch("/api/agent/me", {
        credentials: "include",
      });
      const meData = await meRes.json();

      if (meData?.agent?.trainingCompleted) {
        router.replace("/agentpage");
        return;
      }

      // 🔥 LOCAL TRAINING CHECK
      const completed = JSON.parse(
        localStorage.getItem("training_completed") || "{}"
      );

      if (Object.keys(completed).length === 3) {
        router.replace("/videolectures?mode=test");
      } else {
        router.replace("/videolectures");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && (
        <div className={styles.loaderOverlay}>
          <FaSpinner className={styles.loaderIcon} />
          <p className={styles.loaderText}>Logging in...</p>
        </div>
      )}

      <div className={styles.cont}>
        <div className={styles.left}>
          <Image
            src={require("@/assets/loginbanner.png")}
            alt="image"
            className={styles.leftImage}
          />
        </div>

        <div className={styles.loginCont}>
          <div className={styles.formDiv}>
            <div className={styles.logo}>
              <Image
                src={require("@/assets/logo.png")}
                alt="logo"
                className={styles.logoImage}
              />
            </div>

            <h1 className={styles.heading}>Agent Login</h1>

            <form className={styles.loginForm} onSubmit={onSubmit}>
              {error && <h4>Invalid Credentials</h4>}

              <input
                type="text"
                placeholder="E-mail Address"
                required
                className={styles.input}
                onChange={(e) => setUserName(e.target.value)}
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className={styles.input}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label>
                <input
                  type="checkbox"
                  onClick={() => setShowPassword(!showPassword)}
                />{" "}
                Show Password
              </label>

              <button
                className={styles.loginButton}
                disabled={loading}
                type="submit"
              >
                Login
              </button>
              <p className={styles.signupLink}>
                Don't have an account?{" "}
                <span
                  className={styles.signupText}
                  onClick={() => router.push("/agentsignup")}
                >
                  Sign Up
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
