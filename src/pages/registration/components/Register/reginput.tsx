// import styles from "./Reginput.module.scss";
// import inputBg from "../../../../assets/registration/reg/inputBg.png";
// import inputLine from "../../../../assets/registration/reg/inputLine.png";
// import Leaf from "../../../../assets/registration/reg/leaf.png";
// import type { ReactNode } from "react";
// import type { UseFormRegisterReturn } from "react-hook-form";

// interface ReginputProps {
//   title: string;
//   registration?: UseFormRegisterReturn;
//   type?: string;
//   placeholder?: string;
//   disabled?: boolean;
//   children?: ReactNode;
// }

// export default function Reginput({
//   title,
//   registration,
//   type = "text",
//   placeholder = "",
//   disabled = false,
//   children,
// }: ReginputProps) {
//   return (
//     <div className={styles.reginputContainer}>
//     <div className={styles.inputWrapper}>
//       <h2 className={styles.inputTitle}>{title}</h2>

//       <div
//         className={styles.inputContainer}
//         // style={{
//         //   backgroundImage: `url(${inputBg})`,
//         // }}
//       >
//         {children ? (
//           children
//         ) : (
//           <input
//           className={styles.input}
//             type={type}
//             placeholder={placeholder}
//             disabled={disabled}
//             {...registration}
//           />
//         )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import styles from "./Reginput.module.scss";

// import inputBg from "../../../../assets/registration/reg/inputBg.png";
// import inputLine from "../../../../assets/registration/reg/inputLine.png";
// import Leaf from "../../../../assets/registration/reg/leaf.png";

// import type { ReactNode } from "react";
// import type { UseFormRegisterReturn } from "react-hook-form";

// interface ReginputProps {
//   title: string;
//   registration?: UseFormRegisterReturn;
//   type?: string;
//   placeholder?: string;
//   disabled?: boolean;
//   children?: ReactNode;

//   // Whether this field should have the decorative line + leaf
//   showLine?: boolean;
// }

// export default function Reginput({
//   title,
//   registration,
//   type = "text",
//   placeholder = "",
//   disabled = false,
//   children,
//   showLine = true,
// }: ReginputProps) {
//   return (
//     <div className={styles.reginputContainer}>
//       <div className={styles.inputWrapper}>
//         <h2 className={styles.inputTitle}>{title}</h2>

//         <div
//           className={`${styles.inputContainer} ${
//             showLine ? styles.withLine : styles.withoutLine
//           }`}
//         >
//           <div className={styles.fieldContent}>
//             {children ? (
//               children
//             ) : (
//               <input
//                 className={styles.input}
//                 type={type}
//                 placeholder={placeholder}
//                 disabled={disabled}
//                 {...registration}
//               />
//             )}
//           </div>

//           {showLine && (
//             <div className={styles.fieldLine}>
//               <img
//                 src={inputLine}
//                 className={styles.lineImage}
//                 alt=""
//               />

//               <img
//                 src={Leaf}
//                 className={styles.leaf}
//                 alt=""
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import styles from "./Reginput.module.scss";

import inputLine from "../../../../assets/registration/reg/inputLine.png";
import Leaf from "../../../../assets/registration/reg/leaf.png";

import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface ReginputProps {
  title: string;

  registration?: UseFormRegisterReturn;

  type?: string;

  placeholder?: string;

  disabled?: boolean;

  children?: ReactNode;

  showLine?: boolean;
}

export default function Reginput({
  title,
  registration,
  type = "text",
  placeholder = "",
  disabled = false,
  children,
  showLine = true,
}: ReginputProps) {
  return (
    <div className={styles.reginputContainer}>
      <div className={styles.inputWrapper}>
        <h2 className={styles.inputTitle}>{title}</h2>

        <div className={styles.inputContainer}>
          <div className={styles.fieldContent}>
            {children ? (
              children
            ) : (
              <input
                className={styles.input}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...registration}
              />
            )}
          </div>

          {showLine && (
            <div className={styles.fieldLine}>
              <img src={inputLine} className={styles.lineImage} alt="" />

              <img src={Leaf} className={styles.leaf} alt="" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
