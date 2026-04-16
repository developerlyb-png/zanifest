"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logo from "@/assets/logo.png"; 
import styles from "@/styles/components/superadminsidebar/changepassword.module.css";

const resetpassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const cleanCurrentPassword = currentPassword.trim();
  const cleanNewPassword = newPassword.trim();

  if (!cleanCurrentPassword || !cleanNewPassword) {
    alert("All fields are required");
    return;
  }

  if (cleanNewPassword.length < 6 || cleanNewPassword.length > 50) {
    alert("Password must be 6-50 characters");
    return;
  }

  if (cleanCurrentPassword === cleanNewPassword) {
    alert("New password must be different");
    return;
  }

  try {
    // ✅ CSRF
    const csrfRes = await fetch("/api/csrf-token", {
      credentials: "include",
    });

    const { csrfToken } = await csrfRes.json();

    // ✅ API CALL
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({
        currentPassword: cleanCurrentPassword,
        newPassword: cleanNewPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    alert("Password reset successful");

    // 🔥 IMPORTANT (fix login issue)
    window.location.href = "/adminlogin";

  } catch (err: any) {
    alert(err.message || "Something went wrong");
  }
};
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* <div className={styles.logoContainer}>
          <Image src={logo} alt="Logo" width={100} />
        </div> */}

        <h2 className={styles.title}>Reset Password</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="current-password" className={styles.label}>
              Current Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.input}
                required
              />
              <span className={styles.eyeIcon} onClick={handleTogglePassword}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="new-password" className={styles.label}>
              New Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
              />
              <span className={styles.eyeIcon} onClick={handleTogglePassword}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default resetpassword;
