    import bg from "../assets/086ee623dc5facfe1545894c42f50d8ec74859c9.jpg";
import styles from "../styles/Home.module.scss"
import sandImg from "../assets/sand.png"
    export default function Home() {
        return (
        <div>
            <div
            className="background"
            style={{background: `url(${bg}) no-repeat center center/cover`,height: "100svh", width: "100svw"}}
            >
            </div>
            <div className={styles.sand}>
                <img src={sandImg} className={styles.sandImg} />
            </div>
            </div> )
    }