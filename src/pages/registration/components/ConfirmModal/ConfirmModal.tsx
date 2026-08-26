// import { useState, useEffect, useRef } from "react";
// import styles from "./ConfirmModal.module.scss";
// import axios from "axios";
// import { useCookies } from "react-cookie";

// // import thumb from "/svgs/registration/scrollThumb.svg";
// // import ScrollBar from "/svgs/registration/scroll-bar.svg";

// import ReactDOM from "react-dom";

// type PropsType = {
//   onCancel: () => void;
//   selectedEvents: { id: number; name: string }[];
//   userData: any;
// };

// const Backdrop = () => {
//   return <div className={styles.backdrop} />;
// };

// const Confirmation = (props: PropsType) => {
//   const { onCancel, selectedEvents, userData } = props;

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [access_token, setAccess_token] = useState("");
//   const [notification, setNotification] = useState({
//     showSelection: true,
//     isError: false,
//     message: "",
//   });

//   function redirectWithPost(url: string, data: { [key: string]: string }) {
//     const form = document.createElement("form");
//     form.method = "POST";
//     form.action = url;

//     // Add each key-value pair to the form
//     for (const key in data) {
//       if (data.hasOwnProperty(key)) {
//         const input = document.createElement("input");
//         input.type = "hidden";
//         input.name = key;
//         input.value = data[key];
//         form.appendChild(input);
//       }
//     }

//     document.body.appendChild(form);
//     form.submit();
//   }

//   const mainContainerRef = useRef<HTMLUListElement>(null);
//   const scrollBarRef = useRef<HTMLDivElement>(null);
//   const thumbRef = useRef<HTMLImageElement>(null);

//   const [cookies] = useCookies(["Access_token", "user-auth"]);

//   const handleSubmit = async () => {
//     setIsSubmitting(true);
//     const reqData = {
//       ...userData,
//       access_token: cookies["Access_token"],
//     };
//     axios
//       .post("https://bits-oasis.org/2025/main/registrations/register/", reqData)
//       .then((response) => {
//         setIsSubmitting(false);
//         if (response.data.message === "User has been registered") {
//           setAccess_token(response.data.tokens.access);
//           setNotification({
//             showSelection: false,
//             isError: false,
//             message: "Registration Successful.",
//           });
//         } else {
//           setNotification({
//             showSelection: false,
//             isError: true,
//             message: response.data.message || response.data.error,
//           });
//         }
//       })
//       .catch((error) => {
//         setIsSubmitting(false);
//         console.error("Error registering:", error);
//         setNotification({
//           showSelection: false,
//           isError: true,
//           message:
//             error.response.data.message ||
//             error.response.data.error ||
//             "Registration Failed.",
//         });
//       });
//     sessionStorage.removeItem("selectedEvents");
//   };

//   function handleScroll() {
//     if (!mainContainerRef.current || !thumbRef.current) return;
//     const maxScrollTopValue =
//       mainContainerRef.current.scrollHeight -
//       mainContainerRef.current.clientHeight;
//     const percentage =
//       14 + (mainContainerRef.current.scrollTop / maxScrollTopValue) * 72;

//     percentage > 86.5
//       ? (thumbRef.current.style.top = "86.5%")
//       : (thumbRef.current.style.top = `${percentage}%`);
//   }

//   useEffect(() => {
//     if (!mainContainerRef.current) return;
//     mainContainerRef.current.addEventListener("scroll", handleScroll);

//     return () => {
//       document.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   const handlewheelMouseDown = (
//     e: React.MouseEvent<HTMLImageElement> | React.TouchEvent<HTMLImageElement>
//   ) => {
//     e.preventDefault();

//     document.addEventListener("mousemove", handlewheelDragMove);
//     document.addEventListener("touchmove", handlewheelDragMove);

//     document.addEventListener("mouseup", handlewheelDragEnd);
//     document.addEventListener("touchend", handlewheelDragEnd);
//   };

