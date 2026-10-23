// import { useRef, useState } from 'react'
// import gsap from "gsap";
// import Character from "./character";
// import { MEMBERS } from "./DevMembers";
// import bg from "../../assets/DevPage/bg.png"
// import heading from "../../assets/DevPage/heading.png"
// import styles from "../../styles/DevPage/DevPage.module.scss"
// import Frontend from "../../assets/DevPage/Frontend.png"
// import Backend from "../../assets/DevPage/Backend.png"
// import Ui from "../../assets/DevPage/ui.png"
// import BackButton from "../../assets/DevPage/BackButton.png"
// import bgPink from "../../assets/DevPage/bpPink.png"
// import bgPurple from "../../assets/DevPage/bgPurple.png"
// import bgBlue from "../../assets/DevPage/bgBlue.png"
// import image from "../../assets/DevPage/profile.png"
// import rightTop from "../../assets/DevPage/rightTop.png"
// type Vertical = "Frontend" | "Backend" | "Ui";

// // which scss position slot each person goes into (same order as MEMBERS in devMembers.ts)
// const FRONTEND_SLOTS = [styles.frontend1, styles.frontend2, styles.frontend3, styles.frontend4];
// const BACKEND_SLOTS = [styles.backend1, styles.backend2, styles.backend3, styles.backend4];
// const UI_SLOTS = [styles.ui1, styles.ui2, styles.ui3, styles.ui4, styles.ui5];

// export default function DevPage() {
//   const [activeVertical, setActiveVertical] = useState<Vertical | null>(null);

//   // curtain refs
//   const curtainRefPink = useRef<HTMLImageElement | null>(null);
//   const curtainRefPurple = useRef<HTMLImageElement | null>(null);
//   const curtainRefBlue = useRef<HTMLImageElement | null>(null);

//   // character-group refs
//   const frontendRef = useRef<HTMLDivElement | null>(null);
//   const backendRef = useRef<HTMLDivElement | null>(null);
//   const uiRef = useRef<HTMLDivElement | null>(null);

//   // nav-label refs — the clickable vertical text that sits on a peeking curtain,
//   // letting you jump straight to another vertical while one is already open
//   const labelRefFrontend = useRef<HTMLButtonElement | null>(null);
//   const labelRefBackend = useRef<HTMLButtonElement | null>(null);
//   const labelRefUi = useRef<HTMLButtonElement | null>(null);

//   // keep a handle on the running timeline so rapid clicks don't stack animations
//   const tlRef = useRef<gsap.core.Timeline | null>(null);

//   // Curtains are 100% of the stage wide (see scss). "Landed" covers 0–88%, leaving a 12%
//   // band on the right where the two inactive curtains park — snug against each other.
//   // Curtains are always rotated 5° at rest, which needs 110% of the stage height to
//   // avoid clipping top/bottom — only the active (unrotated) curtain can safely use 100%.
//   // Every tween below sets height explicitly for this reason: GSAP leaves whatever
//   // height a previous tween set as an inline style.
//   //
//   // NOTE: these are percentages of the stage (not vh), so they scale with the
//   // fixed-aspect-ratio stage on every screen.
//   const REST_HEIGHT = "110%";
//   const ACTIVE_HEIGHT = "100%";

//   const ACTIVE_X = "-8%";
//   const ACTIVE_Z = 1; // whichever curtain is active always paints above the parked ones

//   // the two parked curtains always sit in these two slots, snug against each other —
//   // FAR is further back (lower z, partly tucked behind), NEAR sits right in front of
//   // it, closer to the edge. Which vertical goes into which slot is decided per click.
//   const PARK_FAR_X = "84%";
//   const PARK_FAR_Z = 3;
//   const PARK_NEAR_X = "91%";
//   const PARK_NEAR_Z = 5;

//   // matching left-offsets for the nav labels riding on top of the FAR/NEAR curtains
//   const LABEL_FAR_LEFT = "90%";
//   const LABEL_NEAR_LEFT = "96%";

//   // resting spots used only when nobody is active (back at the home cushions)
//   const HOME_X: Record<Vertical, string> = { Frontend: "75%", Backend: "84%", Ui: "92%" };
//   const HOME_Z: Record<Vertical, number> = { Frontend: 1, Backend: 2, Ui: 3 };

