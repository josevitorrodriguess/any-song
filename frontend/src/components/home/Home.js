import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>AnySong - Transform any song into Karaoke</title>
        <meta name="description" content="Transform any song into Karaoke with Any Song" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/any-song_icon.png" />
      </Head>
      
      <div className={styles.container}>
        <div className={styles.imageSection}>
          <Image
            src="/landing_photo.png"
            alt="Girl singing karaoke"
            fill
            className={styles.landingImage}
            priority
          />
          <div className={styles.imageOverlay}></div>
        </div>
        
        <div className={styles.contentSection}>
          <div className={styles.content}>
            <h1 className={styles.title}>NO MORE LIMITS</h1>
            <p className={styles.subtitle}>Transform any song into Karaoke</p>
            
            <div className={styles.buttonGroup}>
              <Link href="/karaoke" className={styles.primaryButton}>
                Join Now
              </Link>
              <Link href="/about" className={styles.secondaryButton}>
                More About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 