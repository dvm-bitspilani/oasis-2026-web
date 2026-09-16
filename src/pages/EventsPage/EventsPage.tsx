import {
    useEffect,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
} from "react";

import Nav from "../../components/Nav";

import styles from "./EventsPage.module.scss";

import dramaVase from "/dramaVase.png";
import photographyVase from "/photographyVase.png";
import danceVase from "/danceVase.png";
import otherVase from "/otherVase.png";
import musicVase from "/musicVase.png";
import eventsTitle from "/eventsTitle.png";

/* =========================================================
   EVENT TYPES
========================================================= */

interface EventData {
    id: string;
    name: string;
    category: string;
    club_name: string | null;
    venue: string | null;
    description: string | null;
    image_url: string | null;
    rulebook: string | null;
}

type Category =
    | "drama"
    | "photography"
    | "dance"
    | "misc"
    | "music";

/* =========================================================
   EVENT DATA
========================================================= */

const eventsData: Record<Category, EventData[]> = {
    drama: [
        {
            id: "sukhmanch",
            name: "Sukhmanch",
            category: "Drama & Theatre",
            club_name: null,
            venue: null,
            description:
                "Celebrated for its deeply emotional and socially impactful plays that resonate with audiences long after the curtain falls. Their repertoire includes thought-provoking dramas such as Court Martial, and Seven Steps Around the Fire, among others. Experience storytelling that's as enlightening as it is entertaining. Join us for an unforgettable theatrical experience.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "street-play",
            name: "Street Play",
            category: "Drama & Theatre",
            club_name: null,
            venue: null,
            description:
                "Right from the streets, a loud and larger-than-life exchange of ideologies, with drama full of humor and zeal. Street Plays aka Nukkad Natak, are carried out to propagate social and political messages among the masses, amidst the direct, intimate and effective means of theater by means of shouts, chants, drums and catchy songs.",
            image_url: null,
            rulebook: "YOUR_STREET_PLAY_RULEBOOK_LINK",
        },
        {
            id: "stage-play",
            name: "Stage Play",
            category: "Drama & Theatre",
            club_name: null,
            venue: null,
            description:
                "The stage, a neutral territory outside the jurisdiction of fate where stars may be crossed with impunity. A truer and more real place does not exist in the universe. The Stage Play event brings you a wholesome feat of drama to awaken and thrill your senses. It gives you a chance to captivate your audience with your actions and expressions and to watch and perform captivating plays.",
            image_url: null,
            rulebook: "YOUR_STAGE_PLAY_RULEBOOK_LINK",
        },
        {
            id: "metamorphosis",
            name: "Metamorphosis",
            category: "Drama & Theatre",
            club_name: null,
            venue: null,
            description:
                "Metamorphosis, our flagship short film competition, returns at Oasis. Create a captivating narrative around a theme, push your artistic boundaries, and compete for an exciting prize pool. Your masterpiece premieres at Oasis before a discerning audience and expert judges. Embrace the challenge!",
            image_url: null,
            rulebook: null,
        },
        {
            id: "hypercut",
            name: "Hypercut",
            category: "Drama & Theatre",
            club_name: null,
            venue: null,
            description:
                "HyperCut is an exciting Ad making competition, where novel filmmakers will have to bring forth their love of film making and combine it with their knowledge of advertisements. Participants will have to make an advertisement on a well known brand and the best entries will be screened as well.",
            image_url: null,
            rulebook: null,
        },
    ],

    photography: [],

    dance: [
        {
            id: "choreo",
            name: "Choreo",
            category: "Dance",
            club_name: null,
            venue: "Central Auditorium",
            description:
                "This event is conducted in the central auditorium. After the initial elimination round, about six to eight teams are shortlisted for the final round. The final round features contemporary dance performances that are usually based on a certain theme.",
            image_url: null,
            rulebook: "YOUR_CHOREO_RULEBOOK_LINK",
        },
        {
            id: "street-dance",
            name: "Street Dance",
            category: "Dance",
            club_name: null,
            venue: "Rotunda",
            description:
                "Street Dance is considered a crowd favorite and is held in the Rotunda, the open-air amphitheater of BITS. The first stage consists of 2 rounds; a performance and a battle round. From this, 4 teams are selected for the second stage. The second stage is a face-off challenge between pairs of teams. These pairs are allotted randomly.",
            image_url: null,
            rulebook: "YOUR_STREET_DANCE_RULEBOOK_LINK",
        },
        {
            id: "desert-duel",
            name: "Desert Duel",
            category: "Dance",
            club_name: null,
            venue: null,
            description:
                "It is a solo dance event in which dancers from every college participate and showcase their talent. Depending on the dancer, styles can vary from western to classical to hip-hop and even to the typical Bollywood style.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "razzmatazz",
            name: "Razzmatazz",
            category: "Dance",
            club_name: null,
            venue: null,
            description:
                "A group dance competition that tests finesse and artistry in showcasing coordinated group choreographies. With equal weightage in judgement given to execution, presentation and creativity, it is fashioned to test the esprit de corps of the participating teams. All forms of dance including fusions are allowed. So trip the light fantastic toe and let there be a dazzle-daze of sheer splendor.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "tandav",
            name: "Tandav",
            category: "Dance",
            club_name: null,
            venue: null,
            description:
                "Oasis' flagship Indian classical dance competition. Solo performers from across the nation gather to showcase the rich heritage of Indian classical dance, captivating audiences with their grace, rhythm, precision, and storytelling. The event not only highlights technical mastery but also celebrates the depth of expression and the spiritual essence embedded in classical forms.",
            image_url: null,
            rulebook: null,
        },
    ],

    misc: [
        {
            id: "fashp",
            name: "FashP",
            category: "Fashion",
            club_name: null,
            venue: null,
            description: null,
            image_url: null,
            rulebook: "YOUR_FASHP_RULEBOOK_LINK",
        },
    ],

    music: [
        {
            id: "pitch-perfect",
            name: "Pitch Perfect",
            category: "Music",
            club_name: null,
            venue: "NAB Auditorium",
            description:
                "With participants from over 10 institutions, Pitch Perfect is the platform for a growing crowd of Cappella enthusiasts to face off against each other. A battle of the bands with no instruments, this symphony of voices at the NAB Auditorium is establishing a new dimensionality of music vastly unexplored till date.",
            image_url: null,
            rulebook: "YOUR_PITCH_PERFECT_RULEBOOK_LINK",
        },
        {
            id: "swaranjali",
            name: "Swaranjali",
            category: "Music",
            club_name: null,
            venue: null,
            description:
                "Swaranjali is a classical music competition that invites participants trained in both the Carnatic and Hindustani styles, covering a range of vocal and instrumental forms. The instruments include violin, sitar, veena, flute, Hawaiian guitar, tabla, mridangam etc. The competition features four categories: Solo Vocals, Solo Wind and String, Solo Percussion, and Group.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "tarang",
            name: "Tarang",
            category: "Music",
            club_name: null,
            venue: null,
            description:
                "Tarang - a musical fusion extravaganza from the Indian heartland and its innumerably diverse facets. Cover an existing piece, or create your own. Come participate in our Indian fusion battle of bands to claim the title of the best band.",
            image_url: null,
            rulebook: "YOUR_TARANG_RULEBOOK_LINK",
        },
        {
            id: "andholika",
            name: "Andholika",
            category: "Music",
            club_name: null,
            venue: null,
            description:
                "Andholika is a talent hunt for the most versatile singer among the participants. The event is split into two categories, Eastern and Western. The event consists of an audition round and a final round. 4 finalists will be selected from each category. A winner and runner up will be awarded from each category.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "rap-wars",
            name: "Rap-wars",
            category: "Music",
            club_name: null,
            venue: null,
            description:
                "RapWars is a rap-battle event with a legacy of 13 years which includes names like Seedhe Maut, Divine, Brodha V, Wolf Cryman and many more. Shortlisted through preliminary rounds in 4 cities, the 8 finalists will do whatever it takes to spit bars par excellence and take the crown home.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "scontro",
            name: "Scontro",
            category: "Music",
            club_name: null,
            venue: null,
            description:
                "A high-energy DJ Battle where talented DJs showcase their skills in live mixing, beat-matching, and creative transitions. DJs compete against each other, bringing their unique styles, from hard hitting bass drops to smooth grooves. The battle emphasizes technical proficiency, creativity, and the ability to engage the crowd through music.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "axetacy",
            name: "Axetacy",
            category: "Music",
            club_name: null,
            venue: null,
            description:
                "Solo Guitar Competition. A thrilling guitar showdown for both acoustic and electric players. Open to all individual participants who can play the guitar. The event features two rounds: Qualifier and Final, with judging criteria determined by the panel.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "drum-duels",
            name: "Drum Duels",
            category: "Music",
            club_name: null,
            venue: null,
            description:
                "A Solo Drumming Competition. A dynamic event for drummers showcasing their creativity and control. Participants are tested in two rounds: replicating a drum track and creating beats for a bass line. Shortlisted drummers then face off in duels.",
            image_url: null,
            rulebook: null,
        },
        {
            id: "beat-brawl",
            name: "Beat-Brawl",
            category: "Music",
            club_name: null,
            venue: null,
            description:
                "An electrifying platform dedicated to beatboxing, the raw vocal art form known for its rhythmic intensity and limitless creativity. Designed to promote and elevate beatbox culture among the youth, BeatBrawl celebrates individuality and performance artistry.",
            image_url: null,
            rulebook: null,
        },
    ],
};

