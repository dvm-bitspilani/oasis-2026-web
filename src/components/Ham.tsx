import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useTransition } from "../context/TransitionProvider";
import gsap from "gsap";
import lidInner from "../assets/ham/lidInner.png";
import lidDome from "../assets/ham/lidDome.png";
import lidEdge from "../assets/ham/lidEdge.png";
import chestWell from "../assets/ham/chestWell.png";
import chestBase from "../assets/ham/chestBase.png";
import sandBottom from "../assets/ham/sandBottom.png";
import sandAbove from "../assets/ham/sandAbove.png";
import board from "../assets/ham/board.png";
import guitarBook from "../assets/ham/guitarBook.png";
import trunkStuff from "../assets/ham/trunkStuff.png";
import bgHome from "../assets/home/bg.jpg";
import styles from "../styles/Ham.module.scss";

type Board = {
    label: string;
    pos: string;
    to: string;
    dx: string;
    dy: string;
    external?: boolean;
};

type NavItem = {
    label: string;
    pos: string;
    to: string;
    external?: boolean;
};

const BOARDS: Board[] = [
    { label: "DEVELOPERS", pos: "board4", to: "/DevPage", dx: "14vw", dy: "-16vh" },
    { label: "ROCKTAVES", pos: "board1", to: "https://rocktaves.bits-oasis.org/", external: true, dx: "-14vw", dy: "-16vh" },
    { label: "SPONSORS", pos: "board3", to: "/sponsers", dx: "10vw", dy: "-26vh" },
    { label: "GALLERY", pos: "board2", to: "/comingSoon", dx: "-10vw", dy: "-26vh" },
    { label: "MEDIA PARTNERS", pos: "board", to: "/comingSoon", dx: "0vw", dy: "-38vh" },
];

// Extra links that only exist in the stacked mobile layout (<= 750px).
// Change label / route as needed. Each `pos` needs a matching .boardN class in the SCSS.
const MOBILE_EXTRA: NavItem[] = [
    { label: "EVENTS", pos: "board5", to: "/events" },
    { label: "ABOUT US", pos: "board6", to: "/aboutUs" },
    { label: "CONTACT", pos: "board7", to: "/contactUs" },
];

const MOBILE_QUERY = "(max-aspect-ratio: 1/1)";
const NARROW_QUERY = "(max-width: 750px)"; // must match the SCSS breakpoint
const SB = 0.14;
const SB_FIT = 0.5;

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
        const dy = q.y - p.y;
        const dz = q.z - p.z;
        const len = Math.hypot(dy, dz);

        return {
            y: p.y,
            z: p.z,
            len,
            ang: (Math.atan2(dz, dy) * 180) / Math.PI,
            slope: Math.abs(dz) / len,
        };
    });

    const total = segs.reduce((s, g) => s + g.len, 0);
    let acc = 0;

    return segs.map((g) => {
        const a = acc / total;
        acc += g.len;

        return {
            ...g,
            a,
            f: g.len / total,
            shade: (1.08 - 0.5 * g.slope).toFixed(3),
        };
    });
})();

