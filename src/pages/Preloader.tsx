import { useEffect, useRef, useState } from "react";
import styles from "../styles/Preloader.module.scss";

interface PreloaderProps {
  assets?: string[];
  onEnter: () => void;
}

type Point = { x: number; y: number };

type BackgroundStar = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  depth: number;
  speed: number;
  phase: number;
  twinkleSpeed: number;
};

type ShootingStar = {
  x: number;
  y: number;
  speed: number;
  angle: number;
  length: number;
  size: number;
  nextSpawn: number;
};

type FormationStar = {
  target: Point;
  startX: number;
  startY: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  distance: number;
  delay: number;
  size: number;
  trailLength: number;
  landed: boolean;
  landedAt: number;
};

type CanvasState = HTMLCanvasElement & { __pathComplete?: boolean };

export default function Preloader({ assets = [], onEnter }: PreloaderProps) {
  // ===================================================================
  // REFS
  // ===================================================================
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const enteredRef = useRef(false);
  const exitStartedRef = useRef(false);

  // ===================================================================
  // STATE
  // ===================================================================
  const [assetsLoaded, setAssetsLoaded] = useState(assets.length === 0);
  const [formationComplete, setFormationComplete] = useState(false);
  const [exiting, setExiting] = useState(false);

  // ===================================================================
  // SVG CONFIGURATION
  // Replace ONLY this path. Any valid SVG path will work.
  // ===================================================================
const PATH_D = `
  M 120 250
  C 300 100, 500 100, 700 250
`;

  // Coordinate system of PATH_D.
  const SVG_VIEWBOX_WIDTH = 1000;
  const SVG_VIEWBOX_HEIGHT = 500;

  // ===================================================================
  // BACKGROUND STARS
  // ===================================================================
  const FAR_STARS = 320;
  const MID_STARS = 190;
  const NEAR_STARS = 110;
  const SHOOTING_STARS = 18;

  // ===================================================================
  // PATH FORMATION
  // ===================================================================
  const PATH_STAR_COUNT = 60; // More stars = denser logo.
  const FORMATION_START = 200; // Don't start immediately.
  const FORMATION_STAGGER = 9000; // Spread formation over ~11 seconds.
  const MIN_TRAVEL_DISTANCE = 900; // Long travel distance.
  const MAX_TRAVEL_DISTANCE = 1700;
  const MIN_STAR_SPEED = 190; // Slow movement.
  const MAX_STAR_SPEED = 300;
  const LOGO_HOLD = 2000; // Hold logo after complete.
  const EXIT_DURATION = 1200; // Curtain exit.

  // Fixed travel angle (degrees) used by every formation star.
  // 0deg = due right, 90deg = due down. Adjust to taste.
  const FORMATION_ANGLE_DEG = 25;

  // ===================================================================
  // COLORS
  // ===================================================================
  const BG_COLOR = "rgb(8, 10, 24)";
  const STAR_COLOR = "245, 222, 179";
  const PATH_STAR_COLOR = "255, 231, 180";

  // ===================================================================
  // ASSET LOADING
  // ===================================================================
  useEffect(() => {
    if (assets.length === 0) {
      setAssetsLoaded(true);
      return;
    }

    let cancelled = false;
    setAssetsLoaded(false);

    const loaders = assets.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = src;
        }),
    );

    Promise.all(loaders).then(() => {
      if (!cancelled) setAssetsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [assets.join("|")]);

  // ===================================================================
  // CANVAS
  // ===================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    const svgPath = pathRef.current;
    if (!canvas || !svgPath) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let destroyed = false;

    const startTime = performance.now();

    let backgroundStars: BackgroundStar[] = [];
    let shootingStars: ShootingStar[] = [];
    let formationStars: FormationStar[] = [];

    // -----------------------------------------------------------------
    // SAMPLE PATH — even distribution along actual SVG geometry.
    // -----------------------------------------------------------------
    const samplePath = (): Point[] => {
      const totalLength = svgPath.getTotalLength();
      if (!Number.isFinite(totalLength) || totalLength <= 0) return [];

      const points: Point[] = [];
      for (let i = 0; i < PATH_STAR_COUNT; i++) {
        const progress = i / Math.max(1, PATH_STAR_COUNT - 1);
        const point = svgPath.getPointAtLength(totalLength * progress);
        points.push({ x: point.x, y: point.y });
      }
      return points;
    };

    // -----------------------------------------------------------------
    // SVG → SCREEN — uniform scaling + centering.
    // -----------------------------------------------------------------
    const svgPointToScreen = (point: Point): Point => {
      const availableWidth = width * 0.82;
      const availableHeight = height * 0.52;

      const scale = Math.min(
        availableWidth / SVG_VIEWBOX_WIDTH,
        availableHeight / SVG_VIEWBOX_HEIGHT,
      );
      const finalScale = Math.max(0.2, scale);

      const renderedWidth = SVG_VIEWBOX_WIDTH * finalScale;
      const renderedHeight = SVG_VIEWBOX_HEIGHT * finalScale;

      const offsetX = (width - renderedWidth) / 2;
      const offsetY = (height - renderedHeight) / 2;

      return {
        x: offsetX + point.x * finalScale,
        y: offsetY + point.y * finalScale,
      };
    };

    // -----------------------------------------------------------------
    // BACKGROUND STAR FIELD
    // -----------------------------------------------------------------
    const createBackgroundStars = () => {
      backgroundStars = [];

      const createLayer = (
        count: number,
        depth: number,
        minSize: number,
        maxSize: number,
        minOpacity: number,
        maxOpacity: number,
        minSpeed: number,
        maxSpeed: number,
      ) => {
        for (let i = 0; i < count; i++) {
          backgroundStars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: minSize + Math.random() * (maxSize - minSize),
            opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
            depth,
            speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.35 + Math.random() * 0.9,
          });
        }
      };

      createLayer(FAR_STARS, 0.16, 0.18, 0.65, 0.055, 0.2, 1, 4); // FAR
      createLayer(MID_STARS, 0.45, 0.4, 1.15, 0.12, 0.38, 4, 9); // MID
      createLayer(NEAR_STARS, 0.95, 0.75, 1.9, 0.24, 0.62, 9, 18); // NEAR
    };

    // -----------------------------------------------------------------
    // SHOOTING STARS
    // -----------------------------------------------------------------
    const createShootingStars = () => {
      shootingStars = [];
      const now = performance.now();

      for (let i = 0; i < SHOOTING_STARS; i++) {
        shootingStars.push({
          x: Math.random() * width,
          y: -50 - Math.random() * 200,
          angle: (18 + Math.random() * 18) * (Math.PI / 180),
          speed: 180 + Math.random() * 160,
          length: 50 + Math.random() * 200, // variable length
          size: 0.8 + Math.random() * 1.4,
          nextSpawn: now + Math.random() * 7000,
        });
      }
    };

    // -----------------------------------------------------------------
    // PATH FORMATION — each star gets a start point, direction, delay.
    // -----------------------------------------------------------------
    const createFormation = () => {
      const svgPoints = samplePath();

      // Fixed angle, shared by every star (no randomness here).
      const angle = FORMATION_ANGLE_DEG * (Math.PI / 180);

      formationStars = svgPoints.map((svgPoint, index) => {
        const target = svgPointToScreen(svgPoint); // exact destination

        // Every star starts a different distance away.
        const distance =
          MIN_TRAVEL_DISTANCE +
          Math.random() * (MAX_TRAVEL_DISTANCE - MIN_TRAVEL_DISTANCE);

        // Slow constant velocity.
        const speed =
          MIN_STAR_SPEED + Math.random() * (MAX_STAR_SPEED - MIN_STAR_SPEED);

        // Calculate starting point.
        const startX = target.x - Math.cos(angle) * distance;
        const startY = target.y - Math.sin(angle) * distance;

        // Position along the path (0 → 1).
        const pathProgress = index / Math.max(1, svgPoints.length - 1);

        // Main delay — the logo gradually gets traced instead of
        // forming all at once.
        const orderedDelay = FORMATION_START + pathProgress * FORMATION_STAGGER;

        // Mild random variation — kept small so stars don't clump up
        // and land on the logo all at the same moment.
        const randomDelay = (Math.random() - 0.5) * 900;

        const delay = Math.max(400, orderedDelay + randomDelay);

        return {
          target,
          startX,
          startY,
          x: startX,
          y: startY,
          angle,
          speed,
          distance,
          delay,
          size: 1.2 + Math.random() * 1.5, // path stars are larger
          trailLength: 45 + Math.random() * 260, // long, varied trails
          landed: false,
          landedAt: 0,
        };
      });
    };

    // -----------------------------------------------------------------
    // RESIZE
    // -----------------------------------------------------------------
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createBackgroundStars();
      createShootingStars();
      createFormation();
    };

    // -----------------------------------------------------------------
    // STAR TRAIL — gradient tail + glowing head.
    // -----------------------------------------------------------------
    const drawTrail = (
      x: number,
      y: number,
      angle: number,
      length: number,
      size: number,
      opacity: number,
      color: string,
    ) => {
      const tailX = x - Math.cos(angle) * length;
      const tailY = y - Math.sin(angle) * length;

      const gradient = ctx.createLinearGradient(tailX, tailY, x, y);
      gradient.addColorStop(0, `rgba(${color},0)`);
      gradient.addColorStop(0.4, `rgba(${color},${opacity * 0.25})`);
      gradient.addColorStop(1, `rgba(${color},${opacity})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      ctx.stroke();

      // Star head.
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${opacity})`;
      ctx.shadowBlur = 8 + size * 4;
      ctx.shadowColor = `rgba(${color},0.9)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    // -----------------------------------------------------------------
    // PATH STAR — pulsing glow once landed on the logo path.
    // -----------------------------------------------------------------
    const drawPathStar = (star: FormationStar, elapsed: number) => {
      const pulse = (Math.sin(elapsed * 0.002 + star.target.x * 0.01) + 1) / 2;
      const opacity = 0.76 + pulse * 0.22;
      const radius = star.size * 1.35;

      ctx.beginPath();
      ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${PATH_STAR_COLOR},${opacity})`;
      ctx.shadowBlur = 11 + star.size * 4;
      ctx.shadowColor = `rgba(${PATH_STAR_COLOR},0.95)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    // -----------------------------------------------------------------
    // LOGO GLOW — radial halo that fades in once formation completes.
    // -----------------------------------------------------------------
    const drawPathGlow = (elapsed: number, lastLanding: number) => {
      const age = elapsed - lastLanding;
      const progress = Math.min(1, age / 1300);
      const pulse = 0.9 + Math.sin(elapsed * 0.0014) * 0.1;

      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.min(width, height) * 0.52,
      );

      gradient.addColorStop(
        0,
        `rgba(${PATH_STAR_COLOR},${0.16 * progress * pulse})`,
      );
      gradient.addColorStop(0.35, `rgba(${STAR_COLOR},${0.07 * progress})`);
      gradient.addColorStop(0.7, `rgba(${STAR_COLOR},${0.025 * progress})`);
      gradient.addColorStop(1, `rgba(${STAR_COLOR},0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    // -----------------------------------------------------------------
    // ANIMATE — main render loop, called every frame.
    // -----------------------------------------------------------------
    const animate = (time: number) => {
      if (destroyed) return;

      const elapsed = time - startTime;

      // Background fill.
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);

      // Parallax star field.
      backgroundStars.forEach((star) => {
        let x =
          (star.x + star.speed * star.depth * (elapsed / 1000)) % (width + 40);
        let y =
          (star.y + star.speed * 0.28 * star.depth * (elapsed / 1000)) %
          (height + 40);

        if (x < 0) x += width + 40;
        if (y < 0) y += height + 40;

        const twinkle =
          (Math.sin(elapsed * 0.001 * star.twinkleSpeed + star.phase) + 1) / 2;
        const opacity = star.opacity * (0.7 + twinkle * 0.3);

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${STAR_COLOR},${opacity})`;

        if (star.depth > 0.75) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = `rgba(${STAR_COLOR},${opacity * 0.5})`;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Shooting stars.
      shootingStars.forEach((star) => {
        if (time < star.nextSpawn) return;

        const age = (time - star.nextSpawn) / 1000;
        const x = star.x + Math.cos(star.angle) * star.speed * age;
        const y = star.y + Math.sin(star.angle) * star.speed * age;

        // Recycle once off-screen.
        if (x > width + 220 || y > height + 220) {
          star.x = Math.random() * width;
          star.y = -50 - Math.random() * 150;
          star.angle = (18 + Math.random() * 18) * (Math.PI / 180);
          star.speed = 180 + Math.random() * 160;
          star.length = 50 + Math.random() * 200;
          star.size = 0.8 + Math.random() * 1.4;
          star.nextSpawn = time + 1000 + Math.random() * 5500;
          return;
        }

        drawTrail(x, y, star.angle, star.length, star.size, 0.72, STAR_COLOR);
      });

      // Path formation — stars travel in, then lock onto the logo path.
      let landedCount = 0;
      let lastLanding = 0;

      formationStars.forEach((star) => {
        const localTime = elapsed - star.delay;
        if (localTime <= 0) return; // hasn't entered the scene yet

        // Constant velocity: no attraction, no easing, no acceleration.
        const travelled = star.speed * (localTime / 1000);

        if (travelled < star.distance) {
          // Still travelling.
          star.x = star.startX + Math.cos(star.angle) * travelled;
          star.y = star.startY + Math.sin(star.angle) * travelled;
          drawTrail(
            star.x,
            star.y,
            star.angle,
            star.trailLength,
            star.size,
            0.88,
            PATH_STAR_COLOR,
          );
          return;
        }

        // Landed — lock exactly to the SVG path.
        if (!star.landed) {
          star.landed = true;
          star.landedAt = elapsed;
        }

        star.x = star.target.x;
        star.y = star.target.y;

        landedCount++;
        lastLanding = Math.max(lastLanding, star.landedAt);

        drawPathStar(star, elapsed);
      });

      // Subtle connecting lines between nearby landed stars.
      for (let i = 0; i < formationStars.length - 1; i++) {
        const a = formationStars[i];
        const b = formationStars[i + 1];
        if (!a.landed || !b.landed) continue;

        const dx = b.target.x - a.target.x;
        const dy = b.target.y - a.target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 100) continue;

        const age = Math.min(elapsed - a.landedAt, elapsed - b.landedAt);
        const progress = Math.min(1, Math.max(0, age / 450));

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${PATH_STAR_COLOR},${0.13 * progress})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Formation complete → draw the halo glow, flag completion.
      const complete =
        formationStars.length > 0 && landedCount === formationStars.length;

      if (complete) {
        drawPathGlow(elapsed, lastLanding);
        (canvas as CanvasState).__pathComplete = true;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    // -----------------------------------------------------------------
    // START / CLEANUP
    // -----------------------------------------------------------------
    window.addEventListener("resize", resize);
    resize();
    animationFrame = requestAnimationFrame(animate);

    return () => {
      destroyed = true;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // ===================================================================
  // WAIT FOR LOGO — poll the canvas flag, then hold for 2s.
  // ===================================================================
  useEffect(() => {
    if (!assetsLoaded) return;

    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let completed = false;

    const check = window.setInterval(() => {
      if (completed) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // True only when every path star has landed.
      if ((canvas as CanvasState).__pathComplete) {
        completed = true;
        window.clearInterval(check);

        // Two second hold before triggering exit.
        holdTimer = window.setTimeout(() => {
          setFormationComplete(true);
        }, LOGO_HOLD);
      }
    }, 100);

    return () => {
      window.clearInterval(check);
      if (holdTimer) window.clearTimeout(holdTimer);
    };
  }, [assetsLoaded]);

  // ===================================================================
  // EXIT — curtain animation, then hand off to parent.
  // ===================================================================
  useEffect(() => {
    if (!assetsLoaded || !formationComplete) return;
    if (exitStartedRef.current) return;

    exitStartedRef.current = true;
    setExiting(true); // move the whole preloader upward like a curtain

    const timer = window.setTimeout(() => {
      if (enteredRef.current) return;
      enteredRef.current = true;
      onEnter();
    }, EXIT_DURATION + 100);

    return () => window.clearTimeout(timer);
  }, [assetsLoaded, formationComplete, onEnter]);

  // ===================================================================
  // JSX
  // ===================================================================
  return (
    <div
      className={[styles.preloader, exiting ? styles.exiting : ""].join(" ")}
    >
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Invisible SVG source — JS reads this path's exact geometry. */}
      <svg
        className={styles.sourceSvg}
        viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path ref={pathRef} d={PATH_D} />
      </svg>

      <div className={styles.vignette} />
    </div>
  );
}