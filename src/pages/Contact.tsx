import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import map from "../assets/contact/map.png";
import cross from "../assets/contact/cross.png";
import styles from "../styles/Contact.module.scss";
import emma from "../assets/contact/emma.webp";
import back from "../assets/contact/backButton.png"

import ContactCard from "../components/ContactCard";

// ─────────────────────────────────────────────────────────────
// CONTACTS — one row per list item / cross / card.
// Row i in this array is wired together:
//   list item i (in "CONTACT US")  ->  cross i  ->  ContactCard i
//
// x / y = position of the cross, as PERCENTAGES of the map image itself:
//   x: 0 = left edge,  100 = right edge
//   y: 0 = top edge,   100 = bottom edge
// The card sits just below its cross automatically.
// Pixel -> percent:  x% = pixelX / imageWidth * 100
// ─────────────────────────────────────────────────────────────
const CONTACTS = [
  {
    label: "Registrations and Correspondence",
    x: 87, y: 42,
    image: emma,
    name: "Name 1",
    email: "email1@bitsmail",
  },
  {
    label: "Website, App and Payments",
    x: 79.5, y: 91,
    image: emma, // TODO: replace
    name: "Avyakt Verma",
    email: "email2@bitsmail",
  },
  {
    label: "Sponsorships and Company Collaborations",
    x: 58, y: 65,
    image: emma, // TODO: replace
    name: "Name 3",
    email: "email3@bitsmail",
  },
  {
    label: "Logistics and Operations",
    x: 49, y: 90,
    image: emma, // TODO: replace
    name: "Name 4",
    email: "email4@bitsmail",
  },
  {
    label: "Reception and Accommodation",
    x: 38, y: 67,
    image: emma, // TODO: replace
    name: "Name 5",
    email: "email5@bitsmail",
  },
  {
    label: "Online Collaborations and Publicity",
    x: 27, y: 40,
    image: emma, // TODO: replace
    name: "Name 6",
    email: "email6@bitsmail",
  },
  {
    label: "President, Students' Union",
    x: 45, y: 27,
    image: emma, // TODO: replace
    name: "Pulkit Bhardwaj",
    email: "email7@bitsmail",
  },
  {
    label: "General Secretary, Students' Union",
    x: 67, y: 32,
    image: emma, // TODO: replace
    name: "Kushal Poosala",
    email: "email8@bitsmail",
  },
];

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Absolute map coordinates
  const pos = useRef({ x: 0, y: 0 });
  // Velocity vector (used ONLY for mouse/touch flick momentum)
  const vel = useRef({ x: 0, y: 0 });
  // Where an automatic "scroll to card" is heading (null = no auto-scroll running)
  const target = useRef<{ x: number; y: number } | null>(null);

  const isDragging = useRef(false); // pointer is down
  const didDrag = useRef(false); // pointer moved far enough to count as a drag
  const isFlicking = useRef(false);
  const startPointer = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Set inside the effect, called by the list items
  const scrollToCard = useRef<(index: number) => void>(() => {});

  // Which list item / card is the currently "selected" one. Stays highlighted
  // until another item is clicked, or the map is dragged / scrolled.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Lower this multiplier (e.g., 0.2) for slower scrolling, or raise it (e.g., 0.5) for faster speed
  const SCROLL_SENSITIVITY = 0.35;
  // Pixels the pointer must move before a press becomes a drag (keeps clicks working)
  const DRAG_THRESHOLD = 5;
  // Speed of the automatic scroll to a card (0.05 = slow/smooth, 0.2 = fast)
  const AUTO_SCROLL_EASING = 0.08;
  // Below this width the map is rendered at MOBILE_MAP_SCALE (see the .mapScale
  // rule in the SCSS) — kept in sync with that file's breakpoint.
  const MOBILE_BREAKPOINT = 729;
  const MOBILE_MAP_SCALE = 0.6;

  useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    if (!container || !layer) return;

    // The map image itself is scaled down on small screens (crosses/cards are
    // counter-scaled back to full size in CSS), so the draggable area shrinks
    // by the same factor there — otherwise you could drag well past the
    // image's visual edge.
    const getMapScale = () =>
      window.innerWidth <= MOBILE_BREAKPOINT ? MOBILE_MAP_SCALE : 1;

    const getBounds = () => {
      const scale = getMapScale();
      const minX = Math.min(0, container.clientWidth - layer.offsetWidth * scale);
      const minY = Math.min(0, container.clientHeight - layer.offsetHeight * scale);
      return { minX, maxX: 0, minY, maxY: 0 };
    };

    const clampPos = (p: { x: number; y: number }) => {
      const { minX, maxX, minY, maxY } = getBounds();
      return {
        x: Math.max(minX, Math.min(maxX, p.x)),
        y: Math.max(minY, Math.min(maxY, p.y)),
      };
    };

    // Smoothly move the map so the chosen card is centred in the visible map area
    scrollToCard.current = (index: number) => {
      const card = cardRefs.current[index];
      if (!card) return;

      const c = container.getBoundingClientRect();
      const l = layer.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      const p = pageRef.current?.getBoundingClientRect();

      // Visible map area = the part of the screen not covered by the left "page"
      const visibleLeft = p && p.width < c.width * 0.9 ? p.right : c.left;
      const centerX = (visibleLeft + c.right) / 2 - c.left;
      const centerY = c.height / 2;

      // Card centre in the map layer's own coordinates
      const cardX = r.left + r.width / 2 - l.left;
      const cardY = r.top + r.height / 2 - l.top;

      isFlicking.current = false;
      vel.current = { x: 0, y: 0 };
      target.current = clampPos({ x: centerX - cardX, y: centerY - cardY });
    };

    // 1. Trackpad / Wheel input (dampened speed)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Cancel any ongoing momentum / auto-scroll
      isFlicking.current = false;
      target.current = null;
      vel.current = { x: 0, y: 0 };
      setActiveIndex(null);

      // Apply dampened deltas
      pos.current.x -= e.deltaX * SCROLL_SENSITIVITY;
      pos.current.y -= e.deltaY * SCROLL_SENSITIVITY;
      pos.current = clampPos(pos.current);
    };

    // 2. Click-and-Drag / Touch input
    // NOTE: pointer capture is only taken once the pointer has actually moved
    // (DRAG_THRESHOLD). Capturing on pointerdown would redirect the click event
    // to the container and break clicks on list items and the mail icon.
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      isDragging.current = true;
      didDrag.current = false;
      isFlicking.current = false;
      target.current = null;
      startPointer.current = { x: e.clientX, y: e.clientY };
      lastPointer.current = { x: e.clientX, y: e.clientY };
      vel.current = { x: 0, y: 0 };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      if (!didDrag.current) {
        const moved = Math.hypot(
          e.clientX - startPointer.current.x,
          e.clientY - startPointer.current.y
        );
        if (moved < DRAG_THRESHOLD) return;
        didDrag.current = true;
        container.setPointerCapture(e.pointerId);
        setActiveIndex(null);
      }

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
      if (!isDragging.current) return;
      isDragging.current = false;

      if (didDrag.current) {
        didDrag.current = false;
        isFlicking.current = true;
        if (container.hasPointerCapture(e.pointerId)) {
          container.releasePointerCapture(e.pointerId);
        }
      }
    };

    // 3. Render, Auto-scroll & Friction Loop
    const render = () => {
      // Automatic scroll to a card (eases toward the target)
      if (target.current) {
        const dx = target.current.x - pos.current.x;
        const dy = target.current.y - pos.current.y;

        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
          pos.current = { ...target.current };
          target.current = null;
        } else {
          pos.current.x += dx * AUTO_SCROLL_EASING;
          pos.current.y += dy * AUTO_SCROLL_EASING;
        }
      }

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

      // The whole layer (map image + crosses + cards) moves together
      layer.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0px)`;

      animFrameId.current = requestAnimationFrame(render);
    };

    // Re-clamp if the window is resized across MOBILE_BREAKPOINT, so the
    // position stays valid whichever map scale is now in effect.
    const handleResize = () => {
      pos.current = clampPos(pos.current);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("resize", handleResize);

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("resize", handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handleListClick = (index: number) => {
    setActiveIndex(index);
    scrollToCard.current(index);
  };

  return (
    <div ref={containerRef} className={styles.mapContainer}>
      {/* Map layer: same size as the map image, receives the drag transform */}
      <div ref={layerRef} className={styles.mapLayer}>
        {/* Scaled down on small screens via CSS; crosses/cards counter-scale
            back to full size (see Contact.module.scss) */}
        <div className={styles.mapScale}>
          <img src={map} alt="Map" className={styles.mapImage} />

          {CONTACTS.map((c, i) => (
            <img
              key={`cross-${i}`}
              src={cross}
              alt="Cross"
              className={styles.cross}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            />
          ))}

          {/* Cards sit just below their crosses (offset handled in the SCSS) */}
          {CONTACTS.map((c, i) => (
            <div
              key={`card-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={styles.cardAnchor}
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <ContactCard image={c.image} name={c.name} email={c.email} />
            </div>
          ))}
        </div>
      </div>

      <section ref={pageRef} className={styles.page}>
        <div className={styles.pageStuff}>
          <Link to="/">
            <img className={styles.backBtn} src={back} alt="Go Back to Home" />
          </Link>
          <h1>CONTACT US</h1>
          <ul>
            {CONTACTS.map((c, i) => (
              <li
                key={c.label}
                className={i === activeIndex ? styles.active : undefined}
                onClick={() => handleListClick(i)}
              >
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}