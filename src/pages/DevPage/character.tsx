import { forwardRef } from "react";
import styles from "../../styles/DevPage/DevPage.module.scss";
import SocialIcons from "./SocialIcons";
import FramedPhoto from "./FramedPhoto";

interface CharacterProps {
  image?: string; // the person's photo (the golden frame is added by FramedPhoto)
  name: string;
  instagram?: string;
  linkedin?: string;
  className?: string;
}

const Character = forwardRef<HTMLDivElement, CharacterProps>(
  ({ image, name, instagram, linkedin, className }, ref) => {
    return (
      <div ref={ref} className={`${styles.character} ${className ?? ""}`}>
        <FramedPhoto image={image} name={name} className={styles.characterFrame} />
        <div className={styles.characterInfo}>
          <p>{name}</p>
          <SocialIcons
            name={name}
            instagram={instagram}
            linkedin={linkedin}
            className={styles.socials}
            linkClassName={styles.socialLink}
          />
        </div>
      </div>
    );
  },
);

Character.displayName = "Character";

export default Character;