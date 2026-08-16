// import { useEffect, useState } from "react";
// import axios from "axios";

// import styles from "./Events.module.scss";

// import ConfirmModal from "../ConfirmModal/ConfirmModal";

// import bg from "../../../../assets/registration/reg/inputBg.png";
// import btn from "../../../../assets/registration/reg/btn.png";
// import RegBg from "../../../../assets/registration/reg/RegBg.png";
// import searchBg from "../../../../assets/registration/reg/searchBg.png";

// import leftbottom from "../../../../assets/registration/reg/leftbottom.png";
// import lefttop from "../../../../assets/registration/reg/lefttop.png";
// import rightbottom from "../../../../assets/registration/reg/rightbottom.png";
// import righttop from "../../../../assets/registration/reg/righttop.png";

// import book from "../../../../assets/registration/reg/book.png";

// interface Event {
//   id: number;
//   name: string;
//   about: string;
// }

// interface EventsProps {
//   userData?: any;
//   setUserData?: React.Dispatch<React.SetStateAction<any>>;
// }

// /* ========================================= */
// /* TEST DATA                                 */
// /* ========================================= */

// const TEST_EVENTS: Event[] = [
//   {
//     id: 1,
//     name: "Battle Dance",
//     about:
//       "A high-energy dance battle where performers compete against each other and showcase their creativity, musicality and choreography.",
//   },
//   {
//     id: 2,
//     name: "Solo Dance",
//     about:
//       "A solo performance where dancers get the stage to themselves and express their unique style and personality.",
//   },
//   {
//     id: 3,
//     name: "Group Dance",
//     about:
//       "A team-based dance performance where synchronization, formations and collective creativity take center stage.",
//   },
//   {
//     id: 4,
//     name: "Classical Dance",
//     about:
//       "A celebration of classical dance forms combining traditional movements, storytelling and artistic expression.",
//   },
//   {
//     id: 5,
//     name: "Solo Singing",
//     about:
//       "A vocal performance where singers compete individually and showcase their voice, expression and musicality.",
//   },
//   {
//     id: 6,
//     name: "Battle of Bands",
//     about:
//       "Bands go head-to-head with their best performances and compete to win over the audience.",
//   },
//   {
//     id: 7,
//     name: "Instrumental",
//     about:
//       "A showcase of instrumental talent featuring musicians performing their favorite compositions.",
//   },
//   {
//     id: 8,
//     name: "Street Play",
//     about:
//       "A powerful theatrical performance designed to engage audiences through storytelling, acting and social themes.",
//   },
//   {
//     id: 9,
//     name: "Stage Play",
//     about:
//       "A traditional theatrical performance combining acting, dialogue, stagecraft and storytelling.",
//   },
//   {
//     id: 10,
//     name: "Mono Act",
//     about:
//       "A solo theatrical performance where one actor takes on the challenge of carrying the entire story.",
//   },
//   {
//     id: 11,
//     name: "Debate",
//     about:
//       "Participants present arguments, challenge opposing viewpoints and demonstrate their communication and reasoning skills.",
//   },
//   {
//     id: 12,
//     name: "Quiz",
//     about:
//       "Put your knowledge to the test with challenging questions across a wide range of topics.",
//   },
// ];

// /* ========================================= */
// /* COMPONENT                                 */
// /* ========================================= */

// export default function Events({
//   userData,
//   setUserData,
// }: EventsProps) {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [search, setSearch] = useState("");

//   const [selectedEvents, setSelectedEvents] = useState<
//     { id: number; name: string }[]
//   >([]);

//   const [activeEvent, setActiveEvent] =
//     useState<Event | null>(null);

//   const [loading, setLoading] = useState(true);

//   const [confirmModal, setConfirmModal] =
//     useState(false);

//   /* ========================================= */
//   /* FETCH EVENTS                              */
//   /* ========================================= */

//   useEffect(() => {
//     axios
//       .get<Event[]>(
//         "https://bits-oasis.org/2026/main/registrations/events_details/",
//       )
//       .then((response) => {
//         console.log(
//           "EVENT API RESPONSE:",
//           response.data,
//         );

