// The two gold icons under each name. Used by BOTH the desktop and the mobile card, each
// passing its own scss classes, so sizes/spacing are controlled separately per view.
// Icons are inline SVG (no image files) and take their colour from CSS `color`.

interface SocialIconsProps {
  name: string;
  instagram?: string;
  linkedin?: string;
  className?: string; // the row that holds both icons
  linkClassName?: string; // each icon
}

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm5.2-3.7a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm.6 7.5v8.9h2.8V9.5H5.6Zm1.4-4.3a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Zm3.3 4.3v8.9h2.8v-4.7c0-1.2.6-1.9 1.6-1.9s1.5.7 1.5 1.9v4.7h2.8v-5.3c0-2.2-1.2-3.8-3.1-3.8-1.2 0-2 .6-2.6 1.4V9.5h-3Z"
    />
  </svg>
);

export default function SocialIcons({
  name,
  instagram,
  linkedin,
  className,
  linkClassName,
}: SocialIconsProps) {
  const items = [
    { label: "Instagram", url: instagram, Icon: InstagramIcon },
    { label: "LinkedIn", url: linkedin, Icon: LinkedInIcon },
  ];

  return (
    <div className={className}>
      {items.map(({ label, url, Icon }) =>
        url ? (
          <a
            key={label}
            className={linkClassName}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} on ${label}`}
          >
            <Icon />
          </a>
        ) : (
          // no link yet: same look as the design, just not clickable
          <span key={label} className={linkClassName} aria-hidden="true">
            <Icon />
          </span>
        )
      )}
    </div>
  );
}