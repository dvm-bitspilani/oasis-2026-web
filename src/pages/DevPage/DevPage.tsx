import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import Character from "./character";
import { MEMBERS } from "./DevMembers";
import bg from "../../assets/DevPage/bg.png";
import heading from "../../assets/DevPage/heading.png";
import styles from "../../styles/DevPage/DevPage.module.scss";
import Frontend from "../../assets/DevPage/Frontend.png";
import Backend from "../../assets/DevPage/Backend.png";
import Ui from "../../assets/DevPage/ui.png";
import BackButton from "../../assets/DevPage/BackButton.png";
import bgPink from "../../assets/DevPage/bpPink.png";
import bgPurple from "../../assets/DevPage/bgPurple.png";
import bgBlue from "../../assets/DevPage/bgBlue.png";
import rightTop from "../../assets/DevPage/rightTop.png";

type Vertical = "Frontend" | "Backend" | "Ui";

// The viewport shape the page was designed for. MUST match --design-w / --design-h in the scss.
const DESIGN_W = 1440;
const DESIGN_H = 784;

// which scss position slot each person goes into (same order as MEMBERS in devMembers.ts)
const FRONTEND_SLOTS = [styles.frontend1, styles.frontend2, styles.frontend3, styles.frontend4];
const BACKEND_SLOTS = [styles.backend1, styles.backend2, styles.backend3, styles.backend4];
const UI_SLOTS = [styles.ui1, styles.ui2, styles.ui3, styles.ui4, styles.ui5];

/* ────────────────────────────────────────────────────────────────────────────
   THE CURTAIN RAIL

   The three curtains hang on ONE rail, always in this order, left → right.
   The order never changes, and neither does their stacking (CSS z-index:
   pink 1, blue 2, purple 3 — the one further right is always in front).

   Because of that, where every curtain sits is fully decided by ONE number:
   which curtain is open (or none = home).

     home      all three parked bottom-right, tilted (the original screen)
     Frontend  open | Backend + UI parked on the right
     Backend   Frontend folded on the left | open | UI parked on the right
     UI        Frontend + Backend folded on the left | open

   Pulling a curtain slides it over the stage and PUSHES its neighbours ahead
   of it: pull UI to the left and Backend (which sits just left of it) is pushed
   to the left edge, and so on. Pull a folded curtain back and everything to
   its right is pushed back to the right edge. Nothing ever jumps, because
   every curtain tweens straight from its current spot to its spot in the new
   layout, with the same duration and ease (so they stay perfectly glued).
   ──────────────────────────────────────────────────────────────────────────── */
const ORDER: Vertical[] = ["Frontend", "Backend", "Ui"];

const DUR = 1.1; // every slide takes this long
const EASE = "power3.inOut";

const REST_ROTATION = 5; // parked / home curtains are tilted 5°
const REST_HEIGHT = "110%"; // a tilted curtain needs 110% of the stage height so no corner shows
const ACTIVE_HEIGHT = "100%"; // untilted curtains only need 100%

const FIRST_X = -8; // x (in %) of the Frontend curtain when it is open or folded
const STRIP_W = 8; // width (in %) of the strip each folded curtain shows on the left

// parked on the right (percent of stage width)
const PARK_FAR_X = "84%"; // the curtain right next to the open one (partly tucked behind the next)
const PARK_NEAR_X = "91%"; // the outermost curtain, closest to the edge
const LABEL_FAR_LEFT = 90;
const LABEL_NEAR_LEFT = 96;

// where each curtain rests on the home screen — keep in sync with the scss (translateX values)
const HOME_X = ["74%", "84%", "92%"]; // Frontend, Backend, UI

// The curtain images have a transparent margin on their left, so a curtain placed at x shows
// its fabric from about x + IMG_EDGE. Strip i is therefore visible between
// (i*STRIP_W + IMG_EDGE) and ((i+1)*STRIP_W + IMG_EDGE); the first strip is clipped by the
// screen edge, so it is visible from 0. Labels are centred on that visible band.
const IMG_EDGE = 3.3;
const LABEL_NUDGE = 0.5; // the rotated label's visual centre sits slightly left of its `left`
const stripLabelLeft = (i: number) => {
  // every strip is exactly STRIP_W wide: strip i shows fabric from i*STRIP_W to (i+1)*STRIP_W
  const start = i * STRIP_W;
  const end = (i + 1) * STRIP_W;
  return `${(start + end) / 2 + LABEL_NUDGE}%`;
};

