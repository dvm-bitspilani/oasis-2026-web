// import styles from "../styles/About.module.scss";

// import Preloader from "./Preloader";

// import bgback from "../assets/about/bgBack.png";
// import cloud from "../assets/about/cloud.png";
// import backBg from "../assets/about/bgBottom.png";
// import leftCloud from "../assets/about/leftClouds.png";
// import leftTop from "../assets/about/pillarTop-trimmed.png";
// import leftTopMob from "../assets/about/leftTop-trimmed.png";
// import head from "../assets/about/head.png";
// import lamp from "../assets/about/lamp.png";
// import bgCon from "../assets/about/bgCont.png";
// import play from "../assets/about/play.png";
// import ff from "../assets/about/ffControl.png";
// import playBtn from "../assets/about/playBtn.png";
// import bgVid from "../assets/about/bgVideo.png";
// import cover from "../assets/about/cover.png";
// import backBtn from "../assets/about/backBtn.png";
// import scrollVid from "../assets/about/scrollVid.png";

// import { useTransition } from "../context/TransitionProvider";

// import {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
// } from "react";

// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// declare global {
//   interface Window {
//     YT: any;
//     onYouTubeIframeAPIReady?: () => void;
//   }
// }

// const ABOUT_ASSETS = [
//   bgback,
//   cloud,
//   backBg,
//   leftCloud,
//   leftTop,
//   leftTopMob,
//   head,
//   lamp,
//   bgCon,
//   play,
//   ff,
//   playBtn,
//   bgVid,
//   cover,
//   backBtn,
//   scrollVid,
// ];

// gsap.registerPlugin(ScrollTrigger);

// ScrollTrigger.config({
//   ignoreMobileResize: true,
// });

// const SvgImg = ({
//   src,
//   fit = "contain",
// }: {
//   src: string;
//   fit?: "contain" | "cover";
// }) => (
//   <svg
//     viewBox="0 0 100 100"
//     preserveAspectRatio="xMidYMid meet"
//   >
//     <image
//       href={src}
//       x="0"
//       y="0"
//       width="100"
//       height="100"
//       preserveAspectRatio={
//         fit === "cover"
//           ? "xMidYMid slice"
//           : "xMidYMid meet"
//       }
//     />
//   </svg>
// );

// const YOUTUBE_VIDEO_IDS = [
//   "V9LHjddKR_M",
//   "5MtkggVC0w0",
//   "ZCrClSBM1ns",
// ];

// const About = () => {
//   const { navigateWithTransition } = useTransition();

//   /*
//    * -------------------------------------------------------
//    * STATE
//    * -------------------------------------------------------
//    */

//   const [showVideo, setShowVideo] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [playerReady, setPlayerReady] = useState(false);
//   const [controlsVisible, setControlsVisible] = useState(false);
//   const [aboutPreloaderDone, setAboutPreloaderDone] =
//     useState(false);
//   const [currentVideoIndex, setCurrentVideoIndex] =
//     useState(0);

//   /*
//    * -------------------------------------------------------
//    * REFS
//    * -------------------------------------------------------
//    */

//   const playerElRef =
//     useRef<HTMLDivElement | null>(null);

//   const playerRef = useRef<any>(null);

//   const controlsTimerRef =
//     useRef<number | null>(null);

//   const videoStartedRef = useRef(false);

//   const showVideoRef = useRef(false);

//   const isNavigatingRef = useRef(false);

//   const scrollTriggerRef =
//     useRef<ScrollTrigger | null>(null);

//   const vidBgRef =
//     useRef<HTMLDivElement | null>(null);

//   const vidRef =
//     useRef<HTMLDivElement | null>(null);

//   const controlsRef =
//     useRef<HTMLDivElement | null>(null);

//   const leftRef =
//     useRef<HTMLDivElement | null>(null);

//   const rightRef =
//     useRef<HTMLDivElement | null>(null);

//   const midCloudR =
//     useRef<HTMLDivElement | null>(null);

//   const containerRef =
//     useRef<HTMLDivElement | null>(null);

//   const bgBackRef =
//     useRef<HTMLDivElement | null>(null);

//   const bgRef =
//     useRef<HTMLDivElement | null>(null);

//   const bgSolidRef =
//     useRef<HTMLDivElement | null>(null);

//   const lampLRef =
//     useRef<HTMLDivElement | null>(null);

//   const LampRRef =
//     useRef<HTMLDivElement | null>(null);

//   const bottomR =
//     useRef<HTMLDivElement | null>(null);

//   const bottomL =
//     useRef<HTMLDivElement | null>(null);

//   const scrollVidRef =
//     useRef<HTMLDivElement | null>(null);

//   const bottomBack =
//     useRef<HTMLDivElement | null>(null);

//   const headRef =
//     useRef<HTMLDivElement | null>(null);

//   const cloudRef =
//     useRef<HTMLDivElement | null>(null);

//   /*
//    * -------------------------------------------------------
//    * RESPONSIVE ASSET
//    * -------------------------------------------------------
//    */

//   const isMobile =
//     window.matchMedia("(max-width: 1000px)").matches;

//   const bgLeft = isMobile
//     ? leftTopMob
//     : leftTop;

//   /*
//    * -------------------------------------------------------
//    * PRELOADER
//    * -------------------------------------------------------
//    */

//   const handleAboutPreloaderEnter = useCallback(() => {
//     setAboutPreloaderDone(true);

//     requestAnimationFrame(() => {
//       ScrollTrigger.refresh();
//     });
//   }, []);

//   /*
//    * -------------------------------------------------------
//    * DESTROY YOUTUBE PLAYER
//    * -------------------------------------------------------
//    */

//   const destroyPlayer = useCallback(() => {
//     const player = playerRef.current;

//     if (controlsTimerRef.current !== null) {
//       clearTimeout(controlsTimerRef.current);
//       controlsTimerRef.current = null;
//     }

//     if (player) {
//       try {
//         player.stopVideo?.();
//       } catch {}

//       try {
//         player.destroy?.();
//       } catch {}
//     }

//     playerRef.current = null;

//     setPlayerReady(false);
//     setControlsVisible(false);

//     videoStartedRef.current = false;
//   }, []);

//   /*
//    * -------------------------------------------------------
//    * BACK BUTTON
//    * -------------------------------------------------------
//    */

//   const handleBackClick = useCallback(() => {
//     if (isNavigatingRef.current) return;

//     isNavigatingRef.current = true;

//     /*
//      * Destroy YouTube player
//      */
//     destroyPlayer();

//     setShowVideo(false);

//     showVideoRef.current = false;

//     /*
//      * Kill ScrollTrigger
//      */
//     const st = scrollTriggerRef.current;

//     if (st) {
//       scrollTriggerRef.current = null;
//       st.kill();
//     }

