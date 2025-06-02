import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "./About.module.css";

export default function About() {
  return (
    <>
      <Head>
        <title>AnySong - About</title>
        <meta name="description" content="Three friends. One Friday night. Learn the story behind AnySong." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <div className={styles.backgroundSection}>
          <Image
            src="/about_photo.png"
            alt="People celebrating with music"
            fill
            className={styles.backgroundImage}
            priority
          />
          <div className={styles.backgroundOverlay}></div>
        </div>
        
        <div className={styles.contentSection}>
          <div className={styles.content}>
            <nav className={styles.navigation}>
              <Link href="/" className={styles.backButton}>
                Back to Home
              </Link>
            </nav>
            
            <header className={styles.header}>
              <h1 className={styles.mainTitle}>About</h1>
            </header>
            
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                The Story Behind the 
                <span className={styles.emoji}>🎤</span>
              </h2>
              <p className={styles.paragraph}>
                Three friends. One Friday night.
              </p>
              <p className={styles.paragraph}>
                Luigi, José and Kruta were tired of scrolling through the same old songs, never finding <em>that perfect track</em>. That night, a simple question changed everything: <strong>"Why can't we just sing ANY song we want?"</strong>
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>From Limitation to Liberation</h2>
              <p className={styles.paragraph}>
                Millions of karaoke lovers face the same problem – being stuck with catalogs that never have your favorite song. Whether it's the latest hit or that nostalgic childhood track, traditional karaoke always leaves someone wanting more.
              </p>
              <p className={styles.highlight}>
                Our mission: Break down the barriers between you and your perfect karaoke moment.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>A Place for Everyone</h2>
              <p className={styles.paragraph}>
                Using AI technology, AnySong transforms any song into a professional karaoke experience. Our AI separates vocals, synchronizes lyrics, and delivers that authentic karaoke feeling – without limits.
              </p>
              <p className={styles.paragraph}>
                Every voice deserves to be heard, every song tells a story, and musical freedom knows no boundaries.
              </p>
              <p className={styles.callToAction}>
                <em>Ready to find your voice? Your song is waiting.</em>
              </p>
            </section>

            <footer className={styles.footer}>
              <hr className={styles.divider} />
              <p className={styles.footerText}>
                <strong>From three friends who refused to be limited by songbooks, to a community embracing unlimited musical freedom.</strong>
              </p>
              <p className={styles.welcomeText}>
                <em>Welcome to AnySong.</em>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
} 