//         if (
//           Array.isArray(response.data) &&
//           response.data.length > 0
//         ) {
//           setEvents(response.data);
//         } else {
//           setEvents(TEST_EVENTS);
//         }
//       })
//       .catch((error) => {
//         console.error(
//           "EVENT API ERROR:",
//           error,
//         );

//         setEvents(TEST_EVENTS);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   /* ========================================= */
//   /* AUTO SHOW FIRST EVENT                     */
//   /* ========================================= */

//   useEffect(() => {
//     if (!loading && events.length > 0) {
//       setActiveEvent(events[0]);
//     }
//   }, [loading, events]);

//   /* ========================================= */
//   /* SEARCH                                    */
//   /* ========================================= */

//   const filteredEvents = events.filter((event) =>
//     event.name
//       .toLowerCase()
//       .includes(search.trim().toLowerCase()),
//   );

//   /* ========================================= */
//   /* KEEP ACTIVE EVENT VALID AFTER SEARCH      */
//   /* ========================================= */

//   useEffect(() => {
//     if (filteredEvents.length === 0) {
//       setActiveEvent(null);
//       return;
//     }

//     if (
//       !activeEvent ||
//       !filteredEvents.some(
//         (event) => event.id === activeEvent.id,
//       )
//     ) {
//       setActiveEvent(filteredEvents[0]);
//     }
//   }, [search, events]);

//   /* ========================================= */
//   /* SELECT / REMOVE EVENT                     */
//   /* ========================================= */

//   const handleEvent = (event: Event) => {
//     const alreadySelected = selectedEvents.some(
//       (item) => item.id === event.id,
//     );

//     if (alreadySelected) {
//       setSelectedEvents((previous) =>
//         previous.filter(
//           (item) => item.id !== event.id,
//         ),
//       );
//     } else {
//       setSelectedEvents((previous) => [
//         ...previous,
//         {
//           id: event.id,
//           name: event.name,
//         },
//       ]);
//     }

//     setActiveEvent(event);
//   };

//   /* ========================================= */
//   /* NEXT EVENT                                */
//   /* ========================================= */

//   const goToNextEvent = () => {
//     if (
//       !activeEvent ||
//       filteredEvents.length === 0
//     ) {
//       return;
//     }

//     const currentIndex =
//       filteredEvents.findIndex(
//         (event) =>
//           event.id === activeEvent.id,
//       );

//     const nextIndex =
//       (currentIndex + 1) %
//       filteredEvents.length;

//     setActiveEvent(
//       filteredEvents[nextIndex],
//     );
//   };

//   /* ========================================= */
//   /* PREVIOUS EVENT                            */
//   /* ========================================= */

//   const goToPreviousEvent = () => {
//     if (
//       !activeEvent ||
//       filteredEvents.length === 0
//     ) {
//       return;
//     }

//     const currentIndex =
//       filteredEvents.findIndex(
//         (event) =>
//           event.id === activeEvent.id,
//       );

//     const previousIndex =
//       (currentIndex -
//         1 +
//         filteredEvents.length) %
//       filteredEvents.length;

//     setActiveEvent(
//       filteredEvents[previousIndex],
//     );
//   };

//   /* ========================================= */
//   /* GO TO PAGE                                */
//   /* ========================================= */

//   const goToPage = (index: number) => {
//     if (
//       filteredEvents.length === 0 ||
//       index < 0 ||
//       index >= filteredEvents.length
//     ) {
//       return;
//     }

//     setActiveEvent(filteredEvents[index]);
//   };

//   /* ========================================= */
//   /* CURRENT PAGE                              */
//   /* ========================================= */

//   const currentIndex = activeEvent
//     ? filteredEvents.findIndex(
//         (event) =>
//           event.id === activeEvent.id,
//       )
//     : -1;

//   const pageOffsets = [-1, 0, 1];

//   /* ========================================= */
//   /* SUBMIT / CONFIRM                         */
//   /* ========================================= */

//   const handleSubmit = () => {
//     if (selectedEvents.length === 0) {
//       return;
//     }

