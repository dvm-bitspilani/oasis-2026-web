import hamLine from "./hamLine.svg";
import navCircle from "./navCircle.svg";
import navSan from "./navSan.svg";
import sandBottom from "./ham/sandBottom.png";
import sandAbove from "./ham/sandAbove.png";
import board from "./ham/board.png";
import guitarBook from "./ham/guitarBook.png";
import trunkStuff from "./ham/trunkStuff.png";
import lidInner from "./ham/lidInner.png";
import lidDome from "./ham/lidDome.png";
import lidEdge from "./ham/lidEdge.png";
import chestWell from "./ham/chestWell.png";
import chestBase from "./ham/chestBase.png";
import bgHome from "./home/bg.jpg";
import Syamsiah from "./fonts/Syamsiah Arabic.ttf";
import EB from "./fonts/EBGaramond-Medium.ttf";
import Cinzel from "./fonts/Cinzel-VariableFont_wght.ttf";

const CLD = "https://res.cloudinary.com/bhfhuzru/image/upload/";
// Plain URL
const cld = (path: string) => CLD + path;
// Optimized: auto format + auto quality (+ optional width cap)
const cldOpt = (path: string, w?: number) =>
  CLD + "f_auto,q_auto" + (w ? ",w_" + w : "") + "/" + path;

// ---------- Home ----------
export const camel1 = cld("camel1.svg");
export const camel2 = cld("camel2.svg");
export const Castle = cld("castlefinal2.png");
export const cloudBig = cld("cloudBig.svg");
export const cloudSmall = cld("cloudSmall.svg");
export const cloudThree = cld("cloudThree.svg");
export const LogoOasis = cld("LogoOasisi.webp");
export const Moon = cld("Moon.webp");
export const sandImg = cld("v1790454105/sandfinal.webp");

// ---------- Registration (optimized) ----------
export const RegBg = cldOpt("RegBg.png", 1920);
export const leftbottom = cldOpt("leftbottom.png", 800);
export const rightbottom = cldOpt("rightbottom.png", 800);
export const lefttop = cldOpt("lefttop.png", 800);
export const righttop = cldOpt("righttop.png", 800);
export const book = cldOpt("book.png", 1200);
export const buttonBg = cldOpt("buttonbg.png", 600);
export const inputBg = cldOpt("inputBg.png", 800);
export const btn = cldOpt("btn.png", 600);
export const searchBg = cldOpt("searchBg.png", 800);
export const line = cldOpt("line.png", 800);
export const wheel = cldOpt("v1790459176/wheel.png", 800);
export const modalFrame = cldOpt("modalFrame.webp", 1400);
export const modalFrameMobile = cldOpt("modalFrameMobile.webp", 800);
export const closedBook = cldOpt("closedBook.webp", 1000);
export const Scroll1 = cldOpt("instructionsScroll.webp", 1000);
export const Scroll2 = cldOpt("instructionsScrollLong.webp", 1000);
export const googleButton = cld("googleReg.svg"); // svg: no transform

// ---------- Lists ----------
export const HOME_ASSETS = [
  bgHome, Castle, cloudBig, cloudSmall, cloudThree, LogoOasis, Moon, sandImg,
];

export const MENU_ASSETS = [
  hamLine, navCircle, sandBottom, sandAbove, board, guitarBook,
  trunkStuff, lidInner, lidDome, lidEdge, chestWell, chestBase,
];

export const REG_ASSETS_DESKTOP = [
  RegBg, leftbottom, rightbottom, lefttop, righttop, book, buttonBg, inputBg,
  btn, searchBg, line, wheel, modalFrame, closedBook, Scroll1, Scroll2, googleButton,
];

export const REG_ASSETS_MOBILE = [
  RegBg, leftbottom, rightbottom, lefttop, righttop, book, buttonBg, inputBg,
  btn, searchBg, line, wheel, modalFrameMobile, closedBook, Scroll1, Scroll2, googleButton,
];

export const FONT_ASSETS = [Syamsiah, EB, Cinzel];

export const isMobileViewport = () => window.innerWidth <= 768;

export const getRegAssets = () =>
  isMobileViewport() ? REG_ASSETS_MOBILE : REG_ASSETS_DESKTOP;

export const getPreloaderAssets = () => {
  const mobile = isMobileViewport();
  return [
    ...HOME_ASSETS,
    ...(mobile ? [] : [camel1, camel2]),
    ...MENU_ASSETS,
    ...(mobile ? [] : [navSan]),
    ...getRegAssets(),
    ...FONT_ASSETS,
  ];
};