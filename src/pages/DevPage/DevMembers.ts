// ONE place for everyone's name + links. Desktop AND mobile both read from here.
// Paste each person's full profile URL. Leave "" until you have it: the icon still shows
// (like the design) but isn't clickable yet.
//   instagram: "https://www.instagram.com/their_username"
//   linkedin:  "https://www.linkedin.com/in/their-profile"
// The ORDER of each list = the character slots (frontend1, frontend2, ... in the scss).

export type Member = {
  name: string;
  instagram?: string;
  linkedin?: string;
};

export type Vertical = "Frontend" | "Backend" | "Ui";

export const MEMBERS: Record<Vertical, Member[]> = {
  Frontend: [
    { name: "Archit Agarwal", instagram: "https://www.instagram.com/archit_al57?xtok=ZWNsdWJuaXh1YzF6&utm_source=qr", linkedin: "www.linkedin.com/in/archit-agarwal-933786405" },
    { name: "Ujaas Agarwal", instagram: "https://www.instagram.com/ujaas_agarwal?rpxt=MWIzenZxY3J2aTIxNg==", linkedin: "https://www.linkedin.com/in/ujaas-agarwal-20b159370/" },
    { name: "Gantavya Mishra", instagram: "https://www.instagram.com/gantavya_06?cplk=YTd2YTRscTJ2NTk=", linkedin: "https://www.linkedin.com/in/gantavya-mishra/" },
    { name: "Arya Veer Sahni", instagram: "https://www.instagram.com/aryaveer8937?rpxt=MTJ3Y2xyNG5icjAxMA==", linkedin: "https://www.linkedin.com/in/arya-veer-sahni-63b889392/" },
  ],
  Backend: [
    { name: "Abhiraj Pharate", instagram: "https://www.instagram.com/whosabhiraj?srtk=MXB1MzJnczUxaWszbQ==", linkedin: "https://www.linkedin.com/in/abhirajpharate/" },
    { name: "Akshat Ranjan", instagram: "https://www.instagram.com/akshat_ranjan806?dlrf=dDBkZTlmeXljYXB1", linkedin: "https://www.linkedin.com/in/akshat-ranjan-a9900b37b/" },
    { name: "Raghav Halan", instagram: "https://www.instagram.com/dopaharkachaaand?dlrf=aXEwOG9pMnlzbDVp", linkedin: "https://www.linkedin.com/in/raghav-halan/" },
    { name: "Ishan Kumar", instagram: "", linkedin: "https://www.linkedin.com/in/ishan-kumar-637022412/" },
  ],
  Ui: [
    { name: "Augustya Adityadi", instagram: "https://www.instagram.com/augustya.a?dlrf=amM5eHBwMzZrOXMw", linkedin: "https://www.linkedin.com/in/augustya-adityadi-3208b930b/" },
    { name: "Shayan Maiti", instagram: "https://www.instagram.com/shayan_maiti?mdxt=MThoY3dic2tyMzFzcA==", linkedin: "https://www.linkedin.com/in/shayan-maiti-05646a417/" },
    { name: "Krishna Madhavi", instagram: "https://www.instagram.com/krishna.m_06?rpxt=aWY1cWZtbmNvbXpj", linkedin: "https://www.linkedin.com/in/krishna-madhvi-aa19a73a8/" },
    { name: "Agrima Bhatnagar", instagram: "https://www.instagram.com/agrima.bhatnagar?srtk=MXR6aWk5ZXZvZDBreQ==", linkedin: "https://www.linkedin.com/in/agrima-bhatnagar-565084376/" },
    { name: "Drivjot Kaur", instagram: "", linkedin: "https://www.linkedin.com/in/drivjot-kaur-0a2508391/" },
  ],
};