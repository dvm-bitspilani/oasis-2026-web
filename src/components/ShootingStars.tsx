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
    let paused = document.hidden;

    // keep track of live tweens so we can pause/resume/kill them together
    const activeTweens = new Set<gsap.core.Tween>();

    const scheduleNext = (delay: number) => {
      if (cancelled || paused) return;
      timeoutId = setTimeout(spawnStar, delay);
    };

   const spawnStar = () => {
  if (cancelled || paused || !container) return;

  const star = document.createElement("div");
  star.className = styles.star;

  const startX = Math.random() * 70;
  const startY = -5;

  const angle = 15 + Math.random() * 20; // deg below horizontal
  const distance = 60 + Math.random() * 30; // vw along the line — longer streak
  const duration = 1.6 + Math.random() * 0.8; // slightly longer to match distance

  const rad = (angle * Math.PI) / 180;
  const travelX = distance * Math.cos(rad);
  const travelY = distance * Math.sin(rad);
  const rotation = 90 + angle;

  star.style.left = `${startX}vw`;
  star.style.top = `${startY}vh`;
  star.style.transform = `rotate(${rotation}deg)`;

  container.appendChild(star);

  const tween = gsap.fromTo(
    star,
    { opacity: 0, x: 0, y: 0 },
    {
      opacity: 1,
      x: `${travelX}vw`,
      y: `${travelY}vw`,
      duration,
      ease: "power1.in",
      onComplete: () => {
        activeTweens.delete(tween);
        const fadeTween = gsap.to(star, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            activeTweens.delete(fadeTween);
            star.remove();
          },
        });
        activeTweens.add(fadeTween);
      },
    }
  );
  activeTweens.add(tween);

  scheduleNext(5000 + Math.random() * 3000);
};
    const handleVisibilityChange = () => {
      if (document.hidden) {
        paused = true;
        clearTimeout(timeoutId);
        activeTweens.forEach((t) => t.pause());
      } else {
        paused = false;
        activeTweens.forEach((t) => t.resume());
        scheduleNext(500 + Math.random() * 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!paused) {
      timeoutId = setTimeout(spawnStar, 500 + Math.random() * 1000);
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activeTweens.forEach((t) => t.kill());
      activeTweens.clear();
      container.querySelectorAll(`.${styles.star}`).forEach((el) => el.remove());
    };
  }, []);

  return <div ref={containerRef} className={styles.shootingStars} />;
}