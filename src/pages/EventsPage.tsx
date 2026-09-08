import { useEffect, useRef } from "react";
import Nav from "../components/Nav";

import styles from "../styles/EventsPage.module.scss";
import dramaVase from "/dramaVase.png";
import photographyVase from "/photographyVase.png";
import danceVase from "/danceVase.png";
import otherVase from "/otherVase.png";
import musicVase from "/musicVase.png";
import eventsTitle from "/eventsTitle.png";

export default function EventsPage() {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const overlay = overlayRef.current;
            if (!overlay) return;

            const rect = overlay.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            overlay.style.setProperty("--mouse-x", `${x}px`);
            overlay.style.setProperty("--mouse-y", `${y}px`);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className={styles.fullPageContainer}>
            <section>
                <Nav />
            </section>

            <section className={styles.title}>
                <img src={eventsTitle} alt="" />
            </section>

            <section className={styles.dramaContainer}>
                <img src={dramaVase} alt="" />
            </section>
            <section className={styles.photographyContainer}>
                <img src={photographyVase} alt="" />
            </section>
            <section className={styles.danceContainer}>
                <img src={danceVase} alt="" />
            </section>
            <section className={styles.otherContainer}>
                <img src={otherVase} alt="" />
            </section>
            <section className={styles.musicContainer}>
                <img src={musicVase} alt="" />
            </section>

            <div ref={overlayRef} className={styles.spotlightOverlay} />
        </div>
    )
}