/* =========================================================
   SMOKE TRANSITION
========================================================= */

interface SmokeCanvasProps {
    originX: number;
    originY: number;
}

function SmokeCanvas({
    originX,
    originY,
}: SmokeCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        let animationFrame = 0;

        const startTime = performance.now();

        /* =====================================================
           CANVAS RESIZE
        ===================================================== */

        const resize = () => {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            canvas.width =
                window.innerWidth * dpr;

            canvas.height =
                window.innerHeight * dpr;

            canvas.style.width =
                `${window.innerWidth}px`;

            canvas.style.height =
                `${window.innerHeight}px`;

            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );
        };

        resize();

        window.addEventListener(
            "resize",
            resize
        );

        /* =====================================================
           BASIC SETTINGS
        ===================================================== */

        const isMobile =
            window.innerWidth <= 700;

        const centerX =
            window.innerWidth * 0.5;

        const centerY =
            window.innerHeight * 0.5 - 20;

        const cloudWidth =
            isMobile ? 420 : 900;

        const cloudHeight =
            isMobile ? 850 : 600;

        /* =====================================================
           PARTICLE WISPS
        ===================================================== */

        const particles = Array.from(
            {
                length:
                    isMobile ? 320 : 520,
            },
            () => {
                const side =
                    Math.random() > 0.5
                        ? 1
                        : -1;

                const rawTargetX =
                    (Math.random() - 0.5) *
                    cloudWidth *
                    (0.5 +
                        Math.random() * 1.1);

                const rawTargetY =
                    (Math.random() - 0.5) *
                    cloudHeight *
                    (0.45 +
                        Math.random() * 0.6);

                const ellipseA =
                    cloudWidth * 0.5;

                const ellipseB =
                    cloudHeight * 0.5;

                const ellipseDist =
                    Math.sqrt(
                        (rawTargetX /
                            ellipseA) **
                            2 +
                            (rawTargetY /
                                ellipseB) **
                                2
                    );

                const clampScale =
                    ellipseDist > 1
                        ? 1 / ellipseDist
                        : 1;

                return {
                    startX:
                        originX +
                        (Math.random() - 0.5) *
                            50,

                    startY:
                        originY +
                        Math.random() * 20,

                    targetX:
                        centerX +
                        rawTargetX *
                            clampScale,

                    targetY:
                        centerY +
                        rawTargetY *
                            clampScale,

                    size:
                        10 +
                        Math.random() * 70,

                    drift:
                        side *
                        (18 +
                            Math.random() * 60),

                    phase:
                        Math.random() *
                        Math.PI *
                        2,

                    speed:
                        0.8 +
                        Math.random() *
                            0.55,

                    delay:
                        Math.random() * 0.2,

                    opacity:
                        0.6 +
                        Math.random() * 0.55,
                };
            }
        );

        /* =====================================================
           CENTRAL CLOUD PUFFS
        ===================================================== */

        const cloudPuffs = [
            { x: -0.42, y: 0.30, s: 0.72 },
            { x: -0.24, y: 0.38, s: 0.88 },
            { x: -0.06, y: 0.36, s: 1.00 },
            { x: 0.14, y: 0.34, s: 0.88 },
            { x: 0.32, y: 0.26, s: 0.68 },

            { x: -0.46, y: 0.08, s: 0.76 },
            { x: -0.26, y: 0.08, s: 1.00 },
            { x: -0.06, y: 0.04, s: 1.12 },
            { x: 0.14, y: 0.06, s: 1.00 },
            { x: 0.34, y: 0.02, s: 0.76 },

            { x: -0.38, y: -0.14, s: 0.72 },
            { x: -0.18, y: -0.18, s: 0.90 },
            { x: 0.02, y: -0.18, s: 0.92 },
            { x: 0.20, y: -0.14, s: 0.72 },

            { x: -0.26, y: -0.32, s: 0.56 },
            { x: -0.06, y: -0.36, s: 0.64 },
            { x: 0.14, y: -0.30, s: 0.52 },
        ];

        /* =====================================================
           SOFT EASING
        ===================================================== */

        const easeOut = (t: number) =>
            1 - Math.pow(1 - t, 2.25);

        /* =====================================================
           DRAW
        ===================================================== */

        const draw = (now: number) => {
            const elapsed =
                (now - startTime) / 1000;

            ctx.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
            );

            /* =================================================
               RISING PARTICLES
            ================================================= */

            particles.forEach((particle) => {
                const rawProgress =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            (elapsed -
                                particle.delay) /
                                2.35
                        )
                    );

                const progress =
                    easeOut(rawProgress);

                const riseAmount =
                    Math.min(
                        window.innerHeight *
                            0.2,
                        390
                    );

                const rise =
                    Math.sin(
                        progress *
                            Math.PI *
                            0.72
                    ) * riseAmount;

                const spread =
                    Math.pow(
                        progress,
                        1.35
                    );

                const wave =
                    Math.sin(
                        elapsed *
                            particle.speed *
                            2.2 +
                            particle.phase
                    );

                const x =
                    particle.startX +
                    (particle.targetX -
                        particle.startX) *
                        spread +
                    wave *
                        particle.drift *
                        spread;

                const risingY =
                    particle.startY -
                    rise;

                const y =
                    risingY +
                    (particle.targetY -
                        risingY) *
                        Math.pow(
                            progress,
                            1.8
                        );

                const size =
                    particle.size *
                    (0.62 +
                        progress * 1.15);

                const alpha =
                    particle.opacity *
                    (0.10 +
                        progress * 0.46);

                const gradient =
                    ctx.createRadialGradient(
                        x,
                        y,
                        0,
                        x,
                        y,
                        size
                    );

                gradient.addColorStop(
                    0,
                    `rgba(91, 81, 137, ${alpha})`
                );

                gradient.addColorStop(
                    0.5,
                    `rgba(91, 81, 137, ${
                        alpha * 0.62
                    })`
                );

                gradient.addColorStop(
                    0.8,
                    `rgba(91, 81, 137, ${
                        alpha * 0.22
                    })`
                );

                gradient.addColorStop(
                    1,
                    "rgba(91, 81, 137, 0)"
                );

                ctx.fillStyle = gradient;

                ctx.beginPath();

                ctx.ellipse(
                    x,
                    y,
                    size,
                    size *
                        (0.62 +
                            Math.sin(
                                particle.phase
                            ) *
                                0.18),
                    particle.phase,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            });

            /* =================================================
               CENTRAL SOFT CLOUD
            ================================================= */

            if (elapsed > 0.42) {
                const cloudProgress =
                    Math.min(
                        1,
                        Math.max(
                            0,
                            (elapsed - 0.42) /
                                0.95
                        )
                    );

                const eased =
                    easeOut(cloudProgress);

                const baseRadius =
                    isMobile
                        ? 250
                        : 400;

                ctx.save();

                ctx.filter = isMobile
                    ? "blur(10px)"
                    : "blur(16px)";

                const baseGradient =
                    ctx.createRadialGradient(
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    );

                baseGradient.addColorStop(
                    0,
                    `rgba(91, 81, 137, ${
                        0.24 * eased
                    })`
                );

                baseGradient.addColorStop(
                    0.38,
                    `rgba(91, 81, 137, ${
                        0.20 * eased
                    })`
                );

                baseGradient.addColorStop(
                    0.62,
                    `rgba(91, 81, 137, ${
                        0.13 * eased
                    })`
                );

                baseGradient.addColorStop(
                    0.78,
                    `rgba(91, 81, 137, ${
                        0.055 * eased
                    })`
                );

                baseGradient.addColorStop(
                    0.90,
                    `rgba(91, 81, 137, ${
                        0.018 * eased
                    })`
                );

                baseGradient.addColorStop(
                    1,
                    "rgba(91, 81, 137, 0)"
                );

                ctx.save();

                ctx.translate(
                    centerX,
                    centerY
                );

                ctx.scale(
                    baseRadius * 1.1,
                    baseRadius * 0.80
                );

                ctx.fillStyle =
                    baseGradient;

                ctx.beginPath();

                ctx.arc(
                    0,
                    0,
                    1,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                ctx.restore();

                cloudPuffs.forEach(
                    (puff, index) => {
                        const puffDelay =
                            index * 0.015;

                        const puffProgress =
                            Math.min(
                                1,
                                Math.max(
                                    0,
                                    (cloudProgress -
                                        puffDelay) /
                                        0.75
                                )
                            );

                        const puffEase =
                            easeOut(
                                puffProgress
                            );

                        const x =
                            centerX +
                            puff.x *
                                cloudWidth *
                                puffEase *
                                0.62;

                        const y =
                            centerY +
                            puff.y *
                                cloudHeight *
                                puffEase *
                                0.58;

                        const radius =
                            (isMobile
                                ? 115
                                : 180) *
                            puff.s *
                            (0.25 +
                                puffEase *
                                    0.60);

                        const alpha =
                            0.105 *
                            puffEase;

                        const puffGradient =
                            ctx.createRadialGradient(
                                0,
                                0,
                                0,
                                0,
                                0,
                                1
                            );

                        puffGradient.addColorStop(
                            0,
                            `rgba(91, 81, 137, ${alpha})`
                        );

                        puffGradient.addColorStop(
                            0.38,
                            `rgba(91, 81, 137, ${
                                alpha * 0.72
                            })`
                        );

                        puffGradient.addColorStop(
                            0.64,
                            `rgba(45, 155, 195, ${
                                alpha * 0.32
                            })`
                        );

                        puffGradient.addColorStop(
                            0.78,
                            `rgba(91, 81, 137, ${
                                alpha * 0.12
                            })`
                        );

                        puffGradient.addColorStop(
                            0.90,
                            `rgba(91, 81, 137, ${
                                alpha * 0.035
                            })`
                        );

                        puffGradient.addColorStop(
                            1,
                            "rgba(91, 81, 137, 0)"
                        );

                        ctx.save();

                        ctx.translate(x, y);

                        ctx.scale(
                            radius,
                            radius * 0.82
                        );

                        ctx.fillStyle =
                            puffGradient;

                        ctx.beginPath();

                        ctx.arc(
                            0,
                            0,
                            1,
                            0,
                            Math.PI * 2
                        );

                        ctx.fill();

                        ctx.restore();
                    }
                );

                ctx.restore();
            }

            /* =================================================
               DENSE CORE
            ================================================= */

            if (elapsed > 0.65) {
                const coreProgress =
                    Math.min(
                        1,
                        (elapsed - 0.65) /
                            0.7
                    );

                const coreGradient =
                    ctx.createRadialGradient(
                        centerX,
                        centerY,
                        0,
                        centerX,
                        centerY,
                        isMobile
                            ? 230
                            : 350
                    );

                coreGradient.addColorStop(
                    0,
                    `rgba(91, 81, 137, ${
                        0.14 *
                        coreProgress
                    })`
                );

                coreGradient.addColorStop(
                    0.38,
                    `rgba(91, 81, 137, ${
                        0.10 *
                        coreProgress
                    })`
                );

                coreGradient.addColorStop(
                    0.72,
                    `rgba(91, 81, 137, ${
                        0.04 *
                        coreProgress
                    })`
                );

                coreGradient.addColorStop(
                    1,
                    "rgba(91, 81, 137, 0)"
                );

                ctx.fillStyle =
                    coreGradient;

                ctx.fillRect(
                    centerX -
                        (isMobile
                            ? 230
                            : 350),
                    centerY -
                        (isMobile
                            ? 170
                            : 250),
                    isMobile
                        ? 460
                        : 700,
                    isMobile
                        ? 400
                        : 600
                );
            }

            /* =================================================
               READABILITY VIGNETTE
            ================================================= */

            if (elapsed > 0.5) {
                const vignetteAlpha =
                    Math.min(
                        1,
                        (elapsed - 0.5) /
                            0.6
                    ) * 0.35;

                const vignette =
                    ctx.createRadialGradient(
                        centerX,
                        centerY,
                        0,
                        centerX,
                        centerY,
                        isMobile
                            ? 260
                            : 480
                    );

                vignette.addColorStop(
                    0,
                    `rgba(30, 26, 20, ${vignetteAlpha})`
                );

                vignette.addColorStop(
                    0.6,
                    `rgba(30, 26, 20, ${
                        vignetteAlpha *
                        0.55
                    })`
                );

                vignette.addColorStop(
                    1,
                    "rgba(30, 26, 20, 0)"
                );

                ctx.fillStyle =
                    vignette;

                ctx.fillRect(
                    centerX -
                        (isMobile
                            ? 260
                            : 480),
                    centerY -
                        (isMobile
                            ? 230
                            : 420),
                    isMobile
                        ? 520
                        : 960,
                    isMobile
                        ? 460
                        : 840
                );
            }

            /* =================================================
               SMOKE BASE AT VASE
            ================================================= */

            const baseProgress =
                Math.min(
                    1,
                    elapsed / 0.75
                );

            if (baseProgress > 0) {
                const baseGradient =
                    ctx.createRadialGradient(
                        originX,
                        originY,
                        0,
                        originX,
                        originY,
                        48
                    );

                baseGradient.addColorStop(
                    0,
                    `rgba(91, 81, 137, ${
                        0.30 *
                        baseProgress
                    })`
                );

                baseGradient.addColorStop(
                    0.38,
                    `rgba(91, 81, 137, ${
                        0.18 *
                        baseProgress
                    })`
                );

                baseGradient.addColorStop(
                    0.7,
                    `rgba(91, 81, 137, ${
                        0.06 *
                        baseProgress
                    })`
                );

                baseGradient.addColorStop(
                    1,
                    "rgba(91, 81, 137, 0)"
                );

                ctx.fillStyle =
                    baseGradient;

                ctx.beginPath();

                ctx.ellipse(
                    originX,
                    originY,
                    24,
                    40,
                    0,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            /* =================================================
               CONTINUE ANIMATION
            ================================================= */

            if (elapsed < 2.9) {
                animationFrame =
                    requestAnimationFrame(
                        draw
                    );
            }
        };

        animationFrame =
            requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(
                animationFrame
            );

            window.removeEventListener(
                "resize",
                resize
            );
        };
    }, [originX, originY]);

    return (
        <canvas
            ref={canvasRef}
            className={styles.smokeCanvas}
            aria-hidden="true"
        />
    );
}

