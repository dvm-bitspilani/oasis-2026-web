// ONE place for everyone's name + photo + links. Desktop AND mobile both read from here.
// Paste each person's full profile URL. Leave "" until you have it: the icon still shows
// (like the design) but isn't clickable yet.
//   instagram: "https://www.instagram.com/their_username"
//   linkedin:  "https://www.linkedin.com/in/their-profile"
// The ORDER of each list = the character slots (frontend1, frontend2, ... in the scss).
//
// PHOTOS: put each file in src/assets/DevPage/<front|back|ui>/ and make the file names below
// match. Every import MUST point at a file that exists, otherwise the build fails.
// If someone has no photo yet, delete their `image:` line: the shared placeholder is used.

// Frontend
import archit from "../../assets/DevPage/front/archit.jpeg";
import ujaas from "../../assets/DevPage/front/ujaas.jpeg";
import gantavya from "../../assets/DevPage/front/gantavya.png";
import aryaveer from "../../assets/DevPage/front/veer.jpeg";
// Backend
import abhiraj from "../../assets/DevPage/back/abhi.png";
import akshat from "../../assets/DevPage/back/akshat.jpg";
import raghav from "../../assets/DevPage/back/raghav.jpeg";
import ishan from "../../assets/DevPage/back/ishan.jpg";
// UI/UX
import augustya from "../../assets/DevPage/design/agastya.png";
import shayan from "../../assets/DevPage/design/shayan.jpeg";
import krishna from "../../assets/DevPage/design/krishna.jpg";
import agrima from "../../assets/DevPage/design/agrima.jpg";
import drivjot from "../../assets/DevPage/design/driv.jpg";

export type Member = {
  name: string;
  image?: string;
  instagram?: string;
  linkedin?: string;
};

export type Vertical = "Frontend" | "Backend" | "Ui";

export const MEMBERS: Record<Vertical, Member[]> = {
  Frontend: [
    { name: "Archit Agarwal", image:archit, instagram: "https://www.instagram.com/archit_al57?xtok=ZWNsdWJuaXh1YzF6&utm_source=qr", linkedin: "https://www.linkedin.com/in/archit-agarwal-933786405" },
    { name: "Ujaas Agarwal", image: ujaas, instagram: "https://www.instagram.com/ujaas_agarwal?rpxt=MWIzenZxY3J2aTIxNg==", linkedin: "https://www.linkedin.com/in/ujaas-agarwal-20b159370/" },
    { name: "Gantavya Mishra", image: gantavya, instagram: "https://www.instagram.com/gantavya_06?cplk=YTd2YTRscTJ2NTk=", linkedin: "https://www.linkedin.com/in/gantavya-mishra/" },
    { name: "Arya Veer Sahni", image: aryaveer, instagram: "https://www.instagram.com/aryaveer8937?rpxt=MTJ3Y2xyNG5icjAxMA==", linkedin: "https://www.linkedin.com/in/arya-veer-sahni-63b889392/" },
  ],
  Backend: [
    { name: "Abhiraj Pharate", image: abhiraj, instagram: "https://www.instagram.com/whosabhiraj?srtk=MXB1MzJnczUxaWszbQ==", linkedin: "https://www.linkedin.com/in/abhirajpharate/" },
    { name: "Akshat Ranjan", image: akshat, instagram: "https://www.instagram.com/akshat_ranjan806?dlrf=dDBkZTlmeXljYXB1", linkedin: "https://www.linkedin.com/in/akshat-ranjan-a9900b37b/" },
    { name: "Raghav Halan", image: raghav, instagram: "https://www.instagram.com/dopaharkachaaand?dlrf=aXEwOG9pMnlzbDVp", linkedin: "https://www.linkedin.com/in/raghav-halan/" },
    { name: "Ishan Kumar", image: ishan, instagram: "", linkedin: "https://www.linkedin.com/in/ishan-kumar-637022412/" },
  ],
  Ui: [
    { name: "Augustya Adityadi", image: augustya, instagram: "https://www.instagram.com/augustya.a?dlrf=amM5eHBwMzZrOXMw", linkedin: "https://www.linkedin.com/in/augustya-adityadi-3208b930b/" },
    { name: "Shayan Maiti", image: shayan, instagram: "https://www.instagram.com/shayan_maiti?mdxt=MThoY3dic2tyMzFzcA==", linkedin: "https://www.linkedin.com/in/shayan-maiti-05646a417/" },
    { name: "Krishna Madhavi", image: krishna, instagram: "https://www.instagram.com/krishna.m_06?rpxt=aWY1cWZtbmNvbXpj", linkedin: "https://www.linkedin.com/in/krishna-madhvi-aa19a73a8/" },
    { name: "Agrima Bhatnagar", image: agrima, instagram: "https://www.instagram.com/agrima.bhatnagar?srtk=MXR6aWk5ZXZvZDBreQ==", linkedin: "https://www.linkedin.com/in/agrima-bhatnagar-565084376/" },
    { name: "Drivjot Kaur", image: drivjot, instagram: "", linkedin: "https://www.linkedin.com/in/drivjot-kaur-0a2508391/" },
  ],
};