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

      const angle = 15 + Math.random() * 20; // deg below horizontal
      const distance = 35 + Math.random() * 20; // vw along the line
      const duration = 1.2 + Math.random() * 0.6;

      const rad = (angle * Math.PI) / 180;
      const travelX = distance * Math.cos(rad);
      const travelY = distance * Math.sin(rad);
      const rotation = 90 + angle;

      star.style.left = `${startX}vw`;
      star.style.top = `${startY}vh`;
      star.style.transform = `rotate(${rotation}deg)`; // set BEFORE gsap touches it

      container.appendChild(star);

      gsap.fromTo(
        star,
        { opacity: 0, x: 0, y: 0 },
        {
          opacity: 1,
          x: `${travelX}vw`,
          y: `${travelY}vw`,
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