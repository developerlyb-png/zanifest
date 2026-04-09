"use client";

import { useState, useEffect } from "react"; // ✅ ADD useEffect
import { useRouter } from "next/router";

import { IoIosArrowBack } from "react-icons/io";
import styles from "@/styles/components/Auth/Login.module.css";
import Image from "next/image";

export default function UserLogin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  // ✅ 🔥 ADD THIS (already login check)
  useEffect(() => {
    const checkAlreadyLogin = async () => {
      try {
        const res = await fetch("/api/auth/check-session", {
          credentials: "include",
        });

        if (res.status === 200) {
          const data = await res.json();

          if (data.user?.role === "user") {
            router.replace("/dashboard");
          }
        }
      } catch (err) {
        console.log("Not logged in");
      }
    };

    checkAlreadyLogin();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        credentials: "include", // ✅ IMPORTANT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.replace("/dashboard"); // ✅ replace better than push
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(true);
    }

    setLoading(false);
  }

  return (
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

          <h1 className={styles.heading}>User Login</h1>

          <form className={styles.loginForm} onSubmit={onSubmit} autoComplete="off" >
            <div className={styles.error}>
              {error && <h4>Invalid Credentials</h4>}
            </div>

            <div className={styles.formInput}>
              <input
                type="email"
                name="email"
                placeholder="E-mail Address"
                required
                className={styles.input}
                  autoComplete="off" 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.formInput}>
              <input
                type={showPassword ? "text" : "password"}
                name="password" 
                placeholder="Password"
                required
                className={styles.input}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className={styles.showPasswordDiv}>
              <input
                type="checkbox"
                onClick={() => setShowPassword(!showPassword)}
              />
              <label>Show Password</label>
            </div>

            <button
              className={styles.loginButton}
              disabled={loading}
              type="submit"
            >
              {loading ? "Loading..." : "Login"}
            </button>

            <p className={styles.signupLink}>
              Don't have an account?{" "}
              <span
                className={styles.signupText}
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}