//   const handlewheelDragMove = (e: MouseEvent | TouchEvent) => {
//     if (!mainContainerRef.current || !scrollBarRef.current) return;

//     const maxScrollTopValue =
//       mainContainerRef.current.scrollHeight -
//       mainContainerRef.current.clientHeight;

//     const clientY = e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;

//     const percentage =
//       ((clientY - scrollBarRef.current.offsetTop) /
//         scrollBarRef.current.clientHeight) *
//       100;

//     mainContainerRef.current.scrollTop = (percentage / 100) * maxScrollTopValue;
//   };

//   const handlewheelDragEnd = () => {
//     document.removeEventListener("mousemove", handlewheelDragMove);
//     document.removeEventListener("mouseup", handlewheelDragEnd);
//     document.removeEventListener("touchmove", handlewheelDragMove);
//     document.removeEventListener("touchend", handlewheelDragEnd);
//   };

//   // const handleTrackSnap = (e: React.MouseEvent | React.TouchEvent) => {
//   //   if (!mainContainerRef.current || !scrollBarRef.current) return;
//   //   const mainWrapperElement = mainContainerRef.current;
//   //   const scrollBarContainer = scrollBarRef.current;

//   //   const percentage =
//   //     (("touches" in e ? e.touches[0].clientY : e.clientY) /
//   //       scrollBarContainer.clientHeight) *
//   //     100;
//   //   const maxScrollTopValue =
//   //     mainWrapperElement.scrollHeight - mainWrapperElement.clientHeight;

//   //   mainWrapperElement.scrollTo({
//   //     top: (percentage / 100) * maxScrollTopValue,
//   //     behavior: "smooth",
//   //   });
//   // };

//   return (
//     <div
//       className={
//         styles.selectedEvents +
//         " " +
//         (notification.showSelection ? "" : styles.error)
//       }
//     >
//       {notification.showSelection ? (
//         <>
//           <h2 className={styles.heading}>Your Selected Events :</h2>
//           <div className={styles.content}>
//             {selectedEvents.length === 0 ? (
//               <div className={styles.noEventsSelected}>
//                 <p style={{ color: "white", scale: "" }}>No Selected Events</p>
//               </div>
//             ) : (
//               <ul ref={mainContainerRef}>
//                 {selectedEvents.map((event) => (
//                   <li key={event.id}>{event.name}</li>
//                 ))}
//               </ul>
//             )}
//             <div
//               className={styles.scrollBarContainer}
//               ref={scrollBarRef}
//               // onClick={handleTrackSnap}
//             >
//               <img
//                 src={null}
//                 alt="scrollbar"
//                 className={styles.scrollBar}
//               />
//               <img
//                 className={styles.scrollBarThumb}
//                 src={null}
//                 alt="thumb"
//                 draggable={false}
//                 onMouseDown={handlewheelMouseDown}
//                 onTouchStart={handlewheelMouseDown}
//                 ref={thumbRef}
//               />
//             </div>
//           </div>
//           <div className={styles.buttonsContainer}>
//             <button onClick={onCancel} className={styles.cancelButton}>
//               Cancel
//             </button>
//             <button className={styles.confirmButton} onClick={handleSubmit}>
//               {isSubmitting ? "Submitting..." : "Confirm"}
//             </button>
//           </div>
//         </>
//       ) : (
//         <>
//           <p>{notification.message}</p>
//           <div className={styles.buttonsContainer}>
//             <button
//               className={styles.confirmButton}
//               onClick={() => {
//                 if (notification.isError) {
//                   onCancel();
//                 } else {
//                   // window.location.href = `https://bits-oasis.org/2025/main/registrations?token=${access_token}`;
//                   redirectWithPost(
//                     "https://bits-oasis.org/2026/main/registrations/",
//                     {
//                       token: access_token,
//                     }
//                   );
//                 }
//               }}
//             >
//               {notification.isError ? "Return" : "Dashboard"}
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// function ConfirmModal(props: PropsType) {
//   return (
//     <>
//       {ReactDOM.createPortal(
//         <Backdrop />,
//         document.getElementById("backdrop-root")!
//       )}
//       {ReactDOM.createPortal(
//         <Confirmation
//           userData={props.userData}
//           onCancel={props.onCancel}
//           selectedEvents={props.selectedEvents}
//         />,
//         document.getElementById("modal-root")!
//       )}
//     </>
//   );
// }

