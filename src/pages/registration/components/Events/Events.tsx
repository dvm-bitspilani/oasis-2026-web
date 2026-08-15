import { useState } from "react";

import styles from "./Events.module.scss";

import ConfirmModal from "../ConfirmModal/ConfirmModal";

interface Event {
  id: number;
  name: string;
  about: string;
}

interface Category {
  id: number;
  name: string;
  events: Event[];
}

interface EventsProps {
  userData?: any;
  setUserData?: React.Dispatch<React.SetStateAction<any>>;
}

const TEST_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Dance",
    events: [
      {
        id: 101,
        name: "Battle Dance",
        about:
          "A high-energy dance battle where performers compete against each other and showcase their creativity, musicality and choreography.",
      },
      {
        id: 102,
        name: "Solo Dance",
        about:
          "A solo performance where dancers get the stage to themselves and express their unique style and personality.",
      },
      {
        id: 103,
        name: "Group Dance",
        about:
          "A team-based dance performance where synchronization, formations and collective creativity take center stage.",
      },
      {
        id: 104,
        name: "Classical Dance",
        about:
          "A celebration of classical dance forms combining traditional movements, storytelling and artistic expression.",
      },
    ],
  },

  {
    id: 2,
    name: "Music",
    events: [
      {
        id: 201,
        name: "Solo Singing",
        about:
          "A vocal performance where singers compete individually and showcase their voice, expression and musicality.",
      },
      {
        id: 202,
        name: "Battle of Bands",
        about:
          "Bands go head-to-head with their best performances and compete to win over the audience.",
      },
      {
        id: 203,
        name: "Instrumental",
        about:
          "A showcase of instrumental talent featuring musicians performing their favorite compositions.",
      },
    ],
  },

  {
    id: 3,
    name: "Drama",
    events: [
      {
        id: 301,
        name: "Street Play",
        about:
          "A powerful theatrical performance designed to engage audiences through storytelling, acting and social themes.",
      },
      {
        id: 302,
        name: "Stage Play",
        about:
          "A traditional theatrical performance combining acting, dialogue, stagecraft and storytelling.",
      },
      {
        id: 303,
        name: "Mono Act",
        about:
          "A solo theatrical performance where one actor takes on the challenge of carrying the entire story.",
      },
    ],
  },

  {
    id: 4,
    name: "Literary",
    events: [
      {
        id: 401,
        name: "Debate",
        about:
          "Participants present arguments, challenge opposing viewpoints and demonstrate their communication and reasoning skills.",
      },
      {
        id: 402,
        name: "Quiz",
        about:
          "Put your knowledge to the test with challenging questions across a wide range of topics.",
      },
      {
        id: 403,
        name: "Creative Writing",
        about:
          "A creative challenge where participants turn ideas and imagination into compelling written pieces.",
      },
    ],
  },

  {
    id: 5,
    name: "Fashion",
    events: [
      {
        id: 501,
        name: "Fashion Show",
        about:
          "A glamorous showcase celebrating fashion, creativity, styling and confident stage presence.",
      },
      {
        id: 502,
        name: "Mr & Ms Oasis",
        about:
          "A personality-driven competition combining confidence, talent, creativity and stage presence.",
      },
    ],
  },
];

