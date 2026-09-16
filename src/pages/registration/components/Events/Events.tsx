import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
} from "react";
import axios from "axios";

import styles from "./Events.module.scss";

import ConfirmModal from "../ConfirmModal/ConfirmModal";
import EventsModal from "../EventsModal/EventsModal";

import bg from "../../../../assets/registration/reg/inputBg.png";
import btn from "../../../../assets/registration/reg/btn.png";
import RegBg from "../../../../assets/registration/reg/RegBg.png";
import searchBg from "../../../../assets/registration/reg/searchBg.png";

import leftbottom from "../../../../assets/registration/reg/leftbottom.png";
import lefttop from "../../../../assets/registration/reg/lefttop.png";
import rightbottom from "../../../../assets/registration/reg/rightbottom.png";
import righttop from "../../../../assets/registration/reg/righttop.png";
import rightmid from "../../../../assets/registration/reg/rightmid.png"

import book from "../../../../assets/registration/reg/book.png";
import line from "../../../../assets/registration/reg/line.png";
import wheel from "../../../../assets/registration/reg/wheel.png";

interface Event {
  id: number;
  name: string;
  about: string;
}

interface EventsProps {
  userData?: any;
  setUserData?: React.Dispatch<React.SetStateAction<any>>;

  /*
   * Called by the back button. The parent should use this to move the
   * step back to the Register screen instead of navigating to "/".
   */
  onClickBack?: () => void;
}

/* ========================================= */
/* MOBILE BREAKPOINT                         */
/* ========================================= */

const MOBILE_BREAKPOINT = 900;

/* ========================================================= */
/* BOOK BOX                                                  */
/*                                                           */
/* The whole desktop layout hangs off one rectangle: the     */
/* book. It's sized here rather than in CSS because it's a   */
/* two-way constraint — the book must fit the width AND the  */
/* height while keeping its aspect ratio, which is a min()   */
/* of two different units that also has to be readable back  */
/* as a number for the page columns.                         */
/*                                                           */
/*   width  = min(vw * MAX_W, vh * MAX_H * ASPECT)           */
/*   height = width / ASPECT                                 */
/*                                                           */
/* Tune BOOK_MAX_VW / BOOK_MAX_VH to make the book bigger or */
/* smaller; everything inside re-scales with it.             */
/* ========================================================= */

const BOOK_ASPECT = 1.4;   /* width : height of book.png    */
const BOOK_MAX_VW = 0.78;  /* at most 78% of the viewport w */
const BOOK_MAX_VH = 0.88;  /* at most 88% of the viewport h */

interface BookBox {
  width: number;
  height: number;
}

const measureBookBox = (): BookBox => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const width = Math.min(
    vw * BOOK_MAX_VW,
    vh * BOOK_MAX_VH * BOOK_ASPECT
  );

  return {
    width,
    height: width / BOOK_ASPECT,
  };
};

/* ========================================= */
/* COMPONENT                                 */
/* ========================================= */

