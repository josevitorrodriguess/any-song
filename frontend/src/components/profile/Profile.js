import { useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import UserProfile from './UserProfile';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Redirecionar para home se não estiver logado
  if (!loading && !user) {
    router.push('/');
    return null;
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>⏳</div>
        <p>Loading...</p>
      </div>
    );
  }

  const handleEditName = () => {
    setEditedName(user.displayName || '');
    setIsEditing(true);
  };

  const handleSaveName = () => {
    // Aqui você implementaria a lógica para salvar no Firebase
    console.log('Salvando nome:', editedName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
  };

  return (
    <>
      <Head>
        <title>AnySong - Profile</title>
        <meta name="description" content="Manage your AnySong profile and preferences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/any-song_icon.png" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/karaoke" className={styles.logo}>
              <Image
                src="/any-song_icon.png"
                alt="AnySong Microphone Icon"
                width={55}
                height={55}
                className={styles.logoIcon}
              />
              <h1 className={styles.logoText}>AnySong</h1>
            </Link>
            <nav className={styles.nav}>
              <Link href="/about" className={styles.navButton}>
                About
              </Link>
              <UserProfile />
            </nav>
          </div>
        </div>

        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.profileHeader}>
              <div className={styles.profileImageContainer}>
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={120}
                    height={120}
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.profileImageFallback}>
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className={styles.profileInfo}>
                <div className={styles.nameSection}>
                  {isEditing ? (
                    <div className={styles.editForm}>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className={styles.nameInput}
                        placeholder="Your name"
                      />
                      <div className={styles.editButtons}>
                        <button onClick={handleSaveName} className={styles.saveButton}>
                          ✓ Save
                        </button>
                        <button onClick={handleCancelEdit} className={styles.cancelButton}>
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.nameDisplay}>
                      <h1 className={styles.userName}>
                        {user.displayName || 'Anonymous User'}
                      </h1>
                      <button onClick={handleEditName} className={styles.editButton}>
                        ✏️ Edit
                      </button>
                    </div>
                  )}
                </div>
                
                <p className={styles.userEmail}>{user.email}</p>
                <div className={styles.verificationBadge}>
                  {user.emailVerified ? (
                    <span className={styles.verified}>✓ Verified</span>
                  ) : (
                    <span className={styles.unverified}>⚠️ Unverified</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.statsContainer}>
              <h2 className={styles.sectionTitle}>Your AnySong Stats</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎵</div>
                  <div className={styles.statValue}>0</div>
                  <div className={styles.statLabel}>Songs Processed</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎤</div>
                  <div className={styles.statValue}>0</div>
                  <div className={styles.statLabel}>Karaoke Sessions</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⭐</div>
                  <div className={styles.statValue}>-</div>
                  <div className={styles.statLabel}>Average Score</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🏆</div>
                  <div className={styles.statValue}>0</div>
                  <div className={styles.statLabel}>Achievements</div>
                </div>
              </div>
            </div>

            <div className={styles.actionsContainer}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                <Link href="/karaoke" className={styles.actionCard}>
                  <div className={styles.actionIcon}>🎤</div>
                  <h3 className={styles.actionTitle}>Create Karaoke</h3>
                  <p className={styles.actionDescription}>
                    Upload a song or search to start creating karaoke
                  </p>
                </Link>
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>📊</div>
                  <h3 className={styles.actionTitle}>View History</h3>
                  <p className={styles.actionDescription}>
                    See your processed songs and karaoke sessions
                  </p>
                </div>
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>⚙️</div>
                  <h3 className={styles.actionTitle}>Settings</h3>
                  <p className={styles.actionDescription}>
                    Customize your AnySong experience
                  </p>
                </div>
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>🎯</div>
                  <h3 className={styles.actionTitle}>Achievements</h3>
                  <p className={styles.actionDescription}>
                    Track your karaoke milestones and badges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 