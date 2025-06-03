import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./About.module.css";

export default function About() {
  const { user, loading } = useAuth();

  // Determine back button text and destination based on auth state
  const getBackButton = () => {
    if (loading) {
      // While loading, show neutral text
      return {
        href: "/",
        text: "Back"
      };
    }
    
    if (user) {
      // User is logged in, send to karaoke
      return {
        href: "/karaoke",
        text: "Back to Karaoke"
      };
    } else {
      // User is not logged in, send to home
      return {
        href: "/",
        text: "Back to Home"
      };
    }
  };

  const backButton = getBackButton();

  return (
    <>
      <Head>
        <title>AnySong - About</title>
        <meta name="description" content="Three friends. One Friday night. Learn the story behind AnySong." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/any-song_icon.png" />
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
              <Link href={backButton.href} className={styles.backButton}>
                {backButton.text}
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
                Luigi, José and Kruta were tired of the same old songs, never finding <em>that perfect track</em>. That night, one question changed everything: <strong>"Why can't we just sing ANY song we want?"</strong>
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>From Limitation to Liberation</h2>
              <p className={styles.paragraph}>
                Millions face the same problem – being stuck with catalogs that never have your favorite song. Traditional karaoke always leaves someone wanting more.
              </p>
              <p className={styles.highlight}>
                Our mission: Break down the barriers between you and your perfect karaoke moment.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>A Place for Everyone</h2>
              <p className={styles.paragraph}>
                Using AI technology, AnySong transforms any song into a professional karaoke experience. Our AI separates vocals, synchronizes lyrics, and delivers that authentic feeling – without limits.
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