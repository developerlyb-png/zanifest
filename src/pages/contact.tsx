"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import styles from "@/styles/contact/contactus.module.css";
import Image from "next/image";

// ✅ SAME IMAGE USED (no array)
import contactImage from "@/assets/contact/cont.png";

const ContactPage = () => {
  return (
    <>
      <Navbar />


      {/* ===== IMAGE SECTION (SINGLE IMAGE) ===== */}
  <section className={styles.carousel}>
  <Image
    src={contactImage}
    alt="Contact Zanifest Insurance"
    fill
    priority
    className={styles.singleImage}
  />

  <div className={styles.imageOverlay}></div>

  <div className={styles.carouselText}>
        <h1 className={styles.contactTitle}>CONTACT Us</h1>

  </div>
</section>
 <div className={styles.carouselTexts}>

    <p className={styles.heroPara}>
      At Zanifest, we believe insurance should be a promise kept, not a hassle endured.
      Founded with a vision to simplify financial protection for every Indian, we bridge
      the gap between complex insurance terms and your peace of mind.
    </p>

    <p className={styles.subLine}>
      Have questions about a policy or need help with a claim? Our team is ready to assist you.
    </p>
  </div>
      {/* ===== CONTACT SECTION ===== */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Contact Form */}
            <div className={styles.card}>
              <h2>Get in Touch with Zanifest</h2>

              <form>
                <input type="text" placeholder="Full Name" />
                <input type="email" placeholder="Email Address" />
                <input type="tel" placeholder="Phone Number" />
                <textarea placeholder="Your Message" rows={4} />
                <button type="submit">Send Message</button>
              </form>
            </div>

            {/* Contact Details */}
            <div className={styles.card}>
              <h2>Contact Information</h2>

              <div className={styles.detailBox}>
                <span>📞 Customer Support</span>
                <p>+91 1762 496 934</p>
              </div>

              <div className={styles.detailBox}>
                <span>📧 Customer Support Email</span>
                <p>support@zanifestinsurance.com</p>
              </div>

              <div className={styles.detailBox}>
                <span>🏢 Grievance Support  Email</span>
                <p>mandeep.rathee@zanifestinsurance.com</p>
              </div>
               <div className={styles.detailBox}>
                <span>🏢 Address</span>
                <p>Zanifest Insurance Broker Pvt Ltd, SCF-8, 1st Floor, Old Ambala Road, Dhakoli, Zirakpur, Distt Mohali, Punjab-140603</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ContactPage;
