"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/pages/TwoWheeler/twowheel.module.css";
import Image from "next/image";
import scooterImg from "@/assets/motorcycle.png";

import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import UserDetails from "@/components/ui/UserDetails";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";
import AOS from "aos";
import "aos/dist/aos.css";

// Step 1: Years
const years = Array.from({ length: 20 }, (_, i) => 2024 - i);

// Step 2: Makes
const makes = [
  { name: "Honda", image: require("@/assets/home/hondacar.png") },
  { name: "Bajaj", image: require("@/assets/home/bajaj logo.png") },
  { name: "TVS", image: require("@/assets/home/tvs logo.png") },
  { name: "Yamaha", image: require("@/assets/home/yamaha.png") },
  { name: "Hero Motorcorp", image: require("@/assets/home/hero (2).png") },
  { name: "Royal Enfield", image: require("@/assets/home/royal logo.png") },
  { name: "Suzuki", image: require("@/assets/home/SuzukiLogo (2).png") },
  { name: "Mahindra", image: require("@/assets/home/Mahindra.png") },
  { name: "KTM", image: require("@/assets/home/ktm.png") },
  { name: "LML", image: require("@/assets/home/lml.png") },
  { name: "Ola", image: require("@/assets/home/ola.png") },
  { name: "Harley Davidson", image: require("@/assets/home/harley.png") },
];

// Step 3: Models
const popularModels = [
  "Activa", "CB Shine", "CB Unicorn", "Aviator",
  "Dio", "Dream Yuga", "Activa E", "CB 300R",
  "CB 350", "NX", "QC1", "XL"
];
const otherModels = [
  "CB", "Shine", "Unicorn", "CB Twister", "Activa-I", "CB 350 RS"
];

export default function TwoWheeler() {
  const [step, setStep] = useState<"years" | "makes" | "models">("years");
  const router = useRouter();

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Refresh AOS whenever step changes
  useEffect(() => {
    AOS.refresh();
  }, [step]);

  return (
    <div>
      <UserDetails />
      <Navbar />

      <div className={styles.container}>
        {/* LEFT FIXED SCOOTER IMAGE */}
        <div className={styles.leftSection}>
          <div className={styles.imageWrapper}>
            <Image
              src={scooterImg}
              alt="Scooter"
              className={styles.image}
              priority
            />
          </div>
        </div>

        {/* RIGHT SECTION (Dynamic UI) */}
        <div className={styles.rightSection}>
          {/* STEP 1: YEAR SELECTION */}
          {step === "years" && (
            <div data-aos="fade-left" key="years">
              <h2 className={styles.question}>
                When did you buy your Bike/Scooter?
              </h2>
              <div className={styles.yearGrid}>
                {years.map((year) => (
                  <button
                    key={year}
                    className={styles.yearButton}
                    onClick={() => setStep("makes")}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: MAKES */}
          {step === "makes" && (
            <div data-aos="fade-left" key="makes" className={styles.makesWrapper}>
              <button
                className={styles.backButton}
                onClick={() => setStep("years")}
              >
                <FaArrowLeft />
              </button>
              <h3>Select two wheeler make</h3>
              <input
                type="text"
                placeholder="Search two wheeler make"
                className={styles.searchInput}
              />
              <p className={styles.popularTitle}>Popular makes</p>
              <div className={styles.grid}>
                {makes.map((make, index) => (
                  <div
                    key={index}
                    className={styles.makeCard}
                    onClick={() => setStep("models")}
                  >
                    <div className={styles.makeImageWrapper}>
                    </div>
                    <span className={styles.makeText}>{make.name}</span>
                  </div>
                ))}
              </div>
              <p className={styles.searchText}>
                Can’t find your bike’s make? Click here to search
              </p>
            </div>
          )}

          {/* STEP 3: MODELS */}
          {step === "models" && (
            <div data-aos="fade-left" key="models" className={styles.modelsWrapper}>
              <button
                className={styles.backButton}
                onClick={() => setStep("makes")}
              >
                <FaArrowLeft />
              </button>
              <h3 className={styles.title}>Select two wheeler model</h3>
              <input
                type="text"
                placeholder="Search Honda two wheeler model"
                className={styles.searchInput}
              />

              <p className={styles.sectionTitle}>Popular models</p>
              <div className={styles.grids}>
                {popularModels.map((model, idx) => (
                  <div
                    key={idx}
                    className={styles.modelCard}
                    onClick={() => router.push("./twowheeler5")}
                  >
                    {model}
                  </div>
                ))}
              </div>

              <p className={styles.sectionTitle}>Other models</p>
              <div className={styles.grids}>
                {otherModels.map((model, idx) => (
                  <div
                    key={idx}
                    className={styles.modelCard}
                    onClick={() => router.push("./twowheeler5")}
                  >
                    {model}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