//   // single source of truth: which curtain + which character group + which nav label
//   const verticalConfig = {
//     Frontend: { curtainRef: curtainRefPink, membersRef: frontendRef, labelRef: labelRefFrontend },
//     Backend: { curtainRef: curtainRefBlue, membersRef: backendRef, labelRef: labelRefBackend },
//     Ui: { curtainRef: curtainRefPurple, membersRef: uiRef, labelRef: labelRefUi },
//   } as const;

//   const allVerticals = Object.keys(verticalConfig) as Vertical[];

//   const handleVerticalClick = (name: Vertical) => {
//     const target = verticalConfig[name];
//     if (!target.curtainRef.current || !target.membersRef.current) return;
//     if (activeVertical === name) return; // already open, nothing to do

//     tlRef.current?.kill();
//     const tl = gsap.timeline();
//     tlRef.current = tl;

//     // 1. fade out whichever vertical was open before (characters only — its curtain
//     //    is handled below as one of the two "others")
//     if (activeVertical) {
//       const prevMembers = verticalConfig[activeVertical].membersRef.current;
//       if (prevMembers) {
//         tl.to(prevMembers.children, { opacity: 0, y: 20, duration: 0.35, ease: "power1.in" }, 0);
//         tl.set(prevMembers, { pointerEvents: "none" });
//       }
//     }

//     // 2. the vertical being opened doesn't need its own nav label — hide it
//     if (target.labelRef.current) {
//       tl.to(target.labelRef.current, { opacity: 0, pointerEvents: "none", duration: 0.25 }, 0);
//     }

//     // 3. the other two always land in the FAR/NEAR slots, bunched together — the one
//     //    that comes first (in Frontend/Backend/Ui order) sits further back
//     const others = allVerticals.filter((key) => key !== name);
//     const [farKey, nearKey] = others;
//     const farCfg = verticalConfig[farKey];
//     const nearCfg = verticalConfig[nearKey];

//     tl.set(farCfg.curtainRef.current, { zIndex: PARK_FAR_Z }, 0);
//     tl.set(nearCfg.curtainRef.current, { zIndex: PARK_NEAR_Z }, 0);
//     tl.to(farCfg.curtainRef.current, { x: PARK_FAR_X, rotation: 5, height: REST_HEIGHT, duration: 0.9, ease: "power3.inOut" }, 0);
//     tl.to(nearCfg.curtainRef.current, { x: PARK_NEAR_X, rotation: 5, height: REST_HEIGHT, duration: 0.9, ease: "power3.inOut" }, 0);
//     if (farCfg.labelRef.current) tl.set(farCfg.labelRef.current, { left: LABEL_FAR_LEFT }, 0);
//     if (nearCfg.labelRef.current) tl.set(nearCfg.labelRef.current, { left: LABEL_NEAR_LEFT }, 0);

//     // 4. the clicked curtain jumps above everything and sweeps in to cover the stage
//     tl.set(target.curtainRef.current, { zIndex: ACTIVE_Z }, 0);
//     tl.to(
//       target.curtainRef.current,
//       { x: ACTIVE_X, rotateZ: 0, height: ACTIVE_HEIGHT, duration: 1.1, ease: "power3.inOut" },
//       activeVertical ? 0.25 : 0 // let it overlap slightly with the previous curtain retreating
//     );

//     // 5. only once the curtain has landed do the matching characters fade in, staggered
//     tl.set(target.membersRef.current, { pointerEvents: "auto" });
//     tl.fromTo(
//       target.membersRef.current.children,
//       { opacity: 0, y: 30 },
//       { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }
//     );

//     // 6. at the same moment, reveal the nav labels for the OTHER two verticals now
//     //    sitting on the FAR/NEAR curtains
//     const otherLabels = others
//       .map((key) => verticalConfig[key].labelRef.current)
//       .filter(Boolean) as HTMLButtonElement[];
//     if (otherLabels.length) {
//       tl.to(otherLabels, { opacity: 1, pointerEvents: "auto", duration: 0.5, ease: "power1.out" }, "<");
//     }

//     setActiveVertical(name);
//   };

//   const handleBack = () => {
//     if (!activeVertical) return;
//     tlRef.current?.kill();
//     const tl = gsap.timeline();
//     tlRef.current = tl;

//     const prev = verticalConfig[activeVertical];
//     tl.to(prev.membersRef.current!.children, { opacity: 0, duration: 0.3 }, 0);
//     tl.set(prev.membersRef.current!, { pointerEvents: "none" });