//     if (setUserData) {
//       setUserData((previousData: any) => ({
//         ...previousData,
//         events: selectedEvents.map(
//           (event) => event.id,
//         ),
//       }));
//     }

//     setConfirmModal(true);
//   };

//   /* ========================================= */
//   /* RENDER                                    */
//   /* ========================================= */

//   return (
//     <>
//       <div
//         className={styles.eventsContainer}
//         style={{
//           backgroundImage: `url(${RegBg})`,
//         }}
//       >
//         {/* ================================= */}
//         {/* DECORATIONS                        */}
//         {/* ================================= */}

//         <img
//           src={leftbottom}
//           className={styles.leftbottom}
//           alt=""
//         />

//         <img
//           src={lefttop}
//           className={styles.lefttop}
//           alt=""
//         />

//         <img
//           src={rightbottom}
//           className={styles.rightbottom}
//           alt=""
//         />

//         <img
//           src={righttop}
//           className={styles.righttop}
//           alt=""
//         />

//         {/* ================================= */}
//         {/* BOOK                               */}
//         {/* ================================= */}

//         <div
//           className={styles.bookContainer}
//           style={{
//             backgroundImage: `url(${book})`,
//           }}
//         />

//         {/* ================================= */}
//         {/* CONTENT                            */}
//         {/* ================================= */}

//         <div className={styles.content}>
//           <div className={styles.eventsArea}>

//             {/* ================================= */}
//             {/* LEFT PAGE                         */}
//             {/* ================================= */}

//             <div className={styles.eventsPage}>
//               <h1
//                 className={
//                   styles.chooseEventsHeading
//                 }
//               >
//                 Choose Events
//               </h1>

//               {/* SEARCH */}

//               <div
//                 className={
//                   styles.searchContainer
//                 }
//                 style={{
//                   backgroundImage: `url(${searchBg})`,
//                 }}
//               >
//                 <input
//                   id="event-search"
//                   name="event-search"
//                   type="text"
//                   placeholder="SEARCH EVENTS"
//                   value={search}
//                   onChange={(e) =>
//                     setSearch(e.target.value)
//                   }
//                   autoComplete="off"
//                 />
//               </div>

//               {/* EVENTS LIST */}

//               {loading ? (
//                 <div
//                   className={styles.message}
//                 >
//                   LOADING EVENTS...
//                 </div>
//               ) : filteredEvents.length > 0 ? (
//                 <div
//                   className={styles.eventsList}
//                 >
//                   {filteredEvents.map((event) => {
//                     const selected =
//                       selectedEvents.some(
//                         (item) =>
//                           item.id === event.id,
//                       );

//                     const active =
//                       activeEvent?.id === event.id;

//                     return (
//                       <button
//                         key={event.id}
//                         type="button"
//                         className={`${
//                           styles.eventItem
//                         } ${
//                           selected
//                             ? styles.selected
//                             : ""
//                         } ${
//                           active
//                             ? styles.active
//                             : ""
//                         }`}
//                         style={{
//                           backgroundImage: `url(${bg})`,
//                         }}
//                         onMouseEnter={() =>
//                           setActiveEvent(event)
//                         }
//                         onFocus={() =>
//                           setActiveEvent(event)
//                         }
//                         onClick={() =>
//                           handleEvent(event)
//                         }
//                       >
//                         <span>
//                           {event.name}
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div
//                   className={styles.message}
//                 >
//                   NO EVENTS FOUND
//                 </div>
//               )}
//             </div>

//             {/* ================================= */}
//             {/* RIGHT PAGE                        */}
//             {/* ================================= */}

//             <div className={styles.infoPage}>
//               <div className={styles.rightOuter}>

//                 {/* ALWAYS VISIBLE */}

//                 <h1
//                   className={
//                     styles.eventHeading
//                   }
//                 >
//                   Event Title
//                 </h1>

//                 {/* EVENT CONTENT */}

//                 {activeEvent ? (
//                   <div
//                     className={styles.eventInfo}
//                   >
//                     {/* EVENT NAME */}

