import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
} from "react";

import Nav from "../../components/Nav";
import Preloader from "../Preloader";

import styles from "./EventsPage.module.scss";

import dramaVase from "/dramaVase.png";
import photographyVase from "/photographyVase.png";
import danceVase from "/danceVase.png";
import otherVase from "/otherVase.png";
import musicVase from "/musicVase.png";
import eventsTitle from "/eventsTitle.png";

import Swaranjali from "../../assets/Events/swaranjali.png";
import PitchPerfect from "../../assets/Events/pitchPerfect.png";
import Tarang from "../../assets/Events/tarang.png";
import Andholika from "../../assets/Events/andholika.png";
import RapWars from "../../assets/Events/rapWars.png";
import Axetacy from "../../assets/Events/axtacy.png";
import DrumDuels from "../../assets/Events/drumDuels.png";
import BeatBrawl from "../../assets/Events/beatBrawl.png";
import FashP from "../../assets/Events/fashP.png";
import Choreo from "../../assets/Events/choreo.jpg";
import StreetDance from "../../assets/Events/streetDance.png";
import DesertDuel from "../../assets/Events/desertDuel.png";
import Razzmatazz from "../../assets/Events/razzmatazz.png";
import Tandav from "../../assets/Events/tandav.png";
import Sukhmanch from "../../assets/Events/sukhmanch.png";
import StreetPlay from "../../assets/Events/streetPlay.png";
import StagePlay from "../../assets/Events/stagePlay.png";
import Metamorphosis from "../../assets/Events/metamorphosis.png";
import Hypercut from "../../assets/Events/hypercut.png";

/* =========================================================
   PRELOADER ASSETS

   Every image imported above — the five category vases, the
   page title, and every event image used in eventsData below
   — so the preloader waits for all of them before revealing
   the page, the same way About.tsx does with ABOUT_ASSETS.
========================================================= */

const EVENTS_ASSETS = [
    dramaVase,
    photographyVase,
    danceVase,
    otherVase,
    musicVase,
    eventsTitle,
    Swaranjali,
    PitchPerfect,
    Tarang,
    Andholika,
    RapWars,
    Axetacy,
    DrumDuels,
    BeatBrawl,
    FashP,
    Choreo,
    StreetDance,
    DesertDuel,
    Razzmatazz,
    Tandav,
    Sukhmanch,
    StreetPlay,
    StagePlay,
    Metamorphosis,
    Hypercut,
];


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
   CATEGORY SMOKE COLORS
========================================================= */

const CATEGORY_COLORS: Record<Category, string> = {
    drama: "#4d2b63",
    photography: "#342875",
    dance: "#50041d",
    misc: "#3b0c3c",
    music: "#03176b",
};

const DEFAULT_SMOKE_COLOR = "#5b5189";

// How long the smoke's fade-out transition takes. Must match
// the `transition: opacity ...` duration set on .smokeCanvas
// (and its fade-out variant) in EventsPage.module.scss.
const SMOKE_FADE_OUT_MS = 700;

interface RgbColor {
    r: number;
    g: number;
    b: number;
}

function hexToRgb(hex: string): RgbColor {
    const sanitized = hex.replace("#", "");

    const bigint = parseInt(sanitized, 16);

    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function clampChannel(value: number) {
    return Math.max(0, Math.min(255, value));
}

function adjustColor(
    color: RgbColor,
    amount: number
): RgbColor {
    return {
        r: clampChannel(color.r + amount),
        g: clampChannel(color.g + amount),
        b: clampChannel(color.b + amount),
    };
}

function rgbString(color: RgbColor) {
    return `${color.r}, ${color.g}, ${color.b}`;
}

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
            image_url: Sukhmanch,
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
            image_url: StreetPlay,
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
            image_url: StagePlay,
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
            image_url: Metamorphosis,
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
            image_url: Hypercut,
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
            image_url: Choreo,
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
            image_url: StreetDance,
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
            image_url: DesertDuel,
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
            image_url: Razzmatazz,
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
            image_url: Tandav,
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
            image_url: FashP,
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
            image_url: PitchPerfect,
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
            image_url: Swaranjali,
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
            image_url: Tarang,
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
            image_url: Andholika,
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
            image_url: RapWars,
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
            image_url: Axetacy,
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
            image_url: DrumDuels,
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
            image_url: BeatBrawl,
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
    color: string;
    fadingOut: boolean;
}

