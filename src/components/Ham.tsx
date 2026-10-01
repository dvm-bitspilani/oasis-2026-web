import { NavLink } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import lidInner from "../assets/ham/lidInner.png";
import lidDome from "../assets/ham/lidDome.png";
import lidEdge from "../assets/ham/lidEdge.png";
import chestWell from "../assets/ham/chestWell.png";
import chestBase from "../assets/ham/chestBase.png";
import sandBottom from "../assets/ham/sandBottom.png";
import sandAbove from "../assets/ham/sandAbove.png";
import board from "../assets/ham/board.png";
import styles from "../styles/Ham.module.scss";
import guitarBook from "../assets/ham/guitarBook.png";
import trunkStuff from "../assets/ham/trunkStuff.png";
import bgHome from "../assets/home/bg.jpg";

// dx / dy = where the sign starts, relative to its final spot (roughly the chest mouth).
// Tweak these until each sign leaves the chest from the right place.
const BOARDS = [
    { label: "DEVELOPERS", pos: "board", to: "/comingSoon", dx: "14vw", dy: "-16vh" },
    { label: "WALL MAG", pos: "board1", to: "/comingSoon", dx: "-14vw", dy: "-16vh" },
    { label: "SPONSORS", pos: "board3", to: "/comingSoon", dx: "10vw", dy: "-26vh" },
    { label: "GALLERY", pos: "board2", to: "/comingSoon", dx: "-10vw", dy: "-26vh" },
    { label: "MEDIA PARTNERS", pos: "board4", to: "/comingSoon", dx: "0vw", dy: "-38vh" },
];

// The closed lid's dome, built from thin flat strips along an elliptical arch.
// All numbers are in ART pixels (the 1417x1167 chest image), so they scale with the chest.
//   frontY/backY = lid depth (front lip edge to hinge), lip = front-edge thickness,
//   rise = how far the dome bulges above the lip. Raise `rise` for a taller lid.
const DOME = { n: 14, frontY: 72, backY: 596, lip: 58, rise: 240 };
const DOME_STRIPS = (() => {
    const pts = Array.from({ length: DOME.n + 1 }, (_, i) => {
        const phi = (i / DOME.n) * Math.PI;
        return {
            y: (DOME.frontY + DOME.backY) / 2 - ((DOME.backY - DOME.frontY) / 2) * Math.cos(phi),
            z: -(DOME.lip + DOME.rise * Math.sin(phi)),
        };
    });
    const segs = pts.slice(0, -1).map((p, i) => {
        const q = pts[i + 1];
        const dy = q.y - p.y, dz = q.z - p.z;
        const len = Math.hypot(dy, dz);
        return { y: p.y, z: p.z, len, ang: (Math.atan2(dz, dy) * 180) / Math.PI, slope: Math.abs(dz) / len };
    });
    const total = segs.reduce((s, g) => s + g.len, 0);
    let acc = 0;
    return segs.map((g) => {
        const a = acc / total;
        acc += g.len;
        // faces pointing up catch more light than steep ones
        return { ...g, a, f: g.len / total, shade: (1.08 - 0.5 * g.slope).toFixed(3) };
    });
})();

// ---------- Easing ----------
// CSS cubic-bezier() as a GSAP ease function
const bezier = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
    if (x <= 0 || x >= 1) return x;
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    let t = x;
    for (let i = 0; i < 8; i++) {
        const e = ((ax * t + bx) * t + cx) * t - x;
        const d = (3 * ax * t + 2 * bx) * t + cx;
        if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
        t -= e / d;
    }
    return ((ay * t + by) * t + cy) * t;
};

// CSS linear() as a GSAP ease function (handles the "value pos%" syntax)
const linearEase = (spec: string) => {
    const stops = spec.split(",").map((s) => s.trim().split(/\s+/));
    const v = stops.map((s) => parseFloat(s[0]));
    const p = stops.map((s) => (s[1] ? parseFloat(s[1]) / 100 : NaN));
    if (isNaN(p[0])) p[0] = 0;
    if (isNaN(p[p.length - 1])) p[p.length - 1] = 1;
    for (let i = 1; i < p.length; i++) {
        if (!isNaN(p[i])) continue;
        let j = i;
        while (isNaN(p[j])) j++;
        for (let k = i; k < j; k++) p[k] = p[i - 1] + ((p[j] - p[i - 1]) * (k - i + 1)) / (j - i + 1);
    }
    return (t: number) => {
        if (t <= 0) return v[0];
        if (t >= 1) return v[v.length - 1];
        let i = 1;
        while (p[i] < t) i++;
        const k = (t - p[i - 1]) / (p[i] - p[i - 1] || 1);
        return v[i - 1] + (v[i] - v[i - 1]) * k;
    };
};