//                     <h2
//                       className={
//                         styles.eventTitle
//                       }
//                     >
//                       {activeEvent.name}
//                     </h2>

//                     {/* DESCRIPTION */}

//                     <p
//                       className={
//                         styles.eventDescription
//                       }
//                     >
//                       {activeEvent.about}
//                     </p>

//                     {/* ADD / REMOVE */}

//                     <button
//                       type="button"
//                       className={
//                         styles.eventActionButton
//                       }
//                       style={{
//                         backgroundImage: `url(${btn})`,
//                       }}
//                       onClick={() =>
//                         handleEvent(activeEvent)
//                       }
//                     >
//                       {selectedEvents.some(
//                         (event) =>
//                           event.id ===
//                           activeEvent.id,
//                       )
//                         ? "REMOVE"
//                         : "ADD"}
//                     </button>

//                     {/* NAVIGATION */}

//                     <div
//                       className={
//                         styles.eventNavigation
//                       }
//                     >
//                       <button
//                         type="button"
//                         onClick={
//                           goToPreviousEvent
//                         }
//                         aria-label="Previous event"
//                         className={
//                           styles.navArrow
//                         }
//                       >
//                         ‹
//                       </button>

//                       <div
//                         className={
//                           styles.pageNumbers
//                         }
//                       >
//                         {filteredEvents.length <=
//                         3 ? (
//                           filteredEvents.map(
//                             (event, index) => (
//                               <button
//                                 key={event.id}
//                                 type="button"
//                                 className={`${
//                                   styles.pageNumber
//                                 } ${
//                                   index ===
//                                   currentIndex
//                                     ? styles.currentPage
//                                     : ""
//                                 }`}
//                                 onClick={() =>
//                                   goToPage(
//                                     index,
//                                   )
//                                 }
//                               >
//                                 {index + 1}
//                               </button>
//                             ),
//                           )
//                         ) : (
//                           pageOffsets.map(
//                             (offset) => {
//                               const pageIndex =
//                                 (currentIndex +
//                                   offset +
//                                   filteredEvents.length) %
//                                 filteredEvents.length;

//                               return (
//                                 <button
//                                   key={offset}
//                                   type="button"
//                                   className={`${
//                                     styles.pageNumber
//                                   } ${
//                                     offset === 0
//                                       ? styles.currentPage
//                                       : ""
//                                   }`}
//                                   onClick={() =>
//                                     goToPage(
//                                       pageIndex,
//                                     )
//                                   }
//                                 >
//                                   {pageIndex + 1}
//                                 </button>
//                               );
//                             },
//                           )
//                         )}
//                       </div>

//                       <button
//                         type="button"
//                         onClick={goToNextEvent}
//                         aria-label="Next event"
//                         className={
//                           styles.navArrow
//                         }
//                       >
//                         ›
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div
//                     className={
//                       styles.emptyInfo
//                     }
//                   >
//                     <p>
//                       HOVER OVER AN EVENT
//                       <br />
//                       TO VIEW DETAILS
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ================================= */}
//         {/* CONFIRM BUTTON                     */}
//         {/* ================================= */}

//         <button
//           type="button"
//           className={styles.confirmButton}
//           onClick={handleSubmit}
//           disabled={selectedEvents.length === 0}
//         >
//           CONFIRM
//         </button>
//       </div>

//       {/* =================================== */}
//       {/* CONFIRMATION MODAL                  */}
//       {/* =================================== */}

//       {confirmModal && (
//         <ConfirmModal
//           onCancel={() =>
//             setConfirmModal(false)
//           }
//           selectedEvents={selectedEvents}
//           userData={userData}
//         />
//       )}
//     </>
//   );
// }


import { useEffect, useState, forwardRef } from "react";

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

import book from "../../../../assets/registration/reg/book.png";

interface Event {
  id: number;
  name: string;
  about: string;
}

interface EventsProps {
  userData?: any;
  setUserData?: React.Dispatch<React.SetStateAction<any>>;
}

