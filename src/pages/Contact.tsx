import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import map from "../assets/contact/map.png";
import cross from "../assets/contact/cross.png";
import styles from "../styles/Contact.module.scss";
import emma from "../assets/contact/emma.webp";
import back from "../assets/contact/backButton.png";

import dvm from "../assets/contact/avyaktVerma.jpeg";
import adp from "../assets/contact/devanshAgarwal.jpg";
import spons from "../assets/contact/prafulMalik.jpg";
import controls from "../assets/contact/shreyasAnand.jpg";
import recnacc from "../assets/contact/prithviGowda.jpg";
import prez from "../assets/contact/pulkitBhardwaj.png";
import gensec from "../assets/contact/kushalPoosala.jpeg";

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
    x: 72, y: 76,
    image: emma,
    name: "Name 1",
    email: "email1@bitsmail",
  },
  {
    label: "Website, App and Payments",
    x: 79.5, y: 45,
    image: dvm, // TODO: replace
    name: "Avyakt Verma",
    email: "email2@bitsmail",
  },
  {
    label: "Sponsorships and Company Collaborations",
    x: 63, y: 40,
    image: spons, // TODO: replace
    name: "Praful Malik",
    email: "email3@bitsmail",
  },
  {
    label: "Logistics and Operations",
    x: 48, y: 54,
    image: controls, // TODO: replace
    name: "Shreyas Anand",
    email: "email4@bitsmail",
  },
  {
    label: "Reception and Accommodation",
    x: 33, y: 71,
    image: recnacc, // TODO: replace
    name: "Prithvi Gowda C",
    email: "email5@bitsmail",
  },
  {
    label: "Online Collaborations and Publicity",
    x: 34, y: 20,
    image: adp, // TODO: replace
    name: "Devansh Agarwal",
    email: "email6@bitsmail",
  },
  {
    label: "President, Students' Union",
    x: 50, y: 15,
    image: prez, // TODO: replace
    name: "Pulkit Bhardwaj",
    email: "email7@bitsmail",
  },
  {
    label: "General Secretary, Students' Union",
    x: 68, y: 12,
    image: gensec, // TODO: replace
    name: "Kushal Poosala",
    email: "email8@bitsmail",
  },
];

// Keyboard controls. Uses e.code (physical keys), so W/A/S/D work on any
// keyboard layout. Values are the direction the VIEW moves across the map.
const KEY_DIRECTIONS: Record<string, { x: number; y: number }> = {
  KeyW: { x: 0, y: -1 },
  ArrowUp: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  ArrowDown: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  ArrowLeft: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};
