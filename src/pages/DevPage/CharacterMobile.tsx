import styles from "../../styles/DevPage/Devpagemobile.module.scss";
import SocialIcons from "./SocialIcons";
import FramedPhoto from "./FramedPhoto";

interface CharacterMobileProps {
  image?: string; // the person's photo (the golden frame is added by FramedPhoto)
  name: string;
  instagram?: string;
  linkedin?: string;
  centered?: boolean; // true = the lone last card of an odd-sized grid: span the row and sit in the middle
  twoLineName?: boolean; // true = always show the name on exactly two lines (used for UI/UX only)
}

export default function CharacterMobile({ image, name, instagram, linkedin, twoLineName, centered }: CharacterMobileProps) {
  // Only when twoLineName is on: show the name on exactly TWO lines, the first word and then
  // the rest ("Shayan / Maiti"), so all cards in a row line up evenly.
  const [firstName, ...otherNames] = name.split(" ");

  return (
    <div
      className={styles.card}
      // inline on purpose, so it needs nothing from your scss: span both columns, sit in the
      // middle, and keep the width of one normal column (the grid has 2 equal columns)
      style={centered ? { gridColumn: "1 / -1", justifySelf: "center", width: "50%" } : undefined}
    >
      <FramedPhoto image={image} name={name} className={styles.cardFrame} />
      <p className={`${styles.cardName} ${twoLineName ? styles.cardNameTwoLines : ""}`}>
        {twoLineName ? (
          <>
            {firstName}
            <br />
            {otherNames.join(" ")}
          </>
        ) : (
          name
        )}
      </p>
      <SocialIcons
        name={name}
        instagram={instagram}
        linkedin={linkedin}
        className={styles.cardSocials}
        linkClassName={styles.cardSocialLink}
      />
    </div>
  );
}