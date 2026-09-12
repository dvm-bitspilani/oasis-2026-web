import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Home from "./Home";
import About from "./About";

gsap.registerPlugin(ScrollTrigger);

type LandingProps = {
  preloaderDone: boolean;
  preloaderExiting: boolean;
};
export default function Landing({ preloaderDone, preloaderExiting }: LandingProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const homeWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!preloaderDone) return;

    const wrapper = wrapperRef.current;
    const homeWrap = homeWrapRef.current;
    if (!wrapper || !homeWrap) return;

    const ctx = gsap.context(() => {
      const aboutEls = wrapper.querySelectorAll<HTMLElement>("[data-about-enter]");
      gsap.set(aboutEls, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: homeWrap,
          start: "top center",
          end: "+=100",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          markers: true,
        },
      });

      tl.to(homeWrap, { autoAlpha: 0, ease: "power1.inOut", duration: 1 }, 0);
      tl.to(
        aboutEls,
        { opacity: 1, ease: "power1.inOut", duration: 1, stagger: 0.05 },
        // 0.15
      );
    }, wrapper);

    // real diagnostics go HERE, inside the effect, after everything is created
    requestAnimationFrame(() => {
      console.log(
        "ScrollTriggers:",
        ScrollTrigger.getAll().map(st => ({ start: st.start, end: st.end, pin: !!st.pin }))
      );
      console.log(
        "scrollHeight:", document.documentElement.scrollHeight,
        "innerHeight:", window.innerHeight
      );
    });

    return () => ctx.revert();
  }, [preloaderDone]);

  return (
    <div ref={wrapperRef}>
      <div ref={homeWrapRef}>
        <Home preloaderDone={preloaderDone} preloaderExiting={preloaderExiting} />
      </div>
      <About />
    </div>
  );
}