import styles from "../styles/Contact.module.scss";
import mail from "../assets/contact/mail.webp";

interface ContactCardProps {
  image: string;
  name: string;
  email: string;
}

// Opens Gmail's "compose" view with the recipient pre-filled. Routed through
// Google's account chooser first, so if the user is signed into more than one
// Google account, they get to pick which one to send from before compose opens.
// Falls back to a plain mailto: link if the tab is blocked (e.g. popup
// blockers) or the user isn't on Gmail.
function openGmailCompose(email: string) {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    email
  )}`;
  const accountChooserUrl = `https://accounts.google.com/AccountChooser?continue=${encodeURIComponent(
    gmailUrl
  )}`;

  const tab = window.open(accountChooserUrl, "_blank", "noopener,noreferrer");

  if (!tab) {
    window.location.href = `mailto:${email}`;
  }
}

export default function ContactCard({ image, name, email }: ContactCardProps) {
  const handleMailClick = () => openGmailCompose(email);

  return (
    <div className={styles.cardContainer}>
      <img className={styles.stuccanImage} src={image} alt={name} />
      <section className={styles.details}>
        <h1>{name}</h1>
        <img
          src={mail}
          alt={`Email ${name}`}
          title={`Email ${name}`}
          className={styles.mail}
          role="button"
          tabIndex={0}
          onClick={handleMailClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMailClick();
            }
          }}
        />
      </section>
    </div>
  );
}