//     /*
//      * Kill any active GSAP tweens
//      */
//     gsap.killTweensOf([
//       containerRef.current,
//       vidRef.current,
//       vidBgRef.current,
//       controlsRef.current,
//       bgRef.current,
//       bgSolidRef.current,
//       bgBackRef.current,
//       leftRef.current,
//       rightRef.current,
//       midCloudR.current,
//       bottomL.current,
//       bottomR.current,
//       bottomBack.current,
//       headRef.current,
//       cloudRef.current,
//       lampLRef.current,
//       LampRRef.current,
//       scrollVidRef.current,
//     ]);

//     navigateWithTransition("/");
//   }, [destroyPlayer, navigateWithTransition]);

//   /*
//    * -------------------------------------------------------
//    * LOAD YOUTUBE API
//    *
//    * Load only once.
//    * Do not remove the global API script during unmount.
//    * -------------------------------------------------------
//    */

//   useEffect(() => {
//     if (window.YT?.Player) return;

//     const existingScript = document.querySelector(
//       'script[src="https://www.youtube.com/iframe_api"]'
//     );

//     if (existingScript) return;

//     const tag = document.createElement("script");

//     tag.src =
//       "https://www.youtube.com/iframe_api";

//     tag.async = true;

//     document.body.appendChild(tag);
//   }, []);

//   /*
//    * -------------------------------------------------------
//    * CREATE YOUTUBE PLAYER
//    * -------------------------------------------------------
//    */

//   useEffect(() => {
//     if (!showVideo) return;
//     if (playerRef.current) return;
//     if (!playerElRef.current) return;

//     let cancelled = false;

//     const createPlayer = () => {
//       if (cancelled) return;
//       if (!playerElRef.current) return;
//       if (playerRef.current) return;
//       if (!window.YT?.Player) return;

//       playerRef.current =
//         new window.YT.Player(
//           playerElRef.current,
//           {
//             videoId:
//               YOUTUBE_VIDEO_IDS[
//                 currentVideoIndex
//               ],

//             width: "100%",
//             height: "100%",

//             playerVars: {
//               autoplay: 1,
//               mute: 1,
//               playsinline: 1,
//               enablejsapi: 1,
//               rel: 0,
//               modestbranding: 1,
//               origin: window.location.origin,
//             },

//             events: {
//               onReady: (event: any) => {
//                 if (cancelled) return;

//                 setPlayerReady(true);

//                 try {
//                   event.target.playVideo();
//                 } catch {}

//                 /*
//                  * Clean up previous timer
//                  */
//                 if (
//                   controlsTimerRef.current !== null
//                 ) {
//                   clearTimeout(
//                     controlsTimerRef.current
//                   );
//                 }

//                 /*
//                  * Delay controls slightly
//                  */
//                 controlsTimerRef.current =
//                   window.setTimeout(() => {
//                     if (!cancelled) {
//                       setControlsVisible(true);
//                     }
//                   }, 150);
//               },

//               onStateChange: (event: any) => {
//                 if (cancelled) return;

//                 if (event.data === 1) {
//                   setIsPlaying(true);
//                 }

//                 if (event.data === 2) {
//                   setIsPlaying(false);
//                 }
//               },
//             },
//           }
//         );
//     };

//     if (window.YT?.Player) {
//       createPlayer();
//     } else {
//       const previousCallback =
//         window.onYouTubeIframeAPIReady;

//       window.onYouTubeIframeAPIReady = () => {
//         previousCallback?.();
//         createPlayer();
//       };

//       return () => {
//         cancelled = true;

//         if (
//           window.onYouTubeIframeAPIReady
//         ) {
//           window.onYouTubeIframeAPIReady =
//             previousCallback;
//         }
//       };
//     }

//     return () => {
//       cancelled = true;

//       if (
//         controlsTimerRef.current !== null
//       ) {
//         clearTimeout(
//           controlsTimerRef.current
//         );

//         controlsTimerRef.current = null;
//       }
//     };
//   }, [showVideo, currentVideoIndex]);

//   /*
//    * -------------------------------------------------------
//    * DESTROY PLAYER ON COMPONENT UNMOUNT
//    * -------------------------------------------------------
//    */

//   useEffect(() => {
//     return () => {
//       const player = playerRef.current;

//       if (controlsTimerRef.current !== null) {
//         clearTimeout(
//           controlsTimerRef.current
//         );

//         controlsTimerRef.current = null;
//       }

//       if (player) {
//         try {
//           player.stopVideo?.();
//         } catch {}

//         try {
//           player.destroy?.();
//         } catch {}

//         playerRef.current = null;
//       }
//     };
//   }, []);

//   /*
//    * -------------------------------------------------------
//    * SCROLL INDICATOR ANIMATION
//    * -------------------------------------------------------
//    */

//   useEffect(() => {
//     if (!scrollVidRef.current) return;

//     const tween = gsap.to(
//       scrollVidRef.current,
//       {
//         y: 10,
//         duration: 0.5,
//         repeat: -1,
//         yoyo: true,
//         ease: "power1.inOut",
//       }
//     );

//     return () => {
//       tween.kill();
//     };
//   }, []);

//   /*
//    * -------------------------------------------------------
//    * PLAY / PAUSE
//    * -------------------------------------------------------
//    */

//   const togglePlay = useCallback(() => {
//     const player = playerRef.current;

//     if (!player) return;

//     try {
//       if (isPlaying) {
//         player.pauseVideo();
//       } else {
//         player.playVideo();
//       }
//     } catch {}
//   }, [isPlaying]);

//   /*
//    * -------------------------------------------------------
//    * CHANGE VIDEO
//    * -------------------------------------------------------
//    */

//   const goToVideo = useCallback(
//     (index: number) => {
//       const total =
//         YOUTUBE_VIDEO_IDS.length;

//       const nextIndex =
//         (index + total) % total;

//       const player =
//         playerRef.current;

//       /*
//        * Update React state
//        */
//       setCurrentVideoIndex(nextIndex);

//       /*
//        * Immediately change YouTube video
//        * if player already exists.
//        */
//       if (
//         player &&
//         typeof player.loadVideoById ===
//           "function"
//       ) {
//         try {
//           player.loadVideoById(
//             YOUTUBE_VIDEO_IDS[nextIndex]
//           );

//           setIsPlaying(true);
//         } catch {}
//       }
//     },
//     []
//   );

//   const goToPrevVideo = useCallback(() => {
//     goToVideo(
//       currentVideoIndex - 1
//     );
//   }, [
//     goToVideo,
//     currentVideoIndex,
//   ]);

//   const goToNextVideo = useCallback(() => {
//     goToVideo(
//       currentVideoIndex + 1
//     );
//   }, [
//     goToVideo,
//     currentVideoIndex,
//   ]);

//   /*
//    * -------------------------------------------------------
//    * MAIN GSAP / SCROLLTRIGGER ANIMATION
//    * -------------------------------------------------------
//    */

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       /*
//        * ---------------------------------------------------
//        * INITIAL STATES
//        * ---------------------------------------------------
//        */

//       gsap.set(leftRef.current, {
//         x: "-2.5vw",
//         opacity: 1,
//       });

//       gsap.set(rightRef.current, {
//         x: "2.5vw",
//         opacity: 1,
//       });

//       gsap.set(cloudRef.current, {
//         opacity: 0,
//       });

