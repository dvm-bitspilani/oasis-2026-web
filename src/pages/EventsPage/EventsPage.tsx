import { useEffect, useRef, useState } from "react";
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

    /* =========================
       DRAMA & THEATRE
    ========================= */

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
        },
    ],


    /* =========================
       PHOTOGRAPHY
       EMPTY INTENTIONALLY
    ========================= */

    photography: [],


    /* =========================
       DANCE
    ========================= */

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
        },
    ],


    /* =========================
       MISC / FASHION
    ========================= */

    misc: [
        {
            id: "fashp",
            name: "FashP",
            category: "Fashion",
            club_name: null,
            venue: null,
            description: null,
            image_url: null,
        },
    ],


    /* =========================
       MUSIC
    ========================= */

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
        },
    ],
};


/* =========================================================
   EVENTS PAGE
========================================================= */

export default function EventsPage() {

    const overlayRef = useRef<HTMLDivElement>(null);

    const [selectedCategory, setSelectedCategory] =
        useState<Category | null>(null);

    const [currentIndex, setCurrentIndex] =
        useState(0);


    /* =====================================================
       SPOTLIGHT
    ===================================================== */

    useEffect(() => {

        const handleMouseMove = (e: MouseEvent) => {

            const overlay = overlayRef.current;

            if (!overlay) return;

            const rect =
                overlay.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

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

    const openCategory = (category: Category) => {

        setSelectedCategory(category);

        setCurrentIndex(0);

    };


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const closeModal = () => {

        setSelectedCategory(null);

        setCurrentIndex(0);

    };


    /* =====================================================
       CURRENT EVENTS
    ===================================================== */

    const currentEvents: EventData[] =
        selectedCategory
            ? eventsData[selectedCategory]
            : [];


    /* =====================================================
       NEXT EVENT
    ===================================================== */

    const handleNext = () => {

        if (currentEvents.length <= 1) return;

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

        if (currentEvents.length <= 1) return;

        setCurrentIndex((prev) => {

            if (prev <= 0) {
                return currentEvents.length - 1;
            }

            return prev - 1;

        });

    };


    /* =====================================================
       KEYBOARD
    ===================================================== */

    useEffect(() => {

        if (!selectedCategory) return;


        const handleKeyDown = (e: KeyboardEvent) => {

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
        <div className={styles.fullPageContainer}>


            {/* =================================================
                NAV
            ================================================= */}

            <section>
                <Nav />
            </section>


            {/* =================================================
                TITLE
            ================================================= */}

            <section className={styles.title}>

                <img
                    src={eventsTitle}
                    alt="Events"
                />

            </section>


            {/* =================================================
                DRAMA
            ================================================= */}

            <section
                className={styles.dramaContainer}
                onClick={() =>
                    openCategory("drama")
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
                onClick={() =>
                    openCategory("photography")
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
                className={styles.danceContainer}
                onClick={() =>
                    openCategory("dance")
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
                className={styles.otherContainer}
                onClick={() =>
                    openCategory("misc")
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
                className={styles.musicContainer}
                onClick={() =>
                    openCategory("music")
                }
            >

                <img
                    src={musicVase}
                    alt="Music"
                />

            </section>


            {/* =================================================
                SPOTLIGHT
            ================================================= */}

            <div
                ref={overlayRef}
                className={styles.spotlightOverlay}
            />


            {/* =================================================
                MODAL
            ================================================= */}

            {selectedCategory !== null && (

                <div
                    className={styles.modalOverlay}
                    onClick={closeModal}
                >

                    <div
                        className={
                            currentEvents.length === 0
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
                            onClick={closeModal}
                            aria-label="Close"
                        >
                            ×
                        </button>


                        {/* =====================================
                            NO EVENTS
                        ===================================== */}

                        {currentEvents.length === 0 ? (

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

                            /* =================================
                               EVENT
                            ================================= */

                            <>

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


                                        {
                                            currentEvent
                                                .description && (
                                                <p
                                                    className={
                                                        styles.description
                                                    }
                                                >
                                                    {
                                                        currentEvent
                                                            .description
                                                    }
                                                </p>
                                            )
                                        }


                                        {/* DETAILS */}

                                        <div
                                            className={
                                                styles.eventDetails
                                            }
                                        >


                                            {/* CATEGORY */}

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
                                                    ♛
                                                </span>

                                                <span>
                                                    {
                                                        currentEvent
                                                            .category
                                                    }
                                                </span>

                                            </div>


                                            {/* CLUB */}

                                            {
                                                currentEvent
                                                    .club_name && (
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
                                                                currentEvent
                                                                    .club_name
                                                            }
                                                        </span>

                                                    </div>
                                                )
                                            }


                                            {/* VENUE */}

                                            {
                                                currentEvent
                                                    .venue && (
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
                                                                currentEvent
                                                                    .venue
                                                            }
                                                        </span>

                                                    </div>
                                                )
                                            }

                                        </div>

                                    </div>


                                    {/* =========================
                                        RIGHT IMAGE
                                    ========================= */}

                                    <div
                                        className={
                                            styles.eventImage
                                        }
                                    >

                                        {
                                            currentEvent
                                                .image_url ? (

                                                <img
                                                    src={
                                                        currentEvent
                                                            .image_url
                                                    }
                                                    alt={
                                                        currentEvent
                                                            .name
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
                                                            currentEvent
                                                                .name
                                                        }
                                                    </span>

                                                </div>

                                            )
                                        }

                                    </div>

                                </div>


                                {/* =================================
                                    EVENT NAVIGATION
                                ================================= */}

                                {
                                    currentEvents.length > 1 && (

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
                                                {currentIndex + 1}
                                                {" / "}
                                                {
                                                    currentEvents
                                                        .length
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

                                    )
                                }

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}