const Events = forwardRef<HTMLDivElement, EventsProps>(
  ({ userData, setUserData, onClickBack }, ref) => {
    /* ========================================= */
    /* EVENTS DATA                               */
    /* ========================================= */

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    /* ========================================= */
    /* VIEWPORT WIDTH                            */
    /*                                           */
    /* Single source of truth for "are we on     */
    /* mobile". Everything width-dependent below */
    /* reads this instead of window.innerWidth,  */
    /* so the tree actually re-renders when the  */
    /* viewport crosses the breakpoint.          */
    /* ========================================= */

    const [isMobile, setIsMobile] = useState<boolean>(
      () =>
        typeof window !== "undefined" &&
        window.innerWidth < MOBILE_BREAKPOINT
    );

    /* ========================================= */
    /* BOOK BOX                                  */
    /*                                           */
    /* Null on mobile / before mount, in which   */
    /* case the CSS fallbacks take over.         */
    /* ========================================= */

    const [bookBox, setBookBox] =
      useState<BookBox | null>(null);

    useEffect(() => {
      const handleViewportResize = () => {
        const mobile =
          window.innerWidth < MOBILE_BREAKPOINT;

        setIsMobile(mobile);

        /*
         * Mobile has its own book framing (see the
         * ≤900px block in the stylesheet), so the
         * measured box is only published on desktop.
         */
        setBookBox(
          mobile ? null : measureBookBox()
        );
      };

      handleViewportResize();

      window.addEventListener(
        "resize",
        handleViewportResize
      );

      window.addEventListener(
        "orientationchange",
        handleViewportResize
      );

      return () => {
        window.removeEventListener(
          "resize",
          handleViewportResize
        );

        window.removeEventListener(
          "orientationchange",
          handleViewportResize
        );
      };
    }, []);

    /* ========================================= */
    /* LIST / SCROLL REFS                        */
    /* ========================================= */

    const eventsListRef =
      useRef<HTMLDivElement>(null);

    const scrollAnimationRef =
      useRef<number | null>(null);

    const targetScrollTopRef =
      useRef(0);

    const dragStartYRef =
      useRef(0);

    const dragStartScrollTopRef =
      useRef(0);

    /*
     * Stores the actual DOM button for every event.
     *
     * This is what allows us to take the event selected
     * from the RIGHT page and find the same event on
     * the LEFT page.
     */
    const eventItemRefs = useRef<
      Record<number, HTMLButtonElement | null>
    >({});

    const [scrollY, setScrollY] = useState(0);

    const [isDraggingScrollbar, setIsDraggingScrollbar] =
      useState(false);

    /* ========================================= */
    /* DESCRIPTION SCROLL (RIGHT PAGE)           */
    /*                                           */
    /* The description's height is pure flex now */
    /* — it's whatever the column has left after */
    /* the heading, title and controls — so      */
    /* there's nothing to measure, only to       */
    /* scroll.                                   */
    /* ========================================= */

    const eventDescRef =
      useRef<HTMLParagraphElement>(null);

    const descScrollAnimationRef =
      useRef<number | null>(null);

    const descTargetScrollTopRef =
      useRef(0);

    const descDragStartYRef =
      useRef(0);

    const descDragStartScrollTopRef =
      useRef(0);

    const [descScrollY, setDescScrollY] =
      useState(0);

    const [
      isDraggingDescScrollbar,
      setIsDraggingDescScrollbar,
    ] = useState(false);

    /* ========================================= */
    /* SEARCH                                    */
    /* ========================================= */

    const [search, setSearch] = useState("");

    /* ========================================= */
    /* SELECTED EVENTS                           */
    /* ========================================= */

    const [selectedEvents, setSelectedEvents] = useState<
      { id: number; name: string }[]
    >(() => {
      try {
        return JSON.parse(
          sessionStorage.getItem("selectedEvents") ||
            "[]"
        );
      } catch {
        return [];
      }
    });

    /* ========================================= */
    /* ACTIVE EVENT                              */
    /* ========================================= */

    const [activeEvent, setActiveEvent] =
      useState<Event | null>(null);

    /* ========================================= */
    /* MODALS                                    */
    /* ========================================= */

    const [confirmModal, setConfirmModal] =
      useState(false);

    const [eventsModal, setEventsModal] =
      useState(false);

    /* ========================================= */
    /* FETCH EVENTS                              */
    /* ========================================= */

    useEffect(() => {
      axios
        .get<Event[]>(
          "https://bits-oasis.org/2026/main/registrations/events_details/"
        )
        .then((response) => {
          console.log(
            "EVENT API RESPONSE:",
            response.data
          );

          if (Array.isArray(response.data)) {
            setEvents(response.data);
          } else {
            setEvents([]);
          }
        })
        .catch((error) => {
          console.error(
            "EVENT API ERROR:",
            error
          );

          setEvents([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, []);

    /* ========================================= */
    /* AUTO SHOW FIRST EVENT ONCE LOADED         */
    /* ========================================= */

    useEffect(() => {
      if (!loading && events.length > 0) {
        setActiveEvent((current) => current ?? events[0]);
      }
    }, [loading, events]);

    /* ========================================= */
    /* FILTER EVENTS                             */
    /* ========================================= */

    const filteredEvents = events.filter((event) =>
      event.name
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );

    /* ========================================= */
    /* CUSTOM EVENT SCROLLBAR                    */
    /* ========================================= */

    const updateScrollY = () => {
      const list = eventsListRef.current;

      if (!list) return;

      const maxScroll =
        list.scrollHeight - list.clientHeight;

      const progress =
        maxScroll > 0
          ? list.scrollTop / maxScroll
          : 0;

      setScrollY(
        Math.max(
          0,
          Math.min(1, progress)
        )
      );
    };

    /* ========================================= */
    /* SMOOTH SCROLL                             */
    /* ========================================= */

    const animateScroll = () => {
      const list = eventsListRef.current;

      if (!list) return;

      const current = list.scrollTop;

      const target =
        targetScrollTopRef.current;

      const next =
        current +
        (target - current) * 0.16;

      list.scrollTop = next;

      updateScrollY();

      if (
        Math.abs(target - next) > 0.5
      ) {
        scrollAnimationRef.current =
          requestAnimationFrame(
            animateScroll
          );
      } else {
        list.scrollTop = target;

        updateScrollY();

        scrollAnimationRef.current = null;
      }
    };

    const startSmoothScroll = () => {
      if (
        scrollAnimationRef.current === null
      ) {
        scrollAnimationRef.current =
          requestAnimationFrame(
            animateScroll
          );
      }
    };

    /* ========================================= */
    /* WHEEL SCROLL                              */
    /* ========================================= */

    const handleEventsWheel = (
      e: React.WheelEvent<HTMLDivElement>
    ) => {
      const list = eventsListRef.current;

      if (!list) return;

      const maxScroll =
        list.scrollHeight - list.clientHeight;

      if (maxScroll <= 0) return;

      e.preventDefault();

      const currentTarget =
        targetScrollTopRef.current;

      const base = Math.max(
        0,
        Math.min(
          maxScroll,
          currentTarget
        )
      );

      targetScrollTopRef.current =
        Math.max(
          0,
          Math.min(
            maxScroll,
            base + e.deltaY * 0.85
          )
        );

      startSmoothScroll();
    };

    /* ========================================= */
    /* SCROLLBAR WHEEL DRAG START                */
    /* ========================================= */

    const handleScrollbarPointerDown = (
      e: React.PointerEvent<HTMLImageElement>
    ) => {
      const list = eventsListRef.current;

      const track =
        e.currentTarget.parentElement;

      if (!list || !track) return;

      const maxScroll =
        list.scrollHeight - list.clientHeight;

      if (maxScroll <= 0) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDraggingScrollbar(true);

      dragStartYRef.current =
        e.clientY;

      dragStartScrollTopRef.current =
        list.scrollTop;

      e.currentTarget.setPointerCapture(
        e.pointerId
      );
    };

    /* ========================================= */
    /* SCROLLBAR WHEEL DRAG MOVE                */
    /* ========================================= */

    const handleScrollbarPointerMove = (
      e: React.PointerEvent<HTMLImageElement>
    ) => {
      if (!isDraggingScrollbar) return;

      const list = eventsListRef.current;

      const track =
        e.currentTarget.parentElement;

      const wheelEl =
        e.currentTarget;

      if (!list || !track) return;

      const trackHeight =
        track.clientHeight;

      const wheelHeight =
        wheelEl.clientHeight;

      const availableTravel =
        Math.max(
          1,
          trackHeight - wheelHeight
        );

      const maxScroll =
        list.scrollHeight - list.clientHeight;

      const deltaY =
        e.clientY -
        dragStartYRef.current;

      const scrollDelta =
        (deltaY / availableTravel) *
        maxScroll;

      const nextScroll =
        Math.max(
          0,
          Math.min(
            maxScroll,
            dragStartScrollTopRef.current +
              scrollDelta
          )
        );

      targetScrollTopRef.current =
        nextScroll;

      list.scrollTop =
        nextScroll;

      updateScrollY();
    };

    /* ========================================= */
    /* SCROLLBAR WHEEL DRAG END                 */
    /* ========================================= */

    const handleScrollbarPointerUp = (
      e: React.PointerEvent<HTMLImageElement>
    ) => {
      setIsDraggingScrollbar(false);

      try {
        e.currentTarget.releasePointerCapture(
          e.pointerId
        );
      } catch {
        // Pointer capture may already
        // have been released.
      }
    };

    /* ========================================= */
    /* CLICK ON SCROLLBAR LINE                  */
    /* ========================================= */

    const handleScrollbarTrackClick = (
      e: React.MouseEvent<HTMLDivElement>
    ) => {
      const list = eventsListRef.current;

      const track = e.currentTarget;

      if (!list) return;

      const maxScroll =
        list.scrollHeight - list.clientHeight;

      if (maxScroll <= 0) return;

      const rect =
        track.getBoundingClientRect();

      const clickY =
        e.clientY - rect.top;

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            clickY / rect.height
          )
        );

      targetScrollTopRef.current =
        progress * maxScroll;

      startSmoothScroll();
    };

    /* ========================================= */
    /* SCROLL LISTENER                           */
    /* ========================================= */

    useEffect(() => {
      const list =
        eventsListRef.current;

      if (!list) return;

      targetScrollTopRef.current =
        list.scrollTop;

      updateScrollY();

      const handleScroll = () => {
        targetScrollTopRef.current =
          list.scrollTop;

        updateScrollY();
      };

      list.addEventListener(
        "scroll",
        handleScroll,
        {
          passive: true,
        }
      );

      window.addEventListener(
        "resize",
        updateScrollY
      );

      return () => {
        list.removeEventListener(
          "scroll",
          handleScroll
        );

        window.removeEventListener(
          "resize",
          updateScrollY
        );

        if (
          scrollAnimationRef.current !==
          null
        ) {
          cancelAnimationFrame(
            scrollAnimationRef.current
          );

          scrollAnimationRef.current =
            null;
        }
      };
    }, [filteredEvents.length]);

    /* ========================================================= */
    /* DESCRIPTION SCROLL LOGIC                                  */
    /* Same easing and same wheel drag as the left list.         */
    /* ========================================================= */

    const updateDescScrollY = () => {
      const el = eventDescRef.current;

      if (!el) return;

      const maxScroll =
        el.scrollHeight - el.clientHeight;

      const progress =
        maxScroll > 0
          ? el.scrollTop / maxScroll
          : 0;

      setDescScrollY(
        Math.max(
          0,
          Math.min(1, progress)
        )
      );
    };

    const animateDescScroll = () => {
      const el = eventDescRef.current;

      if (!el) return;

      const current = el.scrollTop;

      const target =
        descTargetScrollTopRef.current;

      const next =
        current +
        (target - current) * 0.16;

      el.scrollTop = next;

      updateDescScrollY();

      if (
        Math.abs(target - next) > 0.5
      ) {
        descScrollAnimationRef.current =
          requestAnimationFrame(
            animateDescScroll
          );
      } else {
        el.scrollTop = target;

        updateDescScrollY();

        descScrollAnimationRef.current = null;
      }
    };

    const startDescSmoothScroll = () => {
      if (
        descScrollAnimationRef.current === null
      ) {
        descScrollAnimationRef.current =
          requestAnimationFrame(
            animateDescScroll
          );
      }
    };

    const handleDescWheel = (
      e: React.WheelEvent<HTMLDivElement>
    ) => {
      const el = eventDescRef.current;

      if (!el) return;

      const maxScroll =
        el.scrollHeight - el.clientHeight;

      if (maxScroll <= 0) return;

      e.preventDefault();

      const base = Math.max(
        0,
        Math.min(
          maxScroll,
          descTargetScrollTopRef.current
        )
      );

      descTargetScrollTopRef.current =
        Math.max(
          0,
          Math.min(
            maxScroll,
            base + e.deltaY * 0.85
          )
        );

      startDescSmoothScroll();
    };

    const handleDescScrollbarPointerDown = (
      e: React.PointerEvent<HTMLImageElement>
    ) => {
      const el = eventDescRef.current;

      const track =
        e.currentTarget.parentElement;

      if (!el || !track) return;

      const maxScroll =
        el.scrollHeight - el.clientHeight;

      if (maxScroll <= 0) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDraggingDescScrollbar(true);

      descDragStartYRef.current =
        e.clientY;

      descDragStartScrollTopRef.current =
        el.scrollTop;

      e.currentTarget.setPointerCapture(
        e.pointerId
      );
    };

    const handleDescScrollbarPointerMove = (
      e: React.PointerEvent<HTMLImageElement>
    ) => {
      if (!isDraggingDescScrollbar) return;

      const el = eventDescRef.current;

      const track =
        e.currentTarget.parentElement;

      const wheelEl =
        e.currentTarget;

      if (!el || !track) return;

      const trackHeight =
        track.clientHeight;

      const wheelHeight =
        wheelEl.clientHeight;

      const availableTravel =
        Math.max(
          1,
          trackHeight - wheelHeight
        );

      const maxScroll =
        el.scrollHeight - el.clientHeight;

      const deltaY =
        e.clientY -
        descDragStartYRef.current;

      const scrollDelta =
        (deltaY / availableTravel) *
        maxScroll;

      const nextScroll =
        Math.max(
          0,
          Math.min(
            maxScroll,
            descDragStartScrollTopRef.current +
              scrollDelta
          )
        );

      descTargetScrollTopRef.current =
        nextScroll;

      el.scrollTop =
        nextScroll;

      updateDescScrollY();
    };

    const handleDescScrollbarPointerUp = (
      e: React.PointerEvent<HTMLImageElement>
    ) => {
      setIsDraggingDescScrollbar(false);

      try {
        e.currentTarget.releasePointerCapture(
          e.pointerId
        );
      } catch {
        // Pointer capture may already
        // have been released.
      }
    };

    const handleDescScrollbarTrackClick = (
      e: React.MouseEvent<HTMLDivElement>
    ) => {
      const el = eventDescRef.current;

      const track = e.currentTarget;

      if (!el) return;

      const maxScroll =
        el.scrollHeight - el.clientHeight;

      if (maxScroll <= 0) return;

      const rect =
        track.getBoundingClientRect();

      const clickY =
        e.clientY - rect.top;

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            clickY / rect.height
          )
        );

      descTargetScrollTopRef.current =
        progress * maxScroll;

      startDescSmoothScroll();
    };

    /* ========================================= */
    /* DESCRIPTION — RESET + RESIZE              */
    /*                                           */
    /* The box grows and shrinks with the book,  */
    /* so the wheel's position has to be         */
    /* recomputed after a resize as well as      */
    /* after an event change.                    */
    /* ========================================= */

    useEffect(() => {
      const el = eventDescRef.current;

      if (!el) return;

      if (
        descScrollAnimationRef.current !== null
      ) {
        cancelAnimationFrame(
          descScrollAnimationRef.current
        );

        descScrollAnimationRef.current = null;
      }

      el.scrollTop = 0;

      descTargetScrollTopRef.current = 0;

      updateDescScrollY();
    }, [activeEvent, bookBox]);

    useEffect(() => {
      const handleDescResize = () => {
        const el = eventDescRef.current;

        if (!el) return;

        descTargetScrollTopRef.current =
          el.scrollTop;

        updateDescScrollY();
      };

      window.addEventListener(
        "resize",
        handleDescResize
      );

      return () => {
        window.removeEventListener(
          "resize",
          handleDescResize
        );

        if (
          descScrollAnimationRef.current !== null
        ) {
          cancelAnimationFrame(
            descScrollAnimationRef.current
          );

          descScrollAnimationRef.current = null;
        }
      };
    }, []);

    /* ========================================= */
    /* KEEP ACTIVE EVENT VALID AFTER SEARCH      */
    /* ========================================= */

    useEffect(() => {
      if (filteredEvents.length === 0) {
        setActiveEvent(null);
        return;
      }

      if (
        !activeEvent ||
        !filteredEvents.some(
          (event) =>
            event.id === activeEvent.id
        )
      ) {
        setActiveEvent(
          filteredEvents[0]
        );
      }
    }, [search, events]);

    /* ========================================= */
    /* SYNC RIGHT PAGE -> LEFT PAGE              */
    /*                                           */
    /* Desktop only: on mobile the right page    */
    /* isn't rendered, so there's nothing to     */
    /* sync from, and the auto-scroll would      */
    /* fight the user's own scrolling.           */
    /* ========================================= */

    useEffect(() => {
      if (isMobile) return;

      if (!activeEvent) return;

      const activeButton =
        eventItemRefs.current[
          activeEvent.id
        ];

      if (!activeButton) return;

      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, [activeEvent, isMobile]);

    /* ========================================= */
    /* SELECT / REMOVE EVENT                     */
    /* ========================================= */

    const handleEvent = (
      event: Event | null
    ) => {
      if (!event) return;

      setSelectedEvents((previous) => {
        const alreadySelected =
          previous.some(
            (item) =>
              item.id === event.id
          );

        const updatedEvents =
          alreadySelected
            ? previous.filter(
                (item) =>
                  item.id !== event.id
              )
            : [
                ...previous,
                {
                  id: event.id,
                  name: event.name,
                },
              ];

        sessionStorage.setItem(
          "selectedEvents",
          JSON.stringify(
            updatedEvents
          )
        );

        return updatedEvents;
      });

      setActiveEvent(event);
    };

    /* ========================================= */
    /* SHOW EVENT — MOBILE                      */
    /* ========================================= */

    const showEvent = (
      event: Event
    ) => {
      setActiveEvent(event);

      if (isMobile) {
        setEventsModal(true);
      }
    };

    /* ========================================= */
    /* EVENT ITEM CLICK                         */
    /* ========================================= */

    const handleEventItemClick = (
      event: Event
    ) => {
      if (isMobile) {
        /*
         * Mobile:
         * Open details modal.
         */
        showEvent(event);
      } else {
        /*
         * Desktop:
         * Select / remove directly.
         */
        handleEvent(event);
      }
    };

    /* ========================================= */
    /* NEXT EVENT                               */
    /* ========================================= */

    const goToNextEvent = () => {
      if (
        !activeEvent ||
        filteredEvents.length === 0
      ) {
        return;
      }

      const currentEventIndex =
        filteredEvents.findIndex(
          (event) =>
            event.id ===
            activeEvent.id
        );

      const nextIndex =
        (currentEventIndex + 1) %
        filteredEvents.length;

      /*
       * This automatically triggers
       * the useEffect above, which:
       *
       * 1. changes the right page
       * 2. activates the left event
       * 3. scrolls the left event into view
       */
      setActiveEvent(
        filteredEvents[nextIndex]
      );
    };

    /* ========================================= */
    /* PREVIOUS EVENT                           */
    /* ========================================= */

    const goToPreviousEvent = () => {
      if (
        !activeEvent ||
        filteredEvents.length === 0
      ) {
        return;
      }

      const currentEventIndex =
        filteredEvents.findIndex(
          (event) =>
            event.id ===
            activeEvent.id
        );

      const previousIndex =
        (currentEventIndex -
          1 +
          filteredEvents.length) %
        filteredEvents.length;

      setActiveEvent(
        filteredEvents[
          previousIndex
        ]
      );
    };

    /* ========================================= */
    /* GO TO PAGE                               */
    /* ========================================= */

    const goToPage = (
      index: number
    ) => {
      if (
        filteredEvents.length === 0 ||
        index < 0 ||
        index >= filteredEvents.length
      ) {
        return;
      }

      setActiveEvent(
        filteredEvents[index]
      );
    };

    /* ========================================= */
    /* CURRENT PAGE                             */
    /* ========================================= */

    const currentIndex =
      activeEvent
        ? filteredEvents.findIndex(
            (event) =>
              event.id ===
              activeEvent.id
          )
        : -1;

    const pageOffsets = [
      -1,
      0,
      1,
    ];

    /* ========================================= */
    /* SUBMIT / CONFIRM                         */
    /* ========================================= */

    const handleSubmit = () => {
      if (
        selectedEvents.length === 0
      ) {
        return;
      }

      if (setUserData) {
        setUserData(
          (previousData: any) => ({
            ...previousData,
            events:
              selectedEvents.map(
                (event) =>
                  event.id
              ),
          })
        );
      }

      setConfirmModal(true);
    };

    /* ========================================= */
    /* CONTAINER STYLE                          */
    /*                                           */
    /* --book-w / --book-h drive the book art,   */
    /* the content overlay, both page columns,   */
    /* and every font size and control size      */
    /* inside them.                              */
    /* ========================================= */

    const containerStyle = {
      backgroundImage: `url(${RegBg})`,

      ...(bookBox
        ? {
            "--book-w": `${bookBox.width}px`,
            "--book-h": `${bookBox.height}px`,
          }
        : {}),
    } as React.CSSProperties;

    /* ========================================= */
    /* RENDER                                   */
    /* ========================================= */

    return (
      <>
        <div
          ref={ref}
          className={
            styles.eventsContainer
          }
          style={containerStyle}
        >
          {/* ================================= */}
          {/* CORNER DECORATIONS                  */}
          {/* ================================= */}

          <img
            src={leftbottom}
            className={
              styles.leftbottom
            }
            alt=""
          />

          <img
            src={lefttop}
            className={
              styles.lefttop
            }
            alt=""
          />

          <img
            src={rightbottom}
            className={
              styles.rightbottom
            }
            alt=""
          />

          <img
            src={righttop}
            className={
              styles.righttop
            }
            alt=""
          />

          <img
           src={rightmid}
           className={styles.rightmid}
           alt=""
          />

          <button
            type="button"
            onClick={onClickBack}
            className={styles.backButton}
            aria-label="Go back to Registration"
          >
            <img src="/regBackButton.png" alt="" />
          </button>

          {/* ================================= */}
          {/* BOOK FRAME                         */}
          {/* ================================= */}

          <div
            className={
              styles.bookFrame
            }
          >
            {/* BOOK */}

            <div
              className={
                styles.bookContainer
              }
              style={{
                backgroundImage: `url(${book})`,
              }}
            />

            {/* CONTENT — same rectangle as the book */}

            <div
              className={
                styles.content
              }
            >
              <div
                className={
                  styles.eventsArea
                }
              >
                {/* ================================= */}
                {/* LEFT PAGE                         */}
                {/* ================================= */}

                <div
                  className={
                    styles.eventsPage
                  }
                >
                  <h1
                    className={
                      styles.chooseEventsHeading
                    }
                  >
                    Choose Events
                  </h1>

                  {/* SEARCH */}

                  <div
                    className={
                      styles.searchContainer
                    }
                    style={{
                      backgroundImage: `url(${searchBg})`,
                    }}
                  >
                    <input
                      id="event-search"
                      name="event-search"
                      type="text"
                      placeholder="SEARCH EVENTS"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      autoComplete="off"
                    />
                  </div>

                  {/* EVENTS LIST */}

                  {loading ? (
                    <div
                      className={
                        styles.message
                      }
                    >
                      LOADING EVENTS...
                    </div>
                  ) : filteredEvents.length >
                  0 ? (
                    <div
                      className={
                        styles.eventsScrollArea
                      }
                      onWheel={
                        handleEventsWheel
                      }
                    >
                      <div
                        ref={
                          eventsListRef
                        }
                        className={
                          styles.eventsList
                        }
                      >
                        {filteredEvents.map(
                          (event) => {
                            const selected =
                              selectedEvents.some(
                                (item) =>
                                  item.id ===
                                  event.id
                              );

                            const active =
                              activeEvent?.id ===
                              event.id;

                            return (
                              <button
                                key={
                                  event.id
                                }

                                /*
                                 * Store the DOM
                                 * element for this event.
                                 */
                                ref={(el) => {
                                  eventItemRefs.current[
                                    event.id
                                  ] = el;
                                }}

                                type="button"

                                className={`
                                  ${styles.eventItem}
                                  ${
                                    selected
                                      ? styles.selected
                                      : ""
                                  }
                                  ${
                                    active &&
                                    !isMobile
                                      ? styles.active
                                      : ""
                                  }
                                `}

                                style={{
                                  backgroundImage: `url(${bg})`,
                                }}

                                /*
                                 * Hovering on the LEFT page
                                 * changes the RIGHT page.
                                 * Skipped on mobile, where
                                 * there is no right page and
                                 * touch fires a phantom hover.
                                 */
                                onMouseEnter={
                                  isMobile
                                    ? undefined
                                    : () =>
                                        setActiveEvent(
                                          event
                                        )
                                }

                                onFocus={
                                  isMobile
                                    ? undefined
                                    : () =>
                                        setActiveEvent(
                                          event
                                        )
                                }

                                onClick={() =>
                                  handleEventItemClick(
                                    event
                                  )
                                }
                              >
                                <span>
                                  {event.name}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>

                      {/* ================================= */}
                      {/* CUSTOM SCROLLBAR                   */}
                      {/* ================================= */}

                      <div
                        className={
                          styles.customScrollbar
                        }
                        onMouseDown={
                          handleScrollbarTrackClick
                        }
                      >
                        <img
                          src={line}
                          className={
                            styles.scrollbarLine
                          }
                          alt=""
                          draggable={false}
                        />

                        <img
                          src={wheel}
                          className={`
                            ${styles.scrollbarWheel}
                            ${
                              isDraggingScrollbar
                                ? styles.scrollbarWheelDragging
                                : ""
                            }
                          `}
                          style={{
                            top: `${scrollY * 100}%`,
                          }}
                          alt="Scroll"
                          draggable={false}
                          onPointerDown={
                            handleScrollbarPointerDown
                          }
                          onPointerMove={
                            handleScrollbarPointerMove
                          }
                          onPointerUp={
                            handleScrollbarPointerUp
                          }
                          onPointerCancel={
                            handleScrollbarPointerUp
                          }
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={
                        styles.message
                      }
                    >
                      NO EVENTS FOUND
                    </div>
                  )}

                  {/* ================================= */}
                  {/* CONFIRM — MOBILE ONLY              */}
                  {/*                                    */}
                  {/* On mobile the right page isn't     */}
                  {/* rendered, so CONFIRM lives here as */}
                  {/* a normal flow sibling below the    */}
                  {/* list — exactly like the original.  */}
                  {/* ================================= */}

                  {isMobile && (
                    <button
                      type="button"
                      className={
                        styles.confirmButton
                      }
                      onClick={
                        handleSubmit
                      }
                      disabled={
                        selectedEvents.length ===
                        0
                      }
                    >
                      CONFIRM
                    </button>
                  )}
                </div>

                {/* ================================= */}
                {/* RIGHT PAGE — DESKTOP ONLY          */}
                {/* ================================= */}

                {!isMobile && (
                  <div
                    className={
                      styles.infoPage
                    }
                  >
                    <div
                      className={
                        styles.rightOuter
                      }
                    >
                      <h1
                        className={
                          styles.eventHeading
                        }
                      >
                        Event Title
                      </h1>

                      {activeEvent ? (
                        <div
                          className={
                            styles.eventInfo
                          }
                        >
                          {/* EVENT CONTENT */}

                          <div
                            className={
                              styles.eventContent
                            }
                          >
                            <h2
                              className={
                                styles.eventTitle
                              }
                            >
                              {
                                activeEvent.name
                              }
                            </h2>

                            {/* ================================= */}
                            {/* DESCRIPTION                        */}
                            {/*                                    */}
                            {/* Fills the space left between the   */}
                            {/* title and the controls, and        */}
                            {/* scrolls with the same line + wheel */}
                            {/* as the left page.                  */}
                            {/* ================================= */}

                            <div
                              className={
                                styles.eventDescriptionArea
                              }
                              onWheel={
                                handleDescWheel
                              }
                            >
                              <p
                                ref={eventDescRef}
                                className={
                                  styles.eventDescription
                                }
                              >
                                {
                                  activeEvent.about
                                }
                              </p>

                              <div
                                className={
                                  styles.customScrollbar
                                }
                                onMouseDown={
                                  handleDescScrollbarTrackClick
                                }
                              >
                                <img
                                  src={line}
                                  className={
                                    styles.scrollbarLine
                                  }
                                  alt=""
                                  draggable={false}
                                />

                                <img
                                  src={wheel}
                                  className={`
                                    ${styles.scrollbarWheel}
                                    ${
                                      isDraggingDescScrollbar
                                        ? styles.scrollbarWheelDragging
                                        : ""
                                    }
                                  `}
                                  style={{
                                    top: `${descScrollY * 100}%`,
                                  }}
                                  alt="Scroll"
                                  draggable={false}
                                  onPointerDown={
                                    handleDescScrollbarPointerDown
                                  }
                                  onPointerMove={
                                    handleDescScrollbarPointerMove
                                  }
                                  onPointerUp={
                                    handleDescScrollbarPointerUp
                                  }
                                  onPointerCancel={
                                    handleDescScrollbarPointerUp
                                  }
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          {/* CONTROLS */}

                          <div
                            className={
                              styles.eventControls
                            }
                          >
                            {/* ADD / REMOVE */}

                            <button
                              type="button"
                              className={
                                styles.eventActionButton
                              }
                              style={{
                                backgroundImage: `url(${btn})`,
                              }}
                              onClick={() =>
                                handleEvent(
                                  activeEvent
                                )
                              }
                            >
                              {selectedEvents.some(
                                (event) =>
                                  event.id ===
                                  activeEvent.id
                              )
                                ? "REMOVE"
                                : "ADD"}
                            </button>

                            {/* NAVIGATION */}

                            <div
                              className={
                                styles.eventNavigation
                              }
                            >
                              {/* PREVIOUS */}

                              <button
                                type="button"
                                onClick={
                                  goToPreviousEvent
                                }
                                aria-label="Previous event"
                                className={
                                  styles.navArrow
                                }
                              >
                                ‹
                              </button>

                              {/* PAGE NUMBERS */}

                              <div
                                className={
                                  styles.pageNumbers
                                }
                              >
                                {filteredEvents.length <=
                                3
                                  ? filteredEvents.map(
                                      (
                                        event,
                                        index
                                      ) => (
                                        <button
                                          key={
                                            event.id
                                          }
                                          type="button"
                                          className={`
                                            ${styles.pageNumber}
                                            ${
                                              index ===
                                              currentIndex
                                                ? styles.currentPage
                                                : ""
                                            }
                                          `}
                                          onClick={() =>
                                            goToPage(
                                              index
                                            )
                                          }
                                        >
                                          {index +
                                            1}
                                        </button>
                                      )
                                    )
                                  : pageOffsets.map(
                                      (offset) => {
                                        const pageIndex =
                                          (currentIndex +
                                            offset +
                                            filteredEvents.length) %
                                          filteredEvents.length;

                                        return (
                                          <button
                                            key={
                                              offset
                                            }
                                            type="button"
                                            className={`
                                              ${styles.pageNumber}
                                              ${
                                                offset ===
                                                0
                                                  ? styles.currentPage
                                                  : ""
                                              }
                                            `}
                                            onClick={() =>
                                              goToPage(
                                                pageIndex
                                              )
                                            }
                                          >
                                            {pageIndex +
                                              1}
                                          </button>
                                        );
                                      }
                                    )}
                              </div>

                              {/* NEXT */}

                              <button
                                type="button"
                                onClick={
                                  goToNextEvent
                                }
                                aria-label="Next event"
                                className={
                                  styles.navArrow
                                }
                              >
                                ›
                              </button>
                            </div>

                            {/* CONFIRM */}

                            <button
                              type="button"
                              className={
                                styles.confirmButton
                              }
                              onClick={
                                handleSubmit
                              }
                              disabled={
                                selectedEvents.length ===
                                0
                              }
                            >
                              CONFIRM
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={
                            styles.emptyInfo
                          }
                        >
                          <p>
                            HOVER OVER AN EVENT
                            <br />
                            TO VIEW DETAILS
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =================================== */}
        {/* CONFIRMATION MODAL                  */}
        {/* =================================== */}

        {confirmModal && (
          <ConfirmModal
            onCancel={() =>
              setConfirmModal(false)
            }
            selectedEvents={
              selectedEvents
            }
            userData={userData}
          />
        )}

        {/* =================================== */}
        {/* EVENT DETAILS MODAL — MOBILE       */}
        {/* =================================== */}

        {isMobile && eventsModal && (
          <EventsModal
            handleEvent={() =>
              handleEvent(
                activeEvent
              )
            }
            eventData={activeEvent}
            closeModal={() =>
              setEventsModal(false)
            }
            selectedEvents={
              selectedEvents
            }
          />
        )}
      </>
    );
  }
);

Events.displayName = "Events";

export default Events;  