import { Helmet } from "react-helmet-async";
import styles from "./Registration.module.scss";

import Instructions from "../../pages/registration/components/Instructions/Instructions";
import Register from "../registration/components/Register/Register";
import Events from "../../pages/registration/components/Events/Events";
import Booktransition from "./Booktransition";
// import Preloader from "../Preloader";

import { useCallback, useState } from "react";
import { useCookies } from "react-cookie";

import axios from "axios";
import BreadCrumb from "../../components/breadCrumb/BreadCrumb";

// =====================================================
// DEV ONLY — BACKEND BYPASS
// While the google-reg endpoint is broken, set this to true so that
// clicking the sign-in button runs the book transition and lands on
// the Register page without any network call.
// TODO: SET BACK TO false BEFORE DEPLOYING.
// (Keep this in sync with DEV_BYPASS inside Instructions.tsx)
// =====================================================
const DEV_BYPASS = true;

const DEV_USER = {
  email: "dev.tester@bits-pilani.ac.in",
  exists: false,
};

// =====================================================
// ASSETS PRELOADED BEFORE THE REGISTRATION FLOW MOUNTS
// Covers Instructions, Register, Events, and all their modals
// (ConfirmModal, EventsModal, InstructionModal, Reginput)
// =====================================================
// import RegBg from "../../assets/registration/reg/RegBg.png";
// import leftbottom from "../../assets/registration/reg/leftbottom.png";
// import rightbottom from "../../assets/registration/reg/rightbottom.png";
// import lefttop from "../../assets/registration/reg/lefttop.png";
// import righttop from "../../assets/registration/reg/righttop.png";
// import book from "../../assets/registration/reg/book.png";
// import buttonBg from "../../assets/registration/reg/buttonbg.png";
// import inputBg from "../../assets/registration/reg/inputBg.png";
// import btn from "../../assets/registration/reg/btn.png";
// import searchBg from "../../assets/registration/reg/searchBg.png";
// import line from "../../assets/registration/reg/line.png";
// import wheel from "../../assets/registration/reg/wheel.png";
// import modalFrame from "/modalFrame.png";
// import modalFrameMobile from "/modalFrameMobile.png";
// import closedBook from "/closedBook.png";
// import Syamsiah from "../../assets/fonts/Syamsiah Arabic.ttf";
// import EB from "../../assets/fonts/EBGaramond-Medium.ttf";
// import Cinzel from "../../assets/fonts/Cinzel-VariableFont_wght.ttf";
// import Scroll1 from "/instructionsScroll.png";
// import Scroll2 from "/instructionsScrollLong.png";
// import googleButton from "/googleReg.svg";
// import lamps from "/game-icons_magic-lamp.svg";
// import instructionsBG from "/instructionsBG.png";

// const registrationAssets = [
//   RegBg,
//   leftbottom,
//   rightbottom,
//   lefttop,
//   righttop,
//   book,
//   buttonBg,
//   inputBg,
//   btn,
//   searchBg,
//   line,
//   wheel,
//   modalFrame,
//   modalFrameMobile,
//   closedBook,
//   Syamsiah,
//   EB,
//   Cinzel,
//   Scroll1,
//   Scroll2,
//   googleButton,
//   lamps,
//   instructionsBG
// ];

// interface RegistrationProps {
//   startAnimation: boolean;
//   goToPage: (path: string) => void;
// }

