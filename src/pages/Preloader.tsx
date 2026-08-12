import React, { useState, useEffect } from 'react';

const assetList = [
  '/images/hero-bg.jpg',
  '/images/logo.png',
  '/images/banner.jpg'
];

export default function Preloader({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = assetList.length;

    if (totalAssets === 0) {
      setIsLoading(false);
      return;
    }

    assetList.forEach((src) => {
      const img = new Image();
      img.src = src; // Set source after setting events or handle safely
      const handleLoad = () => {
        loadedCount += 1;
        if (loadedCount === totalAssets) {
          setIsLoading(false);
        }
      };
      img.onload = handleLoad;
      img.onerror = handleLoad; // Continue even if an asset fails
    });
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading Assets...</h2>
      </div>
    );
  }

  return children;
}