// export default ConfirmModal;



import { useState, useEffect, useRef } from "react";
import styles from "./ConfirmModal.module.scss";
import axios from "axios";
import { useCookies } from "react-cookie";
import ReactDOM from "react-dom";

import modalFrame from "/modalFrame.png"
import modalFrameMobile from "/modalFrameMobile.png"
import scrollBar from "../../../../assets/registration/reg/line.png"
import scrollHead from "../../../../assets/registration/reg/wheel.png"
import bannerBg from "../../../../assets/registration/reg/inputBg.png"

type PropsType = {
  onCancel: () => void;
  selectedEvents: { id: number; name: string }[];
  userData: any;
};

const Backdrop = () => {
  return <div className={styles.backdrop} />;
};

const Confirmation = (props: PropsType) => {
  const { onCancel, selectedEvents, userData } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [id_token, setId_token] = useState("");

  const [notification, setNotification] = useState({
    showSelection: true,
    isError: false,
    message: "",
  });

  const mainContainerRef = useRef<HTMLUListElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLImageElement>(null);
  // Distance between the pointer's Y position and the thumb's current
  // center Y at the moment the drag starts. Used so the thumb keeps its
  // position relative to the pointer instead of snapping to the cursor.
  const dragOffsetRef = useRef(0);

  const [cookies] = useCookies(["id_token", "user-auth"]);

  /* ========================================= */
  /* REDIRECT WITH POST                        */
  /* ========================================= */

  function redirectWithPost(
    url: string,
    data: { [key: string]: string }
  ) {
    const form = document.createElement("form");

    form.method = "POST";
    form.action = url;

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const input = document.createElement("input");

        input.type = "hidden";
        input.name = key;
        input.value = data[key];

        form.appendChild(input);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }

  /* ========================================= */
  /* SUBMIT REGISTRATION                       */
  /* ========================================= */

  const handleSubmit = async () => {
    if (selectedEvents.length === 0) {
      return;
    }

    setIsSubmitting(true);

    const reqData = {
      ...userData,

      // Always send the selected event IDs
      events: selectedEvents.map((event) => event.id),

      // Use ID token
      id_token: cookies["id_token"],
    };

    console.log("REGISTRATION DATA:", reqData);

    try {
      const response = await axios.post(
        "https://bits-oasis.org/2026/main/registrations/register/",
        reqData
      );

      setIsSubmitting(false);

      if (
        response.data.message ===
        "User has been registered"
      ) {
        /*
         * Adjust this only if your backend returns
         * the ID token under a different property.
         */
        const token =
          response.data.tokens?.access ??
          response.data.id_token;

        setId_token(token || "");

        sessionStorage.removeItem("selectedEvents");

        /*
         * The registration form draft is kept alive across the
         * Register -> Events step so the back button can restore it.
         * This is the point where it is genuinely safe to discard.
         */
        localStorage.removeItem("registrationFormData");

        setNotification({
          showSelection: false,
          isError: false,
          message: "Registration Successful.",
        });
      } else {
        setNotification({
          showSelection: false,
          isError: true,
          message:
            response.data.message ||
            response.data.error ||
            "Registration Failed.",
        });
      }
    } catch (error: any) {
      setIsSubmitting(false);

      console.error("Error registering:", error);

      setNotification({
        showSelection: false,
        isError: true,
        message:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Registration Failed.",
      });
    }
  };

  /* ========================================= */
  /* SCROLL                                    */
  /* ========================================= */

  function handleScroll() {
    if (
      !mainContainerRef.current ||
      !thumbRef.current
    ) {
      return;
    }

    const maxScrollTopValue =
      mainContainerRef.current.scrollHeight -
      mainContainerRef.current.clientHeight;

    if (maxScrollTopValue <= 0) {
      return;
    }

    const percentage =
      14 +
      (mainContainerRef.current.scrollTop /
        maxScrollTopValue) *
        72;

    thumbRef.current.style.top =
      percentage > 86.5
        ? "86.5%"
        : `${percentage}%`;
  }

  useEffect(() => {
    const container = mainContainerRef.current;

    if (!container) {
      return;
    }

    container.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /* ========================================= */
  /* SCROLLBAR DRAG                            */
  /* ========================================= */

  const handlewheelMouseDown = (
    e:
      | React.MouseEvent<HTMLImageElement>
      | React.TouchEvent<HTMLImageElement>
  ) => {
    e.preventDefault();

    if (thumbRef.current) {
      const thumbRect = thumbRef.current.getBoundingClientRect();
      const clientY =
        "touches" in e
          ? e.touches[0].clientY
          : (e as React.MouseEvent).clientY;
      // Remember where inside/around the thumb the user actually grabbed it,
      // so the first move doesn't teleport the thumb to the cursor.
      dragOffsetRef.current =
        clientY - (thumbRect.top + thumbRect.height / 2);
    }

    document.addEventListener(
      "mousemove",
      handlewheelDragMove
    );

    document.addEventListener(
      "touchmove",
      handlewheelDragMove
    );

    document.addEventListener(
      "mouseup",
      handlewheelDragEnd
    );

    document.addEventListener(
      "touchend",
      handlewheelDragEnd
    );
  };

  const handlewheelDragMove = (
    e: MouseEvent | TouchEvent
  ) => {
    if (
      !mainContainerRef.current ||
      !scrollBarRef.current
    ) {
      return;
    }

    const maxScrollTopValue =
      mainContainerRef.current.scrollHeight -
      mainContainerRef.current.clientHeight;

    if (maxScrollTopValue <= 0) {
      return;
    }

    const clientY =
      e instanceof TouchEvent
        ? e.touches[0].clientY
        : e.clientY;

    // Apply the original grab offset so the thumb tracks the pointer
    // relative to where it was picked up, instead of snapping under it.
    const adjustedY = clientY - dragOffsetRef.current;

    const percentage =
      ((adjustedY -
        scrollBarRef.current.offsetTop) /
        scrollBarRef.current.clientHeight) *
      100;

    mainContainerRef.current.scrollTop =
      (percentage / 100) *
      maxScrollTopValue;
  };

  const handlewheelDragEnd = () => {
    document.removeEventListener(
      "mousemove",
      handlewheelDragMove
    );

    document.removeEventListener(
      "mouseup",
      handlewheelDragEnd
    );

    document.removeEventListener(
      "touchmove",
      handlewheelDragMove
    );

    document.removeEventListener(
      "touchend",
      handlewheelDragEnd
    );
  };

  /* ========================================= */
  /* RENDER                                    */
  /* ========================================= */

  return (
    <div
      className={
        styles.selectedEvents +
        " " +
        (notification.showSelection
          ? ""
          : styles.error)
      }
      style={
        {
          "--modal-bg-desktop": `url(${modalFrame})`,
          "--modal-bg-mobile": `url(${modalFrameMobile})`,
        } as React.CSSProperties
      }
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.close}
        onClick={onCancel}
        aria-label="Close"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19.7334 1.5537C19.8179 1.46918 19.885 1.36885 19.9307 1.25843C19.9765 1.14801 20 1.02966 20 0.910135C20 0.790614 19.9765 0.672264 19.9307 0.561841C19.885 0.451419 19.8179 0.351086 19.7334 0.266572C19.6489 0.182058 19.5486 0.115019 19.4382 0.06928C19.3277 0.0235414 19.2094 0 19.0899 0C18.9703 0 18.852 0.0235414 18.7416 0.06928C18.6311 0.115019 18.5308 0.182058 18.4463 0.266572L10 8.71469L1.5537 0.266572C1.46918 0.182058 1.36885 0.115019 1.25843 0.06928C1.14801 0.0235414 1.02966 8.90498e-10 0.910135 0C0.790614 -8.90498e-10 0.672264 0.0235414 0.561841 0.06928C0.451419 0.115019 0.351086 0.182058 0.266572 0.266572C0.182058 0.351086 0.115019 0.451419 0.06928 0.561841C0.0235414 0.672264 -8.90498e-10 0.790614 0 0.910135C8.90498e-10 1.02966 0.0235414 1.14801 0.06928 1.25843C0.115019 1.36885 0.182058 1.46918 0.266572 1.5537L8.71469 10L0.266572 18.4463C0.0958887 18.617 0 18.8485 0 19.0899C0 19.3312 0.0958887 19.5627 0.266572 19.7334C0.437255 19.9041 0.668752 20 0.910135 20C1.15152 20 1.38301 19.9041 1.5537 19.7334L10 11.2853L18.4463 19.7334C18.617 19.9041 18.8485 20 19.0899 20C19.3312 20 19.5627 19.9041 19.7334 19.7334C19.9041 19.5627 20 19.3312 20 19.0899C20 18.8485 19.9041 18.617 19.7334 18.4463L11.2853 10L19.7334 1.5537Z"
        />
      </svg>
      {notification.showSelection ? (
        <>
          <h2 className={styles.heading}>
            Your Selected Events :
          </h2>

          <div className={styles.content}>
            {selectedEvents.length === 0 ? (
              <div
                className={
                  styles.noEventsSelected
                }
              >
                <p style={{ color: "#3a2411" }}>
                  No Selected Events
                </p>
              </div>
            ) : (
              <ul ref={mainContainerRef}>
                {selectedEvents.map((event) => (
                  <li key={event.id}>
                    {event.name}
                  </li>
                ))}
              </ul>
            )}

            <div
              className={
                styles.scrollBarContainer
              }
              ref={scrollBarRef}
            >
              <img
                src={scrollBar}
                alt="scrollbar"
                className={styles.scrollBar}
              />

              <img
                className={
                  styles.scrollBarThumb
                }
                src={scrollHead}
                alt="thumb"
                draggable={false}
                onMouseDown={
                  handlewheelMouseDown
                }
                onTouchStart={
                  handlewheelMouseDown
                }
                ref={thumbRef}
              />
            </div>
          </div>

          <div
            className={
              styles.buttonsContainer
            }
          >
            <button
              onClick={onCancel}
              className={
                styles.cancelButton
              }
              style={{
                backgroundImage: `url(${bannerBg})`,
              }}
              disabled={isSubmitting}
            >
              <span>Cancel</span>
            </button>

            <button
              className={
                styles.confirmButton
              }
              style={{
                backgroundImage: `url(${bannerBg})`,
              }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting
                  ? "Submitting..."
                  : "Confirm"}
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <p>{notification.message}</p>

          <div
            className={
              styles.buttonsContainer
            }
          >
            <button
              className={
                styles.confirmButton
              }
              style={{
                backgroundImage: `url(${bannerBg})`,
              }}
              onClick={() => {
                if (notification.isError) {
                  onCancel();
                } else {
                  redirectWithPost(
                    "https://bits-oasis.org/2026/main/registrations/",
                    {
                      token: id_token,
                    }
                  );
                }
              }}
            >
              <span>
                {notification.isError
                  ? "Return"
                  : "Dashboard"}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ========================================= */
/* MODAL                                      */
/* ========================================= */

function ConfirmModal(props: PropsType) {
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop />,
        document.getElementById(
          "backdrop-root"
        )!
      )}

      {ReactDOM.createPortal(
        <Confirmation
          userData={props.userData}
          onCancel={props.onCancel}
          selectedEvents={
            props.selectedEvents
          }
        />,
        document.getElementById(
          "modal-root"
        )!
      )}
    </>
  );
}

export default ConfirmModal;