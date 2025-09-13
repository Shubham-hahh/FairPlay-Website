'use client'
import { useEffect, useState, ChangeEvent, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCompass,
  faBell,
  faHistory,
  faUserCircle,
  faAward,
  faBookOpen,
  faGamepad,
  faGlobe
} from '@fortawesome/free-solid-svg-icons'
import styles from './Sidebar.module.css';

type Props = {
  active: string
}


export const Sidebar: React.FC<Props> = ({ active }) => {
  // === Utils ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getSessionUser = useCallback(async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;
    return session.user;
  }, []);

  useEffect(() => {
    getSessionUser().then(user => setIsLoggedIn(user !== null));
  }, [getSessionUser]);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        <ul>
          <li>
            <Link href="/feed" className={active === 'videos' ? styles.active : ''}>
              <FontAwesomeIcon icon={faCompass} className={styles.sidebarIcon} /> Explore
            </Link>
          </li>
          <li>
            <Link href="/offline" className={active === 'offline' ? styles.active : ''}>
              <FontAwesomeIcon icon={faGlobe} className={styles.sidebarIcon} /> Offline
            </Link>
          </li>
          <li>
            <Link href="/subscriptions" className={active === 'subscriptions' ? styles.active : ''}>
              <FontAwesomeIcon icon={faBell} className={styles.sidebarIcon} /> Subscriptions
            </Link>
          </li>
          <li>
            <Link href="/history" className={active === 'history' ? styles.active : ''}>
              <FontAwesomeIcon icon={faHistory} className={styles.sidebarIcon} /> History
            </Link>
          </li>
          {isLoggedIn && (
            <li>
              <Link href="/mychannel" className={active === 'mychannel' ? styles.active : ''}>
                <FontAwesomeIcon icon={faUserCircle} className={styles.sidebarIcon} /> My Channel
              </Link>
            </li>
          )}
        </ul>
        {isLoggedIn && (<div className={styles.sidebarSection}>
          <h4>Subscriptions</h4>
          <ul>
            <li>
              <Link href="#">
                <img src="https://placehold.co/24x24?text=C1" alt="Chaîne 1" /> Channel 1
              </Link>
            </li>
            <li>
              <Link href="#">
                <img src="https://placehold.co/24x24?text=C2" alt="Chaîne 2" /> Channel 2
              </Link>
            </li>
            <li>
              <Link href="#">
                <img src="https://placehold.co/24x24?text=C3" alt="Chaîne 3" /> Channel 3
              </Link>
            </li>
          </ul>
        </div>
        )}
        <div className={styles.sidebarSection}>
          <h4>More of FairPlay</h4>
          <ul>
            <li>
              <Link href="/trending" className={active === 'popular' ? styles.active : ''}>
                <FontAwesomeIcon icon={faAward} className={styles.sidebarIcon} /> Trending
              </Link>
            </li>
            <li>
              <Link href="/learning" className={active === 'learning' ? styles.active : ''}>
                <FontAwesomeIcon icon={faBookOpen} className={styles.sidebarIcon} /> Learning
              </Link>
            </li>
            <li>
              <Link href="/gaming" className={active === 'gaming' ? styles.active : ''}>
                <FontAwesomeIcon icon={faGamepad} className={styles.sidebarIcon} /> Gaming
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}