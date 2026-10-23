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
    { name: "Archit Agarwal", instagram: "", linkedin: "" },
    { name: "Ujaas Agarwal", instagram: "", linkedin: "" },
    { name: "Gantavya Mishra", instagram: "", linkedin: "" },
    { name: "Arya Veer Sahni", instagram: "", linkedin: "" },
  ],
  Backend: [
    { name: "Abhiraj Pharate", instagram: "", linkedin: "" },
    { name: "Akshat Ranjan", instagram: "", linkedin: "" },
    { name: "Raghav Halan", instagram: "", linkedin: "" },
    { name: "Ishan Kumar", instagram: "", linkedin: "" },
  ],
  Ui: [
    { name: "Augustya Adityadi", instagram: "", linkedin: "" },
    { name: "Shayan Maiti", instagram: "", linkedin: "" },
    { name: "Krishna Madhavi", instagram: "", linkedin: "" },
    { name: "Agrima Bhatnagar", instagram: "", linkedin: "" },
    { name: "Drivjot Kaur", instagram: "", linkedin: "" },
  ],
};