const E = {
    ease: bezier(0.25, 0.1, 0.25, 1),
    out: bezier(0, 0, 0.58, 1),
    inOut: bezier(0.42, 0, 0.58, 1),
    iris: bezier(0.65, 0, 0.35, 1),
    rise: bezier(0.3, 0, 0.2, 1),
    emerge: bezier(0.45, 0.05, 0.3, 1), // gentle start, steady climb, soft stop (chest out of the sand)
    lift: bezier(0.4, 0, 0.1, 1), // slow start, long weightless drift to a stop
    sand: bezier(0.16, 1, 0.3, 1),
    fly: bezier(0.2, 0.6, 0.3, 1),
    zoom: bezier(0.4, 0, 0.2, 1),
    lid1: bezier(0.4, 0, 0.6, 1),
    lid2: bezier(0.35, 0.2, 0.55, 1),
    lid3: bezier(0.3, 0, 0.5, 1),
    spring: linearEase(
        "0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1.004 84.1%, 1"
    ),
};

export default function Ham() {
    const rootRef = useRef<HTMLDivElement>(null);

    // Pointer parallax: lerped, and the rAF loop sleeps once it has settled.
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (reduced || !finePointer) return;

        let raf = 0;
        let tx = 0, ty = 0, x = 0, y = 0;

        const tick = () => {
            x += (tx - x) * 0.06;
            y += (ty - y) * 0.06;
            el.style.setProperty("--px", x.toFixed(4));
            el.style.setProperty("--py", y.toFixed(4));
            const settled = Math.abs(tx - x) < 0.0005 && Math.abs(ty - y) < 0.0005;
            raf = settled ? 0 : requestAnimationFrame(tick);
        };
        const move = (e: PointerEvent) => {
            tx = e.clientX / window.innerWidth - 0.5;
            ty = e.clientY / window.innerHeight - 0.5;
            if (!raf) raf = requestAnimationFrame(tick);
        };

        window.addEventListener("pointermove", move, { passive: true });
        return () => {
            window.removeEventListener("pointermove", move);
            cancelAnimationFrame(raf);
        };
    }, []);

    // Entrance choreography: one master timeline (seconds).
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        // CSS defaults are the final pose, so reduced motion just skips the timeline
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const ctx = gsap.context(() => {
            const q = (n: string) => `.${styles[n]}`;

            // ---- timing knobs ----
            const riseDelay = 0.15, riseTime = 2;
            const hold = 0;                                // chest hangs in the air before the lid opens
            const lidDelay = riseDelay + riseTime + hold - 0.5, lidTime = 1.9;
            const seg = (f: number) => f * lidTime; // fraction of the lid swing -> seconds
            const hoverLift = -3;                             // yPercent: how far above its resting spot it floats
            const letGo = lidDelay + seg(0.3);                // the force releases...
            const landAt = lidDelay + seg(0.57);              // ...and it lands exactly when the lid hits
            const popDelay = lidDelay + seg(0.55), popStagger = 0.14, popTime = 0.9;
            const camStart = 0.6, camClosed = 0.7;

            const tl = gsap.timeline();
            const chestTop = q("chestTop");

            gsap.set(chestTop, { zIndex: 5 }); // in front of the base while lying over it

            // background iris + dim// background iris + dim
tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: E.out }, 0)
    .fromTo(q("bgHome"),
        { clipPath: "circle(0% at 50% 50%)", "--dim": 0.5 },
        { clipPath: "circle(150% at 50% 50%)", "--dim": 0, duration: 2.5, ease: E.iris }, 1);

            // sand
            tl.fromTo(q("sandAbove"), { yPercent: 30 }, { yPercent: 0, duration: 1.6, ease: E.sand }, 0.1)
                .fromTo(q("sandBottom"), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: E.sand }, 0.1);

            // chest zoom (chest only, everything else stays at scale 1):
            // 0.6 -> 0.7 while the lid is closed -> 1 during the swing
            tl.fromTo(q("lChest"), { scale: camStart }, { scale: camClosed, duration: lidDelay - riseDelay, ease: E.ease }, riseDelay)
                .to(q("lChest"), { scale: 1, duration: lidTime, ease: E.zoom }, lidDelay);

            // chest is LIFTED by an unseen force: slow start, long weightless drift up to a hover
            // height, held there, then the force lets go and it sinks to rest as the lid lands.
            // (no scale here, so the zoom above is the only scale)
            tl.fromTo(q("chestRig"), { yPercent: 120 }, { yPercent: hoverLift, duration: riseTime, ease: E.emerge }, riseDelay)
                .fromTo(q("chestRig"), { opacity: 0 }, { opacity: 1, duration: riseTime * 0.25, ease: E.rise }, riseDelay)
                .to(q("chestRig"), { yPercent: 0, duration: landAt - letGo, ease: "power3.in" }, letGo);

            // Levitation drift, driven by one clock so it is scrubbable/reversible. Pure motion, no
            // glow or particles: a slow bob, a lateral drift, and a tilt that starts leaning as it is
            // lifted and levels out. All of it fades to zero right at the landing.
            const rig = root.querySelector<HTMLElement>(q("chestRig"))!;
            gsap.set(rig, { transformOrigin: "50% 65%" }); // sway around the chest, not the screen centre
            const vh = window.innerHeight / 100;
            const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
            const floatDur = landAt - riseDelay;
            const fade = 0.7;                                 // seconds over which the drift dies out
            const fl = { t: 0 };
            tl.to(fl, {
                t: floatDur, duration: floatDur, ease: "none",
                onUpdate: () => {
                    const t = fl.t;
                    const env = smooth(t / 0.5) * (1 - smooth((t - (floatDur - fade)) / fade));
                    const lean = -5 * (1 - E.emerge(Math.min(1, t / riseTime))) * (1 - smooth((t - (floatDur - fade)) / fade));
                    gsap.set(rig, {
                        y: Math.sin(t * 2.0) * 0.9 * vh * env,
                        x: Math.sin(t * 1.25 + 1) * 0.7 * vh * env,
                        rotation: lean + Math.sin(t * 1.6 + 0.5) * 1.2 * env + Math.sin(t * 31) * 0.12 * env, // last term = faint tremor of effort
                    });
                },
            }, riseDelay);

            // lid swing (angle keyframes, each with its own easing)
            const lid = gsap.timeline()
                .fromTo(chestTop, { "--lid": -90 }, { "--lid": -84, duration: seg(0.12), ease: E.lid1 })
                .to(chestTop, { "--lid": 5, duration: seg(0.46), ease: E.lid2 })
                .to(chestTop, { "--lid": -2.5, duration: seg(0.16), ease: E.lid3 })
                .to(chestTop, { "--lid": 1, duration: seg(0.14), ease: E.inOut })
                .to(chestTop, { "--lid": 0, duration: seg(0.12), ease: E.inOut });
            tl.add(lid, lidDelay);

            // hinge fit: 12% -> 45% of the swing
            tl.fromTo(chestTop, { "--fit": 0 }, { "--fit": 1, duration: seg(0.33), ease: E.lid1 }, lidDelay + seg(0.12));

            // z-order swap at 50%, dome/lip hidden at 47%
            // z-order swap at 50%; dome, lip and well hidden at 47%
