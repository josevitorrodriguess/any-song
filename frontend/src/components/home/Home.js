import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import styles from "./Home.module.css";

export default function Home() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoinNow = async () => {
    if (user) {
      // Se já está logado, vai direto para karaoke
      router.push('/karaoke');
      return;
    }

    try {
      setLoading(true);
      await signInWithGoogle();
      // Após login bem-sucedido, redireciona para karaoke
      router.push('/karaoke');
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
              <button 
                onClick={handleJoinNow}
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.loadingSpinner}>⏳</span>
                ) : user ? (
                  'Join Now'
                ) : (
                  'Sign In'
                )}
              </button>
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