// Extra px around the visible entries of the mobile list (room for the hover glow)
const LIST_PEEK_PADDING = 6;
// Pixels per frame the map moves while a movement key is held.
const KEY_SPEED = 12;

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const mapScaleRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
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
  // Mirror of activeIndex that the keyboard handlers (inside the effect) can
  // read without going stale. Always update both together via setActive().
  const activeIndexRef = useRef<number | null>(null);
  const setActive = (i: number | null) => {
    activeIndexRef.current = i;
    setActiveIndex(i);
  };
  // Mobile only: is the "CONTACT US" panel expanded ("See Less") or collapsed
  // ("See More")? Has no visual effect on desktop (the toggle is hidden there).
  const [expanded, setExpanded] = useState(false);
  // Movement keys currently held down (by e.code)
  const pressedKeys = useRef<Set<string>>(new Set());

  // Touchpad (two-finger scroll) speed. Was 0.35 (felt slow). Lower = slower, higher = faster.
  const SCROLL_SENSITIVITY = 0.9;
  // Touch-screen drag speed multiplier (1 = map follows the finger 1:1, higher = faster).
  // Mouse drags are left at 1:1 so the map stays under the cursor.
  const TOUCH_DRAG_SENSITIVITY = 1.6;
  // A real mouse wheel steps through the list items; minimum ms between steps.
  const WHEEL_STEP_COOLDOWN = 120;
  // Wheel events arriving within this many ms of a touchpad event are treated as
  // part of the same touchpad gesture (covers momentum/inertia tails).
  const TOUCHPAD_GESTURE_GAP = 120;
  // Pixels the pointer must move before a press becomes a drag (keeps clicks working)
  const DRAG_THRESHOLD = 5;
  // Speed of the automatic scroll to a card (0.05 = slow/smooth, 0.2 = fast)
  const AUTO_SCROLL_EASING = 0.08;
  // Reduces how far down the map can shift to reveal content hidden behind
  // .page (see getOffsetY() below) — so BOTH the initial view AND the
  // furthest-down drag position sit this many px higher than the "fully
  // revealed" position. (A previous version only nudged the initial position;
  // the very first drag/flick re-clamped against the un-nudged bound and
  // undid it. Baking it into getOffsetY() itself means every bound derived
  // from it — initial position, max drag extent, resize/collapse recalcs —
  // is consistently nudged, so it can't be silently erased by any of them.)
  const VIEW_NUDGE_UP = 20;
  // Matches .page's collapse transition duration in the SCSS (0.4s) — see
  // handleListClick, which retargets the card auto-scroll once .page has
  // actually finished collapsing.
  const COLLAPSE_TRANSITION_MS = 400;

  useEffect(() => {
    const container = containerRef.current;
    const layer = layerRef.current;
    if (!container || !layer) return;

    // The map image itself may be scaled down by CSS (see the .mapScale rule
    // in the SCSS — currently only on small screens, but this reads the real
    // rendered scale rather than assuming a breakpoint/value, so it can never
    // drift out of sync with the stylesheet again). Crosses/cards counter-scale
    // back to full size there, so only the image's own footprint shrinks.
    const getMapScale = () => {
      const el = mapScaleRef.current;
      if (!el) return 1;
      const transform = getComputedStyle(el).transform;
      if (!transform || transform === "none") return 1; // not scaled (e.g. desktop)
      const matrix = new DOMMatrixReadOnly(transform);
      return matrix.a || 1; // matrix.a is scaleX; 0 would mean "not measurable"
    };

    // .page pins to the top of the screen on small screens and never moves,
    // so whatever's directly under it is always hidden. But .page's own box
    // is taller than what's actually drawn there: the parchment graphic lives
    // on ::before, which slides up via a CSS transform when the list is
    // collapsed (see "See More" in the SCSS) — so only PART of .page's box is
    // opaque there, the rest is transparent and the map already shows through
    // it. This measures ::before's real on-screen position (rather than
    // assuming how far it slides), so it's correct both collapsed and
    // expanded, and mid-animation between the two. Returns null when .page
    // isn't a top bar at all (desktop side panel), where it doesn't obstruct
    // the map vertically.
    const getPageBottom = (): number | null => {
      const c = container.getBoundingClientRect();
      const p = pageRef.current?.getBoundingClientRect();
      if (!p || p.height >= c.height * 0.9) return null; // not a top bar (desktop)

      let slideY = 0;
      if (pageRef.current) {
        const beforeTransform = getComputedStyle(pageRef.current, "::before").transform;
        if (beforeTransform && beforeTransform !== "none") {
          slideY = new DOMMatrixReadOnly(beforeTransform).f; // translateY, in px
        }
      }

      // ::before is `inset: 0` (same box as .page) then slid by slideY (<= 0).
      // What's actually visible/opaque is the part of that box still inside
      // .page's bounds after the slide.
      const visibleHeight = Math.max(0, Math.min(p.height, p.height + slideY));
      return p.top + visibleHeight;
    };

    const getOffsetY = () => {
      const c = container.getBoundingClientRect();
      const bottom = getPageBottom();
      if (bottom === null) return 0; // desktop: .page doesn't obstruct vertically
      return Math.max(0, bottom - c.top - VIEW_NUDGE_UP);
    };

    const getBounds = () => {
      const scale = getMapScale();
      const offsetY = getOffsetY();
      const minX = Math.min(0, container.clientWidth - layer.offsetWidth * scale);
      // Only maxY gets the offset — this EXTENDS how far down the map can go
      // (to reveal what's hidden behind .page) without eating into how far up
      // it can go (reaching the map's actual bottom edge). Adding offsetY to
      // minY too would just shift the whole draggable range instead of
      // growing it, making the bottom unreachable by the same amount.
      const minY = Math.min(0, container.clientHeight - layer.offsetHeight * scale);
      return { minX, maxX: 0, minY, maxY: offsetY };
    };

    const clampPos = (p: { x: number; y: number }) => {
      const { minX, maxX, minY, maxY } = getBounds();
      return {
        x: Math.max(minX, Math.min(maxX, p.x)),
        y: Math.max(minY, Math.min(maxY, p.y)),
      };
    };

    // Start at the (already nudged, see VIEW_NUDGE_UP) fully-revealed position,
    // so the initial view isn't wasted on content hidden behind .page.
    pos.current = clampPos({
      x: pos.current.x,
      y: getOffsetY(),
    });

    // True when an event happened on (or inside) the .page panel. Pressing /
    // dragging there must not move the map (touchpad scrolling still works).
    const isOverPage = (e: Event) =>
      !!pageRef.current && pageRef.current.contains(e.target as Node);

    // Smoothly move the map so the chosen card is centred in the visible map area
    scrollToCard.current = (index: number) => {
      const card = cardRefs.current[index];
      if (!card) return;

      const c = container.getBoundingClientRect();
      const l = layer.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      const p = pageRef.current?.getBoundingClientRect();

      // Visible map area = the part of the screen not covered by .page,
      // whichever side it's on: a side panel (desktop) narrows it from the
      // left, a top bar (mobile) narrows it from the top — using the same
      // real obstruction measurement as getOffsetY(), so a card is still
      // centred correctly whether .page is collapsed or expanded.
      const pageBottom = getPageBottom();
      const visibleLeft = p && p.width < c.width * 0.9 ? p.right : c.left;
      const visibleTop = pageBottom ?? c.top;
      const centerX = (visibleLeft + c.right) / 2 - c.left;
      const centerY = (visibleTop + c.bottom) / 2 - c.top;

      // Card centre in the map layer's own coordinates
      const cardX = r.left + r.width / 2 - l.left;
      const cardY = r.top + r.height / 2 - l.top;

      isFlicking.current = false;
      vel.current = { x: 0, y: 0 };
      target.current = clampPos({ x: centerX - cardX, y: centerY - cardY });
    };

    // 1. Wheel input. Two very different devices send "wheel" events:
    //    - Touchpad (two-finger scroll): pans the map, anywhere — including over .page.
    //    - Real mouse wheel: steps through the list items if one is selected,
    //      otherwise does nothing.
    let lastTouchpadTime = 0;
    let lastWheelStepTime = 0;

    // Heuristic (browsers don't say which device produced a wheel event):
    // a mouse wheel sends big, whole-number, vertical-only notches (or line-based
    // deltas in Firefox); a touchpad sends small, fractional and/or diagonal
    // deltas in a rapid stream. Events right after a touchpad event are treated
    // as the same gesture so momentum tails aren't mistaken for a mouse wheel.
    const isMouseWheel = (e: WheelEvent, now: number) => {
      if (now - lastTouchpadTime < TOUCHPAD_GESTURE_GAP) return false;
      if (e.deltaMode !== 0) return true; // lines / pages => mouse wheel
      return (
        e.deltaX === 0 &&
        Number.isInteger(e.deltaY) &&
        Math.abs(e.deltaY) >= 40
      );
    };

    const handleWheel = (e: WheelEvent) => {
      // Collapsed mobile list is scrollable: let it scroll natively
      const list = listRef.current;
      if (list && list.contains(e.target as Node) && list.scrollHeight > list.clientHeight + 1) {
        return;
      }

      e.preventDefault();
      if (e.ctrlKey) return; // pinch-zoom gesture: ignore

      const now = performance.now();

      if (isMouseWheel(e, now)) {
        const current = activeIndexRef.current;
        if (current === null) return; // nothing selected: wheel does nothing
        if (now - lastWheelStepTime < WHEEL_STEP_COOLDOWN) return;

        const dir = Math.sign(e.deltaY); // down = next, up = previous
        if (dir === 0) return;
        lastWheelStepTime = now;

        const next = Math.max(0, Math.min(CONTACTS.length - 1, current + dir));
        if (next !== current) {
          setActive(next);
          scrollToCard.current(next);
        }
        return;
      }

      // Touchpad: pan the map
      lastTouchpadTime = now;

      // Cancel any ongoing momentum / auto-scroll
      isFlicking.current = false;
      target.current = null;
      vel.current = { x: 0, y: 0 };
      setActive(null);

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
      // Pressing on the .page panel must not start a map drag
      if (isOverPage(e)) return;

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
        setActive(null);
      }

      // Touch screens get a speed boost; mouse/pen stay 1:1 with the cursor.
      // The scaled delta also feeds the flick velocity, so glides speed up too.
      const speed = e.pointerType === "touch" ? TOUCH_DRAG_SENSITIVITY : 1;
      const dx = (e.clientX - lastPointer.current.x) * speed;
      const dy = (e.clientY - lastPointer.current.y) * speed;

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
      // Keyboard movement (W/A/S/D + arrows) — only when no list item is selected
      if (pressedKeys.current.size > 0 && activeIndexRef.current === null) {
        let dx = 0;
        let dy = 0;
        pressedKeys.current.forEach((code) => {
          const dir = KEY_DIRECTIONS[code];
          if (dir) {
            dx += dir.x;
            dy += dir.y;
          }
        });

        if (dx !== 0 || dy !== 0) {
          // Normalise so diagonals aren't faster (and W+A on both sets don't double up)
          const len = Math.hypot(dx, dy);
          // Moving the view right means the map shifts left, hence the minus
          pos.current.x -= (dx / len) * KEY_SPEED;
          pos.current.y -= (dy / len) * KEY_SPEED;
          pos.current = clampPos(pos.current);
        }
      }

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

    // Re-clamp on resize so the position stays valid whichever map scale is
    // now in effect. Also nudge pos.y by however much getOffsetY() itself
    // changed (e.g. crossing the mobile breakpoint, or .page's height
    // changing with viewport width), so the view shifts with it instead of
    // just getting clamped to a new edge.
    let lastOffsetY = getOffsetY();
    const handleResize = () => {
      const offsetY = getOffsetY();
      pos.current.y += offsetY - lastOffsetY;
      lastOffsetY = offsetY;
      pos.current = clampPos(pos.current);
    };

    // 4. Keyboard
    //  - Nothing selected: W/A/S/D + arrows pan the map (held keys, see render()).
    //  - A list item is selected: W/S/↑/↓ step through the list items;
    //    A/D/←/→ unselect it and pan the map from that same press.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Leave browser shortcuts (Ctrl+S, Ctrl+D, Alt+←, ...) alone
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const dir = KEY_DIRECTIONS[e.code];
      if (!dir) return;

      // Don't hijack typing in form fields
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }

      e.preventDefault();

      const current = activeIndexRef.current;

      // Vertical key while a list item is selected -> move through the list
      if (current !== null && dir.y !== 0) {
        if (e.repeat) return; // one step per press
        const next = Math.max(0, Math.min(CONTACTS.length - 1, current + dir.y));
        if (next !== current) {
          setActive(next);
          scrollToCard.current(next);
        }
        return;
      }

      // Horizontal key while a list item is selected -> unselect it
      if (current !== null) setActive(null);

      // Start / continue panning; cancel any glide or auto-scroll in progress
      isFlicking.current = false;
      target.current = null;
      vel.current = { x: 0, y: 0 };
      pressedKeys.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.code);
    };

    // Avoid a "stuck" key if the tab loses focus while one is held
    const handleBlur = () => {
      pressedKeys.current.clear();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  // Measure the list so the mobile collapse/expand can animate max-height:
  //   --list-collapsed = height showing only the first 2 entries
  //   --list-expanded  = height showing every entry
  // (measured, not hard-coded, because entries can wrap onto 2 lines)
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const second = list.children[1] as HTMLElement | undefined;
      if (!second) return;
      const collapsed = second.offsetTop + second.offsetHeight + LIST_PEEK_PADDING;
      list.style.setProperty("--list-collapsed", `${collapsed}px`);
      list.style.setProperty("--list-expanded", `${list.scrollHeight}px`);
    };

    measure();
    window.addEventListener("resize", measure);
    // Fonts loading late changes line heights
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // When the selected entry changes (click, W/S, mouse wheel), scroll the
  // collapsed list so it stays in view. Adjusts the list's own scrollTop only —
  // scrollIntoView() could also shift the overflow:hidden map container.
  useEffect(() => {
    const list = listRef.current;
    if (activeIndex === null || !list) return;
    if (list.scrollHeight <= list.clientHeight + 1) return;

    const li = list.children[activeIndex] as HTMLElement | undefined;
    if (!li) return;

    const top = li.offsetTop;
    const bottom = top + li.offsetHeight;
    if (top < list.scrollTop) {
      list.scrollTo({ top: Math.max(0, top - LIST_PEEK_PADDING), behavior: "smooth" });
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: bottom - list.clientHeight + LIST_PEEK_PADDING, behavior: "smooth" });
    }
  }, [activeIndex]);

  const handleListClick = (index: number) => {
    setActive(index);

    if (expanded) {
      // Collapse first. scrollToCard needs .page's post-collapse geometry to
      // center the card correctly (see getPageBottom()); calling it now, while
      // .page is still expanded, would send the view toward a target based on
      // the OLD geometry and then immediately redirect it once the real
      // (collapsed) geometry is known 400ms later — two different targets in
      // quick succession, which looked like a jump. Waiting for the collapse
      // to finish means there's only ever one target.
      setExpanded(false);
      window.setTimeout(() => scrollToCard.current(index), COLLAPSE_TRANSITION_MS);
    } else {
      scrollToCard.current(index);
    }
  };

  return (
    <div ref={containerRef} className={styles.mapContainer}>
      {/* Map layer: same size as the map image, receives the drag transform */}
      <div ref={layerRef} className={styles.mapLayer}>
        {/* Scaled down on small screens via CSS; crosses/cards counter-scale
            back to full size (see Contact.module.scss) */}
        <div ref={mapScaleRef} className={styles.mapScale}>
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

      <section
        ref={pageRef}
        className={`${styles.page} ${expanded ? styles.expanded : ""}`}
      >
        <div className={styles.pageStuff}>
          <Link to="/">
            <img className={styles.backBtn} src={back} alt="Go Back to Home" />
          </Link>
          <h1>CONTACT US</h1>
          <ul ref={listRef}>
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
          {/* Mobile only (hidden on desktop in the SCSS) */}
          <h2
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpanded((v) => !v);
              }
            }}
          >
            {expanded ? "See Less" : "See More"}
          </h2>
        </div>
      </section>
    </div>
  );
}