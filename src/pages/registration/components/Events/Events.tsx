import { useState } from "react";

import styles from "./Events.module.scss";

import ConfirmModal from "../ConfirmModal/ConfirmModal";

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

export default function Events({
  userData,
  setUserData,
}: EventsProps) {
  const [events] = useState<Event[]>(TEST_EVENTS);

  const [search, setSearch] = useState("");

  const [selectedEvents, setSelectedEvents] = useState<
    { id: number; name: string }[]
  >([]);

  const [activeEvent, setActiveEvent] =
    useState<Event | null>(null);

  const [confirmModal, setConfirmModal] =
    useState(false);

  const filteredEvents = events.filter((event) =>
    event.name
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const handleEvent = (event: Event) => {
    const alreadySelected = selectedEvents.some(
      (item) => item.id === event.id,
    );

    if (alreadySelected) {
      setSelectedEvents(
        selectedEvents.filter(
          (item) => item.id !== event.id,
        ),
      );
    } else {
      setSelectedEvents([
        ...selectedEvents,
        {
          id: event.id,
          name: event.name,
        },
      ]);
    }
  };

  const handleEventHover = (event: Event) => {
    setActiveEvent(event);
  };

  const closeEventInfo = () => {
    setActiveEvent(null);
  };

  const handleSubmit = () => {
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
      <div className={styles.eventsContainer}>
        <h1 className={styles.heading}>
          CHOOSE EVENTS
        </h1>

        <div className={styles.mainContent}>
          {/* LEFT SIDE */}

          <div className={styles.leftSide}>
            {/* SEARCH */}

            <div className={styles.search}>
              <input
                id="event-search"
                name="event-search"
                type="text"
                placeholder="SEARCH HERE"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                autoComplete="off"
              />
            </div>

            {/* EVENTS */}

            <div className={styles.eventsList}>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const selected =
                    selectedEvents.some(
                      (item) =>
                        item.id === event.id,
                    );

                  return (
                    <div
                      key={event.id}
                      className={`${styles.eventItem} ${
                        selected
                          ? styles.selected
                          : ""
                      }`}
                      onMouseEnter={() =>
                        handleEventHover(event)
                      }
                    >
                      <button
                        type="button"
                        className={
                          styles.eventButton
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEvent(event);
                        }}
                      >
                        {event.name}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className={styles.noEvents}>
                  No events found
                </div>
              )}
            </div>

            {/* SELECTED COUNT */}

            <div className={styles.selectedCount}>
              {selectedEvents.length} EVENTS SELECTED
            </div>

            {/* SUBMIT */}

            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleSubmit}
            >
              SUBMIT
            </button>
          </div>

          {/* RIGHT SIDE */}

          <div
            className={styles.rightSide}
            onMouseLeave={closeEventInfo}
          >
            {activeEvent ? (
              <>
                <div className={styles.eventCategory}>
                  EVENT
                </div>

                <h2 className={styles.eventHeading}>
                  {activeEvent.name}
                </h2>

                <p className={styles.eventDescription}>
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
              </>
            ) : (
              <div className={styles.emptyInfo}>
                <h2>EVENT INFO</h2>

                <p>
                  Hover over an event to see its
                  details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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