import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "../styles/ShootingStars.module.scss";

export default function ShootingStars() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const spawnStar = () => {
      if (cancelled || !container) return;

      const star = document.createElement("div");
      star.className = styles.star;

      const startX = Math.random() * 70; 
      const startY = -5;             

      const travelX = 20 + Math.random() * 15; // vw — rightward drift
      const travelY = 55 + Math.random() * 25; // vh — downward fall
      const duration = 1.2 + Math.random() * 0.6;

      star.style.left = `${startX}vw`;
      star.style.top = `${startY}vh`;

      container.appendChild(star);

      gsap.fromTo(
        star,
        { opacity: 0, x: 0, y: 0 },
        {
          opacity: 1,
          x: `${travelX*1.2}vw`,
          y: `${travelY}vh`,
          duration,
          ease: "power1.in",
          onComplete: () => {
            gsap.to(star, {
              opacity: 0,
              duration: 0.2,
              onComplete: () => star.remove(),
            });
          },
        }
      );

      const nextDelay = 800 + Math.random() * 1500;
      timeoutId = setTimeout(spawnStar, nextDelay);
    };

    timeoutId = setTimeout(spawnStar, 500 + Math.random() * 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      container.querySelectorAll(`.${styles.star}`).forEach((el) => el.remove());
    };
  }, []);

  return <div ref={containerRef} className={styles.shootingStars} />;
}