//       gsap.set(midCloudR.current, {
//         x: "2.5vw",
//         opacity: 1,
//       });

//       gsap.set(headRef.current, {
//         y: "-40vh",
//         opacity: 1,
//       });

//       gsap.set(bottomL.current, {
//         x: "-2.5vw",
//         y: "2.5vh",
//         opacity: 1,
//       });

//       gsap.set(lampLRef.current, {
//         x: "-2.5vw",
//         y: "2.5vh",
//         opacity: 1,
//         scale: 0.7,
//       });

//       gsap.set(LampRRef.current, {
//         x: "2.5vw",
//         y: "2.5vh",
//         opacity: 1,
//         scale: 0.7,
//       });

//       gsap.set(bottomR.current, {
//         x: "2.5vw",
//         y: "2.5vh",
//         opacity: 1,
//       });

//       gsap.set(bottomBack.current, {
//         y: "15vh",
//         opacity: 1,
//       });

//       /*
//        * ---------------------------------------------------
//        * RESPONSIVE VIDEO DIMENSIONS
//        * ---------------------------------------------------
//        */

//       const mobile =
//         window.matchMedia(
//           "(max-width: 768px)"
//         ).matches;

//       const boxWidthVw =
//         mobile ? 85 : 63;

//       const boxHeightVh =
//         mobile ? 24 : 62;

//       const VIDEO_ASPECT = 16 / 9;

//       const widthExpr =
//         `min(${boxWidthVw}vw, ${(
//           boxHeightVh *
//           VIDEO_ASPECT
//         ).toFixed(4)}vh)`;

//       const heightExpr =
//         `min(${boxHeightVh}vh, ${(
//           boxWidthVw /
//           VIDEO_ASPECT
//         ).toFixed(4)}vw)`;

//       const leftExpr =
//         `calc(50% - (${widthExpr}) / 2)`;

//       const topExpr =
//         `calc(50% - (${heightExpr}) / 2)`;

//       const CONTROLS_HEIGHT_PCT =
//         mobile ? 12 : 18;

//       const CONTROLS_GAP_PCT = 0.5;

//       /*
//        * ---------------------------------------------------
//        * VIDEO INITIAL STATE
//        * ---------------------------------------------------
//        */

//       gsap.set(vidRef.current, {
//         width: widthExpr,
//         height: heightExpr,
//         left: leftExpr,
//         top: topExpr,
//         opacity: 0,
//       });

//       gsap.set(vidBgRef.current, {
//         width: widthExpr,
//         height: heightExpr,
//         left: leftExpr,
//         top: topExpr,
//         opacity: 0,
//       });

//       gsap.set(controlsRef.current, {
//         width: widthExpr,
//         height: `${CONTROLS_HEIGHT_PCT}vh`,
//         left: leftExpr,
//         top:
//           `calc(${topExpr} + (${heightExpr}) + ${CONTROLS_GAP_PCT}vh)`,
//         opacity: 0,
//       });

//       gsap.set(
//         [
//           bgRef.current,
//           bgSolidRef.current,
//         ],
//         {
//           width: widthExpr,
//           height: heightExpr,
//           left: leftExpr,
//           top: topExpr,
//           xPercent: 0,
//           yPercent: 0,
//           backgroundSize: "100% 100%",
//           backgroundPosition:
//             "center center",
//           backgroundRepeat:
//             "no-repeat",
//         }
//       );

//       /*
//        * ---------------------------------------------------
//        * BACKGROUND INITIAL SCALE
//        * ---------------------------------------------------
//        */

//       const bgBox =
//         bgRef.current?.getBoundingClientRect();

//       const initialScaleX =
//         bgBox && bgBox.width > 0
//           ? window.innerWidth /
//             bgBox.width
//           : 1;

//       const initialScaleY =
//         bgBox && bgBox.height > 0
//           ? window.innerHeight /
//             bgBox.height
//           : 1;

//       gsap.set(bgRef.current, {
//         scaleX: initialScaleX,
//         scaleY: initialScaleY,
//         opacity: 1,
//       });

//       gsap.set(bgSolidRef.current, {
//         scaleX: initialScaleX,
//         scaleY: initialScaleY,
//         opacity: 0,
//       });

//       gsap.set(bgBackRef.current, {
//         opacity: 0.4,
//       });

//       gsap.set(scrollVidRef.current, {
//         opacity: 1,
//       });

//       /*
//        * ---------------------------------------------------
//        * MAIN TIMELINE
//        * ---------------------------------------------------
//        */

//       const tl = gsap.timeline();

//       const SHRINK_DURATION = 0.5;
//       const CROSSFADE_DURATION = 0.35;

//       /*
//        * Background shrink
//        */

//       tl.to(
//         [
//           bgRef.current,
//           bgSolidRef.current,
//         ],
//         {
//           scaleX: 1,
//           scaleY: 1,
//           ease: "none",
//           duration: SHRINK_DURATION,
//         },
//         0
//       );

//       /*
//        * Background fade
//        */

//       tl.to(
//         bgRef.current,
//         {
//           opacity: 0,
//           duration:
//             CROSSFADE_DURATION,
//           ease: "power1.inOut",
//         },
//         SHRINK_DURATION -
//           CROSSFADE_DURATION / 2
//       );

//       tl.to(
//         bgSolidRef.current,
//         {
//           opacity: 1,
//           duration:
//             CROSSFADE_DURATION,
//           ease: "power1.inOut",
//         },
//         SHRINK_DURATION -
//           CROSSFADE_DURATION / 2
//       );

//       tl.to(
//         bgBackRef.current,
//         {
//           opacity: 1,
//           duration: 0.3,
//         },
//         0.4
//       );

//       /*
//        * Scene elements
//        */

//       tl.from(
//         leftRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//         },
//         0
//       );

//       tl.from(
//         rightRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//         },
//         0
//       );

//       tl.from(
//         midCloudR.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//         },
//         0
//       );

//       tl.from(
//         bottomR.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//         },
//         0
//       );

//       tl.from(
//         bottomL.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//         },
//         0
//       );

//       tl.from(
//         bottomBack.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//         },
//         0
//       );

//       tl.from(
//         cloudRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//         },
//         0
//       );

//       tl.from(
//         headRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//         },
//         0
//       );

//       tl.from(
//         lampLRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//           scale: 1,
//         },
//         0
//       );

//       tl.from(
//         LampRRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//           scale: 1,
//         },
//         0
//       );

//       /*
//        * Scroll indicator
//        */

//       tl.to(
//         scrollVidRef.current,
//         {
//           opacity: 0,
//           y: "10vh",
//         },
//         0
//       );

//       /*
//        * Video reveal
//        */

//       tl.to(
//         vidRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//           duration: 0.4,
//           ease: "power1.inOut",
//         },
//         0.5
//       );

//       tl.to(
//         vidBgRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//           duration: 0.4,
//           ease: "power1.inOut",
//         },
//         "<-0.15"
//       );

//       tl.to(
//         controlsRef.current,
//         {
//           x: 0,
//           y: 0,
//           opacity: 1,
//           duration: 0.4,
//           ease: "power1.inOut",
//         },
//         "<"
//       );