const TEST_EVENTS: Event[] = [
  {
    id: 1,
    name: "Battle Dance",
    about:
      "A high-energy dance battle where performers compete against each other and showcase their creativity, musicality and choreography.",
  },
  {
    id: 2,
    name: "Solo Dance",
    about:
      "A solo performance where dancers get the stage to themselves and express their unique style and personality.",
  },
  {
    id: 3,
    name: "Group Dance",
    about:
      "A team-based dance performance where synchronization, formations and collective creativity take center stage.",
  },
  {
    id: 4,
    name: "Classical Dance",
    about:
      "A celebration of classical dance forms combining traditional movements, storytelling and artistic expression.",
  },
  {
    id: 5,
    name: "Solo Singing",
    about:
      "A vocal performance where singers compete individually and showcase their voice, expression and musicality.",
  },
  {
    id: 6,
    name: "Battle of Bands",
    about:
      "Bands go head-to-head with their best performances and compete to win over the audience.",
  },
  {
    id: 7,
    name: "Instrumental",
    about:
      "A showcase of instrumental talent featuring musicians performing their favorite compositions.",
  },
  {
    id: 8,
    name: "Street Play",
    about:
      "A powerful theatrical performance designed to engage audiences through storytelling, acting and social themes.",
  },
  {
    id: 9,
    name: "Stage Play",
    about:
      "A traditional theatrical performance combining acting, dialogue, stagecraft and storytelling.",
  },
  {
    id: 10,
    name: "Mono Act",
    about:
      "A solo theatrical performance where one actor takes on the challenge of carrying the entire story.",
  },
  {
    id: 11,
    name: "Debate",
    about:
      "Participants present arguments, challenge opposing viewpoints and demonstrate their communication and reasoning skills.",
  },
  {
    id: 12,
    name: "Quiz",
    about:
      "Put your knowledge to the test with challenging questions across a wide range of topics.",
  },
];

/* ========================================= */
/* MOBILE BREAKPOINT                         */
/* ========================================= */

const MOBILE_BREAKPOINT = 900;

/* ========================================= */
/* COMPONENT                                 */
/* ========================================= */

