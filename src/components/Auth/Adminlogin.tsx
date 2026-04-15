"use client";
import { useState, useEffect } from "react"; // ✅ ADD useEffect
import { useRouter } from "next/router";
import styles from "@/styles/components/Auth/Login.module.css";
import Image from "next/image";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");

  const router = useRouter();

  // ✅ 🔥 ADD THIS (IMPORTANT)
  useEffect(() => {
    const checkAlreadyLogin = async () => {
      try {
        const res = await fetch("/api/auth/check-session", {
          credentials: "include",
        });

        if (res.status === 200) {
          const data = await res.json();

          // ✅ role based redirect
          if (data.user?.role === "superadmin") {
            router.replace("/superadmin");
          } else if (data.user?.role === "admin") {
            router.replace("/admindashboard");
          }
        }
      } catch (err) {
        console.log("Not logged in");
      }
    };

    checkAlreadyLogin();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError(false);

  try {
    // ✅ STEP 1: GET CSRF TOKEN
    const csrfRes = await fetch("/api/csrf-token", {
      credentials: "include", // 🔥 IMPORTANT
    });

    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;

    // ✅ STEP 2: LOGIN API CALL
    const res = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "include", // 🔥 MUST
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken, // 🔥 VERY IMPORTANT
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(true);
      toast.error(data.message || "Login failed");
      setLoading(false);
      return;
    }

    // ✅ SUCCESS REDIRECT
    if (data.role === "superadmin") {
      router.replace("/superadmin");
    } else if (data.role === "admin") {
      router.replace("/admindashboard");
    } else {
      toast.error("Unauthorized Role");
    }

  } catch (error) {
    console.error("Login error:", error);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.cont}>
      {loading && (
        <div className={styles.loaderOverlay}>
          <AiOutlineLoading3Quarters className={styles.pageLoader} />
          <p>Loading, please wait...</p>
        </div>
      )}

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

          <h1 className={styles.heading}>Admin Login to continue</h1>

       <form
  className={styles.loginForm}
  onSubmit={handleSubmit}
  autoComplete="off" // 🔥 disable autofill
>
  <div className={styles.error}>
    {error && <h4>Invalid Credentials</h4>}
  </div>

  {/* 🔥 Hidden dummy fields (browser ko confuse karne ke liye) */}
  <input type="text" name="fake-email" style={{ display: "none" }} />
  <input type="password" name="fake-password" style={{ display: "none" }} />

  <div className={styles.formInput}>
    <input
      type="text"
      name="email" // 🔥 important
      placeholder="E-mail Address"
      required
      autoComplete="off" // 🔥 audit fix
      className={styles.input}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  <div className={styles.formInput}>
    <input
      type={showPassword ? "text" : "password"}
      name="password" // 🔥 important
      placeholder="Password"
      required
      autoComplete="new-password" // 🔥 audit fix
      className={styles.input}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>

  <div className={styles.showPasswordDiv}>
    <input
      type="checkbox"
      className={styles.passCheck}
      onClick={() => setShowPassword(!showPassword)}
    />
    <label>Show Password</label>
  </div>

  <button
    className={styles.loginButton}
    disabled={loading}
    type="submit"
  >
    Login
  </button>
</form>
        </div>
      </div>
    </div>
  );
}