function SmokeCanvas({
    originX,
    originY,
    color,
    fadingOut,
}: SmokeCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        /* =====================================================
           COLOR SETUP
           Base smoke color comes from the active category. Speck
           highlights/shadows are derived from it so the grain
           texture always matches the category tint instead of a
           fixed purple.
        ===================================================== */

        const baseColor = hexToRgb(color);

        const baseColorStr = rgbString(baseColor);

        const lightSpeckColor = rgbString(
            adjustColor(baseColor, 70)
        );

        const darkSpeckColor = rgbString(
            adjustColor(baseColor, -45)
        );

        let animationFrame = 0;

        const startTime = performance.now();

        let lastDrawTime = 0;

        const frameInterval = 1000 / 40; // cap the heavy work at ~40fps

        /* =====================================================
           CANVAS RESIZE
        ===================================================== */

        const resize = () => {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                1.5
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

        // Cloud footprint scaled up ~1.4x in both directions on
        // mobile and desktop, compared to the original size.
        const cloudWidth =
            isMobile ? 980 : 1400;

        const cloudHeight =
            isMobile ? 1190 : 700;

        /* =====================================================
           PRE-RENDERED TEXTURES
           Built once, off the main draw loop. Each has its own
           softness baked in via a one-time canvas blur, so the
           draw loop never needs ctx.filter or a fresh gradient.
        ===================================================== */
const makeSoftSprite = (
    blurPx: number
) => {
    const spriteSize = 256;

    const sprite =
        document.createElement(
            "canvas"
        );

    sprite.width = spriteSize;
    sprite.height = spriteSize;

    const sctx =
        sprite.getContext("2d");

    if (!sctx) return sprite;

    const r = spriteSize / 2;

    sctx.filter =
        `blur(${blurPx}px)`;

    const gradient =
        sctx.createRadialGradient(
            r,
            r,
            0,
            r,
            r,
            r * 0.78
        );

    gradient.addColorStop(
        0,
        `rgba(${baseColorStr}, 1)`
    );

    gradient.addColorStop(
        0.5,
        `rgba(${baseColorStr}, 0.62)`
    );

    gradient.addColorStop(
        0.8,
        `rgba(${baseColorStr}, 0.22)`
    );

    gradient.addColorStop(
        1,
        `rgba(${baseColorStr}, 0)`
    );

    sctx.fillStyle = gradient;

    sctx.beginPath();

    sctx.arc(
        r,
        r,
        r * 0.78,
        0,
        Math.PI * 2
    );

    sctx.fill();

    /* =====================================================
       TEXTURE PASS
       Scatter uneven light/dark specks over the base gradient
       with a lighter blur than the base, so the sprite reads
       as grainy smoke instead of a flat soft disc. Speck colors
       are derived from the category's base color.
    ===================================================== */

    sctx.filter =
        `blur(${blurPx * 0.4}px)`;

    const textureSpecks = 40;

    for (
        let i = 0;
        i < textureSpecks;
        i++
    ) {
        const angle =
            Math.random() *
            Math.PI *
            2;

        const dist =
            Math.random() *
            r *
            0.75;

        const speckX =
            r +
            Math.cos(angle) *
                dist;

        const speckY =
            r +
            Math.sin(angle) *
                dist;

        const speckRadius =
            6 +
            Math.random() * 22;

        const isLight =
            Math.random() > 0.45;

        sctx.globalAlpha =
            0.08 +
            Math.random() * 0.16;

        sctx.fillStyle = isLight
            ? `rgba(${lightSpeckColor}, 1)`
            : `rgba(${darkSpeckColor}, 1)`;

        sctx.beginPath();

        sctx.arc(
            speckX,
            speckY,
            speckRadius,
            0,
            Math.PI * 2
        );

        sctx.fill();
    }

    sctx.globalAlpha = 1;

    /* =====================================================
       CLIP TEXTURE TO SOFT CIRCLE
       Cuts the specks back down to the original falloff shape
       so grain doesn't spill a hard edge outside the cloud.
    ===================================================== */

    sctx.globalCompositeOperation =
        "destination-in";

    sctx.filter =
        `blur(${blurPx}px)`;

    const clipGradient =
        sctx.createRadialGradient(
            r,
            r,
            0,
            r,
            r,
            r * 0.78
        );

    clipGradient.addColorStop(
        0,
        "rgba(255, 255, 255, 1)"
    );

    clipGradient.addColorStop(
        0.8,
        "rgba(255, 255, 255, 1)"
    );

    clipGradient.addColorStop(
        1,
        "rgba(255, 255, 255, 0)"
    );

    sctx.fillStyle = clipGradient;

    sctx.beginPath();

    sctx.arc(
        r,
        r,
        r * 0.78,
        0,
        Math.PI * 2
    );

    sctx.fill();

    sctx.globalCompositeOperation =
        "source-over";

    return sprite;
};

        // sharper texture for individual wisps, softer one for the big cloud body/puffs
        const particleSprite =
            makeSoftSprite(
                isMobile ? 3 : 4
            );

        const puffSprite =
            makeSoftSprite(
                isMobile ? 10 : 16
            );

        /* =====================================================
           PARTICLE WISPS
           Big particles are biased close to the center and stay
           put once they arrive. Small particles are biased out
           toward the rim and keep idly floating once settled.
           Counts are scaled up (~2x) alongside the larger cloud
           footprint so the wisp density per unit area stays the
           same as before.
        ===================================================== */

        const coreCount =
            isMobile ? 150 : 200;

        const edgeCount =
            isMobile ? 170 : 440;

        const makeParticle = (
    isCore: boolean
) => {
    const side =
        Math.random() > 0.5
            ? 1
            : -1;

    /*
     * MOBILE:
     * Keep the smoke concentrated around the center
     * instead of allowing particles to randomly spread
     * far above it.
     */
    const reach = isCore
    ? 0.08 + Math.random() * 0.28
    : isMobile
        ? 0.25 + Math.random() * 0.3
        : 0.355 + Math.random() * 0.45;

    /*
     * Full circular distribution so particles spread
     * evenly in every direction (left/right/up/down)
     * around the center, instead of being biased
     * toward one side.
     */
    const angle =
        Math.random() *
        Math.PI *
        2;

    const rawTargetX =
        Math.cos(angle) *
        cloudWidth *
        0.6 *
        reach;

    const rawTargetY =
        Math.sin(angle) *
        cloudHeight *
        0.5 *
        reach;

    const ellipseA =
        cloudWidth * 0.5;

    const ellipseB =
        cloudHeight * 0.5;

    const ellipseDist =
        Math.sqrt(
            (rawTargetX /
                ellipseA) ** 2 +
                (rawTargetY /
                    ellipseB) ** 2
        );

    const clampScale =
        ellipseDist > 1
            ? 1 / ellipseDist
            : 1;

    return {
        startX:
            originX +
            (Math.random() - 0.5) *
                35,

        startY:
            originY +
            Math.random() *
                18,

        targetX:
            centerX +
            rawTargetX *
                clampScale,

        targetY:
            centerY +
            rawTargetY *
                clampScale,

        size: isCore
            ? 48 +
              Math.random() * 45
            : 20 +
              Math.random() * 25,

        drift:
            side *
            (isCore
                ? 6 +
                  Math.random() * 10
                : 18 +
                  Math.random() * 35),

        phase:
            Math.random() *
            Math.PI *
            2,

        speed:
            0.1 +
            Math.random() *
                0.45,

        delay:
            Math.random() * 0.8,

        opacity:
            0.55 +
            Math.random() * 0.45,

        isCore,

        idleDrift: isCore
            ? 0
            : 5 +
              Math.random() * 10,

        idlePhase:
            Math.random() *
            Math.PI *
            2,

        idleSpeed:
            0.2 +
            Math.random() * 0.25,
    };
};
        

        const particles = [
            ...Array.from(
                { length: coreCount },
                () => makeParticle(true)
            ),
            ...Array.from(
                { length: edgeCount },
                () => makeParticle(false)
            ),
        ];

        /* =====================================================
           CENTRAL CLOUD PUFFS
           Mirrored above/below and left/right of center so the
           cloud reads as evenly filled on every side, rather
           than concentrated toward one corner. 12 puffs spread
           over the larger footprint keeps density on par with
           the original 5-puff version.
        ===================================================== */

        const cloudPuffs = [
            { x: -0.42, y: 0.30, s: 0.72 },
            { x: 0.42, y: 0.30, s: 0.72 },
            { x: -0.42, y: -0.30, s: 0.68 },
            { x: 0.42, y: -0.30, s: 0.68 },
            { x: -0.24, y: 0.38, s: 0.88 },
            { x: 0.24, y: 0.38, s: 0.88 },
            { x: -0.24, y: -0.38, s: 0.80 },
            { x: 0.24, y: -0.38, s: 0.80 },
            { x: -0.06, y: 0.36, s: 1.00 },
            { x: 0.06, y: -0.36, s: 0.92 },
            { x: 0, y: 0.12, s: 0.75 },
            { x: 0, y: -0.12, s: 0.75 },
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
            if (
                now - lastDrawTime <
                frameInterval
            ) {
                animationFrame =
                    requestAnimationFrame(
                        draw
                    );

                return;
            }

            lastDrawTime = now;

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
                            0.4,
                        390
                    );

                const rise =
                    Math.sin(
                        progress *
                            Math.PI *
                            0.9
                    ) * riseAmount;

                const spread =
                    Math.pow(
                        progress,
                        1.3
                    );

                const wave =
                    Math.sin(
                        elapsed *
                            particle.speed *
                            2.2 +
                            particle.phase
                    );

                const insideCloudStart = 0.75;

                const insideCloudFactor =
                    Math.min(
                        1,
                        Math.max(
                            0,
                            (spread -
                                insideCloudStart) /
                                (1 -
                                    insideCloudStart)
                        )
                    );

                // once a particle has fully arrived, small ones keep
                // idly floating in place; core ones stay still
                const settled =
                    rawProgress >= 1;

                const idleX = settled
                    ? Math.cos(
                          elapsed *
                              particle.idleSpeed +
                              particle.idlePhase
                      ) * particle.idleDrift
                    : 0;

                const idleY = settled
                    ? Math.sin(
                          elapsed *
                              particle.idleSpeed *
                              0.8 +
                              particle.idlePhase
                      ) *
                      particle.idleDrift *
                      0.6
                    : 0;

                const x =
                    particle.startX +
                    (particle.targetX -
                        particle.startX) *
                        spread +
                    wave *
                        particle.drift * 0.25 *
                        insideCloudFactor +
                    idleX;

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
                        ) +
                    idleY;

                const size =
                    particle.size *
                    (2 +
                        progress * 1.5);

                const alpha =
                    particle.opacity *
                    (0.10 +
                        progress * 0.46);

                const aspect =
                    0.62 +
                    Math.sin(
                        particle.phase
                    ) * 0.18;

                ctx.save();

                ctx.globalAlpha = alpha;

                ctx.translate(x, y);

                ctx.rotate(particle.phase);

                ctx.scale(1, aspect);

                ctx.drawImage(
                    particleSprite,
                    -size,
                    -size,
                    size * 2,
                    size * 2
                );

                ctx.restore();
            });

            /* =================================================
               CENTRAL SOFT CLOUD
               (pre-rendered sprite — no per-frame gradients,
               no runtime blur)
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
                        ? 280
                        : 560;

                ctx.save();

                ctx.globalAlpha =
                    0.24 * eased;

                ctx.translate(
                    centerX,
                    centerY
                );

                ctx.scale(
                    1,
                    isMobile ? 0.7 : 0.8 / 1.1
                );

                ctx.drawImage(
                    puffSprite,
                    -baseRadius * 1.1,
                    -baseRadius * 1.1,
                    baseRadius * 1.1 * 2,
                    baseRadius * 1.1 * 2
                );

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
                                ? 161
                                : 252) *
                            puff.s *
                            (0.25 +
                                puffEase *
                                    0.60);

                        const alpha =
                            0.105 *
                            puffEase;

                        ctx.save();

                        ctx.globalAlpha =
                            alpha;

                        ctx.translate(
                            x,
                            y
                        );

                        ctx.scale(
                            1,
                            0.82
                        );

                        ctx.drawImage(
                            puffSprite,
                            -radius,
                            -radius,
                            radius * 2,
                            radius * 2
                        );

                        ctx.restore();
                    }
                );
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
                            ? 322
                            : 490
                    );

                coreGradient.addColorStop(
                    0,
                    `rgba(${baseColorStr}, ${
                        0.14 *
                        coreProgress
                    })`
                );

                coreGradient.addColorStop(
                    0.38,
                    `rgba(${baseColorStr}, ${
                        0.10 *
                        coreProgress
                    })`
                );

                coreGradient.addColorStop(
                    0.72,
                    `rgba(${baseColorStr}, ${
                        0.04 *
                        coreProgress
                    })`
                );

                coreGradient.addColorStop(
                    1,
                    `rgba(${baseColorStr}, 0)`
                );

                ctx.fillStyle =
                    coreGradient;

                ctx.fillRect(
                    centerX -
                        (isMobile
                            ? 322
                            : 490),
                    centerY -
                        (isMobile
                            ? 238
                            : 350),
                    isMobile
                        ? 644
                        : 980,
                    isMobile
                        ? 560
                        : 840
                );
            }

            /* =================================================
               READABILITY VIGNETTE
               (kept neutral/dark regardless of category so text
               stays legible over any smoke color)
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
                            ? 364
                            : 672
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
                            ? 364
                            : 672),
                    centerY -
                        (isMobile
                            ? 322
                            : 588),
                    isMobile
                        ? 728
                        : 1344,
                    isMobile
                        ? 644
                        : 1176
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
                    `rgba(${baseColorStr}, ${
                        0.30 *
                        baseProgress
                    })`
                );

                baseGradient.addColorStop(
                    0.38,
                    `rgba(${baseColorStr}, ${
                        0.18 *
                        baseProgress
                    })`
                );

                baseGradient.addColorStop(
                    0.7,
                    `rgba(${baseColorStr}, ${
                        0.06 *
                        baseProgress
                    })`
                );

                baseGradient.addColorStop(
                    1,
                    `rgba(${baseColorStr}, 0)`
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

            animationFrame =
                requestAnimationFrame(
                    draw
                );
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
    }, [originX, originY, color]);

    return (
        <canvas
            ref={canvasRef}
            className={`${styles.smokeCanvas} ${
                fadingOut
                    ? styles.smokeCanvasFadeOut
                    : ""
            }`}
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

    // Tracks the pending "fade the smoke out, then unmount it"
    // timeout kicked off by closeModal, so it can be cancelled
    // if the component unmounts or another close happens first.
    const smokeFadeTimeoutRef =
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
        smokeCategory,
        setSmokeCategory,
    ] =
        useState<Category | null>(null);

    // When true, the smoke canvas is still mounted but is
    // transitioning its opacity to 0 (see .smokeCanvasFadeOut
    // in EventsPage.module.scss) rather than disappearing
    // instantly.
    const [
        smokeClosing,
        setSmokeClosing,
    ] = useState(false);

    const [
        currentIndex,
        setCurrentIndex,
    ] = useState(0);

    // Mirrors About.tsx's aboutPreloaderDone: the Preloader
    // stays mounted (blocking the page) until every asset in
    // EVENTS_ASSETS has loaded, then this flips to true and
    // it unmounts.
    const [
        eventsPreloaderDone,
        setEventsPreloaderDone,
    ] = useState(false);

    const handleEventsPreloaderEnter =
        useCallback(() => {
            setEventsPreloaderDone(true);
        }, []);

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
       CLEANUP PENDING TIMERS ON UNMOUNT
    ===================================================== */

    useEffect(() => {
        return () => {
            if (smokeTimerRef.current !== null) {
                window.clearTimeout(
                    smokeTimerRef.current
                );
            }

            if (
                smokeFadeTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    smokeFadeTimeoutRef.current
                );
            }
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

        // Opening a new category cancels any smoke that was
        // still fading out from a previous close.
        if (
            smokeFadeTimeoutRef.current !==
            null
        ) {
            window.clearTimeout(
                smokeFadeTimeoutRef.current
            );

            smokeFadeTimeoutRef.current =
                null;
        }

        setSmokeClosing(false);

        // e.currentTarget is now the .hitArea overlay, which
        // sits as a SIBLING of the <img> (both inside
        // .imageWrap) rather than wrapping it, so we look the
        // image up via the shared parent. The visual vase
        // position/size is unaffected by the narrower hit area.
        const vase =
            e.currentTarget.parentElement?.querySelector(
                "img"
            ) ?? null;

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
            rect.height *(- 0.15);

        setSmokeOrigin({
            x: originX,
            y: originY,
        });

        setSmokeCategory(category);

        smokeTimerRef.current =
            window.setTimeout(() => {
                setSelectedCategory(
                    category
                );

                setCurrentIndex(0);

                smokeTimerRef.current =
                    null;
            }, 2100);
    };

    /* =====================================================
       CLOSE MODAL

       The modal itself closes immediately, but the smoke is
       given a moment to fade its opacity to 0 (matching the
       CSS transition on .smokeCanvasFadeOut) before it's
       actually unmounted, instead of vanishing abruptly.
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

        if (smokeOrigin) {
            setSmokeClosing(true);

            if (
                smokeFadeTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    smokeFadeTimeoutRef.current
                );
            }

            smokeFadeTimeoutRef.current =
                window.setTimeout(() => {
                    setSmokeOrigin(null);
                    setSmokeCategory(null);
                    setSmokeClosing(false);

                    smokeFadeTimeoutRef.current =
                        null;
                }, SMOKE_FADE_OUT_MS);
        } else {
            setSmokeOrigin(null);
            setSmokeCategory(null);
            setSmokeClosing(false);
        }
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

    const activeSmokeColor =
        smokeCategory
            ? CATEGORY_COLORS[smokeCategory]
            : DEFAULT_SMOKE_COLOR;

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

                .imageWrap is sized purely by the <img> (as the
                bare <img> was before), so the container's
                absolute positioning/scaling is unchanged. The
                .hitArea is an absolutely-positioned overlay,
                centered inside .imageWrap and narrower than the
                image, so it captures clicks/hover without
                affecting the image's own size or position.
            ================================================= */}

            <section className={styles.dramaContainer}>
                <span className={styles.imageWrap}>
                    <img
                        src={dramaVase}
                        alt="Drama and Theatre"
                    />

                    <span
                        className={styles.hitArea}
                        onClick={(e) =>
                            openCategory(
                                "drama",
                                e
                            )
                        }
                    />
                </span>
            </section>

            {/* =================================================
                PHOTOGRAPHY
            ================================================= */}

            <section className={styles.photographyContainer}>
                <span className={styles.imageWrap}>
                    <img
                        src={photographyVase}
                        alt="Photography"
                    />

                    <span
                        className={styles.hitArea}
                        onClick={(e) =>
                            openCategory(
                                "photography",
                                e
                            )
                        }
                    />
                </span>
            </section>

            {/* =================================================
                DANCE
            ================================================= */}

            <section className={styles.danceContainer}>
                <span className={styles.imageWrap}>
                    <img
                        src={danceVase}
                        alt="Dance"
                    />

                    <span
                        className={styles.hitArea}
                        onClick={(e) =>
                            openCategory(
                                "dance",
                                e
                            )
                        }
                    />
                </span>
            </section>

            {/* =================================================
                MISC / FASHION
            ================================================= */}

            <section className={styles.otherContainer}>
                <span className={styles.imageWrap}>
                    <img
                        src={otherVase}
                        alt="Miscellaneous"
                    />

                    <span
                        className={styles.hitArea}
                        onClick={(e) =>
                            openCategory(
                                "misc",
                                e
                            )
                        }
                    />
                </span>
            </section>

            {/* =================================================
                MUSIC
            ================================================= */}

            <section className={styles.musicContainer}>
                <span className={styles.imageWrap}>
                    <img
                        src={musicVase}
                        alt="Music"
                    />

                    <span
                        className={styles.hitArea}
                        onClick={(e) =>
                            openCategory(
                                "music",
                                e
                            )
                        }
                    />
                </span>
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
                    color={
                        activeSmokeColor
                    }
                    fadingOut={smokeClosing}
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

            {/* =================================================
                PRELOADER
            ================================================= */}

            {!eventsPreloaderDone && (
                <Preloader
                    assets={EVENTS_ASSETS}
                    onEnter={handleEventsPreloaderEnter}
                />
            )}
        </div>
    );
}