const Events = forwardRef<HTMLDivElement, EventsProps>(
  ({ userData, setUserData }, ref) => {
    const [events] = useState<Event[]>(TEST_EVENTS);

    const [search, setSearch] = useState("");

    const [selectedEvents, setSelectedEvents] = useState<
      { id: number; name: string }[]
    >(() => {
      try {
        return JSON.parse(
          sessionStorage.getItem("selectedEvents") || "[]"
        );
      } catch {
        return [];
      }
    });

    const [activeEvent, setActiveEvent] = useState<Event | null>(
      TEST_EVENTS[0] || null
    );

    const [confirmModal, setConfirmModal] = useState(false);

    /*
      Event details modal.
      On mobile (<900px) this is now the primary way of viewing
      an event, since there's no room for the right page. On
      desktop it stays unused (hover fills the right page instead).
    */
    const [eventsModal, setEventsModal] = useState(false);

    const filteredEvents = events.filter((event) =>
      event.name
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );

    useEffect(() => {
      if (filteredEvents.length === 0) {
        setActiveEvent(null);
        return;
      }

      if (
        !activeEvent ||
        !filteredEvents.some(
          (event) => event.id === activeEvent.id
        )
      ) {
        setActiveEvent(filteredEvents[0]);
      }
    }, [search, events]);

    const handleEvent = (event: Event | null) => {
      if (!event) return;

      setSelectedEvents((previous) => {
        const alreadySelected = previous.some(
          (item) => item.id === event.id
        );

        const updatedEvents = alreadySelected
          ? previous.filter((item) => item.id !== event.id)
          : [
              ...previous,
              {
                id: event.id,
                name: event.name,
              },
            ];

        sessionStorage.setItem(
          "selectedEvents",
          JSON.stringify(updatedEvents)
        );

        return updatedEvents;
      });

      setActiveEvent(event);
    };

    /* ========================================= */
    /* SHOW EVENT (opens modal on mobile)        */
    /* ========================================= */

    const showEvent = (event: Event) => {
      setActiveEvent(event);

      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setEventsModal(true);
      }
    };

    /* ========================================= */
    /* EVENT ITEM CLICK (mobile vs desktop)      */
    /* ========================================= */

    const handleEventItemClick = (event: Event) => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        // Mobile: tapping an event opens the details modal.
        // Selecting/deselecting happens from inside the modal.
        showEvent(event);
      } else {
        // Desktop: click toggles selection directly,
        // hover already fills the right page with details.
        handleEvent(event);
      }
    };

    /* ========================================= */
    /* NEXT EVENT                                */
    /* ========================================= */

    const goToNextEvent = () => {
      if (!activeEvent || filteredEvents.length === 0) {
        return;
      }

      const currentIndex = filteredEvents.findIndex(
        (event) => event.id === activeEvent.id
      );

      const nextIndex =
        (currentIndex + 1) % filteredEvents.length;

      setActiveEvent(filteredEvents[nextIndex]);
    };

    const goToPreviousEvent = () => {
      if (!activeEvent || filteredEvents.length === 0) {
        return;
      }

      const currentIndex = filteredEvents.findIndex(
        (event) => event.id === activeEvent.id
      );

      const previousIndex =
        (currentIndex - 1 + filteredEvents.length) %
        filteredEvents.length;

      setActiveEvent(filteredEvents[previousIndex]);
    };

    const goToPage = (index: number) => {
      if (
        filteredEvents.length === 0 ||
        index < 0 ||
        index >= filteredEvents.length
      ) {
        return;
      }

      setActiveEvent(filteredEvents[index]);
    };

    const currentIndex = activeEvent
      ? filteredEvents.findIndex(
          (event) => event.id === activeEvent.id
        )
      : -1;

    const pageOffsets = [-1, 0, 1];

    const handleSubmit = () => {
      if (selectedEvents.length === 0) {
        return;
      }

      if (setUserData) {
        setUserData((previousData: any) => ({
          ...previousData,
          events: selectedEvents.map(
            (event) => event.id
          ),
        }));
      }

      setConfirmModal(true);
    };

    return (
      <>
        <div
          ref={ref}
          className={styles.eventsContainer}
          style={{
            backgroundImage: `url(${RegBg})`,
          }}
        >
          {/* CORNER DECORATIONS */}

          <img
            src={leftbottom}
            className={styles.leftbottom}
            alt=""
          />

          <img
            src={lefttop}
            className={styles.lefttop}
            alt=""
          />

          <img
            src={rightbottom}
            className={styles.rightbottom}
            alt=""
          />

          <img
            src={righttop}
            className={styles.righttop}
            alt=""
          />

          {/* ================================= */}
          {/* BOOK FRAME                         */}
          {/* Wraps the book art + content so    */}
          {/* mobile can position content        */}
          {/* directly on top of the book pages. */}
          {/* On desktop this is a no-op         */}
          {/* (display: contents).               */}
          {/* ================================= */}

          <div className={styles.bookFrame}>

          {/* ================================= */}
          {/* BOOK                               */}
          {/* ================================= */}

          <div
            className={styles.bookContainer}
            style={{
              backgroundImage: `url(${book})`,
            }}
          />

          {/* CONTENT */}

          <div className={styles.content}>
            <div className={styles.eventsArea}>

              {/* LEFT PAGE */}

              <div className={styles.eventsPage}>
                <h1 className={styles.chooseEventsHeading}>
                  Choose Events
                </h1>

                {/* SEARCH */}

                <div
                  className={styles.searchContainer}
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
                      setSearch(e.target.value)
                    }
                    autoComplete="off"
                  />
                </div>

                {/* EVENTS LIST */}

                {filteredEvents.length > 0 ? (
                  <div className={styles.eventsList}>
                    {filteredEvents.map((event) => {
                      const selected =
                        selectedEvents.some(
                          (item) => item.id === event.id
                        );

                      const active =
                        activeEvent?.id === event.id;

                      return (
                        <button
                          key={event.id}
                          type="button"
                          className={`${styles.eventItem} ${
                            selected
                              ? styles.selected
                              : ""
                          } ${
                            active
                              ? styles.active
                              : ""
                          }`}
                          style={{
                            backgroundImage: `url(${bg})`,
                          }}
                          onMouseEnter={() =>
                            setActiveEvent(event)
                          }
                          onFocus={() =>
                            setActiveEvent(event)
                          }
                          onClick={() =>
                            handleEventItemClick(event)
                          }
                        >
                          <span>
                            {event.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.message}>
                    NO EVENTS FOUND
                  </div>
                )}

                {/* ================================= */}
                {/* CONFIRM BUTTON                     */}
                {/* Lives here (after the list) so on  */}
                {/* mobile it's a normal flex-flow     */}
                {/* sibling of the scrollable list —   */}
                {/* it can never overlap the list, and */}
                {/* stays outside the scrolling area.  */}
                {/* Desktop position is unaffected     */}
                {/* (still absolute, still resolves    */}
                {/* against .content — see SCSS).      */}
                {/* ================================= */}

                <button
                  type="button"
                  className={styles.confirmButton}
                  onClick={handleSubmit}
                  disabled={selectedEvents.length === 0}
                >
                  CONFIRM
                </button>
              </div>

              {/* ================================= */}
              {/* RIGHT PAGE (hidden on mobile,      */}
              {/* peeks as a sliver behind the spine)*/}
              {/* ================================= */}

              <div className={styles.infoPage}>
                <div className={styles.rightOuter}>

                  <h1 className={styles.eventHeading}>
                    Event Title
                  </h1>

                  {activeEvent ? (
                    <div className={styles.eventInfo}>

                      {/* EVENT CONTENT */}

                      <div className={styles.eventContent}>
                        <h2 className={styles.eventTitle}>
                          {activeEvent.name}
                        </h2>

                        <p className={styles.eventDescription}>
                          {activeEvent.about}
                        </p>
                      </div>

                      {/* FIXED CONTROLS */}

                      <div className={styles.eventControls}>

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
                            handleEvent(activeEvent)
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

                          <div
                            className={
                              styles.pageNumbers
                            }
                          >
                            {filteredEvents.length <= 3
                              ? filteredEvents.map(
                                  (event, index) => (
                                    <button
                                      key={event.id}
                                      type="button"
                                      className={`${
                                        styles.pageNumber
                                      } ${
                                        index ===
                                        currentIndex
                                          ? styles.currentPage
                                          : ""
                                      }`}
                                      onClick={() =>
                                        goToPage(index)
                                      }
                                    >
                                      {index + 1}
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
                                        key={offset}
                                        type="button"
                                        className={`${
                                          styles.pageNumber
                                        } ${
                                          offset === 0
                                            ? styles.currentPage
                                            : ""
                                        }`}
                                        onClick={() =>
                                          goToPage(
                                            pageIndex
                                          )
                                        }
                                      >
                                        {pageIndex + 1}
                                      </button>
                                    );
                                  }
                                )}
                          </div>

                          <button
                            type="button"
                            onClick={goToNextEvent}
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
                          onClick={handleSubmit}
                          disabled={
                            selectedEvents.length === 0
                          }
                        >
                          CONFIRM
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyInfo}>
                      <p>
                        HOVER OVER AN EVENT
                        <br />
                        TO VIEW DETAILS
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
          </div>
        </div>

        {/* FINAL CONFIRMATION MODAL */}

        {confirmModal && (
          <ConfirmModal
            onCancel={() =>
              setConfirmModal(false)
            }
            selectedEvents={selectedEvents}
            userData={userData}
          />
        )}

        {/* =================================== */}
        {/* EVENT DETAILS MODAL (mobile)         */}
        {/* =================================== */}

        {eventsModal && (
          <EventsModal
            handleEvent={() =>
              handleEvent(activeEvent)
            }
            eventData={activeEvent}
            closeModal={() =>
              setEventsModal(false)
            }
            selectedEvents={selectedEvents}
          />
        )}
      </>
    );
  }
);

Events.displayName = "Events";

export default Events;