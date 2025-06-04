import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import styles from "./Home.module.css";

export default function Home() {
  const { user, signInWithGoogle, backendAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirecionar para karaoke quando backend auth for completado
  useEffect(() => {
    if (backendAuthenticated && user && isSigningIn) {
      router.push('/karaoke');
      setIsSigningIn(false);
    }
  }, [backendAuthenticated, user, isSigningIn, router]);

  const handleJoinNow = async () => {
    if (user && backendAuthenticated) {
      // Se já está logado, vai direto para karaoke
      router.push('/karaoke');
      return;
    }

    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      // O useEffect acima vai redirecionar quando backendAuthenticated for true
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
      setIsSigningIn(false);
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
                disabled={isSigningIn || loading}
              >
                {isSigningIn ? (
                  <span className={styles.loadingSpinner}>⏳</span>
                ) : user && backendAuthenticated ? (
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