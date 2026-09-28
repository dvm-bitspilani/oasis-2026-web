// import React, { forwardRef } from "react";
// import styles from "../../styles/DevPage/DevPage.module.scss";
// import image from "../../assets/DevPage/profile.png"
// interface CharacterProps {
//   image: {image};
//   name: string;
//   instagram?: string;
//   linkedin?: string;
// }

// const Character = forwardRef<HTMLDivElement, CharacterProps>(
//   ({ image, name, instagram, linkedin }, ref) => {
//     return (
//       <div ref={ref} className={styles.character}>
//         <img
//           className={styles.characterImage}
//           src={image}
//           alt={name}
//         />

//         <div className={styles.characterInfo}>
//           <p>{name}</p>

//           <div className={styles.socials}>
//             {instagram && (
//               <a href={instagram} target="_blank" rel="noreferrer">
//                 Instagram
//               </a>
//             )}

//             {linkedin && (
//               <a href={linkedin} target="_blank" rel="noreferrer">
//                 LinkedIn
//               </a>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// Character.displayName = "Character";

// export default Character;
import { forwardRef } from "react";
import styles from "../../styles/DevPage/DevPage.module.scss";

interface CharacterProps {
  image: string;
  name: string;
  instagram?: string;
  linkedin?: string;
  className?: string;
}

const Character = forwardRef<HTMLDivElement, CharacterProps>(
  ({ image, name, instagram, linkedin, className }, ref) => {
    return (
      <div ref={ref} className={`${styles.character} ${className ?? ""}`}>
        <img className={styles.characterImage} src={image} alt={name} />
        <div className={styles.characterInfo}>
          <p>{name}</p>
          <div className={styles.socials}>
            {instagram && (
              <a href={instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            )}

            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Character.displayName = "Character";

export default Character;