//     // nobody's active — every curtain goes back to its own home spot (not bunched)
//     allVerticals.forEach((key) => {
//       const cfg = verticalConfig[key];
//       tl.set(cfg.curtainRef.current, { zIndex: HOME_Z[key] }, 0);
//       tl.to(cfg.curtainRef.current, { x: HOME_X[key], rotation: 5, height: REST_HEIGHT, duration: 0.9, ease: "power3.inOut" }, 0);
//     });

//     const allLabelEls = allVerticals
//       .map((key) => verticalConfig[key].labelRef.current)
//       .filter(Boolean) as HTMLButtonElement[];
//     if (allLabelEls.length) {
//       tl.to(allLabelEls, { opacity: 0, pointerEvents: "none", duration: 0.25 }, 0);
//     }

//     setActiveVertical(null);
//   };

//   return (
//     <div className={styles.wrapper}>
//       {/* Fixed-aspect-ratio stage: everything inside scales together on every screen */}
//       <div className={styles.stage} style={{ backgroundImage: `url(${bg})` }}>
//         <div className={styles.heading}>
//           <img src={heading} />
//         </div>

//         <div className={styles.cushion}>
//           <button
//             className={`${styles.FrontendButton} ${styles.cushionButton}`}
//             onClick={() => handleVerticalClick("Frontend")}
//           >
//             <img className={styles.Frontend} src={Frontend} alt="Frontend" />
//           </button>
//           <button
//             className={`${styles.BackendButton} ${styles.cushionButton}`}
//             onClick={() => handleVerticalClick("Backend")}
//           >
//             <img className={styles.Backend} src={Backend} alt="Backend" />
//           </button>
//           <button
//             className={`${styles.UiButton} ${styles.cushionButton}`}
//             onClick={() => handleVerticalClick("Ui")}
//           >
//             <img className={styles.Ui} src={Ui} alt="ui" />
//           </button>
//         </div>

//         <div className={styles.back}>
//           <button className={styles.BackButton} onClick={handleBack}>
//             <img className={styles.backImg} src={BackButton} alt="Back" />
//           </button>
//         </div>

//         <div className={styles.curtainOverlay}>
//           <img src={rightTop} alt="rightTop" className={styles.rightTop} />
//           <img ref={curtainRefPink} className={styles.pinkCurtain} src={bgPink} alt="curtainPink" />
//           <img ref={curtainRefPurple} className={styles.purpleCurtain} src={bgPurple} alt="curtainPurple" />
//           <img ref={curtainRefBlue} className={styles.blueCurtain} src={bgBlue} alt="curtainBlue" />
//         </div>

//         {/* Nav labels — sit on top of the peeking curtains, hidden until a vertical is
//             open, then let you jump straight to whichever other vertical is showing */}
//         <div className={styles.verticalLabels}>
//           <button
//             ref={labelRefFrontend}
//             className={`${styles.verticalLabel} ${styles.labelFrontend}`}
//             onClick={() => handleVerticalClick("Frontend")}
//           >
//             Frontend
//           </button>
//           <button
//             ref={labelRefBackend}
//             className={`${styles.verticalLabel} ${styles.labelBackend}`}
//             onClick={() => handleVerticalClick("Backend")}
//           >
//             Backend
//           </button>
//           <button
//             ref={labelRefUi}
//             className={`${styles.verticalLabel} ${styles.labelUi}`}
//             onClick={() => handleVerticalClick("Ui")}
//           >
//             UI/UX
//           </button>
//         </div>

//         {/* FRONTEND — names + Instagram/LinkedIn come from devMembers.ts */}
//         <div ref={frontendRef} className={styles.frontendCharacters}>
//           {MEMBERS.Frontend.map((m, i) => (
//             <Character
//               key={m.name}
//               image={image}
//               name={m.name}
//               instagram={m.instagram}
//               linkedin={m.linkedin}
//               className={FRONTEND_SLOTS[i]}
//             />
//           ))}
//         </div>

//         {/* BACKEND */}
//         <div ref={backendRef} className={styles.backendCharacters}>
//           {MEMBERS.Backend.map((m, i) => (
//             <Character
//               key={m.name}
//               image={image}
//               name={m.name}
//               instagram={m.instagram}
//               linkedin={m.linkedin}
//               className={BACKEND_SLOTS[i]}
//             />
//           ))}
//         </div>