export default function Events({
  userData,
  setUserData,
}: EventsProps) {
  const [search, setSearch] = useState("");

  const [selectedEvents, setSelectedEvents] = useState<
    { id: number; name: string }[]
  >([]);

  const [activeCategory, setActiveCategory] = useState(0);

  const [activeEvent, setActiveEvent] = useState(0);

  const [confirmModal, setConfirmModal] = useState(false);

  /*
   * Search categories.
   *
   * A category remains visible if:
   * - its name matches the search
   * OR
   * - one of its events matches the search
   */
  const filteredCategories = TEST_CATEGORIES.filter(
    (category) => {
      const categoryMatches = category.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const eventMatches = category.events.some(
        (event) =>
          event.name
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
      );

      return categoryMatches || eventMatches;
    },
  );

  /*
   * Make sure active category is valid after searching.
   */
  const currentCategory =
    filteredCategories.length > 0
      ? filteredCategories[
          Math.min(
            activeCategory,
            filteredCategories.length - 1,
          )
        ]
      : null;

  /*
   * Current event inside the category.
   */
  const currentEvent =
    currentCategory &&
    currentCategory.events.length > 0
      ? currentCategory.events[
          Math.min(
            activeEvent,
            currentCategory.events.length - 1,
          )
        ]
      : null;

  // --------------------------------------------------
  // CATEGORY
  // --------------------------------------------------

  const handleCategoryChange = (index: number) => {
    setActiveCategory(index);
    setActiveEvent(0);
  };

  // --------------------------------------------------
  // NEXT EVENT
  // --------------------------------------------------

  const nextEvent = () => {
    if (!currentCategory) return;

    setActiveEvent(
      (previous) =>
        (previous + 1) %
        currentCategory.events.length,
    );
  };

  // --------------------------------------------------
  // PREVIOUS EVENT
  // --------------------------------------------------

  const previousEvent = () => {
    if (!currentCategory) return;

    setActiveEvent(
      (previous) =>
        (previous -
          1 +
          currentCategory.events.length) %
        currentCategory.events.length,
    );
  };

  // --------------------------------------------------
  // SELECT / REMOVE
  // --------------------------------------------------

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

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

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

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      <div className={styles.eventsContainer}>
        <h1 className={styles.heading}>
          CHOOSE EVENTS
        </h1>

        <div className={styles.content}>
          {/* ====================================== */}
          {/* LEFT SIDE                              */}
          {/* ====================================== */}

          <div className={styles.leftPanel}>
            {/* SEARCH */}

            <div className={styles.search}>
              <input
                id="event-search"
                name="event-search"
                type="text"
                placeholder="SEARCH HERE"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActiveCategory(0);
                  setActiveEvent(0);
                }}
                autoComplete="off"
              />
            </div>

            {/* CATEGORY LIST */}

            <div className={styles.categoryList}>
              {filteredCategories.length > 0 ? (
                filteredCategories.map(
                  (category, index) => {
                    const isActive =
                      index === activeCategory;

                    const hasSelectedEvent =
                      category.events.some(
                        (event) =>
                          selectedEvents.some(
                            (selected) =>
                              selected.id ===
                              event.id,
                          ),
                      );

                    return (
                      <div
                        key={category.id}
                        className={`${styles.categoryItem} ${
                          isActive
                            ? styles.activeCategory
                            : ""
                        } ${
                          hasSelectedEvent
                            ? styles.categorySelected
                            : ""
                        }`}
                        onMouseEnter={() =>
                          handleCategoryChange(index)
                        }
                        onClick={() =>
                          handleCategoryChange(index)
                        }
                      >
                        <span>
                          {category.name}
                        </span>

                        <small>
                          {category.events.length}
                        </small>
                      </div>
                    );
                  },
                )
              ) : (
                <div className={styles.noEvents}>
                  No categories found
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

          {/* ====================================== */}
          {/* RIGHT SIDE                             */}
          {/* ====================================== */}

          <div className={styles.descriptionPanel}>
            {currentCategory && currentEvent ? (
              <>
                {/* CATEGORY NAME */}

                <div className={styles.categoryHeading}>
                  {currentCategory.name}
                </div>

                {/* EVENT NAME */}

                <h2 className={styles.eventHeading}>
                  {currentEvent.name}
                </h2>

                {/* DESCRIPTION */}

                <p className={styles.description}>
                  {currentEvent.about}
                </p>

                {/* ADD / REMOVE */}

                <button
                  type="button"
                  className={
                    selectedEvents.some(
                      (event) =>
                        event.id ===
                        currentEvent.id,
                    )
                      ? styles.removeButton
                      : styles.addButton
                  }
                  onClick={() =>
                    handleEvent(currentEvent)
                  }
                >
                  {selectedEvents.some(
                    (event) =>
                      event.id ===
                      currentEvent.id,
                  )
                    ? "REMOVE"
                    : "ADD"}
                </button>

                {/* BOTTOM NAVIGATION */}

                <div className={styles.eventNavigation}>
                  <button
                    type="button"
                    className={styles.arrow}
                    onClick={previousEvent}
                    aria-label="Previous event"
                  >
                    ←
                  </button>

                  <span className={styles.eventNumber}>
                    {activeEvent + 1} /{" "}
                    {currentCategory.events.length}
                  </span>

                  <button
                    type="button"
                    className={styles.arrow}
                    onClick={nextEvent}
                    aria-label="Next event"
                  >
                    →
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <h2>SELECT A CATEGORY</h2>

                <p>
                  Hover over a category to explore
                  its events.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}

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