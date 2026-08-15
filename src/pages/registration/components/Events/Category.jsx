import styles from "./Category.module.scss";
import inputBg from "../../../../assets/registration/reg/inputBg.png";

export default function Category({ title }) {
  return (
    <div className={styles.reginputContainer}>
      <div
        className={styles.inputContainer}
        style={{
          backgroundImage: `url(${inputBg})`,
        }}
      >
        <span className={styles.value}>
          {title}
        </span>
      </div>
    </div>
  );
}