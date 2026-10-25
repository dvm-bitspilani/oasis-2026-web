import styles from "../../styles/DevPage/FramedPhoto.module.scss";
import frame from "../../assets/DevPage/character.png"; // the golden oval frame (same for everyone)

interface FramedPhotoProps {
  image?: string; // the person's own photo; if empty a neutral placeholder is shown inside the frame
  name: string;
  className?: string; // the parent sets the SIZE of the whole framed photo through this
}

// A person's photo cropped to an oval, with the golden frame laid on top of it.
// Used by both the desktop card (character.tsx) and the mobile card (CharacterMobile.tsx).
export default function FramedPhoto({ image, name, className }: FramedPhotoProps) {
  return (
    <div className={`${styles.framedPhoto} ${className ?? ""}`}>
      {image ? (
        <img className={styles.photo} src={image} alt={name} />
      ) : (
        <div className={styles.photoPlaceholder} role="img" aria-label={name} />
      )}
      <img className={styles.frame} src={frame} alt="" aria-hidden="true" />
    </div>
  );
}