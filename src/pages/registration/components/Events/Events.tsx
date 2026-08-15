import { useEffect, useState } from "react";
import axios from "axios";

import styles from "./Events.module.scss";

import ConfirmModal from "../ConfirmModal/ConfirmModal";

import RegBg from "../../../../assets/registration/reg/RegBg.png";
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

export default function Events({
  userData,
  setUserData,
}: EventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");

  const [selectedEvents, setSelectedEvents] = useState<
    { id: number; name: string }[]
  >([]);

  const [activeEvent, setActiveEvent] =
    useState<Event | null>(null);

  const [confirmModal, setConfirmModal] =
    useState(false);

  const [loading, setLoading] = useState(true);

  /* ========================================= */
  /* FETCH EVENTS                              */
  /* ========================================= */

  useEffect(() => {
    axios
      .get<Event[]>(
        "https://bits-oasis.org/2026/main/registrations/events_details/",
      )
      .then((response) => {
        console.log("EVENT API RESPONSE:", response.data);
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("EVENT API ERROR:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* ========================================= */
  /* SEARCH                                    */
  /* ========================================= */

  const filteredEvents = events.filter((event) =>
    event.name
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  /* ========================================= */
  /* SELECT EVENT                              */
  /* ========================================= */

  const handleEvent = (event: Event) => {
    const alreadySelected = selectedEvents.some(
      (item) => item.id === event.id,
    );

    if (alreadySelected) {
      setSelectedEvents((previous) =>
        previous.filter(
          (item) => item.id !== event.id,
        ),
      );
    } else {
      setSelectedEvents((previous) => [
        ...previous,
        {
          id: event.id,
          name: event.name,
        },
      ]);
    }
  };

  /* ========================================= */
  /* SUBMIT                                    */
  /* ========================================= */

  const handleSubmit = () => {
    if (selectedEvents.length === 0) {
      return;
    }

    if (setUserData) {
      setUserData((previousData: any) => ({
        ...previousData,
        events: selectedEvents.map(
          (event) => event.id,
        ),
      }));
    }

    setConfirmModal(true);
  };

  return (
    <>
      <div
        className={styles.eventsContainer}
        style={{
          backgroundImage: `url(${RegBg})`,
        }}
      >
        {/* ================================= */}
        {/* REGISTER DECORATION                */}
        {/* ================================= */}

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
        {/* BOOK                              */}
        {/* ================================= */}

        <div
          className={styles.bookContainer}
          style={{
            backgroundImage: `url(${book})`,
          }}
        />

        {/* ================================= */}
        {/* CONTENT                           */}
        {/* ================================= */}

        <div className={styles.content}>

          {/* TITLE */}
          <div className={styles.titleRow}>
            <span className={styles.titleGlow} />
            <h1>CHOOSE EVENTS</h1>
            <span className={styles.titleGlow} />
          </div>

          {/* ================================= */}
          {/* SEARCH                            */}
          {/* ================================= */}

          <div className={styles.searchContainer}>
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

          {/* ================================= */}
          {/* EVENTS                            */}
          {/* ================================= */}

          <div className={styles.eventsArea}>

            {/* LEFT PAGE */}
            <div className={styles.eventsPage}>

              {loading ? (
                <div className={styles.message}>
                  LOADING EVENTS...
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className={styles.eventsList}>
                  {filteredEvents.map((event) => {
                    const selected =
                      selectedEvents.some(
                        (item) =>
                          item.id === event.id,
                      );

                    return (
                      <button
                        key={event.id}
                        type="button"
                        className={`${styles.eventItem} ${
                          selected
                            ? styles.selected
                            : ""
                        }`}
                        onMouseEnter={() =>
                          setActiveEvent(event)
                        }
                        onFocus={() =>
                          setActiveEvent(event)
                        }
                        onClick={() =>
                          handleEvent(event)
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

              {/* SELECTED COUNT */}

              <div className={styles.selectedCount}>
                {selectedEvents.length} EVENTS SELECTED
              </div>

            </div>

            {/* RIGHT PAGE */}
            <div
              className={styles.infoPage}
              onMouseLeave={() =>
                setActiveEvent(null)
              }
            >

              {activeEvent ? (
                <div className={styles.eventInfo}>

                  <div className={styles.eventCategory}>
                    EVENT
                  </div>

                  <h2>
                    {activeEvent.name}
                  </h2>

                  <p>
                    {activeEvent.about}
                  </p>

                  <button
                    type="button"
                    className={
                      selectedEvents.some(
                        (event) =>
                          event.id ===
                          activeEvent.id,
                      )
                        ? styles.removeButton
                        : styles.addButton
                    }
                    onClick={() =>
                      handleEvent(activeEvent)
                    }
                  >
                    {selectedEvents.some(
                      (event) =>
                        event.id ===
                        activeEvent.id,
                    )
                      ? "REMOVE"
                      : "ADD"}
                  </button>

                </div>
              ) : (
                <div className={styles.emptyInfo}>
                  <h2>EVENT INFO</h2>

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

        {/* ================================= */}
        {/* CONFIRM BUTTON                     */}
        {/* ================================= */}

        <button
          type="button"
          className={styles.confirmButton}
          onClick={handleSubmit}
          disabled={selectedEvents.length === 0}
        >
          <span>CONFIRM</span>
        </button>

      </div>

      {/* =================================== */}
      {/* CONFIRM MODAL                       */}
      {/* =================================== */}

      {confirmModal && (
        <ConfirmModal
          onCancel={() =>
            setConfirmModal(false)
          }
          selectedEvents={selectedEvents}
          userData={userData}
        />
      )}
    </>
  );
}