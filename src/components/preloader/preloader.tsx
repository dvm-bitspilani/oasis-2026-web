import React, { useEffect, useState } from "react";
import "./Preloader.css";

const Preloader = ({ assets = [], onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [moonProgress, setMoonProgress] = useState(0);
  const [finished, setFinished] = useState(false);

  // ==========================================
  // LOAD ASSETS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const loadAssets = async () => {
      if (!assets || assets.length === 0) {
        setProgress(100);
        return;
      }

      let loadedCount = 0;

      const loadImage = (src) => {
        return new Promise((resolve) => {
          const img = new Image();

          const finish = () => {
            loadedCount++;

            if (!cancelled) {
              const percentage = Math.round(
                (loadedCount / assets.length) * 100
              );

              setProgress(percentage);
            }

            resolve();
          };

          img.onload = finish;
          img.onerror = finish;

          img.src = src;
        });
      };

      await Promise.all(
        assets.map(loadImage)
      );

      if (cancelled) return;

      setProgress(100);
    };

    loadAssets();

    return () => {
      cancelled = true;
    };
  }, [assets]);


  // ==========================================
  // SLOW MOON ANIMATION
  // ==========================================

  useEffect(() => {
    let animationFrame;

    const animateMoon = () => {
      setMoonProgress((current) => {
        const difference =
          progress - current;

        // Lower = slower
        const speed = 0.025;

        if (Math.abs(difference) < 0.1) {
          return progress;
        }

        return current + difference * speed;
      });

      animationFrame =
        requestAnimationFrame(
          animateMoon
        );
    };

    animationFrame =
      requestAnimationFrame(
        animateMoon
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );
    };
  }, [progress]);


  // ==========================================
  // FINISH
  // ==========================================

  useEffect(() => {
    if (progress !== 100) return;

    if (moonProgress < 99.5) return;

    setFinished(true);

    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => {
      clearTimeout(timer);
    };

  }, [
    progress,
    moonProgress,
    onComplete,
  ]);


  // ==========================================
  // MOON POSITION
  // ==========================================

  const moonOffset =
    -55 +
    (moonProgress / 100) * 55;


  return (
    <div
      className={`preloader ${
        finished
          ? "preloaderFinished"
          : ""
      }`}
    >

      {/* =====================================
          STARS
      ===================================== */}

      <div className="stars">

        <span className="star star1" />
        <span className="star star2" />
        <span className="star star3" />
        <span className="star star4" />
        <span className="star star5" />
        <span className="star star6" />
        <span className="star star7" />
        <span className="star star8" />

      </div>


      {/* =====================================
          BACKGROUND CLOUDS
      ===================================== */}

      <div className="cloudLayer cloudLayerBack">

        <div className="cloud cloud1">
          <span />
          <span />
          <span />
        </div>

        <div className="cloud cloud2">
          <span />
          <span />
          <span />
        </div>

      </div>


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="preloaderContent">

        {/* ===================================
            MOON
        =================================== */}

        <div
          className={`moonWrapper ${
            finished
              ? "moonExit"
              : ""
          }`}
        >

          {/* Dark moon */}

          <div className="moon moonDark" />


          {/* Illuminated moon */}

          <div
            className="moon moonLight"
            style={{
              transform:
                `translateX(${moonOffset}px)`,
            }}
          >

            {/* Moon craters */}

            <span className="crater crater1" />
            <span className="crater crater2" />
            <span className="crater crater3" />
            <span className="crater crater4" />
            <span className="crater crater5" />
            <span className="crater crater6" />
            <span className="crater crater7" />
            <span className="crater crater8" />

          </div>


          {/* Moon glow */}

          <div
            className="moonGlow"
            style={{
              opacity:
                0.12 +
                moonProgress / 170,
            }}
          />

        </div>


        {/* ===================================
            CLOUDS IN FRONT OF MOON
        =================================== */}

        <div className="cloudLayer cloudLayerFront">

          <div className="cloud cloud3">
            <span />
            <span />
            <span />
          </div>

          <div className="cloud cloud4">
            <span />
            <span />
            <span />
          </div>

        </div>


        {/* ===================================
            LOADING
        =================================== */}

        <div className="loadingInfo">

          <div className="loadingPercentage">
            {progress}%
          </div>

          <div className="loadingText">
            {progress < 100
              ? "LOADING"
              : "WELCOME"}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Preloader;