//       /*
//        * Solid background disappears
//        */

//       tl.to(
//         bgSolidRef.current,
//         {
//           opacity: 0,
//           duration: 0,
//           ease: "power1.inOut",
//         },
//         "0"
//       );

//       /*
//        * ---------------------------------------------------
//        * SCROLLTRIGGER
//        * ---------------------------------------------------
//        */

//       const VIDEO_REVEAL_TIME =
//         tl.duration() - 0.9;

//       const REVEAL_EPSILON = 0.03;

//       const st =
//         ScrollTrigger.create({
//           trigger:
//             containerRef.current,

//           start: "top top",

//           end: "+=1200",

//           pin: true,

//           scrub: 2,

//           animation: tl,

//           invalidateOnRefresh: true,

//           onUpdate: (self) => {
//             /*
//              * IMPORTANT:
//              *
//              * ScrollTrigger can call onUpdate
//              * many times per second.
//              *
//              * Don't continuously update React
//              * state unless the value actually
//              * changes.
//              */

//             const reached =
//               tl.time() >=
//                 VIDEO_REVEAL_TIME -
//                   REVEAL_EPSILON ||
//               self.progress >= 0.985;

//             if (
//               showVideoRef.current !==
//               reached
//             ) {
//               showVideoRef.current =
//                 reached;

//               setShowVideo(reached);
//             }
//           },

//           onLeave: () => {
//             if (
//               !showVideoRef.current
//             ) {
//               showVideoRef.current =
//                 true;

//               setShowVideo(true);
//             }
//           },

//           onEnterBack: () => {
//             if (
//               !showVideoRef.current
//             ) {
//               showVideoRef.current =
//                 true;

//               setShowVideo(true);
//             }
//           },
//         });

//       scrollTriggerRef.current = st;

//       /*
//        * ---------------------------------------------------
//        * REFRESH HANDLING
//        *
//        * Debounce resize so ScrollTrigger isn't
//        * refreshed dozens of times while resizing.
//        * ---------------------------------------------------
//        */

//       let resizeTimer: number | null =
//         null;

//       const refresh = () => {
//         if (
//           !isNavigatingRef.current
//         ) {
//           ScrollTrigger.refresh();
//         }
//       };

//       const handleResize = () => {
//         if (resizeTimer !== null) {
//           clearTimeout(resizeTimer);
//         }

//         resizeTimer =
//           window.setTimeout(() => {
//             if (
//               !isNavigatingRef.current
//             ) {
//               ScrollTrigger.refresh();
//             }
//           }, 150);
//       };

//       requestAnimationFrame(refresh);

//       window.addEventListener(
//         "load",
//         refresh
//       );

//       window.addEventListener(
//         "resize",
//         handleResize
//       );

//       /*
//        * ---------------------------------------------------
//        * CLEANUP
//        * ---------------------------------------------------
//        */

//       return () => {
//         if (resizeTimer !== null) {
//           clearTimeout(resizeTimer);
//         }

//         window.removeEventListener(
//           "load",
//           refresh
//         );

//         window.removeEventListener(
//           "resize",
//           handleResize
//         );

//         if (
//           scrollTriggerRef.current ===
//           st
//         ) {
//           scrollTriggerRef.current =
//             null;
//         }

//         st.kill();

//         tl.kill();
//       };
//     }, containerRef);

//     return () => {
//       ctx.revert();
//     };
//   }, []);

//   /*
//    * -------------------------------------------------------
//    * SCROLL TO END
//    * -------------------------------------------------------
//    */

//   const clickHandler = useCallback(() => {
//     const st =
//       scrollTriggerRef.current;

//     if (!st) return;

//     window.scrollTo({
//       top: st.end,
//       behavior: "smooth",
//     });
//   }, []);

//   /*
//    * -------------------------------------------------------
//    * RENDER
//    * -------------------------------------------------------
//    */

//   return (
//     <div
//       ref={containerRef}
//       className={styles.about}
//     >
//       {/*
//        * BACKGROUND
//        */}

//       <div
//         ref={bgBackRef}
//         className={styles.bgBack}
//         style={{
//           backgroundImage: `url(${bgback})`,
//         }}
//       />

//       <div
//         ref={bgRef}
//         className={styles.bgFront}
//         style={{
//           backgroundImage: `url(${cover})`,
//         }}
//       />

//       <div
//         ref={bgSolidRef}
//         className={styles.bgFrontSolid}
//         style={{
//           backgroundImage: `url(${cover})`,
//         }}
//       />

//       {/*
//        * CLOUD / INTRO
//        */}

//       <div
//         ref={cloudRef}
//         className={styles.cloud}
//       >
//         <SvgImg src={cloud} />

//         <div
//           onClick={clickHandler}
//           className={styles.play}
//         >
//           <SvgImg src={play} />
//         </div>

//         <div className={styles.text}>
//           Oasis, the annual cultural
//           extravaganza of Birla
//           Institute of Technology and
//           Science, Pilani, has been a
//           vibrant part of India's cultural
//           tapestry since 1971. Managed
//           entirely by students, it's a
//           dazzling showcase of talent in
//           Dance, Drama, Literature,
//           Comedy, Fashion, and Music.
//           It's where dreams come alive,
//           laughter fills the air, and
//           creativity knows no bounds.
//           Step into the world of Oasis,
//           where youth's boundless
//           potential shines...
//         </div>
//       </div>

//       {/*
//        * VIDEO
//        */}

//       <div
//         className={styles.video}
//         ref={vidRef}
//       >
//         <div
//           className={`${styles.videoIframe} ${
//             playerReady
//               ? styles.playerVisible
//               : ""
//           }`}
//         >
//           <div
//             ref={playerElRef}
//             style={{
//               width: "100%",
//               height: "100%",
//             }}
//           />
//         </div>
//       </div>

//       {/*
//        * VIDEO BACKGROUND
//        */}

//       <div
//         className={styles.bgVid}
//         ref={vidBgRef}
//         style={{
//           backgroundImage: `url(${bgVid})`,
//         }}
//       />

//       {/*
//        * VIDEO CONTROLS
//        */}

//       <div
//         className={`${styles.videoControls} ${
//           controlsVisible
//             ? styles.controlsVisible
//             : ""
//         }`}
//         ref={controlsRef}
//         style={{
//           backgroundImage: `url(${bgCon})`,
//         }}
//       >
//         <button
//           type="button"
//           className={`${styles.controlBtn} ${styles.rewindBtn}`}
//           onClick={goToPrevVideo}
//           aria-label="Previous video"
//         >
//           <img
//             src={ff}
//             alt="Rewind"
//           />
//         </button>

//         <button
//           type="button"
//           className={`${styles.controlBtn} ${styles.playPauseBtn}`}
//           onClick={togglePlay}
//           aria-label={
//             isPlaying
//               ? "Pause video"
//               : "Play video"
//           }
//         >
//           <img
//             src={playBtn}
//             alt=""
//           />
//         </button>