//         {/* UI/UX */}
//         <div ref={uiRef} className={styles.uiCharacters}>
//           {MEMBERS.Ui.map((m, i) => (
//             <Character
//               key={m.name}
//               image={image}
//               name={m.name}
//               instagram={m.instagram}
//               linkedin={m.linkedin}
//               className={UI_SLOTS[i]}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useRef, useState } from 'react'
import gsap from "gsap";
import Character from "./character";
import { MEMBERS } from "./DevMembers";
import bg from "../../assets/DevPage/bg.png"
import heading from "../../assets/DevPage/heading.png"
import styles from "../../styles/DevPage/DevPage.module.scss"
import Frontend from "../../assets/DevPage/Frontend.png"
import Backend from "../../assets/DevPage/Backend.png"
import Ui from "../../assets/DevPage/ui.png"
import BackButton from "../../assets/DevPage/BackButton.png"
import bgPink from "../../assets/DevPage/bpPink.png"
import bgPurple from "../../assets/DevPage/bgPurple.png"
import bgBlue from "../../assets/DevPage/bgBlue.png"
import image from "../../assets/DevPage/profile.png"
import rightTop from "../../assets/DevPage/rightTop.png"
type Vertical = "Frontend" | "Backend" | "Ui";

// which scss position slot each person goes into (same order as MEMBERS in devMembers.ts)
const FRONTEND_SLOTS = [styles.frontend1, styles.frontend2, styles.frontend3, styles.frontend4];
const BACKEND_SLOTS = [styles.backend1, styles.backend2, styles.backend3, styles.backend4];
const UI_SLOTS = [styles.ui1, styles.ui2, styles.ui3, styles.ui4, styles.ui5];

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

  // nav-label refs — the clickable vertical text that sits on a peeking curtain,
  // letting you jump straight to another vertical while one is already open
  const labelRefFrontend = useRef<HTMLButtonElement | null>(null);
  const labelRefBackend = useRef<HTMLButtonElement | null>(null);
  const labelRefUi = useRef<HTMLButtonElement | null>(null);

  // keep a handle on the running timeline so rapid clicks don't stack animations
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // true while a vertical-switch animation is running — extra clicks are ignored so the
  // multi-step curtain choreography can't be interrupted half-way
  const isAnimatingRef = useRef(false);

  // Curtains are 100% of the stage wide (see scss). "Landed" covers 0–88%, leaving a 12%
  // band on the right where the two inactive curtains park — snug against each other.
  // Curtains are always rotated 5° at rest, which needs 110% of the stage height to
  // avoid clipping top/bottom — only the active (unrotated) curtain can safely use 100%.
  // Every tween below sets height explicitly for this reason: GSAP leaves whatever
  // height a previous tween set as an inline style.
  //
  // NOTE: these are percentages of the stage (not vh), so they scale with the
  // fixed-aspect-ratio stage on every screen.
  const REST_HEIGHT = "110%";
  const ACTIVE_HEIGHT = "100%";

  const ACTIVE_X = "-8%";
  const ACTIVE_Z = 1; // whichever curtain is active always paints above the parked ones

  // the two parked curtains always sit in these two slots, snug against each other —
  // FAR is further back (lower z, partly tucked behind), NEAR sits right in front of
  // it, closer to the edge. Which vertical goes into which slot is decided per click.
  const PARK_FAR_X = "84%";
  const PARK_FAR_Z = 3;
  const PARK_NEAR_X = "91%";
  const PARK_NEAR_Z = 5;

  // matching left-offsets for the nav labels riding on top of the FAR/NEAR curtains
  const LABEL_FAR_LEFT = "90%";
  const LABEL_NEAR_LEFT = "96%";

  // resting spots used only when nobody is active (back at the home cushions)
  const HOME_X: Record<Vertical, string> = { Frontend: "75%", Backend: "84%", Ui: "92%" };
  const HOME_Z: Record<Vertical, number> = { Frontend: 1, Backend: 2, Ui: 3 };

  // single source of truth: which curtain + which character group + which nav label
  const verticalConfig = {
    Frontend: { curtainRef: curtainRefPink, membersRef: frontendRef, labelRef: labelRefFrontend },
    Backend: { curtainRef: curtainRefBlue, membersRef: backendRef, labelRef: labelRefBackend },
    Ui: { curtainRef: curtainRefPurple, membersRef: uiRef, labelRef: labelRefUi },
  } as const;

  const allVerticals = Object.keys(verticalConfig) as Vertical[];

  const handleVerticalClick = (name: Vertical) => {
    const target = verticalConfig[name];
    if (!target.curtainRef.current || !target.membersRef.current) return;
    if (activeVertical === name) return; // already open, nothing to do
    if (isAnimatingRef.current) return; // a switch is still playing, ignore the click

    isAnimatingRef.current = true;
    tlRef.current?.kill();
    const tl = gsap.timeline();
    tlRef.current = tl;

    const prevKey = activeVertical; // null when coming from the home cushions

    // 1. fade out the characters of whichever vertical was open (curtain handled below)
    if (prevKey) {
      const prevMembers = verticalConfig[prevKey].membersRef.current;
      if (prevMembers) {
        tl.to(prevMembers.children, { opacity: 0, y: 20, duration: 0.35, ease: "power1.in" }, 0);
        tl.set(prevMembers, { pointerEvents: "none" });
      }
    }

    // 2. the vertical being opened doesn't need its own nav label — hide it
    if (target.labelRef.current) {
      tl.to(target.labelRef.current, { opacity: 0, pointerEvents: "none", duration: 0.25 }, 0);
    }

    // the two verticals that are NOT being opened, in Frontend/Backend/Ui order:
    // the first one takes the FAR slot (further back), the second the NEAR slot
    const others = allVerticals.filter((key) => key !== name);
    const [farKey, nearKey] = others;
    const farCfg = verticalConfig[farKey];
    const nearCfg = verticalConfig[nearKey];

    const LANDED = 1.1; // moment the clicked curtain has fully covered the stage
    let settledAt = LANDED; // moment everything is parked and the nav labels may appear

    if (!prevKey) {
      // ───────── FROM THE HOME CUSHIONS (unchanged) ─────────
      tl.set(farCfg.curtainRef.current, { zIndex: PARK_FAR_Z }, 0);
      tl.set(nearCfg.curtainRef.current, { zIndex: PARK_NEAR_Z }, 0);
      tl.to(farCfg.curtainRef.current, { x: PARK_FAR_X, rotation: 5, height: REST_HEIGHT, duration: 0.9, ease: "power3.inOut" }, 0);
      tl.to(nearCfg.curtainRef.current, { x: PARK_NEAR_X, rotation: 5, height: REST_HEIGHT, duration: 0.9, ease: "power3.inOut" }, 0);
      if (farCfg.labelRef.current) tl.set(farCfg.labelRef.current, { left: LABEL_FAR_LEFT }, 0);
      if (nearCfg.labelRef.current) tl.set(nearCfg.labelRef.current, { left: LABEL_NEAR_LEFT }, 0);

      tl.set(target.curtainRef.current, { zIndex: ACTIVE_Z }, 0);
      tl.to(
        target.curtainRef.current,
        { x: ACTIVE_X, rotateZ: 0, height: ACTIVE_HEIGHT, duration: LANDED, ease: "power3.inOut" },
        0
      );
    } else {
      // ───────── SWITCHING FROM ONE OPEN VERTICAL TO ANOTHER ─────────
      // The new curtain comes in from the right and COVERS the open one (which stays
      // where it is). Only after it has landed is the covered curtain tucked away to the
      // right, hidden, and slid back in to its parked slot. So you never see the open
      // curtain "going back" while the new one arrives.
      const prevCfg = verticalConfig[prevKey];
      const thirdKey = others.find((key) => key !== prevKey) as Vertical;
      const thirdCfg = verticalConfig[thirdKey];

      const SLOT = {
        far: { x: PARK_FAR_X, z: PARK_FAR_Z, label: LABEL_FAR_LEFT },
        near: { x: PARK_NEAR_X, z: PARK_NEAR_Z, label: LABEL_NEAR_LEFT },
      };
      const thirdIsFar = thirdKey === farKey;
      const thirdSlot = thirdIsFar ? SLOT.far : SLOT.near; // slot the untouched parked curtain ends in
      const prevSlot = thirdIsFar ? SLOT.near : SLOT.far; // slot the covered curtain ends in

      // the vertical that was already parked (not involved) just settles into its slot
      tl.set(thirdCfg.curtainRef.current, { zIndex: thirdSlot.z }, 0);
      tl.to(thirdCfg.curtainRef.current, { x: thirdSlot.x, rotation: 5, height: REST_HEIGHT, duration: 0.9, ease: "power3.inOut" }, 0);
      if (thirdCfg.labelRef.current) tl.set(thirdCfg.labelRef.current, { left: thirdSlot.label }, 0);

      // A) the clicked curtain sweeps in from the right, one layer ABOVE the open curtain
      tl.set(target.curtainRef.current, { zIndex: ACTIVE_Z + 1 }, 0);
      tl.to(
        target.curtainRef.current,
        { x: ACTIVE_X, rotateZ: 0, height: ACTIVE_HEIGHT, duration: LANDED, ease: "power3.inOut" },
        0
      );

      // B) it has landed: the covered curtain slides off to the right (it's hidden behind
      //    the new curtain and the parked slivers, so this is barely visible)
      const OUT = 0.4;
      const IN = 0.55;
      tl.to(prevCfg.curtainRef.current, { x: "100%", duration: OUT, ease: "power2.in" }, LANDED);

      // C) while it is off-screen, swap the layers + shape — nothing visible changes
      tl.set(prevCfg.curtainRef.current, { zIndex: prevSlot.z, rotation: 5, height: REST_HEIGHT }, LANDED + OUT);
      tl.set(target.curtainRef.current, { zIndex: ACTIVE_Z }, LANDED + OUT);
      if (prevCfg.labelRef.current) tl.set(prevCfg.labelRef.current, { left: prevSlot.label }, LANDED + OUT);

      // D) it slides back in from the right into its parked slot
      tl.to(prevCfg.curtainRef.current, { x: prevSlot.x, duration: IN, ease: "power3.out" }, LANDED + OUT);

      settledAt = LANDED + OUT + IN;
    }

    // 3. the clicked vertical's characters fade in once its curtain has landed
    tl.set(target.membersRef.current, { pointerEvents: "auto" }, LANDED);
    tl.fromTo(
      target.membersRef.current.children,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" },
      LANDED
    );

    // 4. the nav labels of the OTHER two verticals appear once their curtains are parked
    const otherLabels = others
      .map((key) => verticalConfig[key].labelRef.current)
      .filter(Boolean) as HTMLButtonElement[];
    if (otherLabels.length) {
      tl.to(otherLabels, { opacity: 1, pointerEvents: "auto", duration: 0.5, ease: "power1.out" }, settledAt);
    }

    // 5. everything is in place: allow the next click
    tl.call(() => {
      isAnimatingRef.current = false;
    }, undefined, settledAt);

    setActiveVertical(name);
  };

  const handleBack = () => {
    isAnimatingRef.current = false; // Back always wins over a running switch
    if (!activeVertical) return;
    tlRef.current?.kill();
    const tl = gsap.timeline();
    tlRef.current = tl;

    const prev = verticalConfig[activeVertical];
    tl.to(prev.membersRef.current!.children, { opacity: 0, duration: 0.3 }, 0);
    tl.set(prev.membersRef.current!, { pointerEvents: "none" });

    // nobody's active — every curtain goes back to its own home spot (not bunched)
    allVerticals.forEach((key) => {
      const cfg = verticalConfig[key];
      tl.set(cfg.curtainRef.current, { zIndex: HOME_Z[key] }, 0);
      tl.to(cfg.curtainRef.current, { x: HOME_X[key], rotation: 5, height: REST_HEIGHT, duration: 0.9, ease: "power3.inOut" }, 0);
    });

    const allLabelEls = allVerticals
      .map((key) => verticalConfig[key].labelRef.current)
      .filter(Boolean) as HTMLButtonElement[];
    if (allLabelEls.length) {
      tl.to(allLabelEls, { opacity: 0, pointerEvents: "none", duration: 0.25 }, 0);
    }

    setActiveVertical(null);
  };

  return (
    <div className={styles.wrapper}>
      {/* Fixed-aspect-ratio stage: everything inside scales together on every screen */}
      <div className={styles.stage} style={{ backgroundImage: `url(${bg})` }}>
        <div className={styles.heading}>
          <img src={heading} />
        </div>

        <div className={styles.cushion}>
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

        {/* Nav labels — sit on top of the peeking curtains, hidden until a vertical is
            open, then let you jump straight to whichever other vertical is showing */}
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

        {/* FRONTEND — names + Instagram/LinkedIn come from devMembers.ts */}
        <div ref={frontendRef} className={styles.frontendCharacters}>
          {MEMBERS.Frontend.map((m, i) => (
            <Character
              key={m.name}
              image={image}
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
              image={image}
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
              image={image}
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