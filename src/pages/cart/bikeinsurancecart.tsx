// pages/twowheeler-confirm.tsx
import React, { useState } from "react";
import styles from "@/styles/pages/cart/bikeinsurancecart.module.css";
import Image from "next/image";
import { IoIosArrowBack } from "react-icons/io";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import UserDetails from "@/components/ui/UserDetails";

export default function bikeinsurancecart() {
  const [selectedYear, setSelectedYear] = useState("1");

  return (
     <div>
                      <UserDetails />
                      <Navbar />
    
       <div className={styles.wrapper}>
      <div className={styles.back}>
        <IoIosArrowBack size={18} />
        <span>Back to plans page</span>
      </div>

      <div className={styles.card}>
        {/* Left Form */}
        <div className={styles.left}>
          <h2>
            Hi <span className={styles.green}>AYUB!</span> Great Choice
          </h2>
          <p className={styles.info}>
            👏 85% of the vehicles stolen in India are two wheelers, let's protect yours!
          </p>

          {/* Title + Full Name */}
          <div className={styles.userRow}>
            <div className={styles.titleBox}>
              <label className={styles.label}>Title</label>
              <select className={styles.select}>
                <option>Mr.</option>
                <option>Ms.</option>
              </select>
            </div>
            <div className={styles.nameBox}>
              <label className={styles.label}>Full name</label>
              <div className={styles.nameInputWrapper}>
                <input type="text" value="AYUB KHAN" readOnly className={styles.input} />
                <button className={styles.editBtn}>Edit</button>
              </div>
            </div>
          </div>

          <input className={styles.inputField} placeholder="Mobile number" />
          <input className={styles.inputField} placeholder="Email address" />

          {/* Multi-Year Box */}
          <div className={styles.multiYearBox}>
            <h4 className={styles.multiTitle}>Save More with a Multi-Year Plan</h4>
            <p className={styles.multiDesc}>
              Enjoy exclusive discounts and don’t worry about annual renewals
            </p>
            <div className={styles.radioWrap}>
              {[
                { value: "1", label: "1 year @ ₹728" },
                { value: "2", label: "2 year @ ₹1,509" },
                { value: "3", label: "3 year @ ₹2,258" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`${styles.radioBtn} ${
                    selectedYear === option.value ? styles.active : ""
                  }`}
                >
                  <input
                    type="radio"
                    checked={selectedYear === option.value}
                    onChange={() => setSelectedYear(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Plan Summary */}
        <div className={styles.right}>
          <div className={styles.planHeader}>
            <div>
              <h4>Honda Activa</h4>
              <p>UP56AD5656 | Registered in 2018</p>
            </div>
            <span className={styles.bikeIcon}>🛵</span>
          </div>

          <div className={styles.insurerBlock}>
            <Image src="/assets/bajaj.png" alt="bajaj" width={100} height={30} />
            <p>1 Year Comprehensive</p>
            <span className={styles.idv}>IDV: ₹15,642</span>
          </div>

          <div className={styles.alertBox}>
            <div className={styles.alertTop}>
              <strong>
                Compulsory personal accident cover of ₹15 Lakh for 1 year @₹331
              </strong>
              <span className={styles.lawTag}>Mandatory by law</span>
            </div>
            <p className={styles.alertNote}>
              Not having this may lead to <strong>rejection of claim</strong>
            </p>
            <input type="checkbox" />
          </div>

          <div className={styles.pricing}>
            <div>
              <span>Plan premium</span>
              <span>₹728</span>
            </div>
            <div>
              <span>GST</span>
              <span>₹132</span>
            </div>
            <div className={styles.total}>
              <strong>Final premium</strong>
              <strong className={styles.totalAmt}>₹860</strong>
            </div>
            <button className={styles.payBtn}>🔒 Pay securely</button>
            <p className={styles.terms}>
              By clicking on ‘Pay securely’, I agree to the{" "}
              <a href="#">terms & conditions</a>
            </p>
          </div>
        </div>
      </div>
    </div>
        <Footer />
            </div>
  );
}
