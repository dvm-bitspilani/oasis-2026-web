import React from "react";
import DevPage from "./DevPage.tsx";
import DevPageMobile from "./DevPageMobile.tsx";
import styles from "../../styles/DevPage/DevPageResponsive.module.scss";

// Both versions mount; CSS decides which one is visible.
export default function DevPageResponsive() {
  return (
    <div>
      <div className={styles.desktopOnly}>
        <DevPage />
      </div>

      <div className={styles.mobileOnly}>
        <DevPageMobile />
      </div>
    </div>
  );
}