//         <button
//           type="button"
//           className={`${styles.controlBtn} ${styles.ffBtn}`}
//           onClick={goToNextVideo}
//           aria-label="Next video"
//         >
//           <img
//             src={ff}
//             alt="Fast Forward"
//           />
//         </button>
//       </div>

//       {/*
//        * BOTTOM BACKGROUND
//        */}

//       <div
//         className={styles.bgBottom}
//         ref={bottomBack}
//       >
//         <img
//           src={backBg}
//           alt="Background"
//           loading="eager"
//           decoding="async"
//         />
//       </div>

//       {/*
//        * CLOUDS
//        */}

//       <div
//         ref={bottomL}
//         className={styles.leftCloud}
//       >
//         <SvgImg src={leftCloud} />
//       </div>

//       {/*
//        * HEAD
//        */}

//       <div
//         ref={headRef}
//         className={styles.head}
//       >
//         <SvgImg src={head} />
//       </div>

//       {/*
//        * LEFT TOP
//        */}

//       <div
//         ref={leftRef}
//         className={styles.leftTop}
//       >
//         <SvgImg src={bgLeft} />
//       </div>

//       {/*
//        * RIGHT CLOUD
//        */}

//       <div
//         ref={bottomR}
//         className={styles.rightCloud}
//       >
//         <SvgImg src={leftCloud} />
//       </div>

//       {/*
//        * MIDDLE CLOUD
//        */}

//       <div
//         ref={midCloudR}
//         className={styles.midCloudR}
//       />

//       {/*
//        * RIGHT TOP
//        */}

//       <div
//         ref={rightRef}
//         className={styles.rightTop}
//       >
//         <SvgImg src={leftTop} />
//       </div>

//       {/*
//        * LAMPS
//        */}

//       <div
//         ref={lampLRef}
//         className={styles.lamp}
//       >
//         <SvgImg src={lamp} />
//       </div>

//       <div
//         ref={LampRRef}
//         className={styles.lampR}
//       >
//         <SvgImg src={lamp} />
//       </div>

//       {/*
//        * SCROLL INDICATOR
//        */}

//       <div
//         ref={scrollVidRef}
//         className={styles.scrollVid}
//       >
//         <SvgImg src={scrollVid} />
//       </div>

//       {/*
//        * BACK BUTTON
//        */}

//       <div
//         className={styles.backBtn}
//         onClick={handleBackClick}
//       >
//         <SvgImg src={backBtn} />
//       </div>

//       {/*
//        * PRELOADER
//        */}

//       {!aboutPreloaderDone && (
//         <Preloader
//           assets={ABOUT_ASSETS}
//           onEnter={
//             handleAboutPreloaderEnter
//           }
//         />
//       )}
//     </div>
//   );
// };

// export default About;



import styles from "../styles/About.module.scss";

import Preloader from "./Preloader";

const bgback = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418120/bgback.webp";
const cloud = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418122/cloud.webp";
const backBg = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418120/bgBottom.webp";
const leftCloud = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418215/leftCloud.webp";//
const leftTop = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418356/pillarTop-trimmed.webp"; //
const leftTopMob = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418222/leftTop-trimmed.webp";//
const head = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418214/head.png";
const lamp = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418215/lamp.webp";//
const bgCon = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790412288/bgCont.png";
const play = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418372/play.webp";//
const ff = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418213/ffControl.png";//
const playBtn = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418372/playBtn.webp";  //
const bgVid = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790412288/bgVideo.png";
const cover = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418147/cover.webp";//
const backBtn = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418122/bgVideo.webp";//
const scrollVid = "https://res.cloudinary.com/bhfhuzru/image/upload/v1790418373/scrollVid.png";//

import { useTransition } from "../context/TransitionProvider";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const ABOUT_ASSETS = [
  bgback,
  cloud,
  backBg,
  leftCloud,
  leftTop,
  leftTopMob,
  head,
  lamp,
  bgCon,
  play,
  ff,
  playBtn,
  bgVid,
  cover,
  backBtn,
  scrollVid,
];

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  ignoreMobileResize: true,
});

const SvgImg = ({
  src,
  fit = "contain",
}: {
  src: string;
  fit?: "contain" | "cover";
}) => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid meet"
  >
    <image
      href={src}
      x="0"
      y="0"
      width="100"
      height="100"
      preserveAspectRatio={
        fit === "cover"
          ? "xMidYMid slice"
          : "xMidYMid meet"
      }
    />
  </svg>
);

const YOUTUBE_VIDEO_IDS = [
  "V9LHjddKR_M",
  "5MtkggVC0w0",
  "ZCrClSBM1ns",
];

