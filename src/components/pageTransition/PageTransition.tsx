
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { gsap } from "gsap";
import styles from "./PageTransition.module.scss";

export type PageTransitionHandle = {
  resumeCurtain: () => void;
};

export type PageKey =
  | "home"
  | "events"
  | "about"
  | "sponsors"
  | "gallery"
  | "contact";

type PageTransitionProps = {
  selectedPage: PageKey;
  onComplete?: () => void;
};

const PAGES: {
  key: PageKey;
  title: string;
  image: string;
}[] = [
  { key: "home", title: "Oasis", image: "" },
  { key: "events", title: "Events", image: "" },
  { key: "about", title: "About", image: "" },
  { key: "sponsors", title: "Sponsors", image: "" },
  { key: "gallery", title: "Gallery", image: "" },
  { key: "contact", title: "Contact", image: "" },
];

const PageTransition = forwardRef<
  PageTransitionHandle,
  PageTransitionProps
>(function PageTransition({ selectedPage, onComplete }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onCompleteRef = useRef(onComplete);
  const revealRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useImperativeHandle(ref, () => ({
    resumeCurtain: () => revealRef.current?.(),
  }));

  useEffect(() => {
    const root = rootRef.current;
    const gallery = galleryRef.current;
    const glow = glowRef.current;

    if (!root || !gallery || !glow) return;

    const cards = Array.from(
      gallery.querySelectorAll<HTMLElement>("[data-page-card]"),
    );

    const selectedIndex = PAGES.findIndex(
      (page) => page.key === selectedPage,
    );

    const selectedCard = cards[selectedIndex];

    if (!selectedCard) {
      onCompleteRef.current?.();
      return;
    }

    let revealStarted = false;
    let selectionStarted = false;
    let orbitAngle = 0;

    const initialAngles = cards.map(
      (_, index) => -90 + index * (360 / cards.length),
    );


    const maxCardWidth = Math.max(
      ...cards.map((card) => card.offsetWidth),
    );

    const maxCardHeight = Math.max(
      ...cards.map((card) => card.offsetHeight),
    );

    const availableRadius =
      Math.min(window.innerWidth, window.innerHeight) * 0.36;

    const baseScale = Math.min(
      1,
      (availableRadius * 0.72) / Math.max(maxCardWidth, 1),
      (availableRadius * 0.72) / Math.max(maxCardHeight, 1),
    );

   
    const radius =
      Math.max(maxCardWidth * baseScale, maxCardHeight * baseScale) +
      18;

    const setCardPositions = (angleOffset: number) => {
      cards.forEach((card, index) => {
        const angle =
          (initialAngles[index] + angleOffset) * (Math.PI / 180);

        gsap.set(card, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          rotation: 0,
        });
      });
    };

    gsap.set(root, {
      autoAlpha: 1,
      backgroundColor: "#07091c",
    });

    gsap.set(gallery, {
      rotation: 0,
      transformOrigin: "50% 50%",
    });

    gsap.set(cards, {
      position: "absolute",
      top: "50%",
      left: "50%",
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      rotation: 0,
      scale: baseScale,
      opacity: 1,
      transformOrigin: "50% 50%",
    });

    setCardPositions(0);

    gsap.set(cards, {
      zIndex: 1,
    });

    gsap.set(selectedCard, {
      zIndex: 10,
    });

    gsap.set(glow, {
      opacity: 0,
      scale: 0.1,
    });

    // Animate positions instead of rotating the parent gallery.
    const orbitTween = gsap.to(
      { angle: 0 },
      {
        angle: 360,
        duration: 16,
        ease: "none",
        repeat: -1,
        onUpdate() {
          orbitAngle = gsap.getProperty(
            orbitTween.targets()[0],
            "angle",
          ) as number;

          setCardPositions(orbitAngle);
        },
      },
    );

    // Measure the card at its initial scale to calculate the cover scale.
    const selectedRect = selectedCard.getBoundingClientRect();

    const coverScale =
      baseScale *
      Math.max(
        (window.innerWidth * 1.2) / Math.max(selectedRect.width, 1),
        (window.innerHeight * 1.2) / Math.max(selectedRect.height, 1),
      );

    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        onCompleteRef.current?.();
      },
    });

    // Fade the other cards away.
    timeline.to(cards.filter((_, i) => i !== selectedIndex), {
      opacity: 0,
      duration: 0.3,
      stagger: 0.04,
      ease: "power2.out",
    });

    // Force the selected card upright and centered.
    timeline.set(selectedCard, {
      rotation: 0,
    });

    timeline.to(
      selectedCard,
      {
        x: 0,
        y: 0,
        scale: baseScale * 1.15,
        duration: 0.65,
        ease: "power3.inOut",
      },
      "-=0.05",
    );

    // Expand the glow behind the selected card.
    timeline.to(
      glow,
      {
        opacity: 1,
        scale: 1.6,
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.25",
    );

    // Enlarge the selected card to cover the screen.
    timeline.to(
      selectedCard,
      {
        scale: coverScale,
        duration: 0.7,
        ease: "power2.in",
      },
      "-=0.05",
    );

    timeline.to(
      glow,
      {
        scale: 12,
        opacity: 1,
        duration: 0.55,
        ease: "power2.in",
      },
      "<",
    );

    const selectionTimer = window.setTimeout(() => {
      if (revealStarted || selectionStarted) return;

      selectionStarted = true;

      // Stop changing card positions before the selected card moves.
      orbitTween.pause();
      timeline.play(0);
    }, 1100);

    revealRef.current = () => {
      if (revealStarted) return;

      revealStarted = true;

      window.clearTimeout(selectionTimer);
      orbitTween.kill();
      timeline.kill();

      gsap.to(root, {
        autoAlpha: 0,
        duration: 0.85,
        ease: "power2.out",
        onComplete: () => {
          onCompleteRef.current?.();
        },
      });
    };

    return () => {
      window.clearTimeout(selectionTimer);
      orbitTween.kill();
      timeline.kill();

      gsap.killTweensOf([root, gallery, glow, ...cards]);

      revealRef.current = null;
    };
  }, [selectedPage]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      aria-hidden="true"
    >
      <div ref={glowRef} className={styles.glow} />

      <div ref={galleryRef} className={styles.gallery}>
        {PAGES.map((page) => (
          <div
            key={page.key}
            data-page-card
            className={styles.card}
          >
            {page.image && (
              <img
                src={page.image}
                alt=""
                draggable={false}
              />
            )}

            <div className={styles.cardTitle}>{page.title}</div>
            <div className={styles.cardShine} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default PageTransition;
