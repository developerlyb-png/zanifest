import React, { useState, useEffect } from "react";
import styles from "@/styles/pages/TwoWheeler/twowheeler5.module.css";
import Image from "next/image";
import bajaj from "@/assets/liclogo.png";
import tata from "@/assets/liclogo.png";
import icici from "@/assets/liclogo.png";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import UserDetails from "@/components/ui/UserDetails";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { RiEBikeLine } from "react-icons/ri";
import { VscSettings } from "react-icons/vsc";
import { LuTicketsPlane, LuArrowDownUp } from "react-icons/lu";
import { IoMdMenu, IoMdClose } from "react-icons/io"; // icons for toggle
import {useRouter} from 'next/router'
import { FaFilter } from "react-icons/fa";

const plans = [
  {
    id: 1,
    logo: bajaj,
    name: "Bajaj Allianz",
    idv: "₹15,642",
    price: "₹728",
    badge: "Free Road Side Assistance (RSA) included",
    highlight: "green",
  },
  {
    id: 2,
    logo: tata,
    name: "Tata AIG",
    idv: "₹17,201",
    price: "₹729",
    badge: "Instant buy in 30 sec",
    highlight: "orange",
  },
  {
    id: 3,
    logo: icici,
    name: "ICICI Lombard",
    idv: "₹23,550",
    price: "₹735",
    badge: "Value for money",
    highlight: "green",
  },
];

const twowheeler5 = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
    const router =useRouter();
  return (
    <div>
      <UserDetails />
      <Navbar />

      <div className={styles.wrapper}>
        {/* Icon Toggle */}
        {isMobile && (
          <div className={styles.toggleIcon} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <IoMdClose size={24} /> : <FaFilter  />}
          </div>
        )}

        {/* Sidebar Slide-In */}
        <aside className={`${styles.sidebar} ${isMobile ? styles.mobileSidebar : ""} ${sidebarOpen ? styles.open : ""}`}>
          <div className={styles.card}>
            <h4><RiEBikeLine /> Your scooter details <span className={styles.edit}>Edit</span></h4>
            <p><strong>Honda Activa 3G (110 cc)</strong></p>
            <p>UP56AD5656 | 2018 registered</p>
          </div>

          <div className={styles.card}>
            <h4><VscSettings /> Addons <span className={styles.link}>Know more</span></h4>
            <label><input type="checkbox" /> Personal Accident Cover</label>
            <label><input type="checkbox" /> PA cover for passenger</label>
          </div>

          <div className={styles.card}>
            <h4><LuTicketsPlane /> Plan duration</h4>
            <select>
              <option>1 year</option>
              <option>2 years</option>
              <option>3 years</option>
            </select>
          </div>

          <div className={styles.card}>
            <h4><LuArrowDownUp /> Sort by</h4>
            <label><input type="radio" name="sort" /> Recommended</label>
            <label><input type="radio" name="sort" defaultChecked /> Premium (low to high)</label>
            <label><input type="radio" name="sort" /> Premium (high to low)</label>
            <label><input type="radio" name="sort" /> IDV (high to low)</label>
          </div>
        </aside>

        {/* Main Plans */}
        <main className={styles.main}>
          <div className={styles.planControls}>
            <div className={styles.planBox}>
              <span className={styles.planLabel}>Plan Type</span>
              <span className={styles.planValue}>Comprehensive ▾</span>
            </div>
            <div className={styles.planBox}>
              <span className={styles.planLabel}>Insured Declared Value (IDV)</span>
              <span className={styles.planValue}>Lowest ▾</span>
            </div>
          </div>

          <p className={styles.heading}>8 comprehensive plans available</p>
          <p className={styles.subtext}>Covers damages to your vehicle and third-party</p>

          <div className={styles.planList}>
            {plans.map((plan) => (
              <div key={plan.id} className={styles.planCard}>
                <div className={styles.planLeft}>
                  <div className={styles.logoSection}>
                    <Image src={plan.logo} alt={plan.name} width={100} height={30} />
                    <p>{plan.name}</p>
                  </div>
                  <div>
                    <p className={styles.idvLabel}>IDV</p>
                    <p className={styles.idvValue}>{plan.idv}</p>
                  </div>
                  <button className={styles.buyBtn} onClick={()=>{router.push('/cart/bikeinsurancecart')}}>
                    Buy now <span>{plan.price}</span>
                    <MdOutlineKeyboardArrowRight />
                  </button>
                </div>
                <p className={`${styles.badge} ${styles[plan.highlight]}`}>{plan.badge}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default twowheeler5;