const About = () => {
  const { navigateWithTransition } = useTransition();

  /*
   * -------------------------------------------------------
   * STATE
   * -------------------------------------------------------
   */

  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [aboutPreloaderDone, setAboutPreloaderDone] =
    useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] =
    useState(0);

  /*
   * -------------------------------------------------------
   * REFS
   * -------------------------------------------------------
   */

  const playerElRef =
    useRef<HTMLDivElement | null>(null);

  const playerRef = useRef<any>(null);

  const controlsTimerRef =
    useRef<number | null>(null);

  const videoStartedRef = useRef(false);

  const showVideoRef = useRef(false);

  const isNavigatingRef = useRef(false);

  const scrollTriggerRef =
    useRef<ScrollTrigger | null>(null);

  const vidBgRef =
    useRef<HTMLDivElement | null>(null);

  const vidRef =
    useRef<HTMLDivElement | null>(null);

  const controlsRef =
    useRef<HTMLDivElement | null>(null);

  const leftRef =
    useRef<HTMLDivElement | null>(null);

  const rightRef =
    useRef<HTMLDivElement | null>(null);

  const midCloudR =
    useRef<HTMLDivElement | null>(null);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const bgBackRef =
    useRef<HTMLDivElement | null>(null);

  const bgRef =
    useRef<HTMLDivElement | null>(null);

  const bgSolidRef =
    useRef<HTMLDivElement | null>(null);

  const lampLRef =
    useRef<HTMLDivElement | null>(null);

  const LampRRef =
    useRef<HTMLDivElement | null>(null);

  const bottomR =
    useRef<HTMLDivElement | null>(null);

  const bottomL =
    useRef<HTMLDivElement | null>(null);

  const scrollVidRef =
    useRef<HTMLDivElement | null>(null);

  const bottomBack =
    useRef<HTMLDivElement | null>(null);

  const headRef =
    useRef<HTMLDivElement | null>(null);

  const cloudRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * -------------------------------------------------------
   * RESPONSIVE ASSET
   * -------------------------------------------------------
   */

  const isMobile =
    window.matchMedia("(max-width: 1000px)").matches;

  const bgLeft = isMobile
    ? leftTopMob
    : leftTop;

  /*
   * -------------------------------------------------------
   * PRELOADER
   * -------------------------------------------------------
   */

  const handleAboutPreloaderEnter = useCallback(() => {
    setAboutPreloaderDone(true);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, []);

  /*
   * -------------------------------------------------------
   * DESTROY YOUTUBE PLAYER
   * -------------------------------------------------------
   */

  const destroyPlayer = useCallback(() => {
    const player = playerRef.current;

    if (controlsTimerRef.current !== null) {
      clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }

    if (player) {
      try {
        player.stopVideo?.();
      } catch {}

      try {
        player.destroy?.();
      } catch {}
    }

    playerRef.current = null;

    setPlayerReady(false);
    setControlsVisible(false);

    videoStartedRef.current = false;
  }, []);

  /*
   * -------------------------------------------------------
   * BACK BUTTON
   * -------------------------------------------------------
   */

  const handleBackClick = useCallback(() => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;

    /*
     * Destroy YouTube player
     */
    destroyPlayer();

    setShowVideo(false);

    showVideoRef.current = false;

    /*
     * Kill ScrollTrigger
     */
    const st = scrollTriggerRef.current;

    if (st) {
      scrollTriggerRef.current = null;
      st.kill();
    }

    /*
     * Kill any active GSAP tweens
     */
    gsap.killTweensOf([
      containerRef.current,
      vidRef.current,
      vidBgRef.current,
      controlsRef.current,
      bgRef.current,
      bgSolidRef.current,
      bgBackRef.current,
      leftRef.current,
      rightRef.current,
      midCloudR.current,
      bottomL.current,
      bottomR.current,
      bottomBack.current,
      headRef.current,
      cloudRef.current,
      lampLRef.current,
      LampRRef.current,
      scrollVidRef.current,
    ]);

    navigateWithTransition("/");
  }, [destroyPlayer, navigateWithTransition]);

  /*
   * -------------------------------------------------------
   * LOAD YOUTUBE API
   *
   * Load only once.
   * Do not remove the global API script during unmount.
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (window.YT?.Player) return;

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (existingScript) return;

    const tag = document.createElement("script");

    tag.src =
      "https://www.youtube.com/iframe_api";

    tag.async = true;

    document.body.appendChild(tag);
  }, []);

  /*
   * -------------------------------------------------------
   * CREATE YOUTUBE PLAYER
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!showVideo) return;
    if (playerRef.current) return;
    if (!playerElRef.current) return;

    let cancelled = false;

    const createPlayer = () => {
      if (cancelled) return;
      if (!playerElRef.current) return;
      if (playerRef.current) return;
      if (!window.YT?.Player) return;

      playerRef.current =
        new window.YT.Player(
          playerElRef.current,
          {
            videoId:
              YOUTUBE_VIDEO_IDS[
                currentVideoIndex
              ],

            width: "100%",
            height: "100%",

            playerVars: {
              autoplay: 1,
              mute: 1,
              playsinline: 1,
              enablejsapi: 1,
              rel: 0,
              modestbranding: 1,
              origin: window.location.origin,
            },

            events: {
              onReady: (event: any) => {
                if (cancelled) return;

                setPlayerReady(true);

                try {
                  event.target.playVideo();
                } catch {}

                /*
                 * Clean up previous timer
                 */
                if (
                  controlsTimerRef.current !== null
                ) {
                  clearTimeout(
                    controlsTimerRef.current
                  );
                }

                /*
                 * Delay controls slightly
                 */
                controlsTimerRef.current =
                  window.setTimeout(() => {
                    if (!cancelled) {
                      setControlsVisible(true);
                    }
                  }, 150);
              },

              onStateChange: (event: any) => {
                if (cancelled) return;

                if (event.data === 1) {
                  setIsPlaying(true);
                }

                if (event.data === 2) {
                  setIsPlaying(false);
                }
              },
            },
          }
        );
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const previousCallback =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        createPlayer();
      };

      return () => {
        cancelled = true;

        if (
          window.onYouTubeIframeAPIReady
        ) {
          window.onYouTubeIframeAPIReady =
            previousCallback;
        }
      };
    }

    return () => {
      cancelled = true;

      if (
        controlsTimerRef.current !== null
      ) {
        clearTimeout(
          controlsTimerRef.current
        );

        controlsTimerRef.current = null;
      }
    };
  }, [showVideo, currentVideoIndex]);

  /*
   * -------------------------------------------------------
   * DESTROY PLAYER ON COMPONENT UNMOUNT
   * -------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      const player = playerRef.current;

      if (controlsTimerRef.current !== null) {
        clearTimeout(
          controlsTimerRef.current
        );

        controlsTimerRef.current = null;
      }

      if (player) {
        try {
          player.stopVideo?.();
        } catch {}

        try {
          player.destroy?.();
        } catch {}

        playerRef.current = null;
      }
    };
  }, []);

  /*
   * -------------------------------------------------------
   * SCROLL INDICATOR ANIMATION
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!scrollVidRef.current) return;

    const tween = gsap.to(
      scrollVidRef.current,
      {
        y: 10,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      }
    );

    return () => {
      tween.kill();
    };
  }, []);

  /*
   * -------------------------------------------------------
   * PLAY / PAUSE
   * -------------------------------------------------------
   */

  const togglePlay = useCallback(() => {
    const player = playerRef.current;

    if (!player) return;

    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch {}
  }, [isPlaying]);

  /*
   * -------------------------------------------------------
   * CHANGE VIDEO
   * -------------------------------------------------------
   */

  const goToVideo = useCallback(
    (index: number) => {
      const total =
        YOUTUBE_VIDEO_IDS.length;

      const nextIndex =
        (index + total) % total;

      const player =
        playerRef.current;

      /*
       * Update React state
       */
      setCurrentVideoIndex(nextIndex);

      /*
       * Immediately change YouTube video
       * if player already exists.
       */
      if (
        player &&
        typeof player.loadVideoById ===
          "function"
      ) {
        try {
          player.loadVideoById(
            YOUTUBE_VIDEO_IDS[nextIndex]
          );

          setIsPlaying(true);
        } catch {}
      }
    },
    []
  );

  const goToPrevVideo = useCallback(() => {
    goToVideo(
      currentVideoIndex - 1
    );
  }, [
    goToVideo,
    currentVideoIndex,
  ]);

  const goToNextVideo = useCallback(() => {
    goToVideo(
      currentVideoIndex + 1
    );
  }, [
    goToVideo,
    currentVideoIndex,
  ]);

  /*
   * -------------------------------------------------------
   * MAIN GSAP / SCROLLTRIGGER ANIMATION
   * -------------------------------------------------------
   */

  useEffect(() => {
    const ctx = gsap.context(() => {
      /*
       * ---------------------------------------------------
       * INITIAL STATES
       * ---------------------------------------------------
       */

      gsap.set(leftRef.current, {
        x: "-2.5vw",
        opacity: 1,
      });

      gsap.set(rightRef.current, {
        x: "2.5vw",
        opacity: 1,
      });

      gsap.set(cloudRef.current, {
        opacity: 0,
      });

      gsap.set(midCloudR.current, {
        x: "2.5vw",
        opacity: 1,
      });

      gsap.set(headRef.current, {
        y: "-40vh",
        opacity: 1,
      });

      gsap.set(bottomL.current, {
        x: "-2.5vw",
        y: "2.5vh",
        opacity: 1,
      });

      gsap.set(lampLRef.current, {
        x: "-2.5vw",
        y: "2.5vh",
        opacity: 1,
        scale: 0.7,
      });

      gsap.set(LampRRef.current, {
        x: "2.5vw",
        y: "2.5vh",
        opacity: 1,
        scale: 0.7,
      });

      gsap.set(bottomR.current, {
        x: "2.5vw",
        y: "2.5vh",
        opacity: 1,
      });

      gsap.set(bottomBack.current, {
        y: "15vh",
        opacity: 1,
      });

      /*
       * ---------------------------------------------------
       * RESPONSIVE VIDEO DIMENSIONS
       * ---------------------------------------------------
       */

      const mobile =
        window.matchMedia(
          "(max-width: 768px)"
        ).matches;

      const boxWidthVw =
        mobile ? 85 : 63;

      const boxHeightVh =
        mobile ? 24 : 62;

      const VIDEO_ASPECT = 16 / 9;

      const widthExpr =
        `min(${boxWidthVw}vw, ${(
          boxHeightVh *
          VIDEO_ASPECT
        ).toFixed(4)}vh)`;

      const heightExpr =
        `min(${boxHeightVh}vh, ${(
          boxWidthVw /
          VIDEO_ASPECT
        ).toFixed(4)}vw)`;

      const leftExpr =
        `calc(50% - (${widthExpr}) / 2)`;

      const topExpr =
        `calc(50% - (${heightExpr}) / 2)`;

      const CONTROLS_HEIGHT_PCT =
        mobile ? 12 : 18;

      const CONTROLS_GAP_PCT = 0.5;

      /*
       * ---------------------------------------------------
       * VIDEO INITIAL STATE
       * ---------------------------------------------------
       */

      gsap.set(vidRef.current, {
        width: widthExpr,
        height: heightExpr,
        left: leftExpr,
        top: topExpr,
        opacity: 0,
      });

      gsap.set(vidBgRef.current, {
        width: widthExpr,
        height: heightExpr,
        left: leftExpr,
        top: topExpr,
        opacity: 0,
      });

      gsap.set(controlsRef.current, {
        width: widthExpr,
        height: `${CONTROLS_HEIGHT_PCT}vh`,
        left: leftExpr,
        top:
          `calc(${topExpr} + (${heightExpr}) + ${CONTROLS_GAP_PCT}vh)`,
        opacity: 0,
      });

      gsap.set(
        [
          bgRef.current,
          bgSolidRef.current,
        ],
        {
          width: widthExpr,
          height: heightExpr,
          left: leftExpr,
          top: topExpr,
          xPercent: 0,
          yPercent: 0,
          backgroundSize: "100% 100%",
          backgroundPosition:
            "center center",
          backgroundRepeat:
            "no-repeat",
        }
      );

      /*
       * ---------------------------------------------------
       * BACKGROUND INITIAL SCALE
       * ---------------------------------------------------
       */

      const bgBox =
        bgRef.current?.getBoundingClientRect();

      const initialScaleX =
        bgBox && bgBox.width > 0
          ? window.innerWidth /
            bgBox.width
          : 1;

      const initialScaleY =
        bgBox && bgBox.height > 0
          ? window.innerHeight /
            bgBox.height
          : 1;

      gsap.set(bgRef.current, {
        scaleX: initialScaleX,
        scaleY: initialScaleY,
        opacity: 1,
      });

      gsap.set(bgSolidRef.current, {
        scaleX: initialScaleX,
        scaleY: initialScaleY,
        opacity: 0,
      });

      gsap.set(bgBackRef.current, {
        opacity: 0.4,
      });

      gsap.set(scrollVidRef.current, {
        opacity: 1,
      });

      /*
       * ---------------------------------------------------
       * MAIN TIMELINE
       * ---------------------------------------------------
       */

      const tl = gsap.timeline();

      const SHRINK_DURATION = 0.5;
      const CROSSFADE_DURATION = 0.35;

      /*
       * Background shrink
       */

      tl.to(
        [
          bgRef.current,
          bgSolidRef.current,
        ],
        {
          scaleX: 1,
          scaleY: 1,
          ease: "none",
          duration: SHRINK_DURATION,
        },
        0
      );

      /*
       * Background fade
       */

      tl.to(
        bgRef.current,
        {
          opacity: 0,
          duration:
            CROSSFADE_DURATION,
          ease: "power1.inOut",
        },
        SHRINK_DURATION -
          CROSSFADE_DURATION / 2
      );

      tl.to(
        bgSolidRef.current,
        {
          opacity: 1,
          duration:
            CROSSFADE_DURATION,
          ease: "power1.inOut",
        },
        SHRINK_DURATION -
          CROSSFADE_DURATION / 2
      );

      tl.to(
        bgBackRef.current,
        {
          opacity: 1,
          duration: 0.3,
        },
        0.4
      );

      /*
       * Scene elements
       */

      tl.from(
        leftRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );

      tl.from(
        rightRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );

      tl.from(
        midCloudR.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );

      tl.from(
        bottomR.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );

      tl.from(
        bottomL.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );

      tl.from(
        bottomBack.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );

      tl.from(
        cloudRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );

      tl.from(
        headRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
        },
        0
      );

      tl.from(
        lampLRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
        },
        0
      );

      tl.from(
        LampRRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
        },
        0
      );

      /*
       * Scroll indicator
       */

      tl.to(
        scrollVidRef.current,
        {
          opacity: 0,
          y: "10vh",
        },
        0
      );

      /*
       * Video reveal
       */

      tl.to(
        vidRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power1.inOut",
        },
        0.5
      );

      tl.to(
        vidBgRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power1.inOut",
        },
        "<-0.15"
      );

      tl.to(
        controlsRef.current,
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power1.inOut",
        },
        "<"
      );

      /*
       * Solid background disappears
       */

      tl.to(
        bgSolidRef.current,
        {
          opacity: 0,
          duration: 0,
          ease: "power1.inOut",
        },
        "0"
      );

      /*
       * ---------------------------------------------------
       * SCROLLTRIGGER
       * ---------------------------------------------------
       */

      const VIDEO_REVEAL_TIME =
        tl.duration() - 0.9;

      const REVEAL_EPSILON = 0.03;

      const st =
        ScrollTrigger.create({
          trigger:
            containerRef.current,

          start: "top top",

          end: "+=1200",

          pin: true,

          scrub: 2,

          animation: tl,

          invalidateOnRefresh: true,

          onUpdate: (self) => {
            /*
             * IMPORTANT:
             *
             * ScrollTrigger can call onUpdate
             * many times per second.
             *
             * Don't continuously update React
             * state unless the value actually
             * changes.
             */

            const reached =
              tl.time() >=
                VIDEO_REVEAL_TIME -
                  REVEAL_EPSILON ||
              self.progress >= 0.985;

            if (
              showVideoRef.current !==
              reached
            ) {
              showVideoRef.current =
                reached;

              setShowVideo(reached);
            }
          },

          onLeave: () => {
            if (
              !showVideoRef.current
            ) {
              showVideoRef.current =
                true;

              setShowVideo(true);
            }
          },

          onEnterBack: () => {
            if (
              !showVideoRef.current
            ) {
              showVideoRef.current =
                true;

              setShowVideo(true);
            }
          },
        });

      scrollTriggerRef.current = st;

      /*
       * ---------------------------------------------------
       * REFRESH HANDLING
       *
       * Debounce resize so ScrollTrigger isn't
       * refreshed dozens of times while resizing.
       * ---------------------------------------------------
       */

      let resizeTimer: number | null =
        null;

      const refresh = () => {
        if (
          !isNavigatingRef.current
        ) {
          ScrollTrigger.refresh();
        }
      };

      const handleResize = () => {
        if (resizeTimer !== null) {
          clearTimeout(resizeTimer);
        }

        resizeTimer =
          window.setTimeout(() => {
            if (
              !isNavigatingRef.current
            ) {
              ScrollTrigger.refresh();
            }
          }, 150);
      };

      requestAnimationFrame(refresh);

      window.addEventListener(
        "load",
        refresh
      );

      window.addEventListener(
        "resize",
        handleResize
      );

      /*
       * ---------------------------------------------------
       * CLEANUP
       * ---------------------------------------------------
       */

      return () => {
        if (resizeTimer !== null) {
          clearTimeout(resizeTimer);
        }

        window.removeEventListener(
          "load",
          refresh
        );

        window.removeEventListener(
          "resize",
          handleResize
        );

        if (
          scrollTriggerRef.current ===
          st
        ) {
          scrollTriggerRef.current =
            null;
        }

        st.kill();

        tl.kill();
      };
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  /*
   * -------------------------------------------------------
   * SCROLL TO END
   * -------------------------------------------------------
   */

  const clickHandler = useCallback(() => {
    const st =
      scrollTriggerRef.current;

    if (!st) return;

    window.scrollTo({
      top: st.end,
      behavior: "smooth",
    });
  }, []);

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <div
      ref={containerRef}
      className={styles.about}
    >
      {/*
       * BACKGROUND
       */}

      <div
        ref={bgBackRef}
        className={styles.bgBack}
        style={{
          backgroundImage: `url(${bgback})`,
        }}
      />

      <div
        ref={bgRef}
        className={styles.bgFront}
        style={{
          backgroundImage: `url(${cover})`,
        }}
      />

      <div
        ref={bgSolidRef}
        className={styles.bgFrontSolid}
        style={{
          backgroundImage: `url(${cover})`,
        }}
      />

      {/*
       * CLOUD / INTRO
       */}

      <div
        ref={cloudRef}
        className={styles.cloud}
      >
        <SvgImg src={cloud} />

        <div
          onClick={clickHandler}
          className={styles.play}
        >
          <SvgImg src={play} />
        </div>

        <div className={styles.text}>
          Oasis, the annual cultural
          extravaganza of Birla
          Institute of Technology and
          Science, Pilani, has been a
          vibrant part of India's cultural
          tapestry since 1971. Managed
          entirely by students, it's a
          dazzling showcase of talent in
          Dance, Drama, Literature,
          Comedy, Fashion, and Music.
          It's where dreams come alive,
          laughter fills the air, and
          creativity knows no bounds.
          Step into the world of Oasis,
          where youth's boundless
          potential shines...
        </div>
      </div>

      {/*
       * VIDEO
       */}

      <div
        className={styles.video}
        ref={vidRef}
      >
        <div
          className={`${styles.videoIframe} ${
            playerReady
              ? styles.playerVisible
              : ""
          }`}
        >
          <div
            ref={playerElRef}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/*
       * VIDEO BACKGROUND
       */}

      <div
        className={styles.bgVid}
        ref={vidBgRef}
        style={{
          backgroundImage: `url(${bgVid})`,
        }}
      />

      {/*
       * VIDEO CONTROLS
       */}

      <div
        className={`${styles.videoControls} ${
          controlsVisible
            ? styles.controlsVisible
            : ""
        }`}
        ref={controlsRef}
        style={{
          backgroundImage: `url(${bgCon})`,
        }}
      >
        <button
          type="button"
          className={`${styles.controlBtn} ${styles.rewindBtn}`}
          onClick={goToPrevVideo}
          aria-label="Previous video"
        >
          <img
            src={ff}
            alt="Rewind"
          />
        </button>

        <button
          type="button"
          className={`${styles.controlBtn} ${styles.playPauseBtn}`}
          onClick={togglePlay}
          aria-label={
            isPlaying
              ? "Pause video"
              : "Play video"
          }
        >
          <img
            src={playBtn}
            alt=""
          />
        </button>

        <button
          type="button"
          className={`${styles.controlBtn} ${styles.ffBtn}`}
          onClick={goToNextVideo}
          aria-label="Next video"
        >
          <img
            src={ff}
            alt="Fast Forward"
          />
        </button>
      </div>

      {/*
       * BOTTOM BACKGROUND
       */}

      <div
        className={styles.bgBottom}
        ref={bottomBack}
      >
        <img
          src={backBg}
          alt="Background"
          loading="eager"
          decoding="async"
        />
      </div>

      {/*
       * CLOUDS
       */}

      <div
        ref={bottomL}
        className={styles.leftCloud}
      >
        <SvgImg src={leftCloud} />
      </div>

      {/*
       * HEAD
       */}

      <div
        ref={headRef}
        className={styles.head}
      >
        <SvgImg src={head} />
      </div>

      {/*
       * LEFT TOP
       */}

      <div
        ref={leftRef}
        className={styles.leftTop}
      >
        <SvgImg src={bgLeft} />
      </div>

      {/*
       * RIGHT CLOUD
       */}

      <div
        ref={bottomR}
        className={styles.rightCloud}
      >
        <SvgImg src={leftCloud} />
      </div>

      {/*
       * MIDDLE CLOUD
       */}

      <div
        ref={midCloudR}
        className={styles.midCloudR}
      />

      {/*
       * RIGHT TOP
       */}

      <div
        ref={rightRef}
        className={styles.rightTop}
      >
        <SvgImg src={leftTop} />
      </div>

      {/*
       * LAMPS
       */}

      <div
        ref={lampLRef}
        className={styles.lamp}
      >
        <SvgImg src={lamp} />
      </div>

      <div
        ref={LampRRef}
        className={styles.lampR}
      >
        <SvgImg src={lamp} />
      </div>

      {/*
       * SCROLL INDICATOR
       */}

      <div
        ref={scrollVidRef}
        className={styles.scrollVid}
      >
        <SvgImg src={scrollVid} />
      </div>

      {/*
       * BACK BUTTON
       */}

      <div
        className={styles.backBtn}
        onClick={handleBackClick}
      >
        <SvgImg src={backBtn} />
      </div>

      {/*
       * PRELOADER
       */}

      {!aboutPreloaderDone && (
        <Preloader
          assets={ABOUT_ASSETS}
          onEnter={
            handleAboutPreloaderEnter
          }
        />
      )}
    </div>
  );
};

export default About;