type Pose = { x: string; rotation: number; height: string; labelLeft: string | null };

// openIdx: index of the open curtain in ORDER, or -1 when nothing is open (home)
const poseFor = (openIdx: number, i: number): Pose => {
  // HOME — the original resting spots, nothing is labelled
  if (openIdx === -1) {
    return { x: HOME_X[i], rotation: REST_ROTATION, height: REST_HEIGHT, labelLeft: null };
  }

  // OPEN curtain, or one FOLDED on its left. These two stand at exactly the same
  // spot whether they are open or folded — what changes is only what lies on top of them.
  if (i <= openIdx) {
    // curtain i must show its fabric from i*STRIP_W, so pull its image back by the transparent margin
    const x = i === 0 ? `${FIRST_X}%` : `${i * STRIP_W - IMG_EDGE}%`;
    const isOpen = i === openIdx;
    return {
      x,
      rotation: 0,
      height: ACTIVE_HEIGHT,
      labelLeft: isOpen ? null : stripLabelLeft(i),
    };
  }

  // PARKED on the right. With two parked curtains the one next to the open curtain is "far"
  // (tucked behind) and the outer one is "near"; a single parked curtain takes the near spot.
  const parkedCount = ORDER.length - 1 - openIdx;
  const isFar = parkedCount === 2 && i === openIdx + 1;
  return {
    x: isFar ? PARK_FAR_X : PARK_NEAR_X,
    rotation: REST_ROTATION,
    height: REST_HEIGHT,
    labelLeft: `${isFar ? LABEL_FAR_LEFT : LABEL_NEAR_LEFT}%`,
  };
};

