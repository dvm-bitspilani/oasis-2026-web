// React.lazy and navigation share these promises without mounting hidden pages.
function cached<T>(importModule: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => pending ??= importModule().catch((error: unknown) => {
    pending = undefined;
    throw error;
  });
}
export const loadHome = cached(() => import("../pages/Home"));
export const loadRegistration = cached(() => import("../pages/registration/Registration"));
export const loadAbout = cached(() => import("../pages/About"));
export const loadEvents = cached(() => import("../pages/EventsPage/EventsPage"));
export const loadContact = cached(() => import("../pages/Contact"));
export const loadComingSoon = cached(() => import("../pages/ComingSoon"));
export const loadPageTransition = cached(() => import("../components/pageTransition/PageTransition"));
export function loadRoute(path: string): Promise<unknown> {
  switch (path.split(/[?#]/)[0].replace(/\/$/, "").toLowerCase()) {
    case "": return loadHome();
    case "/register": return loadRegistration();
    case "/aboutus": return loadAbout();
    case "/events": return loadEvents();
    case "/contactus": return loadContact();
    case "/comingsoon": return loadComingSoon();
    default: return Promise.resolve();
  }
}