const bezier = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
    if (x <= 0 || x >= 1) return x;

    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    let t = x;

    for (let i = 0; i < 8; i++) {
        const e = ((ax * t + bx) * t + cx) * t - x;
        const d = (3 * ax * t + 2 * bx) * t + cx;

        if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;

        t -= e / d;
    }

    return ((ay * t + by) * t + cy) * t;
};

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

        for (let k = i; k < j; k++) {
            p[k] = p[i - 1] + ((p[j] - p[i - 1]) * (k - i + 1)) / (j - i + 1);
        }
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
    emerge: bezier(0.45, 0.05, 0.3, 1),
    lift: bezier(0.4, 0, 0.1, 1),
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
    const { navigateWithTransition } = useTransition();
    const rootRef = useRef<HTMLDivElement>(null);

    // true when the stacked, scrollable mobile layout is active (<= 750px)
    const [narrow, setNarrow] = useState(
        () => typeof window !== "undefined" && matchMedia(NARROW_QUERY).matches
    );

    useEffect(() => {
        const mq = matchMedia(NARROW_QUERY);
        const on = () => setNarrow(mq.matches);
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, []);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;

        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

        if (reduced || !finePointer) return;

        let raf = 0;
        let tx = 0;
        let ty = 0;
        let x = 0;
        let y = 0;

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

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const mobile = matchMedia(MOBILE_QUERY).matches;
        const W = window.innerWidth;
        const Hpx = window.innerHeight;
        const hPx = Math.min(Hpx, (W * 1167) / 1417);
        const topPx = Hpx - hPx - Hpx * SB * SB_FIT;
        let offScroll: (() => void) | undefined;

        const ctx = gsap.context(() => {
            const q = (n: string) => `.${styles[n]}`;

            const riseDelay = mobile ? 0.7 : 0.35;
            const riseTime = mobile ? 1.4 : 2;
            const hold = 0.2;
            const lidDelay = riseDelay + riseTime + hold - 0.5;
            const lidTime = 1.9;
            const seg = (f: number) => f * lidTime;
            const hoverLift = mobile ? -1.2 : -3;
            const letGo = lidDelay + seg(0.3);
            const landAt = lidDelay + seg(0.57);
            const popDelay = lidDelay + seg(0.55);
            const popStagger = 0.14;
            const popTime = 0.9;
            const camStart = mobile ? 0.8 : 0.6;
            const camClosed = mobile ? 0.9 : 0.7;

            const tl = gsap.timeline();
            const chestTop = q("chestTop");

            gsap.set(chestTop, { zIndex: 5 });

            const irisAt = mobile ? "50% 100%" : "50% 100%";

            tl.fromTo(
                q("bgHome"),
                { clipPath: `circle(0% at ${irisAt})` },
                {
                    clipPath: `circle(150% at ${irisAt})`,
                    duration: 2,
                    ease: E.iris,
                },
                0.1
            ).fromTo(
                `${q("bgHome")} img`,
                { opacity: 0.5 },
                {
                    opacity: 1,
                    duration: 2,
                    ease: E.iris,
                },
                0.1
            );

            tl.fromTo(
                q("sandAbove"),
                { yPercent: 30 },
                { yPercent: 0, duration: 1.6, ease: E.sand },
                0.1
            ).fromTo(
                q("sandBottom"),
                { yPercent: 100, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: 0.8, ease: E.sand },
                0.1
            );

            if (!mobile) {
                tl.fromTo(
                    `${q("lSand")}, ${q("lFront")}`,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.6, ease: E.out },
                    0
                );
            }

            tl.fromTo(
                q("lChest"),
                { scale: camStart },
                { scale: camClosed, duration: lidDelay - riseDelay, ease: E.ease },
                riseDelay
            ).to(
                q("lChest"),
                { scale: 1, duration: lidTime, ease: E.zoom },
                lidDelay
            );

            tl.to(
                q("lChest"),
                {
                    keyframes: [
                        { y: 5, duration: 0.05 },
                        { y: -3, duration: 0.05 },
                        { y: 1, duration: 0.05 },
                        { y: 0, duration: 0.05 },
                    ],
                    easeEach: "none",
                },
                lidDelay + seg(0.57)
            );

            tl.fromTo(
                q("chestRig"),
                { yPercent: mobile ? 60 : 120 },
                { yPercent: hoverLift, duration: riseTime, ease: mobile ? E.rise : E.emerge },
                riseDelay
            ).fromTo(
                q("chestRig"),
                { opacity: 0 },
                { opacity: 1, duration: riseTime * 0.15, ease: E.rise },
                riseDelay
            ).to(
                q("chestRig"),
                { yPercent: 0, duration: landAt - letGo, ease: "power3.in" },
                letGo
            );

            const rig = root.querySelector<HTMLElement>(q("chestRig"))!;

            gsap.set(rig, {
                transformOrigin: mobile ? `50% ${topPx + hPx * 0.55}px` : "50% 65%",
            });

            const vh = (window.innerHeight / 100) * (mobile ? 0.6 : 1);
            const smooth = (x: number) => {
                const c = Math.min(1, Math.max(0, x));
                return c * c * (3 - 2 * c);
            };

            const floatDur = landAt - riseDelay;
            const fade = 0.7;
            const fl = { t: 0 };

            tl.to(
                fl,
                {
                    t: floatDur,
                    duration: floatDur,
                    ease: "none",
                    onUpdate: () => {
                        const t = fl.t;
                        const env = smooth(t / 0.5) * (1 - smooth((t - (floatDur - fade)) / fade));
                        const lean =
                            -5 *
                            (1 - E.emerge(Math.min(1, t / riseTime))) *
                            (1 - smooth((t - (floatDur - fade)) / fade));

                        gsap.set(rig, {
                            y: Math.sin(t * 2.0) * 0.9 * vh * env,
                            x: Math.sin(t * 1.25 + 1) * 0.7 * vh * env,
                            rotation:
                                lean +
                                Math.sin(t * 1.6 + 0.5) * 1.2 * env +
                                Math.sin(t * 31) * 0.12 * env,
                        });
                    },
                },
                riseDelay
            );

            const lid = gsap
                .timeline()
                .fromTo(
                    chestTop,
                    { "--lid": -90 },
                    { "--lid": -84, duration: seg(0.12), ease: E.lid1 }
                )
                .to(chestTop, { "--lid": 5, duration: seg(0.46), ease: E.lid2 })
                .to(chestTop, { "--lid": -2.5, duration: seg(0.16), ease: E.lid3 })
                .to(chestTop, { "--lid": 1, duration: seg(0.14), ease: E.inOut })
                .to(chestTop, { "--lid": 0, duration: seg(0.12), ease: E.inOut });

            tl.add(lid, lidDelay);

            tl.fromTo(
                chestTop,
                { "--fit": 0 },
                { "--fit": 1, duration: seg(0.33), ease: E.lid1 },
                lidDelay + seg(0.12)
            );

            tl.set(chestTop, { zIndex: 3 }, lidDelay + seg(0.5)).set(
                `${q("strip")}, ${q("lip")}, ${q("chestWell")}`,
                { visibility: "hidden" },
                lidDelay + seg(0.47)
            );

            tl.fromTo(
                q("inner"),
                { filter: "brightness(0.6)" },
                { filter: "brightness(1)", duration: 0.4, ease: E.out, clearProps: "filter" },
                lidDelay + seg(0.3)
            );

            gsap.set(q("guitarBook"), { transformOrigin: "52% 62%" });

            tl.fromTo(
                q("guitarBook"),
                { scale: 0.2 },
                { scale: 1, duration: 1.3, ease: "back.out(1.2)" },
                lidDelay
            ).fromTo(
                q("guitarBook"),
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: E.out },
                lidDelay
            ).fromTo(
                q("trunkStuff"),
                { opacity: 0 },
                { opacity: 1, duration: 0.15, ease: E.out },
                lidDelay + seg(0.2)
            ).fromTo(
                q("lantern"),
                { opacity: 0 },
                { opacity: 1, duration: 1, ease: E.out },
                lidDelay + 0.7
            );

            const signs = gsap.utils.toArray<HTMLElement>(q("sign"));

            const rank = new Map<number, number>(
                signs
                    .map((s, i) => ({ i, bottomEdge: s.getBoundingClientRect().bottom }))
                    .sort((a, b) => b.bottomEdge - a.bottomEdge)
                    .map((o, r) => [o.i, r] as [number, number])
            );

            // Viewport-based centre of the visible plank (the list can be scrolled,
            // so offsetTop would be relative to the scroll content, not the screen).
            const center = (s: HTMLElement) => {
                const r = (s.firstElementChild as HTMLElement).getBoundingClientRect();
                return r.top + r.height / 2;
            };

            // Sign animation follows the LAYOUT (width breakpoint), not the aspect ratio.
            if (narrow) {
                const ordered = signs
                    .map((s, i) => ({ s, r: rank.get(i)! }))
                    .sort((a, b) => a.r - b.r)
                    .map((o) => o.s);

                const first = ordered[0];
                const firstCenter = center(first);
                const firstAt = popDelay;

                const scroller = root.querySelector<HTMLElement>(q("boards"))!;

                // The SCSS ends the scroller exactly on the chest rim (lid line), so its
                // bottom edge IS the lid line. Boards first emerge from there.
                const mouthY = scroller.getBoundingClientRect().bottom;

                const minSx = 0.8; // 1 = no shrink, lower = narrower near the chest
                const minOp = 0.65; // 1 = no fade, lower = boards fade more as they enter the chest
                const follow = 0.22; // 0..1, lower = softer
                const cur = new Map<HTMLElement, { sx: number; op: number }>(
                    signs.map((s) => [s, { sx: 1, op: 1 }])
                );
                let raf = 0;

                const plankH = (s: HTMLElement) => (s.firstElementChild as HTMLElement).offsetHeight;

                // Centre of a board's plank on screen, computed from LAYOUT values only
                // (offsetTop / scrollTop), so GSAP transforms never affect it.
                const liveCenter = (s: HTMLElement, scrollerTop: number) =>
                    scrollerTop + s.offsetTop - scroller.scrollTop + s.offsetHeight - plankH(s) / 2;

                // Everything is measured fresh on every frame so viewport changes
                // (mobile URL bar, rotation, resize, fonts / images settling) never leave stale values.
                const frame = () => {
                    const sr = scroller.getBoundingClientRect();
                    const half = plankH(first) / 2;
                    const startY = sr.bottom - half; // lowest board's resting centre = no squeeze, no fade
                    const endY = sr.bottom + half; // fully squeezed / faded once mostly hidden
                    let busy = false;

                    signs.forEach((s) => {
                        const p = smooth((liveCenter(s, sr.top) - startY) / (endY - startY));
                        const c = cur.get(s)!;
                        const tSx = 1 - (1 - minSx) * p;
                        const tOp = 1 - (1 - minOp) * p;

                        const nSx = c.sx + (tSx - c.sx) * follow;
                        const nOp = c.op + (tOp - c.op) * follow;

                        if (Math.abs(tSx - nSx) > 0.002 || Math.abs(tOp - nOp) > 0.002) busy = true;

                        c.sx = nSx;
                        c.op = nOp;
                        s.style.setProperty("--sx", nSx.toFixed(3));
                        s.style.setProperty("--so", nOp.toFixed(3));
                    });

                    raf = busy ? requestAnimationFrame(frame) : 0;
                };

                const kick = () => {
                    if (!raf) raf = requestAnimationFrame(frame);
                };

                scroller.addEventListener("scroll", kick, { passive: true });
                window.addEventListener("resize", kick);
                const ro = new ResizeObserver(kick); // dvh / URL bar changes resize the scroller
                ro.observe(scroller);

                offScroll = () => {
                    scroller.removeEventListener("scroll", kick);
                    window.removeEventListener("resize", kick);
                    ro.disconnect();
                    cancelAnimationFrame(raf);
                };

                // Keep the (screen-sized) scroller out of rendering while the lid opens;
                // the signs are invisible until `firstAt` anyway.
                gsap.set(scroller, { visibility: "hidden" });
                tl.set(scroller, { visibility: "visible" }, firstAt);

                ordered.forEach((s, r) => gsap.set(s, { zIndex: ordered.length - r }));

                tl.fromTo(
                    first,
                    { y: mouthY - firstCenter, scale: 0.6, opacity: 0 },
                    { y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
                    firstAt
                ).fromTo(
                    first,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.15, ease: "power1.out" },
                    firstAt
                );

                const extendAt = firstAt + 0.3;
                const stagger = 0.08;
                const dur = 0.5;

                ordered.slice(1).forEach((s, k) => {
                    const at = extendAt + k * stagger;

                    tl.fromTo(
                        s,
                        { y: firstCenter - center(s), scale: 0.96, opacity: 0 },
                        { y: 0, scale: 1, duration: dur, ease: "power3.out" },
                        at
                    ).fromTo(
                        s,
                        { opacity: 0 },
                        { opacity: 1, duration: 0.12, ease: "none" },
                        at
                    );
                });

                const end = extendAt + (ordered.length - 2) * stagger + dur;
                const hitZones = signs.map((s) => s.querySelector<HTMLElement>("span")!);
                tl.set(hitZones, { pointerEvents: "auto" }, end);
                tl.set(signs, { clearProps: "zIndex" }, end);

                // apply the correct squeeze / fade once everything is in place, so no
                // board waits for the first scroll to get its real values
                tl.call(kick, undefined, end);
            } else {
                signs.forEach((sign, i) => {
                    const b = BOARDS[i];
                    const at = popDelay + (BOARDS.length - 1 - i) * popStagger;

                    tl.fromTo(
                        sign,
                        { x: b.dx, scale: 0.4 },
                        { x: "0vw", scale: 1, duration: popTime, ease: E.fly },
                        at
                    ).fromTo(
                        sign,
                        { opacity: 0 },
                        { opacity: 1, duration: popTime * 0.15, ease: E.fly },
                        at
                    ).fromTo(
                        sign.firstElementChild,
                        { y: b.dy, rotation: i * 12 - 24 },
                        { y: "0vh", rotation: 0, duration: popTime, ease: E.spring },
                        at
                    ).set(sign, { pointerEvents: "auto" }, at + popTime);
                });
            }
        }, root);

        return () => {
            offScroll?.();
            ctx.revert();
        };
    }, [narrow]);

    const items: NavItem[] = narrow ? [...MOBILE_EXTRA, ...BOARDS] : BOARDS;

    return (
        <div ref={rootRef} className={styles.container}>
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

            <div className={`${styles.layer} ${styles.lChest}`}>
                <div className={styles.chestRig}>
                    <div className={styles.chestWell} aria-hidden="true">
                        <div
                            className={styles.well}
                            style={{ backgroundImage: `url(${chestWell})` }}
                        />
                    </div>

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
                                    "--y": s.y,
                                    "--z": s.z,
                                    "--len": s.len,
                                    "--ang": `${s.ang}deg`,
                                    "--a": s.a,
                                    "--f": s.f,
                                    "--b": s.shade,
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
                {items.map((b, i) => (
                    <a
                        key={b.label}
                        href={b.to}
                        {...(b.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {
                                  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                                      e.preventDefault();
                                      navigateWithTransition(b.to);
                                  },
                              })}
                        className={`${styles.sign} ${styles[b.pos]}`}
                        style={{ "--i": i } as CSSProperties}
                    >
                        <div className={styles.drop}>
                            <div className={styles.plank}>
                                <img src={board} alt="" />
                                <span>{b.label}</span>
                            </div>
                        </div>
                    </a>
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