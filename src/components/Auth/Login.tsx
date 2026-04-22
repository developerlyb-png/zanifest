import { useState } from "react";
import { useRouter } from "next/router";
import { IoIosArrowBack } from "react-icons/io";
import styles from "@/styles/components/Auth/Login.module.css";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const router = useRouter();
  const { setUser } = useAuth();
const [errorMessage, setErrorMessage] = useState<string>("");
  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(false);
  setErrorMessage("");

  try {
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser({ name: data.name || "", email: data.email || "" });
      router.push("/dashboard");
    } else {
      setError(true);
      setErrorMessage(data.message || "Invalid credentials");
    }
  } catch (err) {
    setError(true);
    setErrorMessage("Something went wrong");
  }

  setLoading(false);
};
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

          <h1 className={styles.heading}>
            Login to continue
          </h1>
          {/* <p className={styles.headingp}>
            Access to the most powerful tool in the entire design and web
            industry.
          </p> */}

          <form className={styles.loginForm} onSubmit={onSubmit} autoComplete="off">
            <div className={styles.error}>
              {error && (
  <h4 style={{ color: "red" }}>
    {errorMessage}
  </h4>
)}
            </div>

            <div className={styles.formInput}>
              <input
                type="text"
                name="uname"
                id="uname"
                placeholder="E-mail Address"
                required
                className={styles.input}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
           
            <div className={styles.formInput} style={{ position: "relative" }}>
               <input
      type={showPassword ? "text" : "password"}
      name="password" // 🔥 important
      placeholder="Password"
      required
      autoComplete="new-password" // 🔥 audit fix
      className={styles.input}
      onChange={(e) => setPassword(e.target.value)}
    />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </span>
            </div>
          
          
             <button
  className={styles.loginButton}
  disabled={loading || errorMessage.includes("locked")}
  type="submit"
>
              {loading ? "Loading" : "Login"}
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