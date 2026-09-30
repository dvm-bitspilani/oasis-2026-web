import { sampleIdentity } from "../../demoService";
import { Helmet } from "react-helmet-async";
import styles from "./Registration.module.scss";

import Instructions from "../../pages/registration/components/Instructions/Instructions";
import Register from "../registration/components/Register/Register";
import Events from "../../pages/registration/components/Events/Events";
import Booktransition from "./Booktransition";
// import Preloader from "../Preloader";

import { useCallback, useState } from "react";

import BreadCrumb from "../../components/breadCrumb/BreadCrumb";

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
// import modalFrame from "/modalFrame.webp";
// import modalFrameMobile from "/modalFrameMobile.webp";
// import closedBook from "/closedBook.webp";
// import Syamsiah from "../../assets/fonts/Syamsiah Arabic.ttf";
// import EB from "../../assets/fonts/EBGaramond-Medium.ttf";
// import Cinzel from "../../assets/fonts/Cinzel-VariableFont_wght.ttf";
// import Scroll1 from "/instructionsScroll.webp";
// import Scroll2 from "/instructionsScrollLong.webp";
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
  const userEmail = sampleIdentity.email_id;
  const [userData, setUserData] = useState<any>(sampleIdentity);

  /* =====================================================
     BOOK TRANSITION
     While this is true the overlay is mounted. Instructions
     stays mounted underneath it until the cover has finished
     opening, because Booktransition measures the real .book
     element to work out where the flight starts.
     ===================================================== */
  const [transitioning, setTransitioning] = useState(false);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://oasis2026.bits-oasis.org/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Registration",
        item: "https://oasis2026.bits-oasis.org/register",
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
     Memoised: Booktransition lists these in its effect deps,
     so a new function identity every render would re-measure
     and restart the timeline mid-flight. */
  const handleBookOpened = useCallback(() => {
    setCurrentPage(2);
  }, []);

  /* Cross-fade finished — tear the overlay down. */
  const handleBookDone = useCallback(() => {
    setTransitioning(false);
  }, []);

  const handleSuccess = () => startBookTransition();



  return (
    <div>
      <Helmet>
        <title>Registration | OASIS 2026</title>

        <meta
          name="description"
          content="Explore the local sample registration demo for the OASIS 2026 portfolio archive, the annual cultural festival of BITS Pilani."
        />

        <link
          rel="canonical"
          href="https://oasis2026.bits-oasis.org/register"
        />

        <meta
          property="og:title"
          content="Registration | OASIS 2026"
        />

        <meta
          property="og:description"
          content="Explore the local sample registration demo for the OASIS 2026 portfolio archive, the annual cultural festival of BITS Pilani."
        />

        <meta property="og:type" content="website" />

        <meta
          property="og:url"
          content="https://oasis2026.bits-oasis.org/register"
        />

        <meta
          property="og:image"
          content="https://oasis2026.bits-oasis.org/oasisIcon.webp"
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
          content="Explore the local sample registration demo for the OASIS 2026 portfolio archive, the annual cultural festival of BITS Pilani."
        />

        <meta
          name="twitter:image"
          content="https://oasis2026.bits-oasis.org/oasisIcon.webp"
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