/* =========================================================
   EVENTS PAGE
========================================================= */

export default function EventsPage() {
    const overlayRef =
        useRef<HTMLDivElement>(null);

    const smokeTimerRef =
        useRef<number | null>(null);

    const [
        selectedCategory,
        setSelectedCategory,
    ] =
        useState<Category | null>(null);

    const [
        smokeOrigin,
        setSmokeOrigin,
    ] =
        useState<{
            x: number;
            y: number;
        } | null>(null);

    const [
        currentIndex,
        setCurrentIndex,
    ] = useState(0);

    /* =====================================================
       SPOTLIGHT
    ===================================================== */

    useEffect(() => {
        const handleMouseMove = (
            e: globalThis.MouseEvent
        ) => {
            const overlay =
                overlayRef.current;

            if (!overlay) return;

            const rect =
                overlay.getBoundingClientRect();

            const x =
                e.clientX - rect.left;

            const y =
                e.clientY - rect.top;

            overlay.style.setProperty(
                "--mouse-x",
                `${x}px`
            );

            overlay.style.setProperty(
                "--mouse-y",
                `${y}px`
            );
        };

        window.addEventListener(
            "mousemove",
            handleMouseMove
        );

        return () => {
            window.removeEventListener(
                "mousemove",
                handleMouseMove
            );
        };
    }, []);

    /* =====================================================
       OPEN CATEGORY
    ===================================================== */

    const openCategory = (
        category: Category,
        e: ReactMouseEvent<HTMLElement>
    ) => {
        if (
            smokeTimerRef.current !==
            null
        ) {
            window.clearTimeout(
                smokeTimerRef.current
            );
        }

        const vase =
            e.currentTarget.querySelector(
                "img"
            );

        if (!vase) {
            setSelectedCategory(
                category
            );

            setCurrentIndex(0);

            return;
        }

        const rect =
            vase.getBoundingClientRect();

        const originX =
            rect.left +
            rect.width / 1.5;

        const originY =
            rect.top +
            rect.height * 0.05;

        setSmokeOrigin({
            x: originX,
            y: originY,
        });

        smokeTimerRef.current =
            window.setTimeout(() => {
                setSelectedCategory(
                    category
                );

                setCurrentIndex(0);

                smokeTimerRef.current =
                    null;
            }, 1100);
    };

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const closeModal = () => {
        if (
            smokeTimerRef.current !==
            null
        ) {
            window.clearTimeout(
                smokeTimerRef.current
            );

            smokeTimerRef.current =
                null;
        }

        setSelectedCategory(null);
        setCurrentIndex(0);
        setSmokeOrigin(null);
    };

    /* =====================================================
       CURRENT EVENTS
    ===================================================== */

    const currentEvents: EventData[] =
        selectedCategory
            ? eventsData[
                  selectedCategory
              ]
            : [];

    /* =====================================================
       NEXT EVENT
    ===================================================== */

    const handleNext = () => {
        if (currentEvents.length <= 1) {
            return;
        }

        setCurrentIndex((prev) => {
            if (
                prev >=
                currentEvents.length - 1
            ) {
                return 0;
            }

            return prev + 1;
        });
    };

    /* =====================================================
       PREVIOUS EVENT
    ===================================================== */

    const handlePrev = () => {
        if (currentEvents.length <= 1) {
            return;
        }

        setCurrentIndex((prev) => {
            if (prev <= 0) {
                return (
                    currentEvents.length - 1
                );
            }

            return prev - 1;
        });
    };

    /* =====================================================
       KEYBOARD
    ===================================================== */

    useEffect(() => {
        if (!selectedCategory) {
            return;
        }

        const handleKeyDown = (
            e: KeyboardEvent
        ) => {
            if (e.key === "Escape") {
                closeModal();
            }

            if (e.key === "ArrowRight") {
                handleNext();
            }

            if (e.key === "ArrowLeft") {
                handlePrev();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        selectedCategory,
        currentEvents.length,
    ]);

    /* =====================================================
       CURRENT EVENT
    ===================================================== */

    const currentEvent =
        currentEvents[currentIndex];

    return (
        <div
            className={
                styles.fullPageContainer
            }
        >
            {/* =================================================
                NAV
            ================================================= */}

            <section>
                <Nav />
            </section>

            {/* =================================================
                TITLE
            ================================================= */}

            <section
                className={styles.title}
            >
                <img
                    src={eventsTitle}
                    alt="Events"
                />
            </section>

            {/* =================================================
                DRAMA
            ================================================= */}

            <section
                className={
                    styles.dramaContainer
                }
                onClick={(e) =>
                    openCategory(
                        "drama",
                        e
                    )
                }
            >
                <img
                    src={dramaVase}
                    alt="Drama and Theatre"
                />
            </section>

            {/* =================================================
                PHOTOGRAPHY
            ================================================= */}

            <section
                className={
                    styles.photographyContainer
                }
                onClick={(e) =>
                    openCategory(
                        "photography",
                        e
                    )
                }
            >
                <img
                    src={photographyVase}
                    alt="Photography"
                />
            </section>

            {/* =================================================
                DANCE
            ================================================= */}

            <section
                className={
                    styles.danceContainer
                }
                onClick={(e) =>
                    openCategory(
                        "dance",
                        e
                    )
                }
            >
                <img
                    src={danceVase}
                    alt="Dance"
                />
            </section>

            {/* =================================================
                MISC / FASHION
            ================================================= */}

            <section
                className={
                    styles.otherContainer
                }
                onClick={(e) =>
                    openCategory(
                        "misc",
                        e
                    )
                }
            >
                <img
                    src={otherVase}
                    alt="Miscellaneous"
                />
            </section>

            {/* =================================================
                MUSIC
            ================================================= */}

            <section
                className={
                    styles.musicContainer
                }
                onClick={(e) =>
                    openCategory(
                        "music",
                        e
                    )
                }
            >
                <img
                    src={musicVase}
                    alt="Music"
                />
            </section>

            {/* =================================================
                SMOKE
            ================================================= */}

            {smokeOrigin && (
                <SmokeCanvas
                    originX={
                        smokeOrigin.x
                    }
                    originY={
                        smokeOrigin.y
                    }
                />
            )}

            {/* =================================================
                SPOTLIGHT
            ================================================= */}

            <div
                ref={overlayRef}
                className={
                    styles.spotlightOverlay
                }
            />

            {/* =================================================
                MODAL
            ================================================= */}

            {selectedCategory !== null && (
                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={closeModal}
                >
                    <div
                        className={
                            currentEvents.length ===
                            0
                                ? styles.noEventsModal
                                : styles.modal
                        }
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {/* =====================================
                            CLOSE
                        ===================================== */}

                        <button
                            className={
                                styles.closeButton
                            }
                            onClick={
                                closeModal
                            }
                            aria-label="Close"
                        >
                            ×
                        </button>

                        {/* =====================================
                            NO EVENTS
                        ===================================== */}

                        {currentEvents.length ===
                        0 ? (
                            <div
                                className={
                                    styles.noEventsContent
                                }
                            >
                                <h2>
                                    No Events Found
                                </h2>

                                <p>
                                    Alas! There are no{" "}
                                    {selectedCategory ===
                                    "photography"
                                        ? "photography"
                                        : selectedCategory}{" "}
                                    events to discover
                                    at the moment.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* =================================
                                   EVENT
                                ================================= */}

                                <div
                                    className={
                                        styles.modalContent
                                    }
                                >
                                    {/* =========================
                                        LEFT
                                    ========================= */}

                                    <div
                                        className={
                                            styles.eventInfo
                                        }
                                    >
                                        <h2>
                                            {
                                                currentEvent.name
                                            }
                                        </h2>

                                        {currentEvent.description && (
                                            <p
                                                className={
                                                    styles.description
                                                }
                                            >
                                                {
                                                    currentEvent.description
                                                }
                                            </p>
                                        )}

                                        {/* DETAILS */}

                                        <div
                                            className={
                                                styles.eventDetails
                                            }
                                        >
                                            {/* CLUB */}

                                            {currentEvent.club_name && (
                                                <div
                                                    className={
                                                        styles.detail
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.icon
                                                        }
                                                    >
                                                        ◆
                                                    </span>

                                                    <span>
                                                        {
                                                            currentEvent.club_name
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {/* VENUE */}

                                            {currentEvent.venue && (
                                                <div
                                                    className={
                                                        styles.detail
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.icon
                                                        }
                                                    >
                                                        ⌖
                                                    </span>

                                                    <span>
                                                        {
                                                            currentEvent.venue
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* RULEBOOK */}

                                        {currentEvent.rulebook && (
                                            <a
                                                href={
                                                    "https://docs.google.com/document/d/19yAh7FlGDDVqDHc4ZiUbPv1kwSmhOCYdFTghMzR0UAE/edit?tab=t.0"
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={
                                                    styles.rulebookButton
                                                }
                                            >
                                                Rulebook
                                            </a>
                                        )}
                                    </div>

                                    {/* =========================
                                        RIGHT IMAGE
                                    ========================= */}

                                    <div
                                        className={
                                            styles.eventImage
                                        }
                                    >
                                        {currentEvent.image_url ? (
                                            <img
                                                src={
                                                    currentEvent.image_url
                                                }
                                                alt={
                                                    currentEvent.name
                                                }
                                            />
                                        ) : (
                                            <div
                                                className={
                                                    styles.imagePlaceholder
                                                }
                                            >
                                                <span>
                                                    {
                                                        currentEvent.name
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* =================================
                                    EVENT NAVIGATION
                                ================================= */}

                                {currentEvents.length >
                                    1 && (
                                    <div
                                        className={
                                            styles.navigation
                                        }
                                    >
                                        <button
                                            className={
                                                styles.navButton
                                            }
                                            onClick={
                                                handlePrev
                                            }
                                            aria-label="Previous event"
                                        >
                                            ‹
                                        </button>

                                        <span
                                            className={
                                                styles.counter
                                            }
                                        >
                                            {
                                                currentIndex +
                                                1
                                            }
                                            {" / "}
                                            {
                                                currentEvents.length
                                            }
                                        </span>

                                        <button
                                            className={
                                                styles.navButton
                                            }
                                            onClick={
                                                handleNext
                                            }
                                            aria-label="Next event"
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}