const Registration = () => {
  // const [entered, setEntered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState<any>(null);

  /* =====================================================
     BOOK TRANSITION
     While this is true the overlay is mounted. Instructions
     stays mounted underneath it until the cover has finished
     opening, because BookTransition measures the real .book
     element to work out where the flight starts.
     ===================================================== */
  const [transitioning, setTransitioning] = useState(false);

  const [_cookies, setCookies] = useCookies([
    "Authorization",
    "user-auth",
    "id_token",
  ]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.bits-oasis.org/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Registration",
        item: "https://www.bits-oasis.org/register",
      },
    ],
  };

  // const toFirstPage = () => {
  //   setCurrentPage(1);
  // };

  const toRegPage = () => {
    setCurrentPage(2);
  };

  const toEventPage = () => {
    setCurrentPage(3);
  };

  /* Sign-in succeeded: don't jump to page 2 yet. Kick off the
     book animation and let it decide when to swap the pages. */
  const startBookTransition = () => {
    setTransitioning(true);
  };

  /* Cover has finished rotating — mount the real <Register />
     underneath the overlay so the two spreads line up.
     Memoised: BookTransition lists these in its effect deps,
     so a new function identity every render would re-measure
     and restart the timeline mid-flight. */
  const handleBookOpened = useCallback(() => {
    setCurrentPage(2);
  }, []);

  /* Cross-fade finished — tear the overlay down. */
  const handleBookDone = useCallback(() => {
    setTransitioning(false);
  }, []);

  function redirectWithPost(
    url: string,
    data: { [key: string]: string },
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

  const handleSuccess = (response: any) => {
    // =====================================================
    // DEV BYPASS — no network call, straight into the animation
    // =====================================================
    if (DEV_BYPASS) {
      console.warn(
        "[DEV_BYPASS] Skipping google-reg backend call. Remember to disable before deploying.",
      );

      setCookies("user-auth", DEV_USER);
      setUserEmail(DEV_USER.email);
      startBookTransition();

      return;
    }

    const idToken = response.credential;

    axios
      .post(
        "https://bits-oasis.org/2026/main/registrations/google-reg/",
        {
          id_token: idToken,
        },
      )
      .then((res) => {
        setCookies("id_token", idToken);

        if (res.data.exists) {
          setCookies("user-auth", res.data);
          setCookies(
            "Authorization",
            res.data.tokens.access,
          );

          redirectWithPost(
            "https://bits-oasis.org/2026/main/registrations/",
            {
              token: res.data.tokens.access,
            },
          );

          setUserEmail(res.data.email);
        } else {
          setCookies("user-auth", res.data);

          setUserEmail(res.data.email);

          if (res.data.email) {
            startBookTransition();
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // console.log("CURRENT PAGE:", currentPage);

  return (
    <div>
      <Helmet>
        <title>Registration | OASIS 2026</title>

        <meta
          name="description"
          content="Register for Oasis 2026, the annual cultural festival of BITS Pilani."
        />

        <link
          rel="canonical"
          href="https://www.bits-oasis.org/register"
        />

        <meta
          property="og:title"
          content="Registration | OASIS 2026"
        />

        <meta
          property="og:description"
          content="Register for Oasis 2026, the annual cultural festival of BITS Pilani."
        />

        <meta property="og:type" content="website" />

        <meta
          property="og:url"
          content="https://www.bits-oasis.org/register"
        />

        <meta
          property="og:image"
          content="https://www.bits-oasis.org/logo2.png"
        />

        <meta
          property="og:site_name"
          content="OASIS 2026"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="Registration | OASIS 2026"
        />

        <meta
          name="twitter:description"
          content="Register for Oasis 2026, the annual cultural festival of BITS Pilani."
        />

        <meta
          name="twitter:image"
          content="https://www.bits-oasis.org/logo2.png"
        />
      </Helmet>

      <BreadCrumb data={breadcrumbJsonLd} />

      {/* {!entered && (
        <Preloader
          assets={registrationAssets}
          onEnter={() => setEntered(true)}
        />
      )} */}

      {  (
        <>
          {/* =====================================================
              PAGE 1 — INSTRUCTIONS
              RegBg.png is only applied here
          ===================================================== */}

          {currentPage === 1 && (
            <div className={styles.instrback}>
              <Instructions
                onGoogleSignIn={handleSuccess}
                leaving={transitioning}
              />
            </div>
          )}

          {/* =====================================================
              PAGE 2 — REGISTRATION
          ===================================================== */}

          {currentPage === 2 && (
            <Register
                onClickNext={toEventPage}
                userEmail={userEmail}
                userData={userData}
                setUserData={setUserData}
              />
          )}

          {/* =====================================================
              PAGE 3 — EVENTS
          ===================================================== */}

          {currentPage === 3 && (
            <Events
              userData={userData}
              setUserData={setUserData}
              onClickBack={toRegPage}
            />
          )}

          {/* =====================================================
              BOOK TRANSITION OVERLAY
              Mounted across the 1 -> 2 handover only.
          ===================================================== */}

          {transitioning && (
            <Booktransition
              onOpened={handleBookOpened}
              onDone={handleBookDone}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Registration;