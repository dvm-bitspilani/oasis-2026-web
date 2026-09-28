
import styles from "../../styles/DevPage/DevPageMobile.module.scss";

interface CharacterMobileProps {
  image: string;
  name: string;
  instagram?: string;
  linkedin?: string;
}

export default function CharacterMobile({ image, name, instagram, linkedin }: CharacterMobileProps) {
  return (
    <div className={styles.card}>
      <img className={styles.cardImage} src={image} alt={name} />
      <p className={styles.cardName}>{name}</p>
      <div className={styles.cardSocials}>
        {instagram && (
          <a href={instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        )}
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}