const warmed = new Map<string, Promise<void>>();

export const loadAsset = (url: string): Promise<void> => {
  const hit = warmed.get(url);
  if (hit) return hit;

  const clean = url.split("?")[0].toLowerCase();
  let p: Promise<void>;

  if (/\.(mp4|webm)$/.test(clean)) {
    p = Promise.resolve(); // never download whole videos here
  } else if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(clean)) {
    p = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () =>
        img.decode
          ? img.decode().then(() => resolve(), () => resolve())
          : resolve();
      img.onerror = () => resolve(); // a bad URL must not block the page
      img.src = url;
    });
  } else {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("asset failed: " + url);
        return r.blob();
      })
      .then(() => undefined);
  }

  warmed.set(url, p);
  p.catch(() => warmed.delete(url)); // allow retry on failure
  return p;
};