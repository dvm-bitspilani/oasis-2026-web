// // import styles from "./Reginput.module.scss";
// // import inputBg from "../../../assets/registration/reg/inputBg.png";
// // export default function Reginput({ title }) {
// //   return (
// //     <div className={styles.registerContainer} 
// //      style={{backgroundImage:`url(${inputBg})`}}
// //     >
// //         <h2>{title}</h2>
// //       <input type="text" />
// //     </div>
// //   )
// // }


// import styles from "./Reginput.module.scss";
// import inputBg from "../../../assets/registration/reg/inputBg.png";
// import type { UseFormRegisterReturn } from "react-hook-form";

// interface ReginputProps {
//   title: string;
//   registration?: UseFormRegisterReturn;
//   type?: string;
//   placeholder?: string;
//   disabled?: boolean;
// }

// export default function Reginput({
//   title,
//   registration,
//   type = "text",
//   placeholder = "",
//   disabled = false,
// }: ReginputProps) {
//   return (
//     <div
//       className={styles.reginputContainer}
     
//     >
//       <h2 className={styles.inputTitle}>{title}</h2>
// <div   className={styles.inputContainer}   style={{ backgroundImage: `url(${inputBg})` }}>
//       <input
  
//         type={type}
//         placeholder={placeholder}
//         disabled={disabled}
//         {...registration}
//       />
//       </div>
//     </div>
//   );
// }


// import styles from "./Reginput.module.scss";
// import inputBg from "../../../assets/registration/reg/inputBg.png";
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
//       <h2 className={styles.inputTitle}>{title}</h2>

//       <div
//         className={styles.inputContainer}
//         style={{
//           backgroundImage: `url(${inputBg})`,
//         }}
//       >
//         {children ? (
//           children
//         ) : (
//           <input
//             type={type}
//             placeholder={placeholder}
//             disabled={disabled}
//             {...registration}
//           />
//         )}
//       </div>
//     </div>
//   );
// }


// import styles from "./Reginput.module.scss";
// import inputBg from "../../../assets/registration/reg/inputBg.png";
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
//       <h2 className={styles.inputTitle}>{title}</h2>

//       <div
//         className={styles.inputContainer}
//         style={{
//           backgroundImage: `url(${inputBg})`,
//         }}
//       >
//         {children ? (
//           children
//         ) : (
//           <input
//             className={styles.nativeInput}
//             type={type}
//             placeholder={placeholder}
//             disabled={disabled}
//             {...registration}
//           />
//         )}
//       </div>
//     </div>
//   );
// }


// import styles from "./Reginput.module.scss";
// import inputBg from "../../../assets/registration/reg/inputBg.png";
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
//       <h2 className={styles.inputTitle}>{title}</h2>

//       <div
//         className={styles.inputContainer}
//         style={{
//           backgroundImage: `url(${inputBg})`,
//         }}
//       >
//         {children ? (
//           children
//         ) : (
//           <input
//             type={type}
//             placeholder={placeholder}
//             disabled={disabled}
//             {...registration}
//           />
//         )}
//       </div>
//     </div>
//   );
// }






import styles from "./Reginput.module.scss";
import inputBg from "../../../assets/registration/reg/inputBg.png";
import type { ReactNode, ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface ReginputProps {
  title: string;
  registration?: UseFormRegisterReturn;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  children?: ReactNode;

  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Reginput({
  title,
  registration,
  type = "text",
  placeholder = "",
  disabled = false,
  children,
  value,
  onChange,
}: ReginputProps) {
  return (
    <div className={styles.reginputContainer}>
      <h2 className={styles.inputTitle}>
        {title}
      </h2>

      <div
        className={styles.inputContainer}
        style={{
          backgroundImage: `url(${inputBg})`,
        }}
      >
        {children ? (
          children
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={onChange}
            {...registration}
          />
        )}
      </div>
    </div>
  );
}