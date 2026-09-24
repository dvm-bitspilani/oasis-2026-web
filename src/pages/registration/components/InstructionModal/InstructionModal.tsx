import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./InstructionModal.module.scss";

import scrollBar from "../../../../assets/registration/reg/line.png";
import scrollHead from "../../../../assets/registration/reg/wheel.png";
import modalFrame from "/modalFrame.webp";
import modalFrameMobile from "/modalFrameMobile.webp";

import ReactDOM from "react-dom";

type PropsType = {
  onCancel: () => void;
};

const Backdrop = ({ onCancel }: PropsType) => {
  return (
    <div
      className={styles.backdrop}
      onClick={onCancel}
      role="presentation"
    />
  );
};

const Confirmation = ({ onCancel }: PropsType) => {
  const mainContainerRef = useRef<HTMLUListElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLImageElement>(null);

  // Prevents the thumb from jumping when dragging starts.
  const dragOffsetRef = useRef(0);

  // Stores the pending animation frame used for scroll updates.
  const scrollFrameRef = useRef<number | null>(null);

  /**
   * Update the custom scrollbar thumb position.
   *
   * Direct DOM manipulation is used here intentionally because
   * this value changes frequently and does not need a React render.
   */
  const updateThumbPosition = useCallback(() => {
    const container = mainContainerRef.current;
    const thumb = thumbRef.current;

    if (!container || !thumb) return;

    const maxScrollTop =
      container.scrollHeight - container.clientHeight;

    if (maxScrollTop <= 0) {
      thumb.style.top = "14%";
      return;
    }

    const scrollProgress = container.scrollTop / maxScrollTop;

    const percentage = Math.min(
      86.5,
      14 + scrollProgress * 72
    );

    thumb.style.top = `${percentage}%`;
  }, []);

  /**
   * Subscribe to the actual scroll container.
   *
   * The listener is passive because it never calls preventDefault().
   */
  useEffect(() => {
    const container = mainContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        updateThumbPosition();
      });
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    // Set initial scrollbar position.
    updateThumbPosition();

    return () => {
      container.removeEventListener("scroll", handleScroll);

      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [updateThumbPosition]);

  /**
   * Start dragging the scrollbar thumb.
   *
   * Pointer events handle mouse, touch and pen using one API.
   */
  const handleThumbPointerDown = (
    e: ReactPointerEvent<HTMLImageElement>
  ) => {
    const thumb = thumbRef.current;

    if (!thumb) return;

    e.preventDefault();

    const thumbRect = thumb.getBoundingClientRect();

    dragOffsetRef.current =
      e.clientY -
      (thumbRect.top + thumbRect.height / 2);

    // Continue receiving pointer events even when the pointer
    // moves outside the thumb.
    thumb.setPointerCapture(e.pointerId);
  };

  /**
   * Move the thumb and update the actual scroll position.
   */
  const handleThumbPointerMove = (
    e: ReactPointerEvent<HTMLImageElement>
  ) => {
    const container = mainContainerRef.current;
    const scrollbar = scrollBarRef.current;
    const thumb = thumbRef.current;

    if (!container || !scrollbar || !thumb) return;

    if (!thumb.hasPointerCapture(e.pointerId)) {
      return;
    }

    e.preventDefault();

    const maxScrollTop =
      container.scrollHeight - container.clientHeight;

    if (maxScrollTop <= 0) return;

    const trackRect =
      scrollbar.getBoundingClientRect();

    const adjustedY =
      e.clientY - dragOffsetRef.current;

    let percentage =
      ((adjustedY - trackRect.top) /
        trackRect.height) *
      100;

    percentage = Math.max(
      0,
      Math.min(100, percentage)
    );

    container.scrollTop =
      (percentage / 100) * maxScrollTop;
  };

  /**
   * End dragging.
   */
  const handleThumbPointerUp = (
    e: ReactPointerEvent<HTMLImageElement>
  ) => {
    const thumb = thumbRef.current;

    if (!thumb) return;

    if (thumb.hasPointerCapture(e.pointerId)) {
      thumb.releasePointerCapture(e.pointerId);
    }
  };

  const modalStyle: CSSProperties = {
    "--modal-bg-desktop": `url(${modalFrame})`,
    "--modal-bg-mobile": `url(${modalFrameMobile})`,
  } as CSSProperties;

  return (
    <div
      className={styles.selectedEvents}
      style={modalStyle}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.close}
        onClick={onCancel}
        aria-label="Close instructions"
        role="button"
        tabIndex={0}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.7334 1.5537C19.8179 1.46918 19.885 1.36885 19.9307 1.25843C19.9765 1.14801 20 1.02966 20 0.910135C20 0.790614 19.9765 0.672264 19.9307 0.561841C19.885 0.451419 19.8179 0.351086 19.6489 0.182058C19.5486 0.115019 19.4382 0.06928 19.3277 0.0235414C19.2094 0 19.0899 0 18.9703 0C18.852 0.0235414 18.7416 0.06928 18.6311 0.115019C18.5308 0.182058 18.4463 0.266572L10 8.71469L1.5537 0.266572C1.46918 0.182058 1.36885 0.115019 1.25843 0.06928C1.14801 0.0235414 1.02966 8.90498e-10 0.910135 0C0.790614 -8.90498e-10 0.672264 0.0235414 0.561841 0.06928C0.451419 0.115019 0.351086 0.182058 0.266572 0.266572C0.182058 0.351086 0.115019 0.451419 0.06928 0.561841C0.0235414 0.672264 -8.90498e-10 0.790614 0 0.910135C8.90498e-10 1.02966 0.0235414 1.14801 0.06928 1.25843C0.115019 1.36885 0.182058 1.46918 0.266572 1.5537L8.71469 10L0.266572 18.4463C0.0958887 18.617 0 18.8485 0 19.0899C0 19.3312 0.0958887 19.5627 0.266572 19.7334C0.437255 19.9041 0.668752 20 0.910135 20C1.15152 20 1.38301 19.9041 1.5537 19.7334L10 11.2853L18.4463 19.7334C18.617 19.9041 18.8485 19.9041 19.7334 19.7334C19.9041 19.5627 20 19.3312 20 19.0899C20 18.8485 19.9041 18.617 19.7334 18.4463L11.2853 10L19.7334 1.5537Z"
        />
      </svg>

      <h2 className={styles.heading}>
        Detailed Instructions
      </h2>

      <div className={styles.content}>
        <ul ref={mainContainerRef}>
          <li>
            Complete the registration form with all required
            details. You'll be able to login through your
            registered email id when required. All team members
            are required to register separately.
          </li>

          <li>
            A College Representative (CR) will be appointed
            for each college who'll be responsible for
            allotting heads for all the societies the college
            will be participating for.
          </li>

          <li>
            The heads and CR will be responsible for approving
            the other participating members.
          </li>

          <li>
            After this, an approval email will be sent from
            the Department of Publication and Correspondence.
          </li>

          <li>
            Make the required payment as instructed.
          </li>

          <li>
            Upon successful payment, a confirmation email will
            be sent.
          </li>
        </ul>

        <div
          className={styles.scrollBarContainer}
          ref={scrollBarRef}
        >
          <img
            src={scrollBar}
            alt="Scroll Bar"
            aria-hidden="true"
            className={styles.scrollBar}
            draggable={false}
          />

          <img
            ref={thumbRef}
            className={styles.scrollBarThumb}
            src={scrollHead}
            alt="Scroll instructions"
            draggable={false}
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
          />
        </div>
      </div>
    </div>
  );
};

function InstructionModal({
  onCancel,
}: PropsType) {
  const backdropRoot =
    document.getElementById("backdrop-root");

  const modalRoot =
    document.getElementById("modal-root");

  if (!backdropRoot || !modalRoot) {
    return null;
  }

  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onCancel={onCancel} />,
        backdropRoot
      )}

      {ReactDOM.createPortal(
        <Confirmation onCancel={onCancel} />,
        modalRoot
      )}
    </>
  );
}

export default InstructionModal;