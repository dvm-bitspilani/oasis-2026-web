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

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
} from "react";

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
}

/* ========================================= */
/* TEST DATA                                 */
/* ========================================= */

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
      useState<Event | null>(
        TEST_EVENTS[0] || null
      );

    /* ========================================= */
    /* MODALS                                    */
    /* ========================================= */

    const [confirmModal, setConfirmModal] =
      useState(false);

    const [eventsModal, setEventsModal] =
      useState(false);

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

      const wheel =
        e.currentTarget;

      if (!list || !track) return;

      const trackHeight =
        track.clientHeight;

      const wheelHeight =
        wheel.clientHeight;

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
    /* ⭐ SYNC RIGHT PAGE -> LEFT PAGE            */
    /* ========================================= */

    useEffect(() => {
      if (!activeEvent) return;

      const activeButton =
        eventItemRefs.current[
          activeEvent.id
        ];

      if (!activeButton) return;

      /*
       * If the RIGHT page changes event,
       * find the same event on the LEFT
       * and smoothly bring it into view.
       */
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, [activeEvent]);

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

      if (
        window.innerWidth <
        MOBILE_BREAKPOINT
      ) {
        setEventsModal(true);
      }
    };

    /* ========================================= */
    /* EVENT ITEM CLICK                         */
    /* ========================================= */

    const handleEventItemClick = (
      event: Event
    ) => {
      if (
        window.innerWidth <
        MOBILE_BREAKPOINT
      ) {
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

      const currentIndex =
        filteredEvents.findIndex(
          (event) =>
            event.id ===
            activeEvent.id
        );

      const nextIndex =
        (currentIndex + 1) %
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

      const currentIndex =
        filteredEvents.findIndex(
          (event) =>
            event.id ===
            activeEvent.id
        );

      const previousIndex =
        (currentIndex -
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
    /* RENDER                                   */
    /* ========================================= */

    return (
      <>
        <div
          ref={ref}
          className={
            styles.eventsContainer
          }
          style={{
            backgroundImage: `url(${RegBg})`,
          }}
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

            {/* CONTENT */}

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

                  {filteredEvents.length >
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
                                 * ⭐ Store the DOM
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
                                    active
                                      ? styles.active
                                      : ""
                                  }
                                `}

                                style={{
                                  backgroundImage: `url(${bg})`,
                                }}

                                /*
                                 * Hovering on the
                                 * LEFT page changes
                                 * the RIGHT page.
                                 */
                                onMouseEnter={() =>
                                  setActiveEvent(
                                    event
                                  )
                                }

                                onFocus={() =>
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
                </div>

                {/* ================================= */}
                {/* RIGHT PAGE                         */}
                {/* ================================= */}

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

                          <p
                            className={
                              styles.eventDescription
                            }
                          >
                            {
                              activeEvent.about
                            }
                          </p>
                        </div>

                        {/* FIXED CONTROLS */}

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

        {eventsModal && (
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