'use client'
import { useEffect, useState, useCallback } from 'react';
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
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

type Props = {
  active: string
}


export const Sidebar: React.FC<Props> = ({ active }) => {
  const { t } = useTranslation('common');
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
              <FontAwesomeIcon icon={faCompass} className={styles.sidebarIcon} /> {t('explore')}
            </Link>
          </li>
          <li>
            <Link href="/offline" className={active === 'offline' ? styles.active : ''}>
              <FontAwesomeIcon icon={faGlobe} className={styles.sidebarIcon} /> {t('offline')}
            </Link>
          </li>
          <li>
            <Link href="/subscriptions" className={active === 'subscriptions' ? styles.active : ''}>
              <FontAwesomeIcon icon={faBell} className={styles.sidebarIcon} /> {t('subscriptions')}
            </Link>
          </li>
          <li>
            <Link href="/history" className={active === 'history' ? styles.active : ''}>
              <FontAwesomeIcon icon={faHistory} className={styles.sidebarIcon} /> {t('history')}
            </Link>
          </li>
          {isLoggedIn && (
            <li>
              <Link href="/mychannel" className={active === 'channel' ? styles.active : ''}>
                <FontAwesomeIcon icon={faUserCircle} className={styles.sidebarIcon} /> {t('my_channel')}
              </Link>
            </li>
          )}
        </ul>
        {isLoggedIn && (<div className={styles.sidebarSection}>
          <h4>{t('subscriptions')}</h4>
          <ul>
            <li>
              <Link href="#">
                <Image src="https://placehold.co/24x24?text=C1" alt={t('channel_1')} width={24} height={24} /> {t('channel_1')}
              </Link>
            </li>
            <li>
              <Link href="#">
                <Image src="https://placehold.co/24x24?text=C2" alt={t('channel_2')} width={24} height={24} /> {t('channel_2')}
              </Link>
            </li>
            <li>
              <Link href="#">
                <Image src="https://placehold.co/24x24?text=C3" alt={t('channel_3')} width={24} height={24} /> {t('channel_3')}
              </Link>
            </li>
          </ul>
        </div>
        )}
        <div className={styles.sidebarSection}>
          <h4>{t('more_of_fairplay')}</h4>
          <ul>
            <li>
              <Link href="/trending" className={active === 'popular' ? styles.active : ''}>
                <FontAwesomeIcon icon={faAward} className={styles.sidebarIcon} /> {t('trending')}
              </Link>
            </li>
            <li>
              <Link href="/learning" className={active === 'learning' ? styles.active : ''}>
                <FontAwesomeIcon icon={faBookOpen} className={styles.sidebarIcon} /> {t('learning')}
              </Link>
            </li>
            <li>
              <Link href="/gaming" className={active === 'gaming' ? styles.active : ''}>
                <FontAwesomeIcon icon={faGamepad} className={styles.sidebarIcon} /> {t('gaming')}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}