export default function DevPage() {
  const [activeVertical, setActiveVertical] = useState<Vertical | null>(null);

  // curtain refs
  const curtainRefPink = useRef<HTMLImageElement | null>(null);
  const curtainRefPurple = useRef<HTMLImageElement | null>(null);
  const curtainRefBlue = useRef<HTMLImageElement | null>(null);

  // character-group refs
  const frontendRef = useRef<HTMLDivElement | null>(null);
  const backendRef = useRef<HTMLDivElement | null>(null);
  const uiRef = useRef<HTMLDivElement | null>(null);

  // nav-label refs — the clickable vertical text on the folded / parked curtains
  const labelRefFrontend = useRef<HTMLButtonElement | null>(null);
  const labelRefBackend = useRef<HTMLButtonElement | null>(null);
  const labelRefUi = useRef<HTMLButtonElement | null>(null);

  // The page fills the whole window. The cushions are painted on the sofa in the background, so
  // they have to be squashed/stretched vertically by the same amount as the background:
  // --sy = (window height / width) compared to the design's. 1 = exactly the design shape.
  const stageRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const apply = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      el.style.setProperty("--sy", String(height / width / (DESIGN_H / DESIGN_W)));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the running timeline, so a new move can take over cleanly
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  // true while a switch is playing — extra clicks are ignored (Back always wins)
  const isAnimatingRef = useRef(false);

  // single source of truth: which curtain + which character group + which nav label
  const verticalConfig = {
    Frontend: { curtainRef: curtainRefPink, membersRef: frontendRef, labelRef: labelRefFrontend },
    Backend: { curtainRef: curtainRefBlue, membersRef: backendRef, labelRef: labelRefBackend },
    Ui: { curtainRef: curtainRefPurple, membersRef: uiRef, labelRef: labelRefUi },
  } as const;

  const curtain = (k: Vertical) => verticalConfig[k].curtainRef.current;
  const labelEl = (k: Vertical) => verticalConfig[k].labelRef.current;
  const membersEl = (k: Vertical) => verticalConfig[k].membersRef.current;

  // Put every curtain exactly on its home spot once, so the first animation starts from
  // the same numbers the rest of the code uses (instead of parsing the css transform).
  useLayoutEffect(() => {
    ORDER.forEach((key, i) => {
      const el = curtain(key);
      if (el) gsap.set(el, { x: HOME_X[i], rotation: REST_ROTATION, height: REST_HEIGHT });
    });
    return () => {
      tlRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hideCharacters = (tl: gsap.core.Timeline, k: Vertical) => {
    const m = membersEl(k);
    if (!m) return;
    tl.to(m.children, { opacity: 0, y: 20, duration: 0.35, ease: "power1.in" }, 0);
    tl.set(m, { pointerEvents: "none" }, 0);
  };

  const showCharacters = (tl: gsap.core.Timeline, k: Vertical, at: number) => {
    const m = membersEl(k);
    if (!m) return;
    tl.set(m, { pointerEvents: "auto" }, at);
    tl.fromTo(
      m.children,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" },
      at
    );
  };

  // Move to a new layout: target = the curtain to open, or null for home.
  const goTo = (target: Vertical | null) => {
    const fromIdx = activeVertical ? ORDER.indexOf(activeVertical) : -1;
    const toIdx = target ? ORDER.indexOf(target) : -1;

    isAnimatingRef.current = true;
    tlRef.current?.kill();
    const tl = gsap.timeline();
    tlRef.current = tl;

    // 1. whoever's characters are on screen fade out (all except the one about to open)
    ORDER.forEach((key) => {
      if (key !== target) hideCharacters(tl, key);
    });

    // 2. every curtain slides to its place in the new layout — same duration, same ease,
    //    so a curtain that pushes another one stays glued to it the whole way
    ORDER.forEach((key, i) => {
      const el = curtain(key);
      if (!el) return;
      const pose = poseFor(toIdx, i);

      tl.to(el, { x: pose.x, duration: DUR, ease: EASE }, 0);

      // The tilt: a curtain that is straightening up does it right away (while it is still
      // out near the edge); one that is about to be parked tilts only at the end of its
      // slide. That way a tilted corner never shows a gap while it sweeps across the stage.
      const currentTilt = gsap.getProperty(el, "rotation") as number;
      if (pose.rotation < currentTilt) {
        tl.to(el, { rotation: pose.rotation, height: pose.height, duration: DUR * 0.45, ease: "power2.out" }, 0);
      } else if (pose.rotation > currentTilt) {
        tl.to(
          el,
          { rotation: pose.rotation, height: pose.height, duration: DUR * 0.45, ease: "power2.inOut" },
          DUR * 0.55
        );
      } else {
        tl.set(el, { rotation: pose.rotation, height: pose.height }, 0);
      }
    });

    // 3. nav labels ride along on their curtain
    ORDER.forEach((key, i) => {
      const l = labelEl(key);
      if (!l) return;
      const pose = poseFor(toIdx, i);
      const wasVisible = fromIdx !== -1 && i !== fromIdx; // folded or parked before this move

      if (pose.labelLeft === null) {
        // the curtain being opened, or everything on the home screen: no label
        tl.set(l, { pointerEvents: "none" }, 0);
        tl.to(l, { opacity: 0, duration: 0.25 }, 0);
      } else if (wasVisible) {
        // already labelled: the label travels with its curtain
        tl.to(l, { left: pose.labelLeft, duration: DUR, ease: EASE }, 0);
      } else {
        // label was hidden (it sat on the open curtain): park it at its new spot, reveal at the end
        tl.set(l, { left: pose.labelLeft }, 0);
        tl.to(l, { opacity: 1, duration: 0.5, ease: "power1.out" }, DUR);
        tl.set(l, { pointerEvents: "auto" }, DUR);
      }
    });

    // 4. the new vertical's characters appear once the curtains have settled
    if (target) showCharacters(tl, target, DUR);

    // 5. everything is in place: allow the next click
    tl.call(
      () => {
        isAnimatingRef.current = false;
      },
      undefined,
      DUR
    );

    setActiveVertical(target);
  };

  const handleVerticalClick = (name: Vertical) => {
    if (name === activeVertical) return; // already open
    if (isAnimatingRef.current) return; // a move is still playing
    if (!curtain(name) || !membersEl(name)) return;
    goTo(name);
  };

  // Back, two cases:
  //  • a vertical is open  -> every curtain, folded or parked, slides back to the original home
  //                           spot at the same time
  //  • already on the home screen (cushions) -> leave this page, back to wherever the visitor came from
  const handleBack = () => {
    if (activeVertical === null) {
      if (window.history.length > 1) window.history.back();
      else window.location.assign("/");
      return;
    }
    goTo(null); // takes over from whatever is playing
  };

  return (
    <div className={styles.wrapper}>
      {/* Full-window stage: background / curtains / cushions stretch, people & labels keep their shape */}
      <div ref={stageRef} className={styles.stage} style={{ backgroundImage: `url(${bg})` }}>
        <div className={styles.heading}>
          <img src={heading} />
        </div>

        {/* the cushions only exist on the home screen; once a curtain is open they are
            hidden behind it, so they must not be clickable through the curtain */}
        <div className={styles.cushion} style={{ pointerEvents: activeVertical ? "none" : "auto" }}>
          <button
            className={`${styles.FrontendButton} ${styles.cushionButton}`}
            onClick={() => handleVerticalClick("Frontend")}
          >
            <img className={styles.Frontend} src={Frontend} alt="Frontend" />
          </button>
          <button
            className={`${styles.BackendButton} ${styles.cushionButton}`}
            onClick={() => handleVerticalClick("Backend")}
          >
            <img className={styles.Backend} src={Backend} alt="Backend" />
          </button>
          <button
            className={`${styles.UiButton} ${styles.cushionButton}`}
            onClick={() => handleVerticalClick("Ui")}
          >
            <img className={styles.Ui} src={Ui} alt="ui" />
          </button>
        </div>

        <div className={styles.back}>
          <button className={styles.BackButton} onClick={handleBack}>
            <img className={styles.backImg} src={BackButton} alt="Back" />
          </button>
        </div>

        <div className={styles.curtainOverlay}>
          <img src={rightTop} alt="rightTop" className={styles.rightTop} />
          <img ref={curtainRefPink} className={styles.pinkCurtain} src={bgPink} alt="curtainPink" />
          <img ref={curtainRefPurple} className={styles.purpleCurtain} src={bgPurple} alt="curtainPurple" />
          <img ref={curtainRefBlue} className={styles.blueCurtain} src={bgBlue} alt="curtainBlue" />
        </div>

        {/* Nav labels — sit on the folded / parked curtains and let you jump to that vertical */}
        <div className={styles.verticalLabels}>
          <button
            ref={labelRefFrontend}
            className={`${styles.verticalLabel} ${styles.labelFrontend}`}
            onClick={() => handleVerticalClick("Frontend")}
          >
            Frontend
          </button>
          <button
            ref={labelRefBackend}
            className={`${styles.verticalLabel} ${styles.labelBackend}`}
            onClick={() => handleVerticalClick("Backend")}
          >
            Backend
          </button>
          <button
            ref={labelRefUi}
            className={`${styles.verticalLabel} ${styles.labelUi}`}
            onClick={() => handleVerticalClick("Ui")}
          >
            UI/UX
          </button>
        </div>

        {/* FRONTEND — names + photos + Instagram/LinkedIn come from devMembers.ts */}
        <div ref={frontendRef} className={styles.frontendCharacters}>
          {MEMBERS.Frontend.map((m, i) => (
            <Character
              key={m.name}
              image={m.image}
              name={m.name}
              instagram={m.instagram}
              linkedin={m.linkedin}
              className={FRONTEND_SLOTS[i]}
            />
          ))}
        </div>

        {/* BACKEND */}
        <div ref={backendRef} className={styles.backendCharacters}>
          {MEMBERS.Backend.map((m, i) => (
            <Character
              key={m.name}
              image={m.image}
              name={m.name}
              instagram={m.instagram}
              linkedin={m.linkedin}
              className={BACKEND_SLOTS[i]}
            />
          ))}
        </div>

        {/* UI/UX */}
        <div ref={uiRef} className={styles.uiCharacters}>
          {MEMBERS.Ui.map((m, i) => (
            <Character
              key={m.name}
              image={m.image}
              name={m.name}
              instagram={m.instagram}
              linkedin={m.linkedin}
              className={UI_SLOTS[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}