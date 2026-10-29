import styles from "./Sponsers.module.scss";

import background from "../../assets/home/bg.jpg";

import Pepero from "../../assets/spons/pep.jpeg";
import travel from "../../assets/spons/travel.jpeg";
import Denver from "../../assets/spons/denver.jpeg";
import Ksheer from "../../assets/spons/Ksheer.png";
import rungta from "../../assets/spons/rungta.jpeg";
import campa from "../../assets/spons/campa.jpeg";
import inglu from "../../assets/spons/ing.png";
import tiny from "../../assets/spons/tiny.jpeg";
import maa from "../../assets/spons/maa.png";
import too from "../../assets/spons/too-yum.jpg";
import skppi from "../../assets/spons/skippi.jpg";
import nuware from "../../assets/spons/nuware.png";
import elova from "../../assets/spons/elova.png";
import plum from "../../assets/spons/plum.png";
import ms from "../../assets/spons/ms.jpg";
import gaba from "../../assets/spons/gaba.png";
import acer from "../../assets/spons/acer.png";
import hdfc from "../../assets/spons/hdfc.png";
import abhi from "../../assets/spons/abhibus.jpeg";
import post from "../../assets/spons/post.png";
import falcon from "../../assets/spons/flacon.jpeg";
import jio from "../../assets/spons/jio.png";
import everything from "../../assets/spons/ever.png";
import qsw from "../../assets/spons/qsw.png";

const sponsorsData = {
  title: {
      head: "Title Sponsor",
      img: acer,
      name: "Acer",
      link: "https://www.acer.com/in-en",
    },
  otherSponsors: [
    {
      head: "Official Fragrance Partner",
      img: Denver,
      name: "Denver",
      link: "https://denverformen.com/collections/buy1get1",
    },
    {
      head: "Official Travel Partner",
      img: travel,
      name: "TravelXP",
      link: "https://www.travelxp.com/en",
    },
    {
      head: "Official Sponsor",
      img: Ksheer,
      name: "Ksheer",
      link: "/",
    },
    {
      head: "Official Beverages Partner",
      img: campa,
      name: "Campa Cola",
      link: "https://campabeverages.com/",
    },
    {
      head: "Powered By",
      img: rungta,
      name: "Rungta Mines",
      link: "/",
    },
    {
      head: "Official Skincare Partner",
      img: plum,
      name: "Plum Goodness",
      link: "/",
    },
    {
      head: "Official Sponsor",
      img: ms,
      name: "M&S",
      link: "https://www.marksandspencer.in/l/offers/flashsale20off/?utm_source=google&utm_medium=search&utm_campaign=9897984394&adgroupid=100463569196&utm_content=829805613295&utm_term=marks%20and%20spencer&gad_source=1&gad_campaignid=9897984394&gbraid=0AAAAACf8bcRLFhBjh8OxenvfW40dSyDcU&gclid=Cj0KCQjw3YvXBhCDARIsAKB-ox96QxiNOLnyEUT3xh__ym8D1p4lHX8NAfhujHecYciF64QHbX3G7vwaAn4eEALw_wcB",
    },
    {
      head: "Official Sponsor",
      img: elova,
      name: "Elova",
      link: "/",
    },
    {
      head: "Official Diamond Partner",
      img: nuware,
      name: "NuWare",
      link: "/",
    },
    {
      head: "Official Sponsor",
      img: skppi,
      name: "Skippi",
      link: "https://skippi.in/?srsltid=AYCX9vLur136H7yVs0YGs6I3QHrD-YEbyf1bABizjx_tySD6NCXIJnvy",
    },
    {
      head: "Official Youth Outreach Partner",
      img: inglu,
      name: "Inglu",
      link: "/",
    },
    {
      head: "Official Sponsor",
      img: tiny,
      name: "Tinyfish",
      link: "/",
    },
    {
      head: "Official Sponsor",
      img: maa,
      name: "Maakarni",
      link: "/",
    },
    {
      head: "Official Snacking Partner",
      img: too,
      name: "TooYum",
      link: "https://tooyumm.com/?srsltid=AYCX9vILZ5-hjEFqPdy4aNl4Ep5915YuCgWg40sJBvnobVtTrXamVo7v",
    },
    
    {
    head: "Official Treat Partner",
    img: Pepero,
    name: "Pepero",
    link: "https://www.lotteindia.com/pepero.html",
  },
    {
      head: "Official Sponsor",
      img: abhi,
      name: "AbhiBus",
      link: "https://www.abhibus.com/",
    },
    {
      head: "Official Banking Partner",
      img: hdfc,
      name: "HDFC",
      link: "https://www.hdfc.bank.in/",
    },
    {
      head: "Official Sponsor",
      img: gaba,
      name: "Gaaba.in",
      link: "https://gaaba.in/",
    },
    {
      head: "Official Poster Partner",
      img: post,
      name: "Posterwa",
      link: "/",
    },
    {
      head: "Official Real Estate Partner",
      img: falcon,
      name: "Falcon Real Estate",
      link: "/",
    },
    {
      head: "Associate Partner",
      img: qsw,
      name: "QSW",
      link: "/",
    },
    {
      head: "Official Streaming Partner",
      img: jio,
      name: "JioSaavn",
      link: "https://www.jiosaavn.com/",
    },
    {
      head: "Official Sponsor",
      img: everything,
      name: "Everything Silly",
      link: "/",
    },
  ],
};

const Sponsors = () => {
  return (
    <div className={styles.Wrapper}>
      <div className={styles.backgroundImage}>
        <img src={background} alt="background" draggable={false} />
      </div>

      <div className={styles.heading}>
        <h1>SPONSORS</h1>
      </div>

      <div className={styles.sponsors}>
        <a href={sponsorsData.title.link} target="_blank" rel="noreferrer">
          <div className={styles.titleSponsor}>
            <div className={styles.head}>{sponsorsData.title.head}</div>

            <div className={styles.titleSponsImage}>
              <img
                src={sponsorsData.title.img}
                alt={sponsorsData.title.name}
              />
            </div>

            <div className={`${styles.titleSponsName} ${styles.sponsName}`}>
              {sponsorsData.title.name}
            </div>
          </div>
        </a>

        <div className={styles.otherSponsors}>
          {sponsorsData.otherSponsors.map((sponsor, index) => (
            <a
              href={sponsor.link}
              target="_blank"
              rel="noreferrer"
              key={index}
            >
              <div className={styles.otherSponsor}>
                <div className={styles.head}>{sponsor.head}</div>

                <div className={styles.otherSponsImage}>
                  <img src={sponsor.img} alt={sponsor.name} />
                </div>

                <div
                  className={`${styles.otherSponsName} ${styles.sponsName}`}
                >
                  {sponsor.name}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sponsors;