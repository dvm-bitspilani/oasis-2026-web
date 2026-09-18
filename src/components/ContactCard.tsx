import { useEffect, useRef, useState } from "react";
import styles from "../styles/Contact.module.scss";
import mail from "../assets/contact/mail.png";

interface ContactCardProps {
  image: string;
  name: string;
  designation: string;
  email: string;
}

// Uses the Clipboard API, with a fallback for non-HTTPS / older browsers.
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the fallback below
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export default function ContactCard({ image, name, designation, email }: ContactCardProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(email);
    if (!ok) return;

    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.cardContainer}>
      <img src={image} alt={name} />
      <h1>{name}</h1>
      <h2>{designation}</h2>
      <img
        src={mail}
        alt="Copy email"
        title="Copy email"
        className={styles.mail}
        role="button"
        tabIndex={0}
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCopy();
          }
        }}
      />
      {copied && <span className={styles.copiedToast}>Email copied!</span>}
    </div>
  );
}