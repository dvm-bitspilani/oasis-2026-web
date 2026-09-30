import { NavLink } from "react-router-dom";
import { useEffect, useRef, type CSSProperties } from "react";
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
                    {/* one 3D object, two separate art files:
                        inner = what you see when open, outer = darkened back side */}
                    {/* the chest's open top: fills the gap between the front rim and the hinge */}
                    <div className={styles.chestWell} aria-hidden="true">
                        <div className={styles.well} style={{ backgroundImage: `url(${chestWell})` }} />
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
                        style={{ "--i": i, "--dx": b.dx, "--dy": b.dy } as CSSProperties}
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