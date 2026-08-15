import { Helmet } from "react-helmet-async";
import styles from "./Registration.module.scss";

import Instructions from "../../pages/registration/components/Instructions/Instructions";
import Register from "../registration/components/Register/Register";
import Events from "../../pages/registration/components/Events/Events";

import { useState } from "react";
import { useCookies } from "react-cookie";

import axios from "axios";
import BreadCrumb from "../../components/breadCrumb/BreadCrumb";

interface RegistrationProps {
  startAnimation: boolean;
  goToPage: (path: string) => void;
}

const Registration = ({ goToPage }: RegistrationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState<any>(null);

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

  const toFirstPage = () => {
    setCurrentPage(1);
  };

  const toRegPage = () => {
    setCurrentPage(2);
  };

  const toEventPage = () => {
    setCurrentPage(3);
  };

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
    const idToken = response.credential;

    console.log(response);

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
            toRegPage();
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log("CURRENT PAGE:", currentPage);

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

      {/* =====================================================
          PAGE 1 — INSTRUCTIONS
          RegBg.png is only applied here
      ===================================================== */}

      {currentPage === 1 && (
        <div className={styles.instrback}>
          <Instructions
            onGoogleSignIn={handleSuccess}
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
        />
      )}
    </div>
  );
};

export default Registration;