tl.set(chestTop, { zIndex: 3 }, lidDelay + seg(0.5))
    .set(`${q("strip")}, ${q("lip")}, ${q("chestWell")}`, { visibility: "hidden" }, lidDelay + seg(0.47));

            // lid shadow on the base + inner face lighting up
            tl.fromTo(q("inner"), { filter: "brightness(0.35)" },
                { filter: "brightness(1)", duration: 0.8, ease: E.out, clearProps: "filter" }, lidDelay + seg(0.35));

            // thud when the lid lands
            tl.to(root, {
                keyframes: [{ y: 5, duration: 0.05 }, { y: -3, duration: 0.05 }, { y: 1, duration: 0.05 }, { y: 0, duration: 0.05 }],
                easeEach: "none",
            }, lidDelay + seg(0.57));

            // contents + lantern
            // guitar + book: hidden until the lid starts to open, then scale up out of the chest mouth.
            // transform-origin sits at the chest opening (in the element's own coords); they are
            // below the chest base in z-order, so they grow out from behind it.
            gsap.set(q("guitarBook"), { transformOrigin: "52% 62%" });
            tl.fromTo(q("guitarBook"), { scale: 0.2 },
                { scale: 1, duration: 1.3, ease: "back.out(1.2)" }, lidDelay)
                .fromTo(q("guitarBook"), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: E.out }, lidDelay)
                .fromTo(q("trunkStuff"), { opacity: 0 }, { opacity: 1, duration: 0.15, ease: E.out }, lidDelay + seg(0.2))
                .fromTo(q("lantern"), { opacity: 0 }, { opacity: 1, duration: 1, ease: E.out }, lidDelay + 0.7);

            // signs launch out of the chest
            gsap.utils.toArray<HTMLElement>(q("sign")).forEach((sign, i) => {
                const b = BOARDS[i];
                const at = popDelay + (BOARDS.length - 1 - i) * popStagger;
                tl.fromTo(sign, { x: b.dx, scale: 0.4 }, { x: "0vw", scale: 1, duration: popTime, ease: E.fly }, at)
                    .fromTo(sign, { opacity: 0 }, { opacity: 1, duration: popTime * 0.15, ease: E.fly }, at)
                    .fromTo(sign.firstElementChild, { y: b.dy, rotation: i * 12 - 24 },
                        { y: "0vh", rotation: 0, duration: popTime, ease: E.spring }, at)
                    .set(sign, { pointerEvents: "auto" }, at + popTime); // was `unlock`
            });
        }, root);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={rootRef} className={styles.container}>
            {/* background iris */}
            <div className={`${styles.layer} ${styles.lBg}`}>
                <div className={styles.bgHome}>
                    <img src={bgHome} alt="" />
                </div>
            </div>

            <div className={`${styles.layer} ${styles.lSand}`}>
                <div className={styles.sandAbove}>
                    <img src={sandAbove} alt="" />
                </div>
            </div>

            {/* chest rig: owns the perspective, so the lid is a real 3D rotation */}
            <div className={`${styles.layer} ${styles.lChest}`}>
                <div className={styles.chestRig}>
                    {/* the chest's open top: fills the gap between the front rim and the hinge */}
                    <div className={styles.chestWell} aria-hidden="true">
                        <div className={styles.well} style={{ backgroundImage: `url(${chestWell})` }} />
                    </div>
                    {/* one 3D object, two separate art files:
                        inner = what you see when open, outer = darkened back side */}
                    <div className={styles.chestTop}>
                        <img
                            src={lidInner}
                            alt="An open treasure chest full of scrolls, a lantern and a book"
                            className={`${styles.face} ${styles.inner}`}
                        />
                        {DOME_STRIPS.map((s, i) => (
                            <div
                                key={i}
                                className={styles.strip}
                                style={{
                                    "--y": s.y, "--z": s.z, "--len": s.len, "--ang": `${s.ang}deg`,
                                    "--a": s.a, "--f": s.f, "--b": s.shade,
                                    backgroundImage: `url(${lidDome})`,
                                } as CSSProperties}
                            />
                        ))}
                        <img src={lidEdge} alt="" aria-hidden="true" className={styles.lip} />
                    </div>
                    <div className={styles.guitarBook}>
                        <img src={guitarBook} alt="" />
                    </div>
                    <div className={styles.trunkStuff}>
                        <img src={trunkStuff} alt="" />
                    </div>
                    <div className={styles.chestBase} aria-hidden="true">
                        <img src={chestBase} alt="" />
                    </div>
                    <div className={styles.lantern} aria-hidden="true" />
                </div>
            </div>

            <nav className={styles.boards} aria-label="Sections">
                {BOARDS.map((b, i) => (
                    <NavLink
                        key={b.label}
                        to={b.to}
                        className={`${styles.sign} ${styles[b.pos]}`}
                        style={{ "--i": i } as CSSProperties}
                    >
                        <div className={styles.drop}>
                            <div className={styles.plank}>
                                <img src={board} alt="" />
                                <span>{b.label}</span>
                            </div>
                        </div>
                    </NavLink>
                ))}
            </nav>

            <div className={`${styles.layer} ${styles.lFront}`}>
                <div className={styles.sandBottom}>
                    <img src={sandBottom} alt="" />
                </div>
            </div>
        </div>
    );
}