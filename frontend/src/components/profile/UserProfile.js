import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import styles from './UserProfile.module.css';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.profileContainer} ref={dropdownRef}>
      <button 
        className={styles.profileButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.displayName || 'User'}</span>
          <span className={styles.userEmail}>{user.email}</span>
        </div>
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt="Profile"
            width={40}
            height={40}
            className={styles.profileImage}
          />
        ) : (
          <div className={styles.profileImageFallback}>
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className={styles.dropdownArrow}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownItem}>
            <span className={styles.profileInfo}>
              <strong>{user.displayName || 'User'}</strong>
              <small>{user.email}</small>
            </span>
          </div>
          <div className={styles.divider}></div>
          <button 
            className={styles.dropdownItem}
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
} 