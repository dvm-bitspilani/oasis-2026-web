import { useEffect, useRef } from "react";
import map from "../assets/contact/mapbg.png";
import styles from "../styles/Contact.module.scss";

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Absolute map coordinates
  const pos = useRef({ x: 0, y: 0 });
  // Velocity vector (used ONLY for mouse/touch flick momentum)
  const vel = useRef({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const isFlicking = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Lower this multiplier (e.g., 0.2) for slower scrolling, or raise it (e.g., 0.5) for faster speed
  const SCROLL_SENSITIVITY = 0.35;

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const getBounds = () => {
      const minX = Math.min(0, container.clientWidth - img.offsetWidth);
      const minY = Math.min(0, container.clientHeight - img.offsetHeight);
      return { minX, maxX: 0, minY, maxY: 0 };
    };

    const clampPos = (p: { x: number; y: number }) => {
      const { minX, maxX, minY, maxY } = getBounds();
      return {
        x: Math.max(minX, Math.min(maxX, p.x)),
        y: Math.max(minY, Math.min(maxY, p.y)),
      };
    };

    // 1. Trackpad / Wheel input (dampened speed)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Cancel any ongoing mouse drag momentum
      isFlicking.current = false;
      vel.current = { x: 0, y: 0 };

      // Apply dampened deltas
      pos.current.x -= e.deltaX * SCROLL_SENSITIVITY;
      pos.current.y -= e.deltaY * SCROLL_SENSITIVITY;
      pos.current = clampPos(pos.current);
    };

    // 2. Click-and-Drag / Touch input
    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      isFlicking.current = false;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      vel.current = { x: 0, y: 0 };
      container.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;

      pos.current.x += dx;
      pos.current.y += dy;

      // Track drag velocity for post-release glide
      vel.current = { x: dx, y: dy };
      lastPointer.current = { x: e.clientX, y: e.clientY };

      pos.current = clampPos(pos.current);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging.current) {
        isDragging.current = false;
        isFlicking.current = true;
        container.releasePointerCapture(e.pointerId);
      }
    };

    // 3. Render & Friction Loop
    const render = () => {
      // Apply momentum decay ONLY after releasing a click-and-drag flick
      if (isFlicking.current) {
        if (Math.abs(vel.current.x) > 0.1 || Math.abs(vel.current.y) > 0.1) {
          pos.current.x += vel.current.x;
          pos.current.y += vel.current.y;
          pos.current = clampPos(pos.current);

          vel.current.x *= 0.92; // Friction factor
          vel.current.y *= 0.92;
        } else {
          isFlicking.current = false;
        }
      }

      if (img) {
        img.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0px)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.mapContainer}>
      <img ref={imgRef} src={map} alt="Map" className={styles.mapImage} />

      <section className={styles.page}>
        <h1>CONTACT US</h